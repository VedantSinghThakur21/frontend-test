import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Client, Operator, Crane, Inquiry, SiteVisit, CostCalculation, Quotation, Job, RentCalculation, RentCalculationFormData } from '../types';
import { generateInsight } from '../lib/gemini';
import toast from 'react-hot-toast';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  created_at: string;
  updated_at: string;
}

interface Deal {
  id: string;
  title: string;
  contactId: string;
  value: number;
  status: string;
  expectedCloseDate?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Insight {
  id: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Store {
  // Data states
  clients: Client[];
  operators: Operator[];
  cranes: Crane[];
  inquiries: Inquiry[];
  siteVisits: SiteVisit[];
  costCalculations: CostCalculation[];
  rentCalculations: RentCalculation[];
  quotations: Quotation[];
  jobs: Job[];
  contacts: Contact[];
  deals: Deal[];
  insights: Insight[];
  loading: boolean;

  // Client actions
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Operator actions
  addOperator: (operator: Omit<Operator, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOperator: (id: string, operator: Partial<Operator>) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;

  // Job actions
  addJob: (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateJob: (id: string, job: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  // Inquiry actions
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInquiry: (id: string, inquiry: Partial<Inquiry>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  // Contact actions
  addContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  generateAIInsight: (contactId: string, type: string) => Promise<void>;

  // Deal actions
  addDeal: (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;

  // Quotation actions
  addQuotation: (quotation: Omit<Quotation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;

  // Rent Calculation actions
  addRentCalculation: (calculation: Omit<RentCalculation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRentCalculation: (id: string, calculation: Partial<RentCalculation>) => Promise<void>;
  deleteRentCalculation: (id: string) => Promise<void>;

  // Data fetching
  fetchData: () => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  clients: [],
  operators: [],
  cranes: [],
  inquiries: [],
  siteVisits: [],
  costCalculations: [],
  rentCalculations: [],
  quotations: [],
  jobs: [],
  contacts: [],
  deals: [],
  insights: [],
  loading: false,

  addClient: async (client) => {
    try {
      // Validate required fields
      if (!client.company_name || !client.contact_person || !client.phone) {
        throw new Error('Missing required fields');
      }

      // Set default values for optional fields
      const clientData = {
        ...client,
        is_existing_customer: client.is_existing_customer || false
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint error
          throw new Error('A client with this information already exists');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create client');
      }

      set((state) => ({ clients: [...state.clients, data] }));
      toast.success('Client added successfully');
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast.error(error.message || 'Failed to add client');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateClient: async (id, client) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
      toast.success('Client updated successfully');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));
      toast.success('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addCrane: async (crane) => {
    try {
      if (!crane.model || !crane.capacity || !crane.registration_number || !crane.status) {
        throw new Error('Missing required fields: model, capacity, registration number, and status are required');
      }

      const { data, error } = await supabase
        .from('cranes')
        .insert([crane])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A crane with this registration number already exists');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create crane');
      }

      set((state) => ({ cranes: [...state.cranes, data] }));
      toast.success('Crane added successfully');
    } catch (error: any) {
      console.error('Error adding crane:', error);
      toast.error(error.message || 'Failed to add crane');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addInquiry: async (inquiry) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert([inquiry])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ inquiries: [...state.inquiries, data] }));
      toast.success('Inquiry added successfully');
    } catch (error) {
      console.error('Error adding inquiry:', error);
      toast.error('Failed to add inquiry');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateInquiry: async (id, inquiry) => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .update(inquiry)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, ...data } : i)),
      }));
      toast.success('Inquiry updated successfully');
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error('Failed to update inquiry');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteInquiry: async (id) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        inquiries: state.inquiries.filter((i) => i.id !== id),
      }));
      toast.success('Inquiry deleted successfully');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addContact: async (contact) => {
    try {
      // Validate required fields
      if (!contact.first_name || !contact.last_name || !contact.email) {
        throw new Error('First name, last name and email are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        throw new Error('Invalid email format');
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint error
          throw new Error('A contact with this email already exists');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create contact');
      }

      set((state) => ({ contacts: [...state.contacts, data] }));
      toast.success('Contact added successfully');
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast.error(error.message || 'Failed to add contact');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateContact: async (id, contact) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(contact)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)),
      }));
      toast.success('Contact updated successfully');
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteContact: async (id) => {
    try {
      // Check if contact exists
      const contact = get().contacts.find((c) => c.id === id);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Check for related records
      const { data: relatedDeals, error: dealsError } = await supabase
        .from('deals')
        .select('id')
        .eq('contact_id', id);

      if (dealsError) throw dealsError;
      if (relatedDeals && relatedDeals.length > 0) {
        throw new Error('Cannot delete contact with associated deals');
      }

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') {
          throw new Error('Cannot delete contact due to related records');
        }
        throw error;
      }

      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
      }));
      toast.success('Contact deleted successfully');
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast.error(error.message || 'Failed to delete contact');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  generateAIInsight: async (contactId, type) => {
    try {
      const insight = await generateInsight(contactId, type);
      if (!insight) throw new Error('Failed to generate insight');

      set((state) => ({ insights: [...state.insights, insight] }));
      toast.success('AI insight generated successfully');
    } catch (error) {
      console.error('Error generating AI insight:', error);
      toast.error('Failed to generate AI insight');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addCostCalculation: async (calculation) => {
    try {
      // Validate required fields
      if (!calculation.inquiry_id || !calculation.distance_km || !calculation.fuel_cost || !calculation.operator_cost) {
        throw new Error('Missing required fields: inquiry, distance, fuel cost, and operator cost are required');
      }

      // Validate numeric fields are positive
      const numericFields = ['distance_km', 'toll_charges', 'fuel_cost', 'operator_cost', 'maintenance_cost', 'additional_costs'];
      for (const field of numericFields) {
        const value = Number(calculation[field]);
        if (isNaN(value) || value < 0) {
          throw new Error(`${field.replace('_', ' ')} must be a non-negative number`);
        }
      }

      const { data, error } = await supabase
        .from('cost_calculations')
        .insert([calculation])
        .select()
        .single();

      if (error) {
        if (error.code === '23503') {
          throw new Error('Invalid inquiry selected');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create cost calculation');
      }

      set((state) => ({ costCalculations: [...state.costCalculations, data] }));
      toast.success('Cost calculation added successfully');
    } catch (error: any) {
      console.error('Error adding cost calculation:', error);
      toast.error(error.message || 'Failed to add cost calculation');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addQuotation: async (quotation) => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .insert([quotation])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ quotations: [...state.quotations, data] }));
      toast.success('Quotation added successfully');
    } catch (error) {
      console.error('Error adding quotation:', error);
      toast.error('Failed to add quotation');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      // Add more detailed validation for required fields based on database schema
      if (!calculation.p4_day_night || !calculation.p5_shift || !calculation.p6_sunday_working || 
          !calculation.p11_usage || !calculation.p17_type_of_deal || !calculation.billing_gst || 
          !calculation.p19_risk_factor) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        // Handle specific errors like unique constraints if applicable
        if (error.code === '42P01') {
          throw new Error('Table rent_calculations does not exist. Please run the migration script.');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateQuotation: async (id, quotation) => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .update(quotation)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        quotations: state.quotations.map((q) => (q.id === id ? { ...q, ...data } : q)),
      }));
      toast.success('Quotation updated successfully');
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteQuotation: async (id) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        quotations: state.quotations.filter((q) => q.id !== id),
      }));
      toast.success('Quotation deleted successfully');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast.error('Failed to delete quotation');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addOperator: async (operator) => {
    try {
      // Validate required fields
      if (!operator.first_name || !operator.last_name) {
        throw new Error('First name and last name are required');
      }

      const { data, error } = await supabase
        .from('operators')
        .insert([operator])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint error
          throw new Error('An operator with this information already exists');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create operator');
      }

      set((state) => ({ operators: [...state.operators, data] }));
      toast.success('Operator added successfully');
    } catch (error: any) {
      console.error('Error adding operator:', error);
      toast.error(error.message || 'Failed to add operator');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateOperator: async (id, operator) => {
    try {
      const { data, error } = await supabase
        .from('operators')
        .update(operator)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        operators: state.operators.map((o) => (o.id === id ? { ...o, ...data } : o)),
      }));
      toast.success('Operator updated successfully');
    } catch (error) {
      console.error('Error updating operator:', error);
      toast.error('Failed to update operator');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteOperator: async (id) => {
    try {
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        operators: state.operators.filter((o) => o.id !== id),
      }));
      toast.success('Operator deleted successfully');
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Failed to delete operator');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addJob: async (job) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([job])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ jobs: [...state.jobs, data] }));
      toast.success('Job added successfully');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateJob: async (id, job) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(job)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...data } : j)),
      }));
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteJob: async (id) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== id),
      }));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  addDeal: async (deal) => {
    try {
      // Validate required fields
      if (!deal.title || !deal.contactId || !deal.value || !deal.status) {
        throw new Error('Missing required fields: title, contact, value, and status are required');
      }

      // Validate value is a positive number
      const value = Number(deal.value);
      if (isNaN(value) || value <= 0) {
        throw new Error('Deal value must be a positive number');
      }

      // Map contactId to contact_id and validate expectedCloseDate for database schema
      const dealData = {
        ...deal,
        contact_id: deal.contactId,
        value: value,
        expected_close_date: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : null
      };
      delete dealData.contactId;
      delete dealData.expectedCloseDate;

      const { data, error } = await supabase
        .from('deals')
        .insert([dealData])
        .select()
        .single();

      if (error) {
        if (error.code === '23503') {
          throw new Error('Invalid contact selected');
        }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create deal');
      }

      set((state) => ({ deals: [...state.deals, data] }));
      toast.success('Deal added successfully');
    } catch (error) {
      console.error('Error adding deal:', error);
      toast.error('Failed to add deal');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  updateDeal: async (id, deal) => {
    try {
      // Map frontend fields to database fields and format date
      const dealData: Record<string, any> = {};
      if (deal.title !== undefined) dealData.title = deal.title;
      if (deal.contactId !== undefined) dealData.contact_id = deal.contactId;
      if (deal.value !== undefined) dealData.value = Number(deal.value);
      if (deal.status !== undefined) dealData.status = deal.status;
      if (deal.expectedCloseDate !== undefined) {
        dealData.expected_close_date = deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : null;
      }
      if (deal.notes !== undefined) dealData.notes = deal.notes;

      // Ensure we don't try to update with an empty object
      if (Object.keys(dealData).length === 0) {
        toast.error('No changes detected to update.');
        return;
      }

      const { data, error } = await supabase
        .from('deals')
        .update(dealData) // Use the mapped data
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23503') { // Foreign key violation
          toast.error('Invalid contact selected.');
        } else {
          throw error;
        }
        return; // Stop execution if there was an error
      }

      if (!data) {
        throw new Error('Update returned no data');
      }

      // Update the state with the potentially modified data from the DB
      set((state) => ({
        deals: state.deals.map((d) => (d.id === id ? { ...d, ...data } : d)),
      }));
      toast.success('Deal updated successfully');
    } catch (error: any) {
      console.error('Error updating deal:', error);
      toast.error(error.message || 'Failed to update deal');
      // Do not re-throw the error here unless necessary for upstream handling
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  deleteDeal: async (id) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        deals: state.deals.filter((d) => d.id !== id),
      }));
      toast.success('Deal deleted successfully');
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to delete deal');
      throw error;
    }
  },

  addRentCalculation: async (calculation) => {
    try {
      // Validate required fields (example, adjust based on actual needs)
      if (!calculation.p1_order_type || !calculation.p2_type_of_machine || !calculation.p3_no_of_hours_working) {
        throw new Error('Missing required fields for rent calculation');
      }

      const { data, error } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .insert([calculation])
        .select()
        .single();

      if (error) {
        // Handle specific errors like unique constraints if applicable
        // if (error.code === '23505') {
        //   throw new Error('A rent calculation with this information already exists');
        // }
        throw error;
      }

      if (!data) {
        throw new Error('Failed to create rent calculation');
      }

      set((state) => ({ rentCalculations: [...state.rentCalculations, data as RentCalculation] }));
      toast.success('Rent calculation added successfully');
    } catch (error: any) {
      console.error('Error adding rent calculation:', error);
      toast.error(error.message || 'Failed to add rent calculation');
      throw error;
    }
  },

  updateRentCalculation: async (id, calculationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('rent_calculations')
        .update(calculationUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update rent calculation, no data returned.');

      set((state) => ({
        rentCalculations: state.rentCalculations.map((rc) => 
          rc.id === id ? { ...rc, ...data } as RentCalculation : rc
        ),
      }));
      toast.success('Rent calculation updated successfully');
    } catch (error: any) {
      console.error('Error updating rent calculation:', error);
      toast.error(error.message || 'Failed to update rent calculation');
      throw error;
    }
  },

  deleteRentCalculation: async (id) => {
    try {
      const { error } = await supabase
        .from('rent_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        rentCalculations: state.rentCalculations.filter((rc) => rc.id !== id),
      }));
      toast.success('Rent calculation deleted successfully');
    } catch (error: any) {
      console.error('Error deleting rent calculation:', error);
      toast.error(error.message || 'Failed to delete rent calculation');
      throw error;
    }
  },

  fetchData: async () => {
    set({ loading: true });
    try {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      const { data: operators, error: operatorsError } = await supabase
        .from('operators')
        .select('*');

      const { data: cranes, error: cranesError } = await supabase
        .from('cranes')
        .select('*');

      const { data: inquiries, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*');

      const { data: siteVisits, error: siteVisitsError } = await supabase
        .from('site_visits')
        .select('*');

      const { data: costCalculations, error: costCalculationsError } = await supabase
        .from('cost_calculations')
        .select('*');

      const { data: rentCalculations, error: rentCalculationsError } = await supabase
        .from('rent_calculations') // Ensure this table name is correct
        .select('*');

      const { data: quotations, error: quotationsError } = await supabase
        .from('quotations')
        .select('*');

      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*');

      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('Error fetching contacts:', contactsError);
        throw new Error('Error fetching contacts');
      }

      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (dealsError) {
        console.error('Error fetching deals:', dealsError);
        throw new Error('Error fetching deals');
      }

      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (insightsError) {
        console.error('Error fetching insights:', insightsError);
        throw new Error('Error fetching insights');
      }

      if (clientsError || operatorsError || cranesError || inquiriesError || siteVisitsError || costCalculationsError || rentCalculationsError || quotationsError || jobsError) {
        throw new Error('Error fetching data');
      }

      set({
        loading: false,
        clients: clients || [],
        operators: operators || [],
        cranes: cranes || [],
        inquiries: inquiries || [],
        siteVisits: siteVisits || [],
        costCalculations: costCalculations || [],
        rentCalculations: rentCalculations || [],
        quotations: quotations || [],
        jobs: jobs || [],
        contacts: contacts || [],
        deals: deals || [],
        insights: insights || [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
      set({ loading: false });
      throw error;
    }
  }
}));