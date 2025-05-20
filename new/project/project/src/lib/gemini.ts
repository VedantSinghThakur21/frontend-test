import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI('AIzaSyCgBpB5DvWRWOEBSNk6D57aMXMqZd3_XeY');

export async function generateInsight(contactId: string, type: string) {
  // Validate insight type
  const validTypes = ['sentiment', 'opportunity', 'risk', 'action'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid insight type. Must be one of: ${validTypes.join(', ')}`);
  }

  try {
    // Check if API key is configured
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Fetch contact details with comprehensive error handling
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError) {
      if (contactError.code === 'PGRST116') {
        throw new Error('Contact not found');
      }
      throw new Error(`Failed to fetch contact: ${contactError.message}`);
    }
    if (!contact) throw new Error('Contact not found');

    // Fetch related deals with error handling
    let deals = [];
    const { data: dealsData, error: dealsError } = await supabase
      .from('deals')
      .select('*')
      .eq('contact_id', contactId);

    if (dealsError) {
      console.error('Error fetching deals:', dealsError);
      // Continue without deals data rather than failing
    } else if (dealsData) {
      deals = dealsData;
    }

    // Create a prompt based on the contact and deals data
    const prompt = `Analyze the following contact and their deals to generate a ${type} insight:
    
    Contact: ${contact.first_name} ${contact.last_name}
    Company: ${contact.company || 'N/A'}
    Position: ${contact.position || 'N/A'}
    Last Contacted: ${contact.last_contacted_at || 'Never'}
    Notes: ${contact.notes || 'N/A'}
    
    Deals: ${deals?.map(deal => `
    - ${deal.title} (${deal.status})
      Value: ₹${deal.value}
      Expected Close: ${deal.expected_close_date || 'N/A'}
      Notes: ${deal.notes || 'N/A'}
    `).join('\n') || 'No deals'}
    
    Generate a concise, actionable ${type} insight based on this information. Focus on business opportunities, risks, or relationship management depending on the context.`;

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Generate the insight
    let insight;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      insight = response.text();
      if (!insight) throw new Error('Failed to generate insight: Empty response');
    } catch (aiError) {
      throw new Error(`AI model error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
    }

    // Save the insight to the database
    const { data: savedInsight, error } = await supabase
      .from('ai_insights')
      .insert([{
        contact_id: contactId,
        type,
        content: insight
      }])
      .select()
      .single();

    if (error) throw error;
    return savedInsight;

  } catch (error) {
    console.error('Error generating insight:', error);
    throw error;
  }
}