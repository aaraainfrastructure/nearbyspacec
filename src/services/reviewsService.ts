import { supabase } from '../lib/supabase';
import { Review } from '../types';
import { mapReview, dbReview } from '../lib/mappers';

export const reviewsService = {
  async fetchAllReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapReview);
  },

  async fetchReviewsForSpace(spaceId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('space_id', spaceId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapReview);
  },

  async addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
    const dbData = dbReview(review as Partial<Review>);
    delete dbData.id;

    const { data, error } = await supabase
      .from('reviews')
      .insert(dbData)
      .select('*')
      .single();

    if (error) throw error;

    // Fetch all reviews for this space to recalculate average rating
    const { data: allReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('space_id', review.spaceId);

    if (!reviewsError && allReviews) {
      const count = allReviews.length;
      const total = allReviews.reduce((sum, r) => sum + Number(r.rating), 0);
      const avg = count > 0 ? total / count : 0;
      const roundedAvg = Math.round(avg * 10) / 10;

      await supabase
        .from('spaces')
        .update({
          rating: roundedAvg,
          reviews_count: count
        })
        .eq('id', review.spaceId);
    }

    return mapReview(data);
  }
};
