# Security Analysis: Hybrid Storage Architecture for Anonymous & Authenticated Users

## Executive Summary

The application needs to support both anonymous users (growth hack) and authenticated users (persistent storage). The current RLS policies block anonymous users completely. This document analyzes security approaches and provides a production-ready solution.

## Problem Statement

### Current State
- RLS policies require `auth.uid() = user_id` for all operations
- Anonymous users have `auth.uid() = NULL`, blocking all database access
- Frontend uses sessionStorage for anonymous users (works but not scalable)

### Requirements
1. **Anonymous users**: Can create/read/update/delete their own temporary data
2. **Authenticated users**: Standard user-based data isolation
3. **Security**: Anonymous users cannot access each other's data
4. **Migration**: Seamless data transfer when anonymous users sign up

## Security Analysis of Approaches

### Approach 1: Modified RLS with NULL user_id (NOT RECOMMENDED ❌)

**Concept**: Allow `user_id = NULL` for anonymous users in RLS policies.

**Problems**:
- **CRITICAL SECURITY FLAW**: All anonymous users would see each other's data
- No way to differentiate between anonymous users at database level
- Data leakage between sessions
- GDPR/privacy compliance issues

**Verdict**: REJECT - Fundamentally insecure

### Approach 2: Service Role Key on Backend (NOT RECOMMENDED ❌)

**Concept**: Use service role key to bypass RLS, implement access control in backend.

**Problems**:
- Violates Supabase security best practices
- Bypasses all RLS protections
- Single point of failure if backend is compromised
- Increases attack surface
- Requires maintaining parallel authorization logic

**Verdict**: REJECT - Anti-pattern for Supabase

### Approach 3: Temporary JWT Tokens for Anonymous Users (VIABLE ✓)

**Concept**: Generate temporary JWTs with unique identifiers for anonymous sessions.

**Pros**:
- Each anonymous user gets unique identifier
- Can use standard RLS with temporary user IDs
- Clean separation between anonymous and authenticated

**Cons**:
- Requires custom Edge Function for token generation
- More complex implementation
- Token management overhead

**Verdict**: VIABLE but complex

### Approach 4: Session-Based Tokens with RLS (RECOMMENDED ✅)

**Concept**: Use a hybrid approach with session tokens stored in a dedicated table.

**Implementation**:
1. Generate unique session_id for anonymous users (UUID)
2. Store session_id → data mapping in database
3. Pass session_id as RLS context using JWT claims or headers
4. RLS policies check either user_id OR valid session_id

**Pros**:
- Secure isolation between all users
- No data leakage
- Clean migration path to authenticated
- Follows Supabase patterns
- Auditable access

**Cons**:
- Requires session management
- Needs cleanup strategy

**Verdict**: BEST APPROACH - Secure and practical

### Approach 5: Client-Side Only for Anonymous (CURRENT - LIMITED ✓)

**Concept**: Keep using sessionStorage for anonymous, Supabase for authenticated.

**Pros**:
- Simple, already working
- No security risks
- Clear separation

**Cons**:
- No persistence for anonymous users
- Can't share data across devices
- Limited by browser storage quotas
- Poor UX for trial users

**Verdict**: ACCEPTABLE for MVP, but limits growth

## Recommended Solution: Session-Based Token Approach

### Architecture Overview

```
Anonymous User Flow:
1. Frontend generates session_id (UUID)
2. Stores session_id in localStorage
3. Creates anonymous_sessions record via RPC function
4. All subsequent operations include session_id
5. RLS policies validate session_id ownership

Authenticated User Flow:
1. Standard Supabase auth flow
2. RLS policies check user_id
3. On signup, migrate anonymous data to user account
```

### Security Benefits

1. **Complete Isolation**: Each session is cryptographically unique
2. **No Cross-Contamination**: Sessions cannot access each other's data
3. **Audit Trail**: All access is logged with session/user ID
4. **Clean Migration**: Data transfers seamlessly on signup
5. **Timeout Protection**: Sessions auto-expire after inactivity

### Implementation Components

1. **Database Schema Changes**:
   - Add `session_id` column to all tables
   - Create `anonymous_sessions` table for validation
   - Update RLS policies for dual-mode access

2. **Frontend Changes**:
   - Generate and persist session_id
   - Include session_id in all Supabase calls
   - Handle session expiration gracefully

3. **Backend Components**:
   - RPC function for session creation
   - Cleanup job for expired sessions
   - Migration function for signup

## Alternative: Keep Current Approach (SessionStorage)

If you want to avoid complexity, the current sessionStorage approach is secure and functional:

**Pros**:
- Already implemented and working
- Zero security risk
- Simple architecture

**Cons**:
- No persistence across browser sessions
- Can't preview full features before signup
- Limits conversion funnel

**Recommendation**: Acceptable for launch, plan session-based upgrade for v2.

## Decision Matrix

| Approach | Security | Complexity | Scalability | UX | Recommendation |
|----------|----------|------------|-------------|----|----|
| NULL user_id RLS | ❌ Critical flaws | Low | Poor | Poor | REJECT |
| Service Role Bypass | ❌ Anti-pattern | Medium | Good | Good | REJECT |
| Temporary JWT | ✅ Secure | High | Good | Good | VIABLE |
| Session Tokens | ✅ Very Secure | Medium | Excellent | Excellent | **RECOMMENDED** |
| Client-Side Only | ✅ Secure | Low | Limited | Fair | CURRENT/MVP |

## Final Recommendation

**For Production**: Implement Session-Based Token Approach (Approach 4)
**For MVP/Quick Launch**: Keep current client-side approach (Approach 5)

The session-based approach provides the best balance of security, UX, and maintainability while following Supabase best practices.