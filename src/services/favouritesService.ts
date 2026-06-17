import { supabase } from '../lib/supabase';

export const favouritesService = {
  async fetchUserFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('space_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(row => row.space_id);
  },

  async toggleFavorite(userId: string, spaceId: string): Promise<string[]> {
    const { data, error: fetchError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('space_id', spaceId);

    if (fetchError) throw fetchError;

    if (data && data.length > 0) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('space_id', spaceId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, space_id: spaceId });
      
      if (error) throw error;
    }

    return this.fetchUserFavorites(userId);
  }
};
