export type Role = 'user' | 'owner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar: string;
  isBlocked: boolean;
  registeredAt: string;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  photos: string[];
  address: string;
  city: string;
  locality: string;
  lat: number;
  lng: number;
  pricePerDay: number;
  pricePerHour: number;
  amenities: string[];
  isApproved: boolean; // Approved by admin
  ownerId: string;
  ownerPhone: string;
  totalSeats: number;
  availableSeats: number;
  availability: 'all' | 'weekdays' | 'weekends';
  rating: number;
  reviewsCount: number;
}

export interface Booking {
  id: string;
  spaceId: string;
  spaceName: string;
  spacePhoto: string;
  userId: string;
  userName: string;
  date: string;
  durationDays?: number;
  startTime?: string;
  endTime?: string;
  type: 'hourly' | 'daily';
  seatsBooked: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  spaceId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Favorite {
  spaceId: string;
}

export interface Enquiry {
  id: string;
  spaceId: string;
  spaceName: string;
  ownerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  timestamp: string;
  notifiedGowriEmail: string; // "gowri7282@gmail.com"
  ownerNotified: boolean;
}
