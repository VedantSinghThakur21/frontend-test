import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Client, Operator, Crane, Inquiry, SiteVisit, CostCalculation, Quotation, Job } from '../types';
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
  quotations: [],
  jobs: [],
  contacts: [],
  deals: [],
  insights: [],
  loading: true, // Start with loading true until initial fetch is done

  // --- Data Fetching ---
  fetchData: async () => {
    set({ loading: true });
    try {
      const [clientsRes, operatorsRes, cranesRes, inquiriesRes, siteVisitsRes, costCalculationsRes, quotationsRes, jobsRes, contactsRes, dealsRes, insightsRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('operators').select('*'),
        supabase.from('cranes').select('*'),
        supabase.from('inquiries').select('*'),
        supabase.from('site_visits').select('*'),
        supabase.from('cost_calculations').select('*'),
        supabase.from('quotations').select('*'),
        supabase.from('jobs').select('*'),
        supabase.from('contacts').select('*'),
        supabase.from('deals').select('*'),
        supabase.from('insights').select('*'),
      ]);

      if (clientsRes.error) throw new Error(`Failed to fetch clients: ${clientsRes.error.message}`);
      if (operatorsRes.error) throw new Error(`Failed to fetch operators: ${operatorsRes.error.message}`);
      if (cranesRes.error) throw new Error(`Failed to fetch cranes: ${cranesRes.error.message}`);
      if (inquiriesRes.error) throw new Error(`Failed to fetch inquiries: ${inquiriesRes.error.message}`);
      if (siteVisitsRes.error) throw new Error(`Failed to fetch site visits: ${siteVisitsRes.error.message}`);
      if (costCalculationsRes.error) throw new Error(`Failed to fetch cost calculations: ${costCalculationsRes.error.message}`);
      if (quotationsRes.error) throw new Error(`Failed to fetch quotations: ${quotationsRes.error.message}`);
      if (jobsRes.error) throw new Error(`Failed to fetch jobs: ${jobsRes.error.message}`);
      if (contactsRes.error) throw new Error(`Failed to fetch contacts: ${contactsRes.error.message}`);
      if (dealsRes.error) throw new Error(`Failed to fetch deals: ${dealsRes.error.message}`);
      if (insightsRes.error) throw new Error(`Failed to fetch insights: ${insightsRes.error.message}`);

      set({
        clients: clientsRes.data || [],
        operators: operatorsRes.data || [],
        cranes: cranesRes.data || [],
        inquiries: inquiriesRes.data || [],
        siteVisits: siteVisitsRes.data || [],
        costCalculations: costCalculationsRes.data || [],
        quotations: quotationsRes.data || [],
        jobs: jobsRes.data || [],
        contacts: contactsRes.data || [],
        deals: dealsRes.data || [],
        insights: insightsRes.data || [],
      });

    } catch (error: any) {
      console.error("Error fetching initial data:", error);
      toast.error(`Failed to load data: ${error.message}`);
      // Depending on requirements, you might want to clear state or handle differently
      set({
        clients: [],
        operators: [],
        cranes: [],
        inquiries: [],
        siteVisits: [],
        costCalculations: [],
        quotations: [],
        jobs: [],
        contacts: [],
        deals: [],
        insights: [],
      });
    } finally {
      set({ loading: false });
    }
  },

  // --- Client Actions ---
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

  // --- Operator Actions ---
  addOperator: async (operator) => {
    try {
      if (!operator.name || !operator.license_number || !operator.contact_number) {
        throw new Error('Missing required fields: name, license number, and contact number are required');
      }

      const { data, error } = await supabase
        .from('operators')
        .insert([operator])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('An operator with this license number already exists');
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

  // --- Crane Actions ---
  // Placeholder for addCrane, updateCrane, deleteCrane

  // --- Inquiry Actions ---
  addInquiry: async (inquiry) => {
    try {
      if (!inquiry.client_id || !inquiry.crane_type || !inquiry.rental_duration || !inquiry.expected_start_date || !inquiry.location) {
        throw new Error('Missing required fields for inquiry');
      }

      const { data, error } = await supabase
        .from('inquiries')
        .insert([{ ...inquiry, status: inquiry.status || 'pending' }])
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to create inquiry');
      }

      set((state) => ({ inquiries: [...state.inquiries, data] }));
      toast.success('Inquiry added successfully');
    } catch (error: any) {
      console.error('Error adding inquiry:', error);
      toast.error(error.message || 'Failed to add inquiry');
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

  // --- Site Visit Actions ---
  // Placeholder for addSiteVisit, updateSiteVisit, deleteSiteVisit

  // --- Cost Calculation Actions ---
  // Placeholder for addCostCalculation, updateCostCalculation, deleteCostCalculation

  // --- Quotation Actions ---
  addQuotation: async (quotation) => {
    try {
      if (!quotation.inquiry_id || !quotation.cost_calculation_id || !quotation.validity_period) {
        throw new Error('Missing required fields for quotation');
      }

      const { data, error } = await supabase
        .from('quotations')
        .insert([{ ...quotation, status: quotation.status || 'pending', version: quotation.version || 1 }])
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to create quotation');
      }

      set((state) => ({ quotations: [...state.quotations, data] }));
      toast.success('Quotation added successfully');
    } catch (error: any) {
      console.error('Error adding quotation:', error);
      toast.error(error.message || 'Failed to add quotation');
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

  // --- Job Actions ---
  addJob: async (job) => {
    try {
      if (!job.quotation_id || !job.start_date || !job.end_date || !job.status) {
        throw new Error('Missing required fields for job');
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([job])
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to create job');
      }

      set((state) => ({ jobs: [...state.jobs, data] }));
      toast.success('Job added successfully');
    } catch (error: any) {
      console.error('Error adding job:', error);
      toast.error(error.message || 'Failed to add job');
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

  // --- Contact Actions ---
  addContact: async (contact) => {
    try {
      if (!contact.first_name || !contact.last_name || !contact.email) {
        throw new Error('Missing required fields: first name, last name, and email are required');
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
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

  deleteContact: async (id) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
      }));
      toast.success('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
      throw error;
    }
  },

  generateAIInsight: async (contactId, type) => {
    const contact = get().contacts.find(c => c.id === contactId);
    if (!contact) {
      toast.error('Contact not found');
      return;
    }

    toast.loading(`Generating ${type} insight...`);
    try {
      const insightContent = await generateInsight(contact, type);
      const { data, error } = await supabase
        .from('insights')
        .insert({ contact_id: contactId, type, content: insightContent })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({ insights: [...state.insights, data] }));
      toast.dismiss();
      toast.success(`${type} insight generated successfully`);
    } catch (error: any) {
      console.error(`Error generating ${type} insight:`, error);
      toast.dismiss();
      toast.error(`Failed to generate ${type} insight: ${error.message}`);
    }
  },

  // --- Deal Actions ---
  addDeal: async (deal) => {
    try {
      if (!deal.title || !deal.contactId || !deal.value || !deal.status) {
        throw new Error('Missing required fields: title, contact, value, and status are required');
      }

      const { data, error } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to create deal');
      }

      set((state) => ({ deals: [...state.deals, data] }));
      toast.success('Deal added successfully');
    } catch (error: any) {
      console.error('Error adding deal:', error);
      toast.error(error.message || 'Failed to add deal');
      throw error;
    }
  },

  updateDeal: async (id, deal) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update(deal)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        deals: state.deals.map((d) => (d.id === id ? { ...d, ...data } : d)),
      }));
      toast.success('Deal updated successfully');
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
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

}));