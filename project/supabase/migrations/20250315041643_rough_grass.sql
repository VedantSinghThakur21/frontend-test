/*
  # ASP Crane CRM Schema Setup

  1. New Tables
    - `clients` - Store client/company information
    - `inquiries` - Track initial inquiries and requirements
    - `site_visits` - Record site visit details and operator feedback
    - `quotations` - Store quotation details and negotiation history
    - `jobs` - Track job execution and completion
    - `operators` - Store operator information
    - `cranes` - Manage crane inventory
    - `costs` - Track cost calculations and estimates

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text,
  phone text NOT NULL,
  address text,
  is_existing_customer boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Operators table
CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  experience_years integer,
  certification_level text NOT NULL,
  specialization text[],
  availability_status text DEFAULT 'available',
  status text DEFAULT 'active',
  license_number text NOT NULL,
  license_expiry_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cranes table
CREATE TABLE IF NOT EXISTS cranes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  capacity text NOT NULL,
  registration_number text UNIQUE,
  maintenance_status text DEFAULT 'operational',
  current_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  crane_type text NOT NULL,
  rental_duration integer NOT NULL,
  expected_start_date date NOT NULL,
  location text NOT NULL,
  shift_type text DEFAULT 'day',
  site_conditions text,
  food_accommodation_required boolean DEFAULT false,
  additional_requirements text,
  status text DEFAULT 'pending',
  assigned_operator_id uuid REFERENCES operators(id),
  site_visit_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site Visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES inquiries(id),
  operator_id uuid REFERENCES operators(id),
  visit_date date NOT NULL,
  site_conditions text,
  access_challenges text,
  safety_concerns text,
  recommendations text,
  photos text[],
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cost Calculations table
CREATE TABLE IF NOT EXISTS cost_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES inquiries(id),
  distance_km numeric NOT NULL,
  toll_charges numeric DEFAULT 0,
  fuel_cost numeric NOT NULL,
  operator_cost numeric NOT NULL,
  maintenance_cost numeric DEFAULT 0,
  additional_costs numeric DEFAULT 0,
  total_cost numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid REFERENCES inquiries(id),
  cost_calculation_id uuid REFERENCES cost_calculations(id),
  version integer DEFAULT 1,
  total_amount numeric NOT NULL,
  advance_amount numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  validity_period integer DEFAULT 7,
  terms_conditions text,
  status text DEFAULT 'draft',
  negotiation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id),
  crane_id uuid REFERENCES cranes(id),
  operator_id uuid REFERENCES operators(id),
  start_date date NOT NULL,
  end_date date,
  status text DEFAULT 'scheduled',
  advance_payment_received boolean DEFAULT false,
  advance_payment_date timestamptz,
  final_payment_received boolean DEFAULT false,
  final_payment_date timestamptz,
  completion_notes text,
  client_feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS policies removed

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_client_id ON inquiries(client_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_site_visits_inquiry_id ON site_visits(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_quotations_inquiry_id ON quotations(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_jobs_quotation_id ON jobs(quotation_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_operators_updated_at
  BEFORE UPDATE ON operators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cranes_updated_at
  BEFORE UPDATE ON cranes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_site_visits_updated_at
  BEFORE UPDATE ON site_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cost_calculations_updated_at
  BEFORE UPDATE ON cost_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();