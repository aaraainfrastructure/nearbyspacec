import React, { useState, useEffect } from 'react';
import { User, Space, Booking, Review, Enquiry } from './types';
import { INITIAL_USERS, INITIAL_SPACES, INITIAL_BOOKINGS, INITIAL_REVIEWS } from './mockData';
import { DEFAULT_LAT, DEFAULT_LNG, calculateDistance, formatCurrency } from './utils';
import { spacesService } from './services/spacesService';
import { bookingsService } from './services/bookingsService';
import { usersService } from './services/usersService';
import { reviewsService } from './services/reviewsService';
import { favouritesService } from './services/favouritesService';
import { enquiriesService } from './services/enquiriesService';
import { supabase } from './lib/supabase';


// Icons
import { 
  Compass, Map, Sparkles, Building2, Ticket, Heart, Code, LogIn,
  LogOut, ShieldAlert, Laptop, Settings, ChevronRight, Menu, X, Users, Search, MapPin,
  Mail, CheckCircle, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import UserSpaceList from './components/UserSpaceList';
import MapView from './components/MapView';
import BookingModal from './components/BookingModal';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import TechDocs from './components/TechDocs';
import LeadPopupModal from './components/LeadPopupModal';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Mumbai': { lat: 19.0596, lng: 72.8295 },
  'Delhi NCR': { lat: 28.4595, lng: 77.0266 },
  'Hyderabad': { lat: 17.4401, lng: 78.3489 },
  'Chennai': { lat: 12.9229, lng: 80.2224 },
  'Pune': { lat: 18.5362, lng: 73.8940 }
};

export default function App() {
  // Database States loaded from Supabase
  const [spaces, setSpaces] = useState<Space[]>(INITIAL_SPACES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State to hold active visual notification toasts
  interface ToastItem {
    id: string;
    spaceName: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    notifiedGowriEmail: string;
    timestamp: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Owner phone verification states
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  const [leadTargetSpace, setLeadTargetSpace] = useState<Space | null>(null);
  const [verifiedSpaceIds, setVerifiedSpaceIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('ns_verified_leads');
    return saved ? JSON.parse(saved) : [];
  });

  // Professional Search dropdown filters
  const [searchCity, setSearchCity] = useState<string>('all');
  const [searchLocality, setSearchLocality] = useState<string>('all');
  const [searchSpaceType, setSearchSpaceType] = useState<string>('all');
  const [searchMaxPrice, setSearchMaxPrice] = useState<string>('any');

  // Current session coordinates
  const [userLat, setUserLat] = useState(DEFAULT_LAT);
  const [userLng, setUserLng] = useState(DEFAULT_LNG);
  const [locationStatus, setLocationStatus] = useState<'default' | 'detected'>('default');

  // Currently authenticated user (By default, seed with Rahul Sharma Customer for instant testing)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ns_current_user');
    if (saved) return JSON.parse(saved);
    // default seed client
    return {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '+91 98765 43210',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      isBlocked: false,
      registeredAt: '2026-02-15'
    };
  });

  // App Navigation layout views:
  // - 'landing': Main Guest Landing Page with Hero, Search Feed & Map
  // - 'my_bookings': Active & Past Customer Booking History
  // - 'favorites': Saved spots
  // - 'owner_panel': Space Creator dashboard (only if owner/admin)
  // - 'admin_panel': Approved space manager and user list audit (only if admin)
  // - 'blueprints': Schema and Vercel documentation blueprints
  const [viewTab, setViewTab] = useState<'landing' | 'my_bookings' | 'favorites' | 'owner_panel' | 'admin_panel' | 'blueprints'>('landing');

  // Interactive popup modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTargetSpace, setBookingTargetSpace] = useState<Space | null>(null);

  // Selected space on Map popup
  const [mapSelectedSpace, setMapSelectedSpace] = useState<Space | null>(null);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ns_verified_leads', JSON.stringify(verifiedSpaceIds));
  }, [verifiedSpaceIds]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ns_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ns_current_user');
    }
  }, [currentUser]);

  // Fetch initial data from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const fetchedSpaces = await spacesService.fetchAllSpaces();
        setSpaces(fetchedSpaces);

        const fetchedBookings = await bookingsService.fetchAllBookings();
        setBookings(fetchedBookings);

        const fetchedReviews = await reviewsService.fetchAllReviews();
        setReviews(fetchedReviews);

        const fetchedUsers = await usersService.fetchAllUsers();
        setUsersList(fetchedUsers);

        const fetchedEnquiries = await enquiriesService.fetchEnquiries();
        setEnquiries(fetchedEnquiries);

        if (currentUser) {
          const fetchedFavs = await favouritesService.fetchUserFavorites(currentUser.id);
          setFavorites(fetchedFavs);
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentUser?.id]);


  // Geolocation trigger
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      setLocationStatus('default');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          setLocationStatus('detected');
          alert(`GPS Origin matches! Centered nearby your location: (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        (error) => {
          console.warn("Geolocation Access Denied by frame container. Centering defaults to downtown San Francisco.");
          // Reset to default coordinates
          setUserLat(DEFAULT_LAT);
          setUserLng(DEFAULT_LNG);
          setLocationStatus('default');
          alert("Iframe or browser denied location settings. Reverting coordinate calculation to San Francisco Downtown.");
        }
      );
    } else {
      alert("Browser does not support GPS Geolocation capabilities.");
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redirect logically
    if (user.role === 'owner') {
      setViewTab('owner_panel');
    } else if (user.role === 'admin') {
      setViewTab('admin_panel');
    } else {
      setViewTab('landing');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewTab('landing');
    localStorage.removeItem('ns_current_user');
  };

  const handleToggleFavorite = async (spaceId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const updated = await favouritesService.toggleFavorite(currentUser.id, spaceId);
      setFavorites(updated);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleAddReview = async (newReview: Review) => {
    try {
      const added = await reviewsService.addReview({
        spaceId: newReview.spaceId,
        userId: newReview.userId,
        userName: newReview.userName,
        userAvatar: newReview.userAvatar,
        rating: newReview.rating,
        comment: newReview.comment
      });
      setReviews(prev => [added, ...prev]);

      const fetchedSpaces = await spacesService.fetchAllSpaces();
      setSpaces(fetchedSpaces);
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  };

  const handleConfirmBooking = async (newBooking: Booking) => {
    try {
      const added = await bookingsService.createBooking({
        spaceId: newBooking.spaceId,
        spaceName: newBooking.spaceName,
        spacePhoto: newBooking.spacePhoto,
        userId: newBooking.userId,
        userName: newBooking.userName,
        date: newBooking.date,
        durationDays: newBooking.durationDays,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        type: newBooking.type,
        seatsBooked: newBooking.seatsBooked,
        totalPrice: newBooking.totalPrice,
        status: newBooking.status
      });

      setBookings(prev => [added, ...prev]);

      const fetchedSpaces = await spacesService.fetchAllSpaces();
      setSpaces(fetchedSpaces);
    } catch (err) {
      console.error('Failed to confirm booking:', err);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const updated = await bookingsService.cancelBooking(bookingId);
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? updated : b)
      );

      const fetchedSpaces = await spacesService.fetchAllSpaces();
      setSpaces(fetchedSpaces);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setIsLoading(true);
      await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('favorites').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('enquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('spaces').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      for (const u of INITIAL_USERS) {
        const uuid = u.id === 'usr-1' ? '550e8400-e29b-41d4-a716-446655440000' :
                     u.id === 'owner-1' ? '550e8400-e29b-41d4-a716-446655440001' :
                     u.id === 'admin-1' ? '550e8400-e29b-41d4-a716-446655440002' : u.id;
        await supabase.from('users').insert({
          id: uuid,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          avatar: u.avatar,
          is_blocked: u.isBlocked
        });
      }

      for (const sp of INITIAL_SPACES) {
        const uuid = sp.id === 'space-1' ? 'e6401f78-1111-43cf-a0e2-e1927361a9aa' :
                     sp.id === 'space-2' ? 'e6401f78-2222-43cf-a0e2-e1927361a9aa' :
                     sp.id === 'space-3' ? 'e6401f78-3333-43cf-a0e2-e1927361a9aa' :
                     sp.id === 'space-4' ? 'e6401f78-4444-43cf-a0e2-e1927361a9aa' :
                     sp.id === 'space-5' ? 'e6401f78-5555-43cf-a0e2-e1927361a9aa' :
                     sp.id === 'space-6' ? 'e6401f78-6666-43cf-a0e2-e1927361a9aa' : sp.id;
        const ownerUuid = sp.ownerId === 'owner-1' ? '550e8400-e29b-41d4-a716-446655440001' : sp.ownerId;
        
        await supabase.from('spaces').insert({
          id: uuid,
          name: sp.name,
          description: sp.description,
          photos: sp.photos,
          address: sp.address,
          city: sp.city,
          locality: sp.locality,
          latitude: sp.lat,
          longitude: sp.lng,
          price_per_day: sp.pricePerDay,
          price_per_hour: sp.pricePerHour,
          amenities: sp.amenities,
          is_approved: sp.isApproved,
          owner_id: ownerUuid,
          owner_phone: sp.ownerPhone,
          total_seats: sp.totalSeats,
          available_seats: sp.availableSeats,
          availability: sp.availability,
          rating: sp.rating,
          reviews_count: sp.reviewsCount
        });
      }

      for (const b of INITIAL_BOOKINGS) {
        const uuid = b.id === 'b-1' ? 'b0000000-0000-0000-0000-000000000001' :
                     b.id === 'b-2' ? 'b0000000-0000-0000-0000-000000000002' : b.id;
        const spaceUuid = b.spaceId === 'space-1' ? 'e6401f78-1111-43cf-a0e2-e1927361a9aa' :
                          b.spaceId === 'space-2' ? 'e6401f78-2222-43cf-a0e2-e1927361a9aa' : b.spaceId;
        const userUuid = b.userId === 'usr-1' ? '550e8400-e29b-41d4-a716-446655440000' : b.userId;

        await supabase.from('bookings').insert({
          id: uuid,
          space_id: spaceUuid,
          space_name: b.spaceName,
          space_photo: b.spacePhoto,
          user_id: userUuid,
          user_name: b.userName,
          booking_date: b.date,
          booking_type: b.type,
          seats_booked: b.seatsBooked,
          total_price: b.totalPrice,
          status: b.status,
          duration_days: b.durationDays,
          start_time: b.startTime,
          end_time: b.endTime
        });
      }

      for (const r of INITIAL_REVIEWS) {
        const uuid = r.id === 'r-1' ? 'r0000000-0000-0000-0000-000000000001' :
                     r.id === 'r-2' ? 'r0000000-0000-0000-0000-000000000002' : r.id;
        const spaceUuid = r.spaceId === 'space-1' ? 'e6401f78-1111-43cf-a0e2-e1927361a9aa' : r.spaceId;
        const userUuid = r.userId === 'usr-1' ? '550e8400-e29b-41d4-a716-446655440000' :
                         r.userId === 'usr-2' ? '550e8400-e29b-41d4-a716-446655440001' : r.userId;
        await supabase.from('reviews').insert({
          id: uuid,
          space_id: spaceUuid,
          user_id: userUuid,
          user_name: r.userName,
          user_avatar: r.userAvatar,
          rating: r.rating,
          comment: r.comment
        });
      }

      const fetchedSpaces = await spacesService.fetchAllSpaces();
      setSpaces(fetchedSpaces);

      const fetchedBookings = await bookingsService.fetchAllBookings();
      setBookings(fetchedBookings);

      const fetchedReviews = await reviewsService.fetchAllReviews();
      setReviews(fetchedReviews);

      const fetchedUsers = await usersService.fetchAllUsers();
      setUsersList(fetchedUsers);

      setFavorites([]);
      setEnquiries([]);
      setVerifiedSpaceIds([]);
      setUserLat(DEFAULT_LAT);
      setUserLng(DEFAULT_LNG);
      setLocationStatus('default');

      const defaultUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@gmail.com',
        phone: '+91 98765 43210',
        role: 'user' as const,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        isBlocked: false,
        registeredAt: '2026-02-15'
      };
      setCurrentUser(defaultUser);
      setViewTab('landing');
      alert('Mock Database restored to initial default seeds.');
    } catch (err) {
      console.error('Failed to reset database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOwnerContact = (space: Space) => {
    setLeadTargetSpace(space);
    setIsLeadOpen(true);
  };

  const handleLoginAndVerify = async (verifiedUser: User, newEnquiry: Enquiry) => {
    try {
      const existingUser = usersList.find(u => u.email === verifiedUser.email);
      let dbUserObject = existingUser;

      if (!existingUser) {
        dbUserObject = await usersService.createUser({
          name: verifiedUser.name,
          email: verifiedUser.email,
          phone: verifiedUser.phone,
          role: verifiedUser.role,
          avatar: verifiedUser.avatar
        });
        setUsersList(prev => [...prev, dbUserObject!]);
      }

      const createdEnquiry = await enquiriesService.createEnquiry({
        spaceId: newEnquiry.spaceId,
        spaceName: newEnquiry.spaceName,
        ownerId: newEnquiry.ownerId,
        userId: dbUserObject!.id,
        userName: dbUserObject!.name,
        userEmail: dbUserObject!.email,
        userPhone: dbUserObject!.phone || '',
        notifiedGowriEmail: 'gowri7282@gmail.com',
        ownerNotified: true
      });

      setEnquiries(prev => [createdEnquiry, ...prev]);
      setVerifiedSpaceIds(prev => [...prev, createdEnquiry.spaceId]);
      setCurrentUser(dbUserObject!);

      setIsLeadOpen(false);
      setLeadTargetSpace(null);

      console.log(`[Notification Service] New Lead Enquiry Processed successfully!`, {
        event: 'LEAD_NOTIFY',
        targetSpace: createdEnquiry.spaceName,
        leadDetails: {
          userName: createdEnquiry.userName,
          userEmail: createdEnquiry.userEmail,
          userPhone: createdEnquiry.userPhone,
          timestamp: createdEnquiry.timestamp,
        },
        sentTo: 'gowri7282@gmail.com'
      });

      const toastId = `toast-${Date.now()}`;
      const newToast: ToastItem = {
        id: toastId,
        spaceName: createdEnquiry.spaceName,
        userName: createdEnquiry.userName,
        userEmail: createdEnquiry.userEmail,
        userPhone: createdEnquiry.userPhone,
        notifiedGowriEmail: 'gowri7282@gmail.com',
        timestamp: createdEnquiry.timestamp
      };
      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, 8000);
    } catch (err) {
      console.error('Failed to process lead enquiry:', err);
    }
  };

  const userHasVerifiedLeadContact = (spaceId: string) => {
    return verifiedSpaceIds.includes(spaceId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-[#ed2f39]/10 selection:text-[#ed2f39]">
      
      {/* Platform Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setViewTab('landing')}>
              <div className="w-8 h-8 bg-[#ed2f39] rounded-lg flex items-center justify-center shadow-md">
                <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5 text-[#ed2f39]" />
                </div>
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-slate-900">
                Nearby<span className="text-[#ed2f39]">Space</span>
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-50 text-[#ed2f39] text-[8px] font-black tracking-widest rounded-md uppercase leading-none">SF</span>
              </span>
            </div>

            {/* Middle Nav Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setViewTab('landing')}
                className={`px-3.5 py-2 text-xs font-bold rounded-full transition-all ${
                  viewTab === 'landing' ? 'bg-red-50 text-[#ed2f39]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Find Coworks
              </button>

              {currentUser && (
                <>
                  <button
                    onClick={() => setViewTab('my_bookings')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-full transition-all ${
                      viewTab === 'my_bookings' ? 'bg-red-50 text-[#ed2f39]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => setViewTab('favorites')}
                    className={`px-3.5 py-2 text-xs font-bold rounded-full transition-all ${
                      viewTab === 'favorites' ? 'bg-red-50 text-[#ed2f39]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Favorites ({favorites.length})
                  </button>
                </>
              )}

              {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setViewTab('owner_panel')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-full transition-all ${
                    viewTab === 'owner_panel' ? 'bg-red-50 text-[#ed2f39]' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Owner Dashboard
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setViewTab('admin_panel')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-full transition-all ${
                    viewTab === 'admin_panel' ? 'bg-indigo-50 text-indigo-600 animate-pulse' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin Hub
                </button>
              )}

              <button
                onClick={() => setViewTab('blueprints')}
                className={`px-3.5 py-2 text-xs font-bold rounded-full transition-all flex items-center space-x-1.5 ${
                  viewTab === 'blueprints' ? 'bg-red-50 text-[#ed2f39]' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Hosting Docs</span>
              </button>
            </nav>

            {/* Right session action triggers */}
            <div className="hidden md:flex items-center space-x-3.5">
              {/* GPS Tracker indicator */}
              <button
                onClick={handleDetectGPS}
                title="Detect GPS origin using browser location services"
                className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  locationStatus === 'detected'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>{locationStatus === 'detected' ? 'GPS Active' : 'Align Location'}</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-200"></div>

              {/* Login avatar button */}
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                    <span className="text-[9px] font-bold text-[#ed2f39] uppercase tracking-wider bg-red-50 border border-red-100 px-2 py-0.5 rounded-full leading-none block mt-0.5">
                      {currentUser.role} Account
                    </span>
                  </div>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <button
                    onClick={handleLogout}
                    title="Log Out Session"
                    className="p-1.5 px-2 border border-slate-200 text-slate-400 hover:text-[#ed2f39] hover:bg-red-50/20 rounded-full text-[10px] uppercase font-black transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-[#ed2f39] text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-sm shadow-red-200"
                >
                  Login
                </button>
              )}
            </div>

            {/* Mobile Menu Icon trigger */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={handleDetectGPS}
                className="p-1.5 text-slate-500 rounded-lg border border-slate-200 bg-slate-50"
              >
                <Map className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Panel menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-3 shadow-md">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setViewTab('landing'); setMobileMenuOpen(false); }}
                className="p-2.5 text-center text-xs font-bold bg-slate-50 rounded-lg text-slate-700"
              >
                Find Spaces
              </button>
              <button
                onClick={() => { setViewTab('blueprints'); setMobileMenuOpen(false); }}
                className="p-2.5 text-center text-xs font-bold bg-slate-50 rounded-lg text-slate-700"
              >
                Hosting Manual
              </button>
            </div>

            {currentUser && (
              <div className="grid grid-cols-2 gap-2 border-t pt-3 border-slate-100">
                <button
                  onClick={() => { setViewTab('my_bookings'); setMobileMenuOpen(false); }}
                  className="p-2.5 text-center text-xs font-bold bg-slate-50 rounded-lg text-slate-700"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => { setViewTab('favorites'); setMobileMenuOpen(false); }}
                  className="p-2.5 text-center text-xs font-bold bg-slate-50 rounded-lg text-slate-700"
                >
                  Saved Favorites ({favorites.length})
                </button>
              </div>
            )}

            {(currentUser?.role === 'owner' || currentUser?.role === 'admin') && (
              <button
                onClick={() => { setViewTab('owner_panel'); setMobileMenuOpen(false); }}
                className="w-full text-center p-2.5 bg-red-50 text-[#ed2f39] text-xs font-bold rounded-lg block"
              >
                Space Owner Console
              </button>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => { setViewTab('admin_panel'); setMobileMenuOpen(false); }}
                className="w-full text-center p-2.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg block"
              >
                Platform Administrative Panel
              </button>
            )}

            <div className="border-t pt-3 border-slate-100 flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center space-x-3 w-full justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</h4>
                      <span className="text-[8px] font-bold text-[#ed2f39] uppercase">{currentUser.role} view</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="py-1 px-2 border border-slate-200 text-slate-500 rounded text-[10px] uppercase font-bold"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsAuthOpen(true); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg text-center"
                >
                  Demo Authorization Profile
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#ed2f39] rounded-full animate-spin"></div>
            <p className="text-slate-500 font-display text-sm font-semibold tracking-wide animate-pulse">Syncing NearbySpace Database...</p>
          </div>
        ) : (
          <>

        {/* VIEW TAB: LANDING / DISCOVERY PAGE */}
        {viewTab === 'landing' && (() => {
          // Localities lookup dictionary
          const localitiesMap: Record<string, string[]> = {
            'Bengaluru': ['Indiranagar', 'HSR Layout', 'Whitefield', 'Koramangala'],
            'Mumbai': ['Bandra West', 'Andheri', 'Colaba'],
            'Delhi NCR': ['DLF CyberCity', 'Connaught Place', 'Noida Sector 62'],
            'Hyderabad': ['Gachibowli', 'Jubilee Hills', 'Madhapur'],
            'Chennai': ['OMR Road', 'Adyar', 'T-Nagar'],
            'Pune': ['Koregaon Park', 'Kalyani Nagar']
          };

          const currentLocalities = searchCity !== 'all' ? (localitiesMap[searchCity] || []) : [];

          // Reactive search block filters
          const filteredApprovedSpaces = spaces.filter(space => {
            if (!space.isApproved) return false;

            // City bounds
            if (searchCity !== 'all' && space.city !== searchCity) return false;

            // Locality bounds
            if (searchLocality !== 'all' && space.locality !== searchLocality) return false;

            // Space Type bounds
            if (searchSpaceType !== 'all') {
              const desc = space.description.toLowerCase();
              const sName = space.name.toLowerCase();
              if (searchSpaceType === 'hotdesk' && !desc.includes('hot') && !desc.includes('collaboration')) return false;
              if (searchSpaceType === 'dedicated' && !desc.includes('dedicated') && !desc.includes('ergonomic') && !desc.includes('boutique')) return false;
              if (searchSpaceType === 'private' && !desc.includes('cabin') && !desc.includes('private') && !desc.includes('executive')) return false;
              if (searchSpaceType === 'meeting' && !space.amenities.includes('Meeting Room')) return false;
            }

            // Price bounds
            if (searchMaxPrice !== 'any') {
              const priceLimit = Number(searchMaxPrice);
              if (space.pricePerDay > priceLimit) return false;
            }

            return true;
          });

          return (
            <div className="space-y-8 animate-fade-in">
              
              {/* HERO SECTION */}
              <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-12 border border-slate-800 shadow-xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
                
                <div className="max-w-2xl relative space-y-4">
                  <span className="bg-[#ed2f39] text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full inline">
                    Flexible Workspaces Near You
                  </span>
                  <h1 className="font-display font-black text-3xl sm:text-5xl leading-[1.1] tracking-tight">
                    Seamlessly book desk spaces near you in seconds
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                    Join a community of 40,000+ creators, builders, and corporate executives. Book shared offices, executive boardrooms, and 1-day hot desks with verified fiber Wi-Fi.
                  </p>

                  {/* Simulated Quick metrics */}
                  <div className="flex gap-6 pt-2 font-mono text-xs text-slate-400">
                    <div>
                      <h5 className="font-bold text-white text-base">500+</h5>
                      <p className="text-[10px] uppercase">Seeded Desks</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-base">4.9/5 ★</h5>
                      <p className="text-[10px] uppercase">User Reviews</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-base">Instant</h5>
                      <p className="text-[10px] uppercase">OTP Access</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* PROFESSIONAL SEARCH TOP BLACK BOX */}
              <section className="bg-slate-950 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Choose City */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Choose City</label>
                    <div className="relative">
                      <select
                        value={searchCity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchCity(val);
                          setSearchLocality('all'); 
                          if (val !== 'all' && CITY_COORDINATES[val]) {
                            setUserLat(CITY_COORDINATES[val].lat);
                            setUserLng(CITY_COORDINATES[val].lng);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#ed2f39] cursor-pointer"
                      >
                        <option value="all">All Indian Cities</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Pune">Pune</option>
                      </select>
                      <span className="absolute inset-y-0 right-3 flex items-center pr-1.5 pointer-events-none text-slate-400 text-[10px]">▼</span>
                    </div>
                  </div>

                  {/* Locality */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Locality</label>
                    <div className="relative">
                      <select
                        value={searchLocality}
                        disabled={searchCity === 'all'}
                        onChange={(e) => setSearchLocality(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 disabled:bg-slate-950 disabled:opacity-40 disabled:text-slate-600 rounded-xl px-3.5 py-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#ed2f39] cursor-pointer"
                      >
                        {searchCity === 'all' ? (
                          <option value="all">Select City First</option>
                        ) : (
                          <>
                            <option value="all">All Localities</option>
                            {currentLocalities.map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ))}
                          </>
                        )}
                      </select>
                      <span className="absolute inset-y-0 right-3 flex items-center pr-1.5 pointer-events-none text-slate-400 text-[10px]">▼</span>
                    </div>
                  </div>

                  {/* Space Type */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Space Type</label>
                    <div className="relative">
                      <select
                        value={searchSpaceType}
                        onChange={(e) => setSearchSpaceType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#ed2f39] cursor-pointer"
                      >
                        <option value="all">All Types</option>
                        <option value="hotdesk">Hot Desk</option>
                        <option value="dedicated">Dedicated Desk</option>
                        <option value="private">Private Cabin</option>
                        <option value="meeting">Meeting Room</option>
                      </select>
                      <span className="absolute inset-y-0 right-3 flex items-center pr-1.5 pointer-events-none text-slate-400 text-[10px]">▼</span>
                    </div>
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Max Price</label>
                    <div className="relative">
                      <select
                        value={searchMaxPrice}
                        onChange={(e) => setSearchMaxPrice(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-[#ed2f39] cursor-pointer"
                      >
                        <option value="any">Any Budget</option>
                        <option value="400">₹400 / day</option>
                        <option value="800">₹800 / day</option>
                        <option value="1200">₹1200 / day</option>
                        <option value="2000">₹2000 / day</option>
                        <option value="5000">₹5000 / day</option>
                      </select>
                      <span className="absolute inset-y-0 right-3 flex items-center pr-1.5 pointer-events-none text-slate-400 text-[10px]">▼</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-xs text-slate-350 font-sans tracking-wide">
                    📦 We found <strong className="text-white font-bold">{filteredApprovedSpaces.length} approved entries</strong> listing today in our persistent directory.
                  </p>
                  <button
                    onClick={() => {
                      const el = document.getElementById('workspaces-listing-feed');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2.5 bg-[#ed2f39] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-200/10 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Workspaces</span>
                  </button>
                </div>
              </section>

              {/* INTERACTIVE VECTOR MAP AND GRID SEGMENT */}
              <section id="workspaces-listing-feed" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start scroll-mt-20">
                
                {/* Left Side: Spaces listing feed search results */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-display font-black text-lg text-slate-800">Available Workspaces</h2>
                      <p className="text-xs text-slate-400">Seeded spaces matching Indian city boundaries</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white border px-3 py-1 rounded-lg">
                      {filteredApprovedSpaces.length} verified live location
                    </span>
                  </div>

                  <UserSpaceList
                    spaces={filteredApprovedSpaces}
                    reviews={reviews}
                    favorites={favorites}
                    userLat={userLat}
                    userLng={userLng}
                    searchCity={searchCity}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenBooking={(sp) => {
                      if (!currentUser) {
                        setIsAuthOpen(true);
                        return;
                      }
                      setBookingTargetSpace(sp);
                      setIsBookingOpen(true);
                    }}
                    onAddReview={handleAddReview}
                    currentUserId={currentUser?.id || 'usr-guest'}
                    currentUserName={currentUser?.name || 'Guest User'}
                    onViewOwnerContact={handleViewOwnerContact}
                    userHasVerifiedLeadContact={userHasVerifiedLeadContact}
                  />
                </div>

                {/* Right Side: Map Visual HUD */}
                <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-22">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display font-bold text-sm text-slate-800">Visual GPS Radar</h3>
                    <button
                      onClick={handleDetectGPS}
                      className="text-[10px] font-bold text-[#ed2f39] hover:underline"
                    >
                      Recenter GPS Origin
                    </button>
                  </div>

                  <MapView
                    spaces={filteredApprovedSpaces}
                    selectedSpace={mapSelectedSpace}
                    onSelectSpace={setMapSelectedSpace}
                    userLat={userLat}
                    userLng={userLng}
                    onUpdateUserLocation={(newLat, newLng) => {
                      setUserLat(newLat);
                      setUserLng(newLng);
                    }}
                    onOpenBooking={(sp) => {
                      if (!currentUser) {
                        setIsAuthOpen(true);
                        return;
                      }
                      setBookingTargetSpace(sp);
                      setIsBookingOpen(true);
                    }}
                  />

                  {/* Interactive Map Guideline message */}
                  <div className="p-4 bg-white border border-slate-200/80 rounded-xl text-xs space-y-1 shadow-sm leading-relaxed text-slate-500 font-medium">
                    <span className="font-bold text-slate-800">How to test GPS distance sorting:</span>
                    <p>Click and hold or double-click anywhere inside the map coordinate vector above. NearbySpace will automatically snap your user location to that coordinates, recalculating all space distances instantly with nearby sorting!</p>
                  </div>
                </div>

              </section>

            </div>
          );
        })()}

        {/* VIEW TAB: MY BOOKINGS (Customer board pass history) */}
        {viewTab === 'my_bookings' && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-800">My Booking History</h2>
              <p className="text-xs text-slate-400 mt-0.5">View active boarding passes, receipt logs, and reservation tickets.</p>
            </div>

            {bookings.filter(b => b.userId === currentUser?.id).length === 0 ? (
              <div className="p-16 text-center border bg-white rounded-3xl">
                <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg text-slate-700">No Reservations Recorded</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">You have not purchased a day pass check yet. Go explore approved offices under the "Find Coworks" button!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter(b => b.userId === currentUser?.id)
                  .map(bk => (
                    <div
                      key={bk.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow"
                    >
                      <img
                        src={bk.spacePhoto}
                        alt={bk.spaceName}
                        referrerPolicy="no-referrer"
                        className="w-full sm:w-32 h-32 sm:h-auto object-cover flex-shrink-0"
                      />
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-display font-bold text-base text-slate-800">{bk.spaceName}</h4>
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black">
                              ID: {bk.id}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2 font-medium">
                            <span>Date: <strong className="text-slate-800">{bk.date}</strong></span>
                            <span>Seats: <strong className="text-slate-800">{bk.seatsBooked}</strong></span>
                            {bk.startTime && (
                              <span>Hours: <strong className="text-slate-800">{bk.startTime} - {bk.endTime}</strong></span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-3.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">FARE PAID</span>
                            <p className="text-sm font-extrabold text-slate-800">{formatCurrency(bk.totalPrice)}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            {bk.status === 'confirmed' ? (
                              <>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-1 rounded-lg font-bold">
                                  ✓ Verified Live
                                </span>
                                <button
                                  onClick={() => handleCancelBooking(bk.id)}
                                  className="px-3 py-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-[#ed2f39] rounded text-[10px] uppercase font-black tracking-wide cursor-pointer transition-all border border-slate-100"
                                >
                                  Cancel Booking
                                </button>
                              </>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-lg font-bold">
                                Cancelled
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW TAB: FAVORITES */}
        {viewTab === 'favorites' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-800">My Saved Favorites</h2>
              <p className="text-xs text-slate-400 mt-0.5">Quick access to spaces you loved and saved for reference.</p>
            </div>

            {favorites.length === 0 ? (
              <div className="p-16 text-center border bg-white rounded-3xl">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-display font-semibold text-lg text-slate-700">No Saved Listings</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Click the heart button on space lists to save them directly for quick review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spaces
                  .filter(sp => favorites.includes(sp.id))
                  .map(space => (
                    <div key={space.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center space-x-3.5">
                      <img
                        src={space.photos[0]}
                        alt={space.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="truncate flex-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{space.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{space.address}</p>
                        <p className="text-xs font-semibold text-[#ed2f39] mt-1.5">{formatCurrency(space.pricePerDay)} / day</p>
                      </div>
                      <div className="flex flex-col space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 items-end">
                        <button
                          onClick={() => handleToggleFavorite(space.id)}
                          className="text-[#ed2f39] hover:text-slate-300 transition-all text-xs font-bold uppercase"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => {
                            setBookingTargetSpace(space);
                            setIsBookingOpen(true);
                          }}
                          className="bg-[#ed2f39] text-white font-bold text-[9px] px-2.5 py-1 rounded uppercase tracking-wide mt-1.5"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW TAB: OWNER DASHBOARD */}
        {viewTab === 'owner_panel' && currentUser && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-800">Space Owner Console</h2>
              <p className="text-xs text-slate-400 mt-0.5">Organize listings, monitor revenue trends, and review guest desk allocations.</p>
            </div>

            <OwnerDashboard
              spaces={spaces}
              bookings={bookings}
              enquiries={enquiries}
              currentUserId={currentUser.id}
              onUpdateSpace={(updatedSpace) => {
                setSpaces(prev => prev.map(s => s.id === updatedSpace.id ? updatedSpace : s));
              }}
              onAddSpace={(newSpace) => {
                setSpaces(prev => [newSpace, ...prev]);
              }}
              onUpdateBookingStatus={(bookingId, status) => {
                setBookings(prev =>
                  prev.map(b => b.id === bookingId ? { ...b, status: status } : b)
                );
              }}
            />
          </div>
        )}

        {/* VIEW TAB: ADMIN DASHBOARD */}
        {viewTab === 'admin_panel' && currentUser?.role === 'admin' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-800">Platform Administration Console</h2>
              <p className="text-xs text-slate-400 mt-0.5">Direct system dials: Approve owner coworking requests, audit authenticated accounts list, reset tables.</p>
            </div>

            <AdminDashboard
              spaces={spaces}
              bookings={bookings}
              enquiries={enquiries}
              usersList={usersList}
              onApproveSpace={async (spaceId) => {
                try {
                  const updated = await spacesService.approveSpace(spaceId);
                  setSpaces(prev => prev.map(s => s.id === spaceId ? updated : s));
                  alert("Listed space approved successfully! It is now live for search on map and list views.");
                } catch (err) {
                  console.error('Failed to approve space:', err);
                }
              }}
              onRejectSpace={async (spaceId) => {
                try {
                  await spacesService.rejectSpace(spaceId);
                  setSpaces(prev => prev.filter(s => s.id !== spaceId));
                  alert("Compliance decline registered. Listed space removed from auditing logs.");
                } catch (err) {
                  console.error('Failed to reject space:', err);
                }
              }}
              onUpdateUserRole={async (userId, role) => {
                try {
                  const updated = await usersService.updateUserRole(userId, role);
                  setUsersList(prev => prev.map(u => u.id === userId ? updated : u));
                  alert(`User permissions updated to ${role.toUpperCase()}`);
                } catch (err) {
                  console.error('Failed to update user role:', err);
                }
              }}
              onToggleBlockUser={async (userId) => {
                try {
                  const updated = await usersService.toggleBlockUser(userId);
                  setUsersList(prev => prev.map(u => u.id === userId ? updated : u));
                  alert(updated.isBlocked ? 'User account has been BLOCKED' : 'User account access unblocked.');
                } catch (err) {
                  console.error('Failed to toggle block user:', err);
                }
              }}
              onResetDatabase={handleResetDatabase}
            />
          </div>
        )}

        {/* VIEW TAB: HOSTING BLUEPRINTS */}
        {viewTab === 'blueprints' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
              <h2 className="font-display font-black text-2xl text-slate-800">Production Code Blueprints</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">Our app has fully validated mock logic inside. Use these PostgreSQL, Supabase migrations, proxy API endpoints, and environment guides to deploy live to Next.js v15 and Vercel.</p>
            </div>

            <TechDocs />
          </div>
        )}
          </>
        )}
      </main>

      {/* Platform Sandbox Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-12 py-8 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-3.5">
          <div className="flex justify-center space-x-6 text-slate-400 font-bold">
            <button onClick={() => setViewTab('landing')} className="hover:text-white">Explore Map</button>
            <button onClick={() => setViewTab('blueprints')} className="hover:text-white">Postgres DB Schema</button>
            <button onClick={handleResetDatabase} className="hover:text-white">Re-seed Database</button>
          </div>
          
          <div className="flex flex-col items-center max-w-sm mx-auto p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300">
              <Users className="w-4 h-4 text-[#ed2f39]" />
              <span>Simulated Demo Profiles Switcher</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal text-center">To seamlessly test user customer flows, space listing additions, owner revenue charts, or admin actions, you can switch demo accounts instantly inside the authorization modal or from the top header!</p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="mt-3.5 px-3 py-1.5 bg-[#ed2f39] text-white hover:bg-red-600 font-bold text-[9px] rounded-lg uppercase tracking-wider"
            >
              Configure Active Profile
            </button>
          </div>

          <p className="text-slate-600 pt-3">© 2026 NearbySpace Platform Inc. Created for premium co-working booking on high-fidelity sandbox.</p>
        </div>
      </footer>

      {/* MODAL POPUPS */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

      {bookingTargetSpace && (
        <BookingModal
          space={bookingTargetSpace}
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setBookingTargetSpace(null);
          }}
          userId={currentUser?.id || 'usr-custom'}
          userName={currentUser?.name || 'Jane Doe'}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {leadTargetSpace && (
        <LeadPopupModal
          isOpen={isLeadOpen}
          onClose={() => {
            setIsLeadOpen(false);
            setLeadTargetSpace(null);
          }}
          space={leadTargetSpace}
          currentUser={currentUser}
          onLoginAndVerify={handleLoginAndVerify}
        />
      )}

      {/* Visual UI Toast Notifications for Mock Service */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto bg-slate-950 text-white rounded-2xl p-4 shadow-2xl border border-slate-800 backdrop-blur-md relative overflow-hidden"
            >
              {/* Highlight bar top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ed2f39] via-rose-500 to-amber-500" />
              
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-3 mt-1">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[#ed2f39] shrink-0">
                  <Mail className="w-5 h-5 animate-pulse" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notification Dispatch</span>
                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider scale-90">
                      Live
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-white mt-1 break-words">
                    Enquiry: {toast.spaceName}
                  </h4>
                  <p className="text-[11px] text-[#ed2f39] font-medium mt-0.5">
                    ✉ Emailed to gowri7282@gmail.com
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-900 space-y-1.5 text-[10px] text-slate-400 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Visitor:</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[170px]">{toast.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-200 text-[9px] truncate max-w-[170px]">{toast.userEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="text-emerald-400 font-bold">{toast.userPhone}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-[9px] text-slate-500">
                      <span>Status:</span>
                      <span className="text-emerald-500 flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3" /> DISPATCHED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
