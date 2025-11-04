# Monitoring & Cleanup Strategies for Anonymous Data

## Overview

This document outlines strategies for monitoring anonymous session usage, detecting anomalies, and maintaining a clean database through automated cleanup processes.

## Monitoring Strategy

### 1. Key Metrics Dashboard

Create a monitoring dashboard tracking these KPIs:

```sql
-- Create a view for real-time metrics
CREATE OR REPLACE VIEW session_metrics AS
SELECT
  -- Session counts
  COUNT(*) FILTER (WHERE migrated_to_user_id IS NULL AND expires_at > NOW()) as active_sessions,
  COUNT(*) FILTER (WHERE migrated_to_user_id IS NOT NULL) as migrated_sessions,
  COUNT(*) FILTER (WHERE expires_at < NOW() AND migrated_to_user_id IS NULL) as expired_sessions,

  -- Activity metrics
  COUNT(*) FILTER (WHERE last_activity_at > NOW() - INTERVAL '1 hour') as active_last_hour,
  COUNT(*) FILTER (WHERE last_activity_at > NOW() - INTERVAL '24 hours') as active_last_day,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_sessions_today,

  -- Conversion metrics
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE migrated_to_user_id IS NOT NULL) /
    NULLIF(COUNT(*), 0), 2
  ) as migration_rate_percent,

  -- Data volume
  (SELECT COUNT(*) FROM jobs WHERE session_id IS NOT NULL) as anonymous_jobs,
  (SELECT COUNT(*) FROM candidates WHERE session_id IS NOT NULL) as anonymous_candidates,
  (SELECT COUNT(*) FROM evaluations WHERE session_id IS NOT NULL) as anonymous_evaluations

FROM anonymous_sessions;

-- Grant read access to monitoring role
GRANT SELECT ON session_metrics TO monitoring_role;
```

### 2. Real-time Alerts

Set up alerts for critical conditions:

```sql
-- Function to check for anomalies
CREATE OR REPLACE FUNCTION check_session_anomalies()
RETURNS TABLE (
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  details JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Alert: High session creation rate (potential abuse)
  IF (SELECT COUNT(*) FROM anonymous_sessions
      WHERE created_at > NOW() - INTERVAL '1 hour') > 1000 THEN
    RETURN QUERY
    SELECT
      'HIGH_SESSION_CREATION_RATE'::TEXT,
      'WARNING'::TEXT,
      'Unusually high session creation rate detected'::TEXT,
      jsonb_build_object(
        'sessions_last_hour',
        (SELECT COUNT(*) FROM anonymous_sessions WHERE created_at > NOW() - INTERVAL '1 hour'),
        'threshold', 1000
      );
  END IF;

  -- Alert: Low migration rate
  IF (SELECT migration_rate_percent FROM session_metrics) < 5 THEN
    RETURN QUERY
    SELECT
      'LOW_MIGRATION_RATE'::TEXT,
      'INFO'::TEXT,
      'Migration rate below target'::TEXT,
      jsonb_build_object(
        'current_rate', (SELECT migration_rate_percent FROM session_metrics),
        'target_rate', 5
      );
  END IF;

  -- Alert: Orphaned data detected
  IF EXISTS (
    SELECT 1 FROM jobs j
    LEFT JOIN anonymous_sessions s ON j.session_id = s.session_token
    WHERE j.session_id IS NOT NULL AND s.session_token IS NULL
    LIMIT 1
  ) THEN
    RETURN QUERY
    SELECT
      'ORPHANED_DATA'::TEXT,
      'ERROR'::TEXT,
      'Data found without corresponding session'::TEXT,
      jsonb_build_object(
        'orphaned_jobs',
        (SELECT COUNT(*) FROM jobs WHERE session_id NOT IN
          (SELECT session_token FROM anonymous_sessions))
      );
  END IF;

  -- Alert: Storage threshold
  IF (SELECT COUNT(*) FROM anonymous_sessions WHERE migrated_to_user_id IS NULL) > 100000 THEN
    RETURN QUERY
    SELECT
      'STORAGE_THRESHOLD'::TEXT,
      'WARNING'::TEXT,
      'Anonymous session count exceeds threshold'::TEXT,
      jsonb_build_object(
        'session_count',
        (SELECT COUNT(*) FROM anonymous_sessions WHERE migrated_to_user_id IS NULL),
        'recommended_action', 'Run cleanup process'
      );
  END IF;

  RETURN;
END;
$$;
```

### 3. Usage Analytics

Track user behavior patterns:

```sql
-- Session lifecycle analytics
CREATE OR REPLACE VIEW session_analytics AS
WITH session_lifetimes AS (
  SELECT
    session_token,
    created_at,
    last_activity_at,
    migrated_to_user_id,
    EXTRACT(EPOCH FROM (
      COALESCE(migrated_to_user_id::text::timestamp, last_activity_at) - created_at
    ))/3600 as lifetime_hours
  FROM anonymous_sessions
)
SELECT
  -- Lifetime statistics
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lifetime_hours) as median_lifetime_hours,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lifetime_hours) as p95_lifetime_hours,
  AVG(lifetime_hours) as avg_lifetime_hours,

  -- Engagement metrics
  AVG(CASE
    WHEN migrated_to_user_id IS NOT NULL THEN lifetime_hours
    ELSE NULL
  END) as avg_hours_to_conversion,

  -- Daily patterns
  jsonb_object_agg(
    EXTRACT(HOUR FROM created_at)::text,
    count
  ) as hourly_creation_pattern

FROM (
  SELECT
    lifetime_hours,
    migrated_to_user_id,
    EXTRACT(HOUR FROM created_at) as hour,
    COUNT(*) as count
  FROM session_lifetimes
  GROUP BY 1, 2, 3
) t
GROUP BY hour;
```

## Cleanup Strategy

### 1. Automated Cleanup Job

Deploy a scheduled cleanup process:

```sql
-- Enhanced cleanup function with logging
CREATE OR REPLACE FUNCTION cleanup_expired_sessions(
  p_dry_run BOOLEAN DEFAULT FALSE,
  p_batch_size INTEGER DEFAULT 1000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_time TIMESTAMP := clock_timestamp();
  v_deleted_sessions INTEGER := 0;
  v_deleted_jobs INTEGER := 0;
  v_deleted_candidates INTEGER := 0;
  v_deleted_evaluations INTEGER := 0;
  v_session_batch UUID[];
BEGIN
  -- Identify expired sessions to clean
  SELECT ARRAY_AGG(session_token)
  INTO v_session_batch
  FROM (
    SELECT session_token
    FROM anonymous_sessions
    WHERE expires_at < NOW()
      AND migrated_to_user_id IS NULL
    ORDER BY expires_at
    LIMIT p_batch_size
  ) t;

  IF array_length(v_session_batch, 1) IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'success',
      'message', 'No expired sessions to clean',
      'duration_ms', 0
    );
  END IF;

  IF NOT p_dry_run THEN
    -- Delete associated data
    DELETE FROM evaluations
    WHERE session_id = ANY(v_session_batch)
    RETURNING * INTO v_deleted_evaluations;

    DELETE FROM candidates
    WHERE session_id = ANY(v_session_batch)
    RETURNING * INTO v_deleted_candidates;

    DELETE FROM jobs
    WHERE session_id = ANY(v_session_batch)
    RETURNING * INTO v_deleted_jobs;

    -- Delete sessions
    DELETE FROM anonymous_sessions
    WHERE session_token = ANY(v_session_batch)
    RETURNING * INTO v_deleted_sessions;

    -- Log cleanup activity
    INSERT INTO cleanup_log (
      cleanup_type,
      records_deleted,
      metadata,
      executed_at
    ) VALUES (
      'expired_sessions',
      jsonb_build_object(
        'sessions', v_deleted_sessions,
        'jobs', v_deleted_jobs,
        'candidates', v_deleted_candidates,
        'evaluations', v_deleted_evaluations
      ),
      jsonb_build_object(
        'batch_size', p_batch_size,
        'oldest_session', (SELECT MIN(expires_at) FROM anonymous_sessions WHERE session_token = ANY(v_session_batch))
      ),
      NOW()
    );
  END IF;

  RETURN jsonb_build_object(
    'status', 'success',
    'dry_run', p_dry_run,
    'sessions_processed', array_length(v_session_batch, 1),
    'deleted_counts', jsonb_build_object(
      'sessions', v_deleted_sessions,
      'jobs', v_deleted_jobs,
      'candidates', v_deleted_candidates,
      'evaluations', v_deleted_evaluations
    ),
    'duration_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000
  );
END;
$$;
```

### 2. Cleanup Schedule

Implement tiered cleanup schedule:

```sql
-- Using pg_cron for scheduling (if available)
-- Daily: Clean sessions expired > 7 days ago
SELECT cron.schedule(
  'cleanup-old-sessions',
  '0 2 * * *', -- 2 AM daily
  $$SELECT cleanup_expired_sessions(false, 5000);$$
);

-- Weekly: Deep cleanup and orphan removal
SELECT cron.schedule(
  'deep-cleanup',
  '0 3 * * 0', -- 3 AM Sunday
  $$
    -- Remove orphaned data
    DELETE FROM jobs WHERE session_id NOT IN
      (SELECT session_token FROM anonymous_sessions);

    -- Vacuum analyze affected tables
    VACUUM ANALYZE jobs, candidates, evaluations, anonymous_sessions;
  $$
);

-- Monthly: Archive old migrated sessions
SELECT cron.schedule(
  'archive-migrated',
  '0 4 1 * *', -- 4 AM first of month
  $$
    INSERT INTO archived_sessions
    SELECT * FROM anonymous_sessions
    WHERE migrated_to_user_id IS NOT NULL
      AND created_at < NOW() - INTERVAL '90 days';

    DELETE FROM anonymous_sessions
    WHERE migrated_to_user_id IS NOT NULL
      AND created_at < NOW() - INTERVAL '90 days';
  $$
);
```

### 3. Manual Cleanup Procedures

For emergency or maintenance cleanup:

```sql
-- Aggressive cleanup (use with caution)
CREATE OR REPLACE FUNCTION aggressive_cleanup(
  p_confirm TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Safety check
  IF p_confirm != 'CONFIRM_AGGRESSIVE_CLEANUP' THEN
    RAISE EXCEPTION 'Must confirm with CONFIRM_AGGRESSIVE_CLEANUP';
  END IF;

  -- Clean all expired sessions regardless of age
  DELETE FROM anonymous_sessions
  WHERE expires_at < NOW()
    AND migrated_to_user_id IS NULL;

  -- Clean sessions inactive > 30 days
  DELETE FROM anonymous_sessions
  WHERE last_activity_at < NOW() - INTERVAL '30 days'
    AND migrated_to_user_id IS NULL;

  -- Remove orphaned data
  DELETE FROM jobs WHERE session_id NOT IN
    (SELECT session_token FROM anonymous_sessions WHERE session_token IS NOT NULL);

  DELETE FROM candidates WHERE session_id NOT IN
    (SELECT session_token FROM anonymous_sessions WHERE session_token IS NOT NULL);

  -- Reclaim space
  VACUUM FULL ANALYZE jobs, candidates, evaluations, anonymous_sessions;

  RETURN jsonb_build_object(
    'status', 'completed',
    'timestamp', NOW()
  );
END;
$$;
```

## Storage Optimization

### 1. Partitioning Strategy (for scale)

```sql
-- Partition anonymous_sessions by month for easier archival
CREATE TABLE anonymous_sessions_partitioned (
  LIKE anonymous_sessions INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE anonymous_sessions_y2025m01
  PARTITION OF anonymous_sessions_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Auto-create future partitions
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'anonymous_sessions_y' ||
    TO_CHAR(start_date, 'YYYY') || 'm' ||
    TO_CHAR(start_date, 'MM');

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF anonymous_sessions_partitioned
     FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );
END;
$$;
```

### 2. Data Archival

```sql
-- Archive old sessions to cold storage
CREATE TABLE archived_sessions (
  LIKE anonymous_sessions INCLUDING ALL
);

-- Move old migrated sessions to archive
CREATE OR REPLACE FUNCTION archive_old_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_archived_count INTEGER;
BEGIN
  WITH moved AS (
    DELETE FROM anonymous_sessions
    WHERE migrated_to_user_id IS NOT NULL
      AND created_at < NOW() - INTERVAL '90 days'
    RETURNING *
  )
  INSERT INTO archived_sessions
  SELECT * FROM moved;

  GET DIAGNOSTICS v_archived_count = ROW_COUNT;

  RETURN v_archived_count;
END;
$$;
```

## Monitoring Implementation

### 1. Grafana Dashboard Config

```json
{
  "dashboard": {
    "title": "Anonymous Sessions Monitor",
    "panels": [
      {
        "title": "Active Sessions",
        "type": "graph",
        "targets": [{
          "rawSql": "SELECT NOW() as time, active_sessions as value FROM session_metrics"
        }]
      },
      {
        "title": "Migration Rate",
        "type": "stat",
        "targets": [{
          "rawSql": "SELECT migration_rate_percent FROM session_metrics"
        }]
      },
      {
        "title": "Data Volume",
        "type": "piechart",
        "targets": [{
          "rawSql": "SELECT 'Jobs' as metric, anonymous_jobs as value FROM session_metrics UNION ALL SELECT 'Candidates', anonymous_candidates UNION ALL SELECT 'Evaluations', anonymous_evaluations"
        }]
      }
    ]
  }
}
```

### 2. CloudWatch/Datadog Alerts

```javascript
// monitoring/alerts.js

const alerts = {
  highSessionCreation: {
    metric: 'session.creation.rate',
    threshold: 1000,
    window: '1h',
    action: 'notify-ops'
  },

  lowMigrationRate: {
    metric: 'session.migration.rate',
    threshold: 5,
    comparison: '<',
    window: '24h',
    action: 'notify-product'
  },

  storageThreshold: {
    metric: 'session.count.anonymous',
    threshold: 100000,
    action: 'trigger-cleanup'
  },

  orphanedData: {
    query: `
      SELECT COUNT(*)
      FROM jobs
      WHERE session_id NOT IN (
        SELECT session_token FROM anonymous_sessions
      )
    `,
    threshold: 0,
    comparison: '>',
    action: 'page-oncall'
  }
};
```

### 3. Application-Level Monitoring

```javascript
// services/monitoring.js

class SessionMonitor {
  constructor() {
    this.metrics = {
      sessionsCreated: 0,
      sessionsMigrated: 0,
      sessionsExpired: 0,
      errors: []
    };
  }

  async checkHealth() {
    try {
      // Check session creation works
      const testSession = await supabase.rpc('create_anonymous_session');
      if (!testSession.data) throw new Error('Session creation failed');

      // Check cleanup job status
      const { data: lastCleanup } = await supabase
        .from('cleanup_log')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(1)
        .single();

      const hoursSinceCleanup =
        (Date.now() - new Date(lastCleanup.executed_at)) / 3600000;

      if (hoursSinceCleanup > 48) {
        console.warn('Cleanup job may be failing - last run:', hoursSinceCleanup, 'hours ago');
      }

      return {
        healthy: true,
        lastCleanup: lastCleanup.executed_at,
        metrics: this.metrics
      };
    } catch (error) {
      this.metrics.errors.push({
        timestamp: new Date(),
        error: error.message
      });

      return {
        healthy: false,
        error: error.message,
        metrics: this.metrics
      };
    }
  }

  trackSessionCreated() {
    this.metrics.sessionsCreated++;
    window.analytics?.track('Anonymous Session Created');
  }

  trackSessionMigrated() {
    this.metrics.sessionsMigrated++;
    window.analytics?.track('Session Migrated to User');
  }
}

export const sessionMonitor = new SessionMonitor();
```

## Cost Management

### 1. Storage Cost Optimization

```sql
-- Monitor storage usage
CREATE OR REPLACE VIEW storage_usage AS
SELECT
  'anonymous_sessions' as table_name,
  pg_size_pretty(pg_relation_size('anonymous_sessions')) as size,
  COUNT(*) as row_count,
  pg_size_pretty(pg_relation_size('anonymous_sessions')::numeric / COUNT(*)) as avg_row_size
FROM anonymous_sessions

UNION ALL

SELECT
  'jobs_anonymous',
  pg_size_pretty(pg_relation_size('jobs')),
  COUNT(*),
  pg_size_pretty(pg_relation_size('jobs')::numeric / NULLIF(COUNT(*), 0))
FROM jobs
WHERE session_id IS NOT NULL;
```

### 2. Retention Policies

```yaml
# retention-policy.yml
retention_policies:
  anonymous_sessions:
    active:
      retain_days: 7
      extend_on_activity: true

    inactive:
      retain_days: 30
      action: delete

    migrated:
      retain_days: 90
      action: archive

  associated_data:
    jobs:
      follow_session: true

    candidates:
      follow_session: true

    evaluations:
      follow_session: true
      keep_summary: true  # Keep aggregated stats
```

## Compliance & Privacy

### 1. GDPR Compliance

```sql
-- User data export (for GDPR requests)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'exported_at', NOW(),
    'sessions', (
      SELECT jsonb_agg(row_to_json(s))
      FROM anonymous_sessions s
      WHERE migrated_to_user_id = p_user_id
    ),
    'jobs', (
      SELECT jsonb_agg(row_to_json(j))
      FROM jobs j
      WHERE user_id = p_user_id
    ),
    'candidates', (
      SELECT jsonb_agg(row_to_json(c))
      FROM candidates c
      WHERE user_id = p_user_id
    )
  );
END;
$$;

-- Right to be forgotten
CREATE OR REPLACE FUNCTION delete_user_data(
  p_user_id UUID,
  p_confirm TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_confirm != 'DELETE_ALL_MY_DATA' THEN
    RAISE EXCEPTION 'Confirmation required';
  END IF;

  DELETE FROM evaluations WHERE user_id = p_user_id;
  DELETE FROM candidates WHERE user_id = p_user_id;
  DELETE FROM jobs WHERE user_id = p_user_id;
  DELETE FROM anonymous_sessions WHERE migrated_to_user_id = p_user_id;

  RETURN TRUE;
END;
$$;
```

## Success Metrics

1. **Session Management**
   - Migration rate > 10%
   - Average session lifetime: 2-7 days
   - Cleanup success rate: 100%

2. **Performance**
   - Cleanup job duration < 5 minutes
   - Storage growth < 10GB/month
   - Zero orphaned records

3. **Cost**
   - Storage cost < $50/month
   - Compute cost for cleanup < $10/month

4. **Compliance**
   - GDPR request response < 30 days
   - Data retention policy adherence: 100%
   - Privacy audit pass rate: 100%