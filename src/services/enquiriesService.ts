import { supabase } from '../lib/supabase';
import { Enquiry } from '../types';
import { mapEnquiry, dbEnquiry } from '../lib/mappers';

export const enquiriesService = {
  async fetchEnquiries(): Promise<Enquiry[]> {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapEnquiry);
  },

  async createEnquiry(enquiry: Omit<Enquiry, 'id' | 'timestamp'>): Promise<Enquiry> {
    const dbData = dbEnquiry(enquiry as Partial<Enquiry>);
    delete dbData.id;
    delete dbData.timestamp;

    const { data, error } = await supabase
      .from('enquiries')
      .insert(dbData)
      .select('*')
      .single();

    if (error) throw error;
    return mapEnquiry(data);
  },

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<Enquiry> {
    const dbData = dbEnquiry(updates);
    const { data, error } = await supabase
      .from('enquiries')
      .update(dbData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapEnquiry(data);
  }
};
