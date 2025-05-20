-- Create custom roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_system_role boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES custom_roles(id) ON DELETE CASCADE,
  permission_name text NOT NULL,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_name)
);

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES custom_roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

-- Enable RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admins can manage roles"
  ON custom_roles FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN custom_roles cr ON ur.role_id = cr.id
    WHERE ur.user_id = auth.uid()
    AND cr.name = 'admin'
  ));

CREATE POLICY "Super admins can manage permissions"
  ON role_permissions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN custom_roles cr ON ur.role_id = cr.id
    WHERE ur.user_id = auth.uid()
    AND cr.name = 'admin'
  ));

CREATE POLICY "Super admins can manage user roles"
  ON user_roles FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    INNER JOIN custom_roles cr ON ur.role_id = cr.id
    WHERE ur.user_id = auth.uid()
    AND cr.name = 'admin'
  ));

-- Insert default roles
INSERT INTO custom_roles (name, description, is_system_role)
VALUES
  ('admin', 'Super administrator with full system access', true),
  ('manager', 'Manager with elevated permissions', true),
  ('employee', 'Regular employee with basic access', true);

-- Insert default permissions for admin
INSERT INTO role_permissions (role_id, permission_name, enabled)
SELECT
  r.id,
  p.permission_name,
  true
FROM
  custom_roles r,
  (VALUES
    ('canManageUsers'),
    ('canManageRoles'),
    ('canViewAllData'),
    ('canEditAllData'),
    ('canDeleteData'),
    ('canApproveQuotations'),
    ('canAssignJobs')
  ) AS p(permission_name)
WHERE
  r.name = 'admin';

-- Insert default permissions for manager
INSERT INTO role_permissions (role_id, permission_name, enabled)
SELECT
  r.id,
  p.permission_name,
  p.enabled
FROM
  custom_roles r,
  (VALUES
    ('canManageUsers', false),
    ('canManageRoles', false),
    ('canViewAllData', true),
    ('canEditAllData', true),
    ('canDeleteData', false),
    ('canApproveQuotations', true),
    ('canAssignJobs', true)
  ) AS p(permission_name, enabled)
WHERE
  r.name = 'manager';

-- Insert default permissions for employee
INSERT INTO role_permissions (role_id, permission_name, enabled)
SELECT
  r.id,
  p.permission_name,
  false
FROM
  custom_roles r,
  (VALUES
    ('canManageUsers'),
    ('canManageRoles'),
    ('canViewAllData'),
    ('canEditAllData'),
    ('canDeleteData'),
    ('canApproveQuotations'),
    ('canAssignJobs')
  ) AS p(permission_name)
WHERE
  r.name = 'employee';