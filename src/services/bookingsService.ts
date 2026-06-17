import { supabase } from '../lib/supabase';
import { Booking } from '../types';
import { mapBooking, dbBooking } from '../lib/mappers';

export const bookingsService = {
  async fetchAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBooking);
  },

  async fetchUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapBooking);
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    const dbData = dbBooking(booking as Partial<Booking>);
    delete dbData.id;
    delete dbData.created_at;

    const { data, error } = await supabase
      .from('bookings')
      .insert(dbData)
      .select('*')
      .single();

    if (error) throw error;

    // Decrement available seats in space
    const { data: spaceData, error: spaceError } = await supabase
      .from('spaces')
      .select('available_seats')
      .eq('id', booking.spaceId)
      .single();

    if (!spaceError && spaceData) {
      const newAvailable = Math.max(0, spaceData.available_seats - booking.seatsBooked);
      await supabase
        .from('spaces')
        .update({ available_seats: newAvailable })
        .eq('id', booking.spaceId);
    }

    return mapBooking(data);
  },

  async cancelBooking(id: string): Promise<Booking> {
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !bookingData) throw fetchError || new Error('Booking not found');

    const booking = mapBooking(bookingData);

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    // Refund/release seats back if it was not already cancelled
    if (booking.status !== 'cancelled') {
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('available_seats, total_seats')
        .eq('id', booking.spaceId)
        .single();

      if (!spaceError && spaceData) {
        const newAvailable = Math.min(spaceData.total_seats, spaceData.available_seats + booking.seatsBooked);
        await supabase
          .from('spaces')
          .update({ available_seats: newAvailable })
          .eq('id', booking.spaceId);
      }
    }

    return mapBooking(data);
  },

  async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled'): Promise<Booking> {
    if (status === 'cancelled') {
      return this.cancelBooking(id);
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapBooking(data);
  }
};

