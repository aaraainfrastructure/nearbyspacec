import { supabase } from '../lib/supabase';
import { User } from '../types';
import { mapUser } from '../lib/mappers';

export const usersService = {
  async fetchAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapUser);
  },

  async updateUserRole(id: string, role: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapUser(data);
  },

  async toggleBlockUser(id: string): Promise<User> {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('is_blocked')
      .eq('id', id)
      .single();

    if (fetchError || !user) throw fetchError || new Error('User not found');

    const { data, error } = await supabase
      .from('users')
      .update({ is_blocked: !user.is_blocked })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapUser(data);
  },

  async createUser(user: Omit<User, 'id' | 'registeredAt' | 'isBlocked'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        is_blocked: false
      })
      .select('*')
      .single();

    if (error) throw error;
    return mapUser(data);
  }
};
