-- Enable RLS for all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE cranes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can manage their contact relationships" ON user_contacts;
DROP POLICY IF EXISTS "Users can manage their own deals" ON deals;
DROP POLICY IF EXISTS "Users can view insights for their contacts" ON ai_insights;
DROP POLICY IF EXISTS "Users can manage all clients" ON clients;
DROP POLICY IF EXISTS "Users can manage all operators" ON operators;
DROP POLICY IF EXISTS "Users can manage all cranes" ON cranes;
DROP POLICY IF EXISTS "Users can manage all inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can manage all site visits" ON site_visits;
DROP POLICY IF EXISTS "Users can manage all cost calculations" ON cost_calculations;
DROP POLICY IF EXISTS "Users can manage all quotations" ON quotations;
DROP POLICY IF EXISTS "Users can manage all jobs" ON jobs;

-- Create role-based policies for CRM tables
CREATE POLICY "Admin full access to contacts"
  ON contacts FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Manager full access to contacts"
  ON contacts FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'manager');

CREATE POLICY "Employee view own contacts"
  ON contacts FOR SELECT TO authenticated
  USING (id IN (SELECT contact_id FROM user_contacts WHERE user_id = auth.uid()));

-- Similar policies for other CRM tables
CREATE POLICY "Role-based access to deals"
  ON deals FOR ALL TO authenticated
  USING (
    CASE auth.jwt() ->> 'role'
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      ELSE contact_id IN (SELECT contact_id FROM user_contacts WHERE user_id = auth.uid())
    END
  );

-- Role-based policies for ASP Crane tables
CREATE POLICY "Role-based access to clients"
  ON clients FOR ALL TO authenticated
  USING (
    CASE auth.jwt() ->> 'role'
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      ELSE false
    END
  );

CREATE POLICY "Employee read-only access to clients"
  ON clients FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'employee');

-- Similar policies for other operational tables
CREATE POLICY "Role-based access to quotations"
  ON quotations FOR ALL TO authenticated
  USING (
    CASE auth.jwt() ->> 'role'
      WHEN 'admin' THEN true
      WHEN 'manager' THEN true
      ELSE false
    END
  );

CREATE POLICY "Employee read-only access to quotations"
  ON quotations FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' = 'employee');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_role ON auth.users ((raw_user_meta_data->>'role'));
CREATE INDEX IF NOT EXISTS idx_contacts_user ON user_contacts(user_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);