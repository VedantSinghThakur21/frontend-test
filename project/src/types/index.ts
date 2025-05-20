export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  email?: string;
  phone: string;
  address?: string;
  is_existing_customer: boolean;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  license_number: string;
  license_expiry_date: string;
  experience_years?: number;
  status: 'available' | 'assigned' | 'on_leave' | 'training';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Crane {
  id: string;
  model: string;
  capacity: string;
  registration_number: string;
  maintenance_status: string;
  current_location?: string;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  client_id: string;
  crane_type: string;
  rental_duration: number;
  expected_start_date: string;
  location: string;
  shift_type: string;
  site_conditions?: string;
  food_accommodation_required: boolean;
  additional_requirements?: string;
  status: string;
  assigned_operator_id?: string;
  site_visit_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteVisit {
  id: string;
  inquiry_id: string;
  operator_id: string;
  visit_date: string;
  site_conditions?: string;
  access_challenges?: string;
  safety_concerns?: string;
  recommendations?: string;
  photos?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CostCalculation {
  id: string;
  inquiry_id: string;
  distance_km: number;
  toll_charges: number;
  fuel_cost: number;
  operator_cost: number;
  maintenance_cost: number;
  additional_costs: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  inquiry_id: string;
  cost_calculation_id: string;
  version: number;
  total_amount: number;
  advance_amount: number;
  remaining_amount: number;
  validity_period: number;
  terms_conditions?: string;
  status: string;
  negotiation_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  quotation_id: string;
  crane_id: string;
  operator_id: string;
  start_date: string;
  end_date?: string;
  status: string;
  advance_payment_received: boolean;
  advance_payment_date?: string;
  final_payment_received: boolean;
  final_payment_date?: string;
  completion_notes?: string;
  client_feedback?: string;
  created_at: string;
  updated_at: string;
}