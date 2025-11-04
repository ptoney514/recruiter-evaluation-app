# Testing Strategies for Hybrid Storage RLS Policies

## Overview

This document provides comprehensive testing strategies to validate the security and functionality of the dual-mode RLS policies supporting both authenticated and anonymous users.

## Test Categories

### 1. Security Tests (Critical)

These tests ensure no data leakage between users or sessions.

#### Test 1.1: Anonymous Session Isolation

```sql
-- Test Setup: Create two anonymous sessions
SELECT create_anonymous_session('{"test": "session1"}') AS session1;
SELECT create_anonymous_session('{"test": "session2"}') AS session2;

-- Test: Session 1 creates data
SET request.headers TO '{"x-session-token": "<session1_token>"}'::jsonb;
INSERT INTO jobs (title, session_id) VALUES ('Job from Session 1', '<session1_token>');

-- Test: Session 2 cannot see Session 1's data
SET request.headers TO '{"x-session-token": "<session2_token>"}'::jsonb;
SELECT * FROM jobs WHERE title = 'Job from Session 1';
-- EXPECTED: 0 rows (RLS should block access)

-- Test: Session 1 can see its own data
SET request.headers TO '{"x-session-token": "<session1_token>"}'::jsonb;
SELECT * FROM jobs WHERE title = 'Job from Session 1';
-- EXPECTED: 1 row returned
```

#### Test 1.2: Authenticated User Isolation

```sql
-- Test: Authenticated user cannot see anonymous data
SET LOCAL auth.uid TO 'user-123';
SELECT * FROM jobs WHERE session_id IS NOT NULL;
-- EXPECTED: 0 rows (authenticated users can't see anonymous data)

-- Test: Anonymous cannot see authenticated data
SET LOCAL auth.uid TO NULL;
SET request.headers TO '{"x-session-token": "<valid_session>"}'::jsonb;
SELECT * FROM jobs WHERE user_id IS NOT NULL;
-- EXPECTED: 0 rows (anonymous can't see authenticated data)
```

#### Test 1.3: Session Hijacking Prevention

```javascript
// JavaScript test for frontend
describe('Session Security', () => {
  it('should not accept arbitrary session tokens', async () => {
    // Try to use a made-up session token
    localStorage.setItem('anonymous_session_token', 'fake-uuid-1234');

    const { error } = await supabase
      .from('jobs')
      .select('*');

    expect(error).toBeTruthy();
    expect(error.code).toBe('42501'); // Insufficient privilege
  });

  it('should reject expired sessions', async () => {
    // Create session and manually expire it
    const { data: session } = await supabase.rpc('create_anonymous_session');

    // Manually expire in database (for testing)
    await supabase.rpc('admin_expire_session', {
      p_token: session.session_token
    });

    // Try to use expired session
    localStorage.setItem('anonymous_session_token', session.session_token);

    const { error } = await supabase
      .from('jobs')
      .insert({ title: 'Test Job' });

    expect(error).toBeTruthy();
  });
});
```

### 2. Functional Tests

#### Test 2.1: CRUD Operations for Anonymous Users

```javascript
// frontend/src/tests/anonymousStorage.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { sessionManager } from '../services/sessionManager';
import { supabase } from '../lib/supabase';

describe('Anonymous User CRUD', () => {
  let sessionToken;

  beforeEach(async () => {
    // Create fresh anonymous session
    const session = await sessionManager.createSession();
    sessionToken = session.sessionToken;
  });

  it('should create job as anonymous', async () => {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: 'Test Job',
        session_id: sessionToken
      })
      .select()
      .single();

    expect(error).toBeFalsy();
    expect(data.title).toBe('Test Job');
    expect(data.session_id).toBe(sessionToken);
    expect(data.user_id).toBeNull();
  });

  it('should read own jobs as anonymous', async () => {
    // Create a job
    await supabase.from('jobs').insert({
      title: 'My Job',
      session_id: sessionToken
    });

    // Read it back
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('session_id', sessionToken);

    expect(error).toBeFalsy();
    expect(data.length).toBe(1);
    expect(data[0].title).toBe('My Job');
  });

  it('should update own job as anonymous', async () => {
    // Create job
    const { data: job } = await supabase
      .from('jobs')
      .insert({ title: 'Original', session_id: sessionToken })
      .select()
      .single();

    // Update it
    const { data, error } = await supabase
      .from('jobs')
      .update({ title: 'Updated' })
      .eq('id', job.id)
      .select()
      .single();

    expect(error).toBeFalsy();
    expect(data.title).toBe('Updated');
  });

  it('should delete own job as anonymous', async () => {
    // Create job
    const { data: job } = await supabase
      .from('jobs')
      .insert({ title: 'To Delete', session_id: sessionToken })
      .select()
      .single();

    // Delete it
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', job.id);

    expect(error).toBeFalsy();

    // Verify deletion
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job.id);

    expect(data.length).toBe(0);
  });
});
```

#### Test 2.2: Data Migration on Signup

```javascript
describe('Session Migration', () => {
  it('should migrate all anonymous data to user account', async () => {
    // Step 1: Create anonymous session and data
    const session = await sessionManager.createSession();

    // Create test data as anonymous
    const { data: anonJob } = await supabase
      .from('jobs')
      .insert({
        title: 'Anonymous Job',
        session_id: session.sessionToken
      })
      .select()
      .single();

    const { data: anonCandidate } = await supabase
      .from('candidates')
      .insert({
        job_id: anonJob.id,
        full_name: 'John Doe',
        session_id: session.sessionToken
      })
      .select()
      .single();

    // Step 2: Sign up user
    const { data: authData } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'TestPassword123!'
    });

    // Step 3: Migrate session
    const { data: migrationResult } = await supabase.rpc(
      'migrate_session_to_user',
      {
        p_session_token: session.sessionToken,
        p_user_id: authData.user.id
      }
    );

    expect(migrationResult).toBe(true);

    // Step 4: Verify data migrated
    const { data: userJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', authData.user.id);

    expect(userJobs.length).toBe(1);
    expect(userJobs[0].title).toBe('Anonymous Job');
    expect(userJobs[0].user_id).toBe(authData.user.id);
    expect(userJobs[0].session_id).toBeNull();

    // Verify candidate migrated too
    const { data: userCandidates } = await supabase
      .from('candidates')
      .select('*')
      .eq('user_id', authData.user.id);

    expect(userCandidates.length).toBe(1);
    expect(userCandidates[0].full_name).toBe('John Doe');
  });
});
```

### 3. Performance Tests

```javascript
describe('RLS Performance', () => {
  it('should handle queries efficiently with session validation', async () => {
    const startTime = Date.now();

    // Perform 10 sequential queries
    for (let i = 0; i < 10; i++) {
      await supabase
        .from('jobs')
        .select('*')
        .limit(10);
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
  });

  it('should handle bulk inserts with session_id', async () => {
    const session = await sessionManager.getSession();
    const jobs = Array.from({ length: 50 }, (_, i) => ({
      title: `Bulk Job ${i}`,
      session_id: session.sessionToken
    }));

    const startTime = Date.now();
    const { error } = await supabase
      .from('jobs')
      .insert(jobs);

    const duration = Date.now() - startTime;
    expect(error).toBeFalsy();
    expect(duration).toBeLessThan(3000); // Bulk insert should be fast
  });
});
```

### 4. Edge Case Tests

```sql
-- Test 4.1: Constraint validation
-- Should fail: Both user_id and session_id
INSERT INTO jobs (title, user_id, session_id)
VALUES ('Invalid', 'user-123', 'session-456');
-- EXPECTED: Check constraint violation

-- Should fail: Neither user_id nor session_id
INSERT INTO jobs (title)
VALUES ('Also Invalid');
-- EXPECTED: Check constraint violation

-- Test 4.2: Session expiration during operation
BEGIN;
  SET request.headers TO '{"x-session-token": "<valid_token>"}'::jsonb;
  INSERT INTO jobs (title, session_id) VALUES ('Test', '<valid_token>');

  -- Simulate session expiration
  UPDATE anonymous_sessions
  SET expires_at = NOW() - INTERVAL '1 hour'
  WHERE session_token = '<valid_token>';

  -- This should fail
  INSERT INTO candidates (job_id, full_name, session_id)
  VALUES ('<job_id>', 'Test User', '<valid_token>');
ROLLBACK;
```

## Automated Test Suite

### PostgreSQL Test Suite (using pgtap)

```sql
-- tests/test_rls_policies.sql

BEGIN;
SELECT plan(10);

-- Test 1: Anonymous isolation
SELECT create_anonymous_session() INTO session1;
SELECT create_anonymous_session() INTO session2;

-- Session 1 creates data
SET request.headers TO jsonb_build_object('x-session-token', session1.session_token);
INSERT INTO jobs (title, session_id) VALUES ('Job1', session1.session_token);

-- Session 2 cannot see it
SET request.headers TO jsonb_build_object('x-session-token', session2.session_token);
SELECT is(
  (SELECT COUNT(*) FROM jobs WHERE title = 'Job1'),
  0::bigint,
  'Anonymous sessions cannot see each other''s data'
);

-- Test 2: Authenticated isolation
SET LOCAL auth.uid TO gen_random_uuid();
SELECT is(
  (SELECT COUNT(*) FROM jobs WHERE session_id IS NOT NULL),
  0::bigint,
  'Authenticated users cannot see anonymous data'
);

-- Add more tests...

SELECT * FROM finish();
ROLLBACK;
```

### CI/CD Integration

```yaml
# .github/workflows/test-rls.yml

name: Test RLS Policies

on:
  pull_request:
    paths:
      - 'supabase/migrations/*.sql'
      - 'frontend/src/services/**'

jobs:
  test-rls:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Start Supabase
        run: supabase start

      - name: Run migrations
        run: supabase db push

      - name: Run RLS tests
        run: |
          supabase test db
          npm run test:rls

      - name: Run security audit
        run: |
          npm run audit:security
          supabase test rls-policies
```

## Manual Test Checklist

### Pre-Deployment Tests

- [ ] **Anonymous User Flow**
  - [ ] Can create session without authentication
  - [ ] Can perform CRUD on own data
  - [ ] Cannot see other anonymous users' data
  - [ ] Session persists across page refreshes
  - [ ] Session expires after 7 days

- [ ] **Authenticated User Flow**
  - [ ] Can perform CRUD on own data
  - [ ] Cannot see anonymous data
  - [ ] Cannot see other users' data
  - [ ] Data persists across devices

- [ ] **Migration Flow**
  - [ ] Anonymous data migrates on signup
  - [ ] No data lost during migration
  - [ ] Session cleared after migration
  - [ ] Can't use old session after migration

- [ ] **Security Tests**
  - [ ] Can't use fake session tokens
  - [ ] Can't access expired sessions
  - [ ] Can't bypass RLS with null checks
  - [ ] SQL injection attempts blocked

- [ ] **Performance Tests**
  - [ ] Page load < 2 seconds
  - [ ] Query response < 500ms
  - [ ] Bulk operations < 5 seconds
  - [ ] No N+1 query issues

## Load Testing

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  // Create anonymous session
  let sessionRes = http.post(
    'https://your-project.supabase.co/rest/v1/rpc/create_anonymous_session',
    JSON.stringify({}),
    {
      headers: {
        'apikey': 'your-anon-key',
        'Content-Type': 'application/json'
      }
    }
  );

  check(sessionRes, {
    'session created': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).session_token
  });

  // Use session for operations
  const token = JSON.parse(sessionRes.body).session_token;

  let jobRes = http.post(
    'https://your-project.supabase.co/rest/v1/jobs',
    JSON.stringify({
      title: 'Load Test Job',
      session_id: token
    }),
    {
      headers: {
        'apikey': 'your-anon-key',
        'x-session-token': token,
        'Content-Type': 'application/json'
      }
    }
  );

  check(jobRes, {
    'job created': (r) => r.status === 201
  });
}
```

## Monitoring Queries

```sql
-- Monitor active sessions
SELECT
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE migrated_to_user_id IS NOT NULL) as migrated,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired,
  COUNT(*) FILTER (WHERE last_activity_at > NOW() - INTERVAL '1 hour') as active_last_hour
FROM anonymous_sessions;

-- Check for orphaned data
SELECT
  'jobs' as table_name,
  COUNT(*) as orphaned_records
FROM jobs j
LEFT JOIN anonymous_sessions s ON j.session_id = s.session_token
WHERE j.session_id IS NOT NULL AND s.session_token IS NULL

UNION ALL

SELECT
  'candidates',
  COUNT(*)
FROM candidates c
LEFT JOIN anonymous_sessions s ON c.session_id = s.session_token
WHERE c.session_id IS NOT NULL AND s.session_token IS NULL;

-- Performance metrics
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename IN ('jobs', 'candidates', 'evaluations')
  AND attname IN ('user_id', 'session_id');
```

## Success Criteria

1. **Security**: Zero data leakage incidents
2. **Performance**: 95th percentile query time < 1 second
3. **Reliability**: 99.9% uptime for session creation
4. **Migration**: 100% data integrity during migration
5. **User Experience**: < 2% session-related error rate