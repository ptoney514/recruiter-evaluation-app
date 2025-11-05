-- Supabase Setup Verification Script
-- Run this in SQL Editor after migrations to verify everything is set up correctly

-- 1. Check all tables exist
SELECT '✅ Tables Check' as check_name,
       COUNT(*) as table_count,
       string_agg(table_name, ', ') as tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('jobs', 'candidates', 'evaluations', 'candidate_rankings', 'interview_ratings', 'reference_checks');

-- 2. Check RLS is enabled
SELECT '✅ RLS Check' as check_name,
       COUNT(*) as rls_enabled_count,
       string_agg(tablename, ', ') as rls_tables
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- 3. Check user_id columns exist
SELECT '✅ User ID Columns' as check_name,
       table_name,
       column_name,
       is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name = 'user_id'
ORDER BY table_name;

-- 4. Check indexes
SELECT '✅ Performance Indexes' as check_name,
       COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public';

-- 5. List all indexes by table
SELECT tablename,
       indexname,
       indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 6. Check RLS policies
SELECT '✅ RLS Policies' as check_name,
       schemaname,
       tablename,
       policyname,
       permissive,
       roles,
       cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. Check storage buckets
SELECT '✅ Storage Buckets' as check_name,
       id,
       name,
       public,
       file_size_limit,
       allowed_mime_types
FROM storage.buckets
WHERE id = 'resumes';

-- 8. Check functions
SELECT '✅ Functions' as check_name,
       routine_name,
       routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';

-- 9. Check foreign key constraints
SELECT '✅ Foreign Keys' as check_name,
       tc.table_name,
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public';

-- 10. Test auth.uid() function (will be NULL if not authenticated)
SELECT '✅ Auth Function' as check_name,
       auth.uid() as current_user_id,
       CASE
         WHEN auth.uid() IS NULL THEN 'Not authenticated (expected in SQL Editor)'
         ELSE 'Authenticated as: ' || auth.uid()::text
       END as status;

-- Summary Report
SELECT '🎉 SETUP VERIFICATION COMPLETE' as status,
       'Run each query above to verify your setup' as instructions;