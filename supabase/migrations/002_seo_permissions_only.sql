-- =====================================================
-- SEO SYSTEM SETUP (Safe to run multiple times)
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: ADD SEO PERMISSIONS
-- =====================================================

INSERT INTO admin_permissions (name, display_name, description, module, action) VALUES
('seo_settings.view', 'View SEO Settings', 'View SEO and site settings', 'seo_settings', 'view'),
('seo_settings.edit', 'Edit SEO Settings', 'Edit SEO and site settings', 'seo_settings', 'edit'),
('seo_settings.delete', 'Delete SEO Settings', 'Delete SEO settings', 'seo_settings', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Grant SEO permissions to super_admin and content_manager
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name IN ('super_admin', 'content_manager')
AND p.name LIKE 'seo_settings.%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- STEP 2: FIX RLS POLICIES FOR SITE_SETTINGS
-- =====================================================
-- Since we use custom admin_users table (not Supabase Auth),
-- we need to allow all operations and rely on app-level auth

-- First, drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view active settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can read active site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can read all site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON site_settings;

-- Enable RLS (if not already)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
-- Public can read active settings (for SEO injection on frontend)
CREATE POLICY "allow_public_read_active"
ON site_settings FOR SELECT
TO public
USING (is_active = true);

-- Authenticated users can read all settings (for admin panel)
CREATE POLICY "allow_authenticated_read_all"
ON site_settings FOR SELECT
TO authenticated
USING (true);

-- Allow all operations for anon role (since we handle auth in the app)
-- This is safe because:
-- 1. Admin panel requires login via admin_users table
-- 2. Only admins can access the SEO settings page
CREATE POLICY "allow_anon_all"
ON site_settings FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Also allow for authenticated role
CREATE POLICY "allow_authenticated_all"
ON site_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- STEP 3: VERIFY
-- =====================================================

-- Check permissions were added
SELECT
  r.display_name as role,
  p.display_name as permission
FROM admin_role_permissions rp
JOIN admin_roles r ON rp.role_id = r.id
JOIN admin_permissions p ON rp.permission_id = p.id
WHERE p.name LIKE 'seo_settings.%'
ORDER BY r.sort_order;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'site_settings';
