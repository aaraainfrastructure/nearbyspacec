import React, { useState } from 'react';
import { Space, Review, Booking } from '../types';
import { Search, SlidersHorizontal, MapPin, Heart, Wifi, Shield, Car, Coffee, Printer, Zap, Sparkles, MessageSquare, Star, ArrowUpDown } from 'lucide-react';
import { calculateDistance, formatCurrency } from '../utils';

interface UserSpaceListProps {
  spaces: Space[];
  reviews: Review[];
  favorites: string[];
  userLat: number;
  userLng: number;
  searchCity?: string;
  onToggleFavorite: (spaceId: string) => void;
  onOpenBooking: (space: Space) => void;
  onAddReview: (review: Review) => void;
  currentUserId: string;
  currentUserName: string;
  onViewOwnerContact?: (space: Space) => void;
  userHasVerifiedLeadContact?: (spaceId: string) => boolean;
}

export default function UserSpaceList({
  spaces,
  reviews,
  favorites,
  userLat,
  userLng,
  searchCity = 'all',
  onToggleFavorite,
  onOpenBooking,
  onAddReview,
  currentUserId,
  currentUserName,
  onViewOwnerContact,
  userHasVerifiedLeadContact
}: UserSpaceListProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(50); // default max 50 km
  const [maxPrice, setMaxPrice] = useState<number>(3000); // max default 3000 INR per day
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [selectedSpaceIdForDetails, setSelectedSpaceIdForDetails] = useState<string | null>(null);

  // New review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const amenitiesOptions = ['WiFi', 'AC', 'Parking', 'Meeting Room', 'Cafeteria', 'Power Backup', 'Printer'];

  const handleAmenityCheck = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleReviewSubmit = (e: React.FormEvent, spaceId: string) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Review content cannot be empty');
      return;
    }

    const review: Review = {
      id: `rev-${Date.now()}`,
      spaceId: spaceId,
      userId: currentUserId || 'usr-guest',
      userName: currentUserName || 'Guest Reviewer',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0]
    };

    onAddReview(review);
    setNewComment('');
    setNewRating(5);
    setReviewError('');
  };

  const activeDetailsSpace = spaces.find(s => s.id === selectedSpaceIdForDetails);

  // Filter & Sort Spaces list
  const filteredSpaces = spaces
    .filter(space => {
      // Must be approved by admin to show to general users
      if (!space.isApproved) return false;

      // 1. Search term match name / address / description
      const nameMatch = space.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = space.description.toLowerCase().includes(searchTerm.toLowerCase());
      const addrMatch = space.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = nameMatch || descMatch || addrMatch;

      // 2. Distance match - if viewing All Cities, suppress distance cap to let cross-city results show
      const dist = calculateDistance(userLat, userLng, space.lat, space.lng);
      const matchesDistance = searchCity === 'all' ? true : dist <= maxDistance;

      // 3. Price match
      const matchesPrice = space.pricePerDay <= maxPrice;

      // 4. Amenities match
      const matchesAmenities = selectedAmenities.every(amenity =>
        space.amenities.includes(amenity)
      );

      return matchesSearch && matchesDistance && matchesPrice && matchesAmenities;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        const distA = calculateDistance(userLat, userLng, a.lat, a.lng);
        const distB = calculateDistance(userLat, userLng, b.lat, b.lng);
        return distA - distB;
      }
      if (sortBy === 'price') {
        return a.pricePerDay - b.pricePerDay;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

  // Helper for Amenity Icons
  const renderAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'WiFi': return <Wifi className="w-4 h-4" />;
      case 'AC': return <Shield className="w-4 h-4 text-sky-500" />;
      case 'Parking': return <Car className="w-4 h-4 text-emerald-500" />;
      case 'Cafeteria': return <Coffee className="w-4 h-4 text-amber-600" />;
      case 'Printer': return <Printer className="w-4 h-4 text-indigo-600" />;
      case 'Power Backup': return <Zap className="w-4 h-4 text-[#ed2f39]" />;
      default: return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/85 p-5 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4.5 text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search co-working desks, hot seats, or neighborhoods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-full py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed2f39] focus:bg-white transition-all text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Detailed Slider Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Distance Slide bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase mb-2">
              <span>Max Distance Radius</span>
              <span className="text-[#ed2f39]">{maxDistance} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="2"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ed2f39]"
            />
          </div>

          {/* Pricing Slide bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase mb-2">
              <span>Max Daily Price</span>
              <span className="text-[#ed2f39]">{formatCurrency(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ed2f39]"
            />
          </div>

          {/* Sort selection dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Sort Results By</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <ArrowUpDown className="w-4 h-4" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none col-span-1"
              >
                <option value="distance">Nearest Distance</option>
                <option value="price">Lowest Day Pass Price</option>
                <option value="rating">Top Rated (Stars)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Amenities Selection Row */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Amenities Needed</label>
          <div className="flex flex-wrap gap-2">
            {amenitiesOptions.map(amenity => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  onClick={() => handleAmenityCheck(amenity)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-red-50 text-[#ed2f39] border-red-200'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {renderAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid List of spaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSpaces.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-8">
            <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-lg text-slate-700">No Nearby Spaces Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Try widening your search radius, adjusting price slider caps, or unchecking exclusive amenities.</p>
          </div>
        ) : (
          filteredSpaces.map((space, index) => {
            const distance = calculateDistance(userLat, userLng, space.lat, space.lng);
            const isFav = favorites.includes(space.id);

            const spaceCard = (
              <div
                key={space.id}
                className="bg-white rounded-2xl border border-slate-200 p-3 overflow-hidden flex flex-col group hover:border-[#ed2f39] hover:shadow-md transition-all duration-300 shadow-sm cursor-pointer animate-fade-in"
              >
                {/* Photo Header */}
                <div className="relative h-48 bg-slate-100 rounded-xl overflow-hidden">
                  <img
                    src={space.photos[0]}
                    alt={space.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Distance and Rating Badge info */}
                  <div className="absolute top-3 left-3 flex gap-1.5 font-sans">
                    <span className="bg-slate-900/80 text-white px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#ed2f39]" />
                      <span>{distance} km away</span>
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center space-x-1 border border-amber-200">
                      <Star className="w-3 h-3 fill-current text-amber-600" />
                      <span>{space.rating > 0 ? space.rating.toFixed(1) : 'New'}</span>
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(space.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full cursor-pointer transition-all ${
                      isFav 
                        ? 'bg-[#ed2f39] text-white' 
                        : 'bg-white/90 text-slate-600 hover:bg-white hover:text-[#ed2f39] shadow-sm'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Info Container */}
                <div className="p-3 pt-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-base text-slate-900 line-clamp-1 group-hover:text-[#ed2f39] transition-colors">{space.name}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">{space.address}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 pt-1">{space.description}</p>
                  </div>

                  {/* Amenities Line */}
                  <div className="flex gap-2 flex-wrap pt-3.5">
                    {space.amenities.slice(0, 4).map(amenity => (
                      <span
                        key={amenity}
                        className="py-1 px-2 text-[10px] bg-slate-50 border border-slate-100 rounded-md font-semibold text-slate-500 flex items-center space-x-1"
                      >
                        {renderAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </span>
                    ))}
                    {space.amenities.length > 4 && (
                      <span className="py-1 px-2 text-[10px] bg-slate-100 text-slate-600 rounded-md font-bold">
                        +{space.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Pricing and Action Bottom Line */}
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-4">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">DAILY PASS</p>
                      <h4 className="text-base font-black text-slate-800">
                        {formatCurrency(space.pricePerDay)} <span className="text-xs text-slate-400 font-semibold">/ day</span>
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setSelectedSpaceIdForDetails(space.id)}
                        className="px-2.5 py-1.5 text-[11px] font-bold border border-slate-200 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                      >
                        Details
                      </button>

                      {onViewOwnerContact && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOwnerContact(space);
                          }}
                          className={`px-2.5 py-1.5 text-[11px] font-bold border rounded-lg transition-all cursor-pointer ${
                            userHasVerifiedLeadContact && userHasVerifiedLeadContact(space.id)
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800'
                          }`}
                        >
                          {userHasVerifiedLeadContact && userHasVerifiedLeadContact(space.id) ? (
                            <span className="flex items-center space-x-1">
                              <span>📞</span>
                              <span className="font-mono text-[10px]">{space.ownerPhone}</span>
                            </span>
                          ) : (
                            '📞 Get Owner'
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onOpenBooking(space)}
                        className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#ed2f39] hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );

            return (
              <React.Fragment key={space.id}>
                {spaceCard}
                
                {index === 1 && (
                  <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-100 p-5 flex flex-col justify-between h-auto shadow-sm min-h-[300px] animate-fade-in col-span-1">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Ad • Google AdSense</span>
                        <span className="px-1.5 py-0.5 bg-red-100 text-[#ed2f39] text-[8px] font-bold rounded uppercase">Sponsored Deals</span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-slate-800 leading-snug">ACT Fibernet for Startups</h4>
                      <p className="text-xs text-slate-500 leading-normal">
                        Power up your co-working space list priority! Indian owners can get instant verified high-speed commercial routers with 100% power backup. Special 30% discount for NearbySpace India registered hubs.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">Starting at ₹1,999/mo</span>
                      <a href="mailto:gowri7282@gmail.com?subject=Inquiry about ACT Fibernet Promo" className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg uppercase tracking-wide transition-colors">
                        Get Fiber Now
                      </a>
                    </div>
                  </div>
                )}

                {index === 3 && (
                  <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between h-auto shadow-sm min-h-[300px] animate-fade-in border border-slate-800 col-span-1">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Ad • Local Vendor Spotlight</span>
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[8px] font-bold rounded uppercase">Chai Point Office Partner</span>
                      </div>
                      <h4 className="font-display font-medium text-sm text-white leading-snug">Chai Point Office Dispensers</h4>
                      <p className="text-xs text-slate-300 leading-normal">
                        Improve employee workspace retention rates across Bangalore & Mumbai co-work locations. Fresh organic loose-leaf tea, filter coffee, and Indian snacks delivered daily to your door.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">₹0 Setup Cost Promo</span>
                      <button onClick={() => alert("Chai Point vendor inquiry has been prepared! Log mail will be saved to admin (gowri7282@gmail.com).")} className="px-3.5 py-1.5 bg-[#ed2f39] hover:bg-red-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wide transition-colors cursor-pointer">
                        Book Demo
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* SPACE DETAILS INTEGRATED SIDE PANEL/DRAWER */}
      {activeDetailsSpace && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-slide-left relative overflow-y-auto">
            
            {/* Header section with photo carousel */}
            <div className="relative h-64 bg-slate-200">
              <img
                src={activeDetailsSpace.photos[0]}
                alt={activeDetailsSpace.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              <button
                onClick={() => setSelectedSpaceIdForDetails(null)}
                className="absolute top-4 left-4 p-2.5 rounded-full bg-black/40 text-white hover:bg-black/60 font-bold text-base transition-all cursor-pointer"
              >
                &larr; Back to Explore
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="bg-[#ed2f39] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase">
                  {activeDetailsSpace.availability === 'all' ? 'Open 24/7' : 'Weekday Access Only'}
                </span>
                <h2 className="font-display font-bold text-xl mt-1.5">{activeDetailsSpace.name}</h2>
                <p className="text-xs text-slate-200 mt-0.5">{activeDetailsSpace.address}</p>
              </div>
            </div>

            {/* Main scrollable body */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* About description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About the Workspace</h4>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeDetailsSpace.description}</p>
              </div>

              {/* Photos Gallery */}
              {activeDetailsSpace.photos.length > 1 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Gallery View</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {activeDetailsSpace.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Interior Workspace"
                        referrerPolicy="no-referrer"
                        className="w-full h-20 rounded-lg object-cover border border-slate-100 hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Full Amenities list */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Included Amenities ({activeDetailsSpace.amenities.length})</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {activeDetailsSpace.amenities.map(amenity => (
                    <div
                      key={amenity}
                      className="p-3 border border-slate-100 rounded-xl flex items-center space-x-2.5 text-xs text-slate-600 bg-slate-50"
                    >
                      {renderAmenityIcon(amenity)}
                      <span className="font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic live state Capacity / availability indicators */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-800">Operational Guard Active</span>
                  <p className="text-emerald-600 mt-0.5">Real-time occupancy tracking via IoT nodes</p>
                </div>
                <div className="text-right font-bold text-emerald-800">
                  {activeDetailsSpace.availableSeats} of {activeDetailsSpace.totalSeats} seats open
                </div>
              </div>

              {/* Dynamic review system section */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Reviews & Rating History</h4>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-black text-slate-800">{activeDetailsSpace.rating > 0 ? activeDetailsSpace.rating.toFixed(1) : 'New'}</span>
                  <div>
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 text-slate-200 fill-current" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{activeDetailsSpace.reviewsCount} customer reviews</span>
                  </div>
                </div>

                {/* Submitting a custom local review */}
                <form onSubmit={(e) => handleReviewSubmit(e, activeDetailsSpace.id)} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 mb-5">
                  <h5 className="text-xs font-bold text-slate-700">Write an honest customer review</h5>
                  
                  {reviewError && <p className="text-xs text-[#ed2f39]">{reviewError}</p>}

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Set Star Rating</label>
                    <div className="flex space-x-1.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewRating(st)}
                          className="p-1 focus:outline-none"
                        >
                          <Star className={`w-5 h-5 ${st <= newRating ? 'text-amber-500 fill-current' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Feedback Comment</label>
                    <textarea
                      required
                      placeholder="Discuss fiber internet speeds, sound level, seating ergonomics, coffee, lighting..."
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#ed2f39]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Submit Verified Review
                  </button>
                </form>

                {/* List of past reviews */}
                <div className="space-y-4 pt-1 divide-y divide-slate-100">
                  {reviews
                    .filter(rev => rev.spaceId === activeDetailsSpace.id)
                    .map(rev => (
                      <div key={rev.id} className="pt-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {rev.userAvatar ? (
                              <img
                                src={rev.userAvatar}
                                alt={rev.userName}
                                referrerPolicy="no-referrer"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black">
                                {rev.userName[0]}
                              </div>
                            )}
                            <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-500 my-1">
                          {Array.from({ length: Math.floor(rev.rating) }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{rev.comment}</p>
                      </div>
                    ))}
                </div>
              </div>

            </div>

            {/* Bottom stick bar details pricing / direct booking button */}
            <div className="sticky bottom-0 p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400">Pass pricing</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-black text-[#ed2f39]">{formatCurrency(activeDetailsSpace.pricePerDay)}</span>
                  <span className="text-xs text-slate-400 font-semibold">/day</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onViewOwnerContact && (
                  <button
                    onClick={() => onViewOwnerContact(activeDetailsSpace)}
                    className={`px-4 py-2.5 font-bold text-xs rounded-xl border transition-all cursor-pointer ${
                      userHasVerifiedLeadContact && userHasVerifiedLeadContact(activeDetailsSpace.id)
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800'
                    }`}
                  >
                    {userHasVerifiedLeadContact && userHasVerifiedLeadContact(activeDetailsSpace.id) ? (
                      <span className="font-mono">Owner: {activeDetailsSpace.ownerPhone}</span>
                    ) : (
                      '📞 Contact Owner'
                    )}
                  </button>
                )}

                <button
                  onClick={() => onOpenBooking(activeDetailsSpace)}
                  className="px-5 py-2.5 bg-[#ed2f39] hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
                >
                  Book Pass
                </button>
                <button
                  onClick={() => setSelectedSpaceIdForDetails(null)}
                  className="px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
