import { supabase } from '../lib/supabase';
import { Space } from '../types';
import { mapSpace, dbSpace } from '../lib/mappers';

export const spacesService = {
  async fetchApprovedSpaces(): Promise<Space[]> {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('is_approved', true);
    
    if (error) throw error;
    return (data || []).map(mapSpace);
  },

  async fetchAllSpaces(): Promise<Space[]> {
    const { data, error } = await supabase
      .from('spaces')
      .select('*');
    
    if (error) throw error;
    return (data || []).map(mapSpace);
  },

  async createSpace(space: Omit<Space, 'id' | 'rating' | 'reviewsCount'>): Promise<Space> {
    const dbData = dbSpace(space as Partial<Space>);
    delete dbData.id;
    dbData.rating = 0;
    dbData.reviews_count = 0;

    const { data, error } = await supabase
      .from('spaces')
      .insert(dbData)
      .select('*')
      .single();

    if (error) throw error;
    return mapSpace(data);
  },

  async updateSpace(id: string, space: Partial<Space>): Promise<Space> {
    const dbData = dbSpace(space);
    const { data, error } = await supabase
      .from('spaces')
      .update(dbData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapSpace(data);
  },

  async approveSpace(id: string): Promise<Space> {
    return this.updateSpace(id, { isApproved: true });
  },

  async rejectSpace(id: string): Promise<void> {
    const { error } = await supabase
      .from('spaces')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
