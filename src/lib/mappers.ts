import { User, Space, Booking, Review, Enquiry } from '../types';

export function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    role: row.role,
    avatar: row.avatar,
    isBlocked: row.is_blocked,
    registeredAt: row.registered_at,
  };
}

export function mapSpace(row: any): Space {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    photos: row.photos || [],
    address: row.address,
    city: row.city,
    locality: row.locality,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    pricePerDay: Number(row.price_per_day),
    pricePerHour: Number(row.price_per_hour),
    amenities: row.amenities || [],
    isApproved: row.is_approved,
    ownerId: row.owner_id,
    ownerPhone: row.owner_phone || '',
    totalSeats: Number(row.total_seats),
    availableSeats: Number(row.available_seats),
    availability: row.availability,
    rating: Number(row.rating || 0),
    reviewsCount: Number(row.reviews_count || 0),
  };
}

export function mapBooking(row: any): Booking {
  return {
    id: row.id,
    spaceId: row.space_id,
    spaceName: row.space_name,
    spacePhoto: row.space_photo,
    userId: row.user_id,
    userName: row.user_name,
    date: row.booking_date,
    durationDays: row.duration_days ? Number(row.duration_days) : undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
    type: row.booking_type,
    seatsBooked: Number(row.seats_booked),
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapReview(row: any): Review {
  return {
    id: row.id,
    spaceId: row.space_id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatar: row.user_avatar,
    rating: Number(row.rating),
    comment: row.comment || '',
    date: row.created_at ? row.created_at.split('T')[0] : '',
  };
}

export function mapEnquiry(row: any): Enquiry {
  return {
    id: row.id,
    spaceId: row.space_id,
    spaceName: row.space_name,
    ownerId: row.owner_id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    userPhone: row.user_phone,
    timestamp: row.timestamp,
    notifiedGowriEmail: row.notified_gowri_email,
    ownerNotified: row.owner_notified,
  };
}

export function dbUser(user: Partial<User>): any {
  const row: any = {};
  if (user.id !== undefined) row.id = user.id;
  if (user.name !== undefined) row.name = user.name;
  if (user.email !== undefined) row.email = user.email;
  if (user.phone !== undefined) row.phone = user.phone;
  if (user.role !== undefined) row.role = user.role;
  if (user.avatar !== undefined) row.avatar = user.avatar;
  if (user.isBlocked !== undefined) row.is_blocked = user.isBlocked;
  if (user.registeredAt !== undefined) row.registered_at = user.registeredAt;
  return row;
}

export function dbSpace(space: Partial<Space>): any {
  const row: any = {};
  if (space.id !== undefined) row.id = space.id;
  if (space.name !== undefined) row.name = space.name;
  if (space.description !== undefined) row.description = space.description;
  if (space.photos !== undefined) row.photos = space.photos;
  if (space.address !== undefined) row.address = space.address;
  if (space.city !== undefined) row.city = space.city;
  if (space.locality !== undefined) row.locality = space.locality;
  if (space.lat !== undefined) row.latitude = space.lat;
  if (space.lng !== undefined) row.longitude = space.lng;
  if (space.pricePerDay !== undefined) row.price_per_day = space.pricePerDay;
  if (space.pricePerHour !== undefined) row.price_per_hour = space.pricePerHour;
  if (space.amenities !== undefined) row.amenities = space.amenities;
  if (space.isApproved !== undefined) row.is_approved = space.isApproved;
  if (space.ownerId !== undefined) row.owner_id = space.ownerId;
  if (space.ownerPhone !== undefined) row.owner_phone = space.ownerPhone;
  if (space.totalSeats !== undefined) row.total_seats = space.totalSeats;
  if (space.availableSeats !== undefined) row.available_seats = space.availableSeats;
  if (space.availability !== undefined) row.availability = space.availability;
  if (space.rating !== undefined) row.rating = space.rating;
  if (space.reviewsCount !== undefined) row.reviews_count = space.reviewsCount;
  return row;
}

export function dbBooking(booking: Partial<Booking>): any {
  const row: any = {};
  if (booking.id !== undefined) row.id = booking.id;
  if (booking.spaceId !== undefined) row.space_id = booking.spaceId;
  if (booking.spaceName !== undefined) row.space_name = booking.spaceName;
  if (booking.spacePhoto !== undefined) row.space_photo = booking.spacePhoto;
  if (booking.userId !== undefined) row.user_id = booking.userId;
  if (booking.userName !== undefined) row.user_name = booking.userName;
  if (booking.date !== undefined) row.booking_date = booking.date;
  if (booking.durationDays !== undefined) row.duration_days = booking.durationDays;
  if (booking.startTime !== undefined) row.start_time = booking.startTime;
  if (booking.endTime !== undefined) row.end_time = booking.endTime;
  if (booking.type !== undefined) row.booking_type = booking.type;
  if (booking.seatsBooked !== undefined) row.seats_booked = booking.seatsBooked;
  if (booking.totalPrice !== undefined) row.total_price = booking.totalPrice;
  if (booking.status !== undefined) row.status = booking.status;
  if (booking.createdAt !== undefined) row.created_at = booking.createdAt;
  return row;
}

export function dbReview(review: Partial<Review>): any {
  const row: any = {};
  if (review.id !== undefined) row.id = review.id;
  if (review.spaceId !== undefined) row.space_id = review.spaceId;
  if (review.userId !== undefined) row.user_id = review.userId;
  if (review.userName !== undefined) row.user_name = review.userName;
  if (review.userAvatar !== undefined) row.user_avatar = review.userAvatar;
  if (review.rating !== undefined) row.rating = review.rating;
  if (review.comment !== undefined) row.comment = review.comment;
  return row;
}

export function dbEnquiry(enquiry: Partial<Enquiry>): any {
  const row: any = {};
  if (enquiry.id !== undefined) row.id = enquiry.id;
  if (enquiry.spaceId !== undefined) row.space_id = enquiry.spaceId;
  if (enquiry.spaceName !== undefined) row.space_name = enquiry.spaceName;
  if (enquiry.ownerId !== undefined) row.owner_id = enquiry.ownerId;
  if (enquiry.userId !== undefined) row.user_id = enquiry.userId;
  if (enquiry.userName !== undefined) row.user_name = enquiry.userName;
  if (enquiry.userEmail !== undefined) row.user_email = enquiry.userEmail;
  if (enquiry.userPhone !== undefined) row.user_phone = enquiry.userPhone;
  if (enquiry.timestamp !== undefined) row.timestamp = enquiry.timestamp;
  if (enquiry.notifiedGowriEmail !== undefined) row.notified_gowri_email = enquiry.notifiedGowriEmail;
  if (enquiry.ownerNotified !== undefined) row.owner_notified = enquiry.ownerNotified;
  return row;
}
