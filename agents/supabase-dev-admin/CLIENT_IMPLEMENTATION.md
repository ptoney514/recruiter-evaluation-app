# Client-Side Implementation Guide for Hybrid Storage

## Overview

This guide shows how to implement the session-based anonymous access on the frontend to work with the new RLS policies.

## Core Implementation

### 1. Session Manager Service

Create a new service to manage anonymous sessions:

```javascript
// frontend/src/services/sessionManager.js

import { supabase } from '../lib/supabase';

class SessionManager {
  constructor() {
    this.SESSION_KEY = 'anonymous_session_token';
    this.EXPIRY_KEY = 'anonymous_session_expires';
  }

  /**
   * Get or create anonymous session
   */
  async getSession() {
    // Check if user is authenticated
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (authSession) {
      return { type: 'authenticated', userId: authSession.user.id };
    }

    // Check for existing anonymous session
    const token = localStorage.getItem(this.SESSION_KEY);
    const expires = localStorage.getItem(this.EXPIRY_KEY);

    if (token && expires) {
      const expiryDate = new Date(expires);
      if (expiryDate > new Date()) {
        // Session still valid
        return { type: 'anonymous', sessionToken: token, expires: expiryDate };
      }
    }

    // Create new anonymous session
    return await this.createSession();
  }

  /**
   * Create new anonymous session via RPC
   */
  async createSession() {
    const { data, error } = await supabase.rpc('create_anonymous_session', {
      p_metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    });

    if (error) {
      console.error('Failed to create anonymous session:', error);
      throw error;
    }

    // Store in localStorage
    localStorage.setItem(this.SESSION_KEY, data.session_token);
    localStorage.setItem(this.EXPIRY_KEY, data.expires_at);

    return {
      type: 'anonymous',
      sessionToken: data.session_token,
      expires: new Date(data.expires_at)
    };
  }

  /**
   * Clear anonymous session (on logout or migration)
   */
  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
  }

  /**
   * Migrate anonymous session to authenticated user
   */
  async migrateToUser() {
    const token = localStorage.getItem(this.SESSION_KEY);
    if (!token) {
      return { success: true, message: 'No anonymous session to migrate' };
    }

    const { data, error } = await supabase.rpc('migrate_session_to_user', {
      p_session_token: token
    });

    if (error) {
      console.error('Failed to migrate session:', error);
      throw error;
    }

    // Clear anonymous session after migration
    this.clearSession();

    return { success: true, migrated: true };
  }
}

export const sessionManager = new SessionManager();
```

### 2. Updated Supabase Client Configuration

Configure Supabase client to include session token in headers:

```javascript
// frontend/src/lib/supabase.js

import { createClient } from '@supabase/supabase-js';
import { sessionManager } from '../services/sessionManager';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create base client
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Wrap client with session header injection
export const supabase = new Proxy(supabaseClient, {
  get(target, prop) {
    if (prop === 'from' || prop === 'rpc') {
      return function(...args) {
        // Get session token if anonymous
        const token = localStorage.getItem('anonymous_session_token');

        if (token && !target.auth.getSession()?.data?.session) {
          // Add session token to headers for anonymous users
          const options = args[1] || {};
          options.headers = {
            ...options.headers,
            'x-session-token': token
          };

          if (prop === 'from') {
            return target.from(args[0]).options(options);
          } else {
            return target.rpc(args[0], args[1], options);
          }
        }

        // Regular authenticated flow
        return target[prop](...args);
      };
    }

    return target[prop];
  }
});

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
```

### 3. Updated Storage Manager

Modify the existing storage manager to work with sessions:

```javascript
// frontend/src/services/storage/supabaseStore.js

import { supabase } from '../../lib/supabase';
import { sessionManager } from '../sessionManager';

/**
 * Enhanced save job function that handles both auth modes
 */
export async function saveJob(jobData) {
  // Get current session (authenticated or anonymous)
  const session = await sessionManager.getSession();

  const insertData = {
    title: jobData.title,
    department: jobData.department || null,
    location: jobData.location || null,
    employment_type: jobData.employmentType || 'Full-time',
    must_have_requirements: jobData.requirements || [],
    preferred_requirements: jobData.preferredRequirements || [],
    years_experience_min: jobData.yearsExperienceMin || null,
    years_experience_max: jobData.yearsExperienceMax || null,
    description: jobData.summary || null,
    status: 'open'
  };

  // Add appropriate ownership field
  if (session.type === 'authenticated') {
    insertData.user_id = session.userId;
  } else {
    insertData.session_id = session.sessionToken;
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error saving job:', error);
    throw new Error(`Failed to save job: ${error.message}`);
  }

  return data;
}

// Similar updates for saveCandidate, saveEvaluation, etc.
```

### 4. Authentication Hook with Migration

Create a React hook to handle auth state and migration:

```javascript
// frontend/src/hooks/useAuth.js

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { sessionManager } from '../services/sessionManager';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionType, setSessionType] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check initial auth state
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User just signed in - migrate anonymous data
          try {
            await sessionManager.migrateToUser();
            // Invalidate queries to reload with user data
            queryClient.invalidateQueries();
          } catch (error) {
            console.error('Migration failed:', error);
          }
        }

        await checkUser();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();

      if (authSession?.user) {
        setUser(authSession.user);
        setSessionType('authenticated');
      } else {
        // Ensure anonymous session exists
        const anonSession = await sessionManager.getSession();
        setUser(null);
        setSessionType('anonymous');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    sessionType,
    isAuthenticated: !!user,
    isAnonymous: !user && sessionType === 'anonymous'
  };
}
```

### 5. Component Usage Example

```javascript
// frontend/src/components/jobs/JobCreationModal.jsx

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { saveJob } from '../../services/storage/supabaseStore';

export function JobCreationModal({ onClose }) {
  const { isAuthenticated, isAnonymous } = useAuth();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  async function handleSubmit(formData) {
    try {
      // Save job (works for both auth states)
      const job = await saveJob(formData);

      // Show signup prompt for anonymous users
      if (isAnonymous) {
        setShowSignupPrompt(true);
      }

      onClose(job);
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  }

  return (
    <>
      {/* Job creation form */}

      {showSignupPrompt && isAnonymous && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            Sign up to save your data permanently and access it from any device!
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="mt-2 btn-primary"
          >
            Create Account
          </button>
        </div>
      )}
    </>
  );
}
```

## Key Implementation Points

### 1. Session Lifecycle

```
Anonymous User Flow:
1. User visits site → getSession() called
2. No session found → createSession() via RPC
3. Session token stored in localStorage
4. All Supabase calls include x-session-token header
5. Data saved with session_id field

On Signup:
1. User creates account → auth state change triggered
2. migrateToUser() called automatically
3. All session data transferred to user_id
4. Anonymous session cleared from localStorage
5. Queries invalidated to reload user data
```

### 2. Error Handling

```javascript
// Handle session expiration
async function handleSupabaseError(error) {
  if (error.code === 'PGRST301' && error.message.includes('session')) {
    // Session expired - create new one
    await sessionManager.createSession();
    // Retry the operation
    return true;
  }
  return false;
}
```

### 3. Development/Testing Mode

```javascript
// For local development without sessions
const USE_SESSIONS = import.meta.env.VITE_USE_SESSIONS !== 'false';

if (!USE_SESSIONS) {
  // Fallback to localStorage-only mode
  // Useful for rapid development/testing
}
```

## Migration Strategy

### Phase 1: Deploy Backend (Week 1)
1. Deploy migration 005 to Supabase
2. Test RPC functions work correctly
3. Verify RLS policies don't break existing users

### Phase 2: Soft Launch (Week 2)
1. Deploy frontend with session support
2. Feature flag for gradual rollout
3. Monitor error rates

### Phase 3: Full Rollout (Week 3)
1. Enable for all users
2. Add migration prompts
3. Monitor conversion rates

## Monitoring & Analytics

```javascript
// Track anonymous → authenticated conversion
window.analytics?.track('Session Migrated', {
  itemCount: migratedItems,
  sessionDuration: Date.now() - sessionStart
});

// Monitor session creation failures
window.Sentry?.captureException(error, {
  tags: { feature: 'anonymous_sessions' }
});
```

## Common Pitfalls & Solutions

### 1. Session Token Not Included
**Problem**: Forgetting to include session token in headers
**Solution**: Use the Proxy wrapper shown above

### 2. Migration Race Conditions
**Problem**: User signs up while actively using the app
**Solution**: Queue operations during migration, retry after

### 3. localStorage Quota Exceeded
**Problem**: Browser storage limits hit
**Solution**: Prompt user to sign up when nearing limits

### 4. Cross-Tab Synchronization
**Problem**: Multiple tabs with different sessions
**Solution**: Use BroadcastChannel API to sync sessions

```javascript
// Sync sessions across tabs
const channel = new BroadcastChannel('session_sync');
channel.onmessage = (e) => {
  if (e.data.type === 'session_updated') {
    sessionManager.reload();
  }
};
```

## Testing Checklist

- [ ] Anonymous user can create job
- [ ] Anonymous user can view only their data
- [ ] Session persists across page refreshes
- [ ] Session expires after 7 days
- [ ] Data migrates on signup
- [ ] Authenticated users see only their data
- [ ] No data leakage between sessions
- [ ] Error handling for expired sessions
- [ ] Performance with session validation