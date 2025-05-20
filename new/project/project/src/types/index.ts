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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
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

export interface RentCalculationFormData {
  p1_order_type: 'micro' | 'large';
  p2_type_of_machine: string;
  p3_no_of_hours_working: number;
  p4_day_night: 'day' | 'night';
  p5_shift: 'single' | 'double';
  p6_sunday_working: 'yes' | 'no';
  p7_food_resources: number;
  p7_food_cost_per_resource: number;
  p10_accommodation_resources: number;
  p10_accommodation_cost_per_resource: number;
  p11_usage: 'heavy' | 'light';
  p12_distance_of_site: number;
  p13_trailer_cost: number;
  p14_mob_relaxation_given: number;
  p17_type_of_deal: 'no_advance' | 'credit' | 'long_credit';
  p18_extra_charge_for_p17: number;
  billing_gst: 'gst' | 'no_gst';
  p19_risk_factor: 'high' | 'medium' | 'low';
  p20_incidental_charges: number;
  p21_other_factors: 'area' | 'condition' | 'customer_reputation' | '';
  p22_charges_for_other_factors: number;
  contract_days?: number;
}

export interface RentCalculation extends RentCalculationFormData {
  id: string;
  total_rent: number;
  h2_value: number;
  h3_value: number;
  h4_value: number;
  h5_value: number;
  h7_value: number;
  h8_value: number;
  h9_value: number;
  h10_value: number;
  h11_value: number;
  created_at: string;
  // updated_at is missing in StoredRentCalculation, adding it for consistency
  updated_at: string; 
}