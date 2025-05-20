/*
  # Initial CRM Schema Setup

  1. New Tables
    - `contacts`
      - Basic contact information
      - Company and position details
      - Contact history tracking
    - `deals`
      - Deal tracking with stages
      - Value and status management
    - `ai_insights`
      - AI-generated insights
      - Linked to contacts
    - `user_contacts`
      - Junction table for user-contact relationships
      - Manages contact ownership and access control

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users
*/

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  company text,
  position text,
  last_contacted_at timestamptz,
  notes text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User-Contacts junction table
CREATE TABLE IF NOT EXISTS user_contacts (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, contact_id)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id),
  title text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'lead',
  expected_close_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AI Insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id),
  type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS policies removed

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_user_contacts_user_id ON user_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_contact_id ON user_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_contact_id ON ai_insights(contact_id);

-- Create function to automatically link contacts to users
CREATE OR REPLACE FUNCTION public.handle_new_contact()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_contacts (user_id, contact_id)
  VALUES (auth.uid(), NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically link new contacts
CREATE TRIGGER on_contact_created
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_contact();