import { User, Space, Booking, Review } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 43210',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    isBlocked: false,
    registeredAt: '2026-02-15'
  },
  {
    id: 'owner-1',
    name: 'Rajesh Gupta',
    email: 'rajesh.gupta@coworkindia.com',
    phone: '+91 91234 56789',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isBlocked: false,
    registeredAt: '2026-01-10'
  },
  {
    id: 'admin-1',
    name: 'Gowri Shanker',
    email: 'gowri7282@gmail.com',
    phone: '+91 99887 76655',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    isBlocked: false,
    registeredAt: '2025-12-01'
  }
];

export const INITIAL_SPACES: Space[] = [
  {
    id: 'space-1',
    name: 'Bengaluru Tech Sanctuary',
    description: 'A premium, modern workspace featuring raw wooden aesthetic desks, natural layout ergonomics, plant decorations, high-fidelity acoustics, professional enterprise routers, soundproof phone booths, and free-flowing South Indian filter coffee. Extremely close to Metro Station.',
    photos: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600'
    ],
    address: '98, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    lat: 12.9784,
    lng: 77.6408,
    pricePerDay: 450,
    pricePerHour: 80,
    amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Power Backup', 'Printer'],
    isApproved: true,
    ownerId: 'owner-1',
    ownerPhone: '+91 98765 12345',
    totalSeats: 32,
    availableSeats: 18,
    availability: 'weekdays',
    rating: 4.8,
    reviewsCount: 3
  },
  {
    id: 'space-2',
    name: 'Zenith Premium Mumbai Cabin',
    description: 'Elevate your enterprise team with panoramic top-deck views of the Arabian Sea in our Bandra West shared workspaces. Perfect for executives, tech leads, and founders. Handcrafted workspace design with ergonomic desks, executive layout, and instant 1 Gbps broadband connection.',
    photos: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
      'https://images.unsplash.com/photo-1542744095-29185346892f?w=600',
      'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'
    ],
    address: 'Link Road, Bandra West, Mumbai, Maharashtra 400050',
    city: 'Mumbai',
    locality: 'Bandra West',
    lat: 19.0596,
    lng: 72.8295,
    pricePerDay: 850,
    pricePerHour: 150,
    amenities: ['WiFi', 'AC', 'Meeting Room', 'Power Backup', 'Printer'],
    isApproved: true,
    ownerId: 'owner-1',
    ownerPhone: '+91 91234 98765',
    totalSeats: 15,
    availableSeats: 7,
    availability: 'all',
    rating: 4.9,
    reviewsCount: 2
  },
  {
    id: 'space-3',
    name: 'Innovate Hub Gurugram',
    description: 'A vibrant collaborative hot seat environment right in DLF CyberCity, Delhi NCR. Flooded with natural radiant lighting, customized posture chairs, quiet privacy pods, secure document storage lockers, and custom snack bar. Designed for active dreamers and startups.',
    photos: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600'
    ],
    address: 'DLF CyberCity, Phase 3, Gurugram, Haryana 122002',
    city: 'Delhi NCR',
    locality: 'DLF CyberCity',
    lat: 28.4595,
    lng: 77.0266,
    pricePerDay: 350,
    pricePerHour: 60,
    amenities: ['WiFi', 'AC', 'Parking', 'Cafeteria', 'Printer'],
    isApproved: true,
    ownerId: 'owner-1',
    ownerPhone: '+91 99445 56677',
    totalSeats: 40,
    availableSeats: 30,
    availability: 'all',
    rating: 4.5,
    reviewsCount: 1
  },
  {
    id: 'space-4',
    name: 'Summit Executive Gachibowli',
    description: 'State-of-the-art private meeting room and conference deck. Explicitly optimized for board interactions, pitch presentations, and developer offline strategy alignments. High-speed multi-gig fiber, surround-sound smart LED panels, and premium caterings upon request.',
    photos: [
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800',
      'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'
    ],
    address: 'Hitech City Road, Gachibowli, Hyderabad, Telangana 500032',
    city: 'Hyderabad',
    locality: 'Gachibowli',
    lat: 17.4401,
    lng: 78.3489,
    pricePerDay: 1500,
    pricePerHour: 300,
    amenities: ['WiFi', 'AC', 'Meeting Room', 'Parking', 'Power Backup', 'Printer'],
    isApproved: true,
    ownerId: 'owner-2',
    ownerPhone: '+91 90001 20002',
    totalSeats: 12,
    availableSeats: 12,
    availability: 'weekdays',
    rating: 4.7,
    reviewsCount: 1
  },
  {
    id: 'space-5',
    name: 'The Oasis Koregaon Park',
    description: 'A cozy boutique workstation set amidst the leafy lanes of Lane 5, Koregaon Park, Pune. Features standing desks, private laptop docks, comfortable lounge beanbags, local bakery partnerships, and extremely silent outdoor terrace section.',
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'
    ],
    address: 'Koregaon Park, Lane 5, Pune, Maharashtra 411001',
    city: 'Pune',
    locality: 'Koregaon Park',
    lat: 18.5362,
    lng: 73.8940,
    pricePerDay: 299,
    pricePerHour: 50,
    amenities: ['WiFi', 'AC', 'Cafeteria', 'Power Backup'],
    isApproved: true,
    ownerId: 'owner-3',
    ownerPhone: '+91 88888 77777',
    totalSeats: 25,
    availableSeats: 15,
    availability: 'all',
    rating: 4.6,
    reviewsCount: 2
  },
  {
    id: 'space-6',
    name: 'Hive West OMR Shared Desks',
    description: 'An upcoming modern architectural co-working facility located right on the IT Corridor in OMR Chennai. Clean concrete design, rooftop workspace, high-density secure locks, high-capacity generators, and soundproof study bays.',
    photos: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
    ],
    address: 'OMR Road, Karapakkam, Chennai, Tamil Nadu 600097',
    city: 'Chennai',
    locality: 'OMR Road',
    lat: 12.9229,
    lng: 80.2224,
    pricePerDay: 550,
    pricePerHour: 90,
    amenities: ['WiFi', 'AC', 'Parking', 'Meeting Room', 'Power Backup'],
    isApproved: true, // Approved as well, or we can make it 6 approved entries as requested!
    ownerId: 'owner-1',
    ownerPhone: '+91 97766 55443',
    totalSeats: 20,
    availableSeats: 20,
    availability: 'weekdays',
    rating: 4.4,
    reviewsCount: 1
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    spaceId: 'space-1',
    spaceName: 'Bengaluru Tech Sanctuary',
    spacePhoto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    userId: 'usr-1',
    userName: 'Rahul Sharma',
    date: '2026-06-20',
    type: 'daily',
    seatsBooked: 1,
    totalPrice: 450,
    status: 'confirmed',
    createdAt: '2026-06-15T10:30:00Z'
  },
  {
    id: 'b-2',
    spaceId: 'space-2',
    spaceName: 'Zenith Premium Mumbai Cabin',
    spacePhoto: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
    userId: 'usr-1',
    userName: 'Rahul Sharma',
    date: '2026-06-18',
    type: 'hourly',
    startTime: '10:00',
    endTime: '14:00',
    seatsBooked: 2,
    totalPrice: 1200,
    status: 'confirmed',
    createdAt: '2026-06-16T15:45:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r-1',
    spaceId: 'space-1',
    userId: 'usr-2',
    userName: 'Rajesh Gupta',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 5,
    comment: 'Superb atmosphere! Quick access to Indiranagar Metro Station makes commuting flawless. Blazing symmetric internet speed.',
    date: '2026-06-05'
  },
  {
    id: 'r-2',
    spaceId: 'space-1',
    userId: 'usr-1',
    userName: 'Rahul Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    rating: 5,
    comment: 'The South Indian filter coffee is incredible! Highly recommended daily desk.',
    date: '2026-06-14'
  }
];
