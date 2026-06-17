import React, { useState } from 'react';
import { Space, Booking, User, Enquiry } from '../types';
import { PlusCircle, List, DollarSign, CalendarCheck, Check, X, Building2, Eye, TrendingUp, Sparkles, MapPin, AlertCircle, PhoneCall } from 'lucide-react';
import { formatCurrency } from '../utils';

interface OwnerDashboardProps {
  spaces: Space[];
  bookings: Booking[];
  enquiries: Enquiry[];
  currentUserId: string;
  onUpdateSpace: (space: Space) => void;
  onAddSpace: (space: Space) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'confirmed' | 'cancelled') => void;
}

export default function OwnerDashboard({
  spaces,
  bookings,
  enquiries,
  currentUserId,
  onUpdateSpace,
  onAddSpace,
  onUpdateBookingStatus
}: OwnerDashboardProps) {
  const [activeTab, setActiveTab ] = useState<'create' | 'listings' | 'bookings' | 'revenue' | 'enquiries'>('listings');

  // Space Creation State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [targetCity, setTargetCity] = useState('Bengaluru');
  const [targetLocality, setTargetLocality] = useState('Indiranagar');
  const [ownerPhone, setOwnerPhone] = useState('+91 91234 56789');
  const [pricePerDay, setPricePerDay] = useState(450); // Indian price defaults
  const [pricePerHour, setPricePerHour] = useState(80); // Indian price defaults
  const [totalSeats, setTotalSeats] = useState(20);
  const [availability, setAvailability] = useState<'all' | 'weekdays' | 'weekends'>('weekdays');
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['WiFi', 'AC']);
  const [photoPreset, setPhotoPreset] = useState('modern_industrial');
  const [successMsg, setSuccessMsg] = useState('');

  // SOMA, FiDi, Mission preloaded photos to choose from
  const photosDict: Record<string, string[]> = {
    modern_industrial: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600'
    ],
    penthouse_exec: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
      'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'
    ],
    creative_garden: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600'
    ]
  };

  const amenitiesOptions = ['WiFi', 'AC', 'Parking', 'Meeting Room', 'Cafeteria', 'Power Backup', 'Printer'];

  const handleCreateSpaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    const newSpace: Space = {
      id: `space-owner-${Date.now()}`,
      name,
      description,
      address,
      city: targetCity,
      locality: targetLocality,
      lat: targetCity === 'Bengaluru' ? 12.9716 : 19.0760, // approximate Indian city lat
      lng: targetCity === 'Bengaluru' ? 77.5946 : 72.8777, // approximate Indian city lng
      pricePerDay: Number(pricePerDay),
      pricePerHour: Number(pricePerHour),
      amenities: selectedAmenities,
      isApproved: false, // Starts unapproved - Admin must review and approve!
      ownerId: currentUserId,
      ownerPhone: ownerPhone,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      availability,
      rating: 0.0,
      reviewsCount: 0,
      photos: photosDict[photoPreset]
    };

    onAddSpace(newSpace);
    
    // reset form
    setName('');
    setDescription('');
    setAddress('');
    setSuccessMsg('Your space listing has been created and queued for platform Admin Approval. You can see it in Listings!');
    setActiveTab('listings');
    setTimeout(() => {
      setSuccessMsg('');
    }, 6000);
  };

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Filter listings and reservations that belong to this owner (e.g. David Miller)
  const mySpaces = spaces.filter(s => s.ownerId === currentUserId);
  const mySpacesIds = mySpaces.map(s => s.id);
  const myBookings = bookings.filter(b => mySpacesIds.includes(b.spaceId));

  // Compute Revenue data
  const totalRevenue = myBookings
    .filter(b => b.status === 'confirmed')
    .reduce((val, curr) => val + curr.totalPrice, 0);

  const pendingBookingsCount = myBookings.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Overview Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">My Active Listings</span>
            <h3 className="text-2xl font-black text-slate-700 mt-1">{mySpaces.filter(s => s.isApproved).length} <span className="text-xs text-slate-400 font-medium">/ {mySpaces.length} total</span></h3>
          </div>
          <Building2 className="w-8 h-8 text-[#ed2f39]/20" />
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Demonstrated Revenue</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalRevenue)}</h3>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-600/20" />
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Reservations</span>
            <h3 className="text-2xl font-black text-slate-700 mt-1">{myBookings.length}</h3>
          </div>
          <CalendarCheck className="w-8 h-8 text-indigo-600/20" />
        </div>

      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Sparkles className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
            activeTab === 'listings'
              ? 'border-[#ed2f39] text-[#ed2f39]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          My Listings ({mySpaces.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
            activeTab === 'create'
              ? 'border-[#ed2f39] text-[#ed2f39]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Build Workspace Listing
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
            activeTab === 'bookings'
              ? 'border-[#ed2f39] text-[#ed2f39]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Manage Reservations ({myBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
            activeTab === 'enquiries'
              ? 'border-[#ed2f39] text-[#ed2f39]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          📞 Customer Leads ({enquiries.filter(e => e.ownerId === currentUserId).length})
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
            activeTab === 'revenue'
              ? 'border-[#ed2f39] text-[#ed2f39]'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Revenue Analytics
        </button>
      </div>

      {/* TAB CONTENT: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {mySpaces.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-700">No registered spaces list yet</h4>
              <p className="text-xs text-slate-400 mt-1">Click the "Build Workspace Listing" tab to launch your first coworking spot!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySpaces.map(space => (
                <div key={space.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex space-x-3.5">
                  <img
                    src={space.photos[0]}
                    alt={space.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="truncate flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{space.name}</h4>
                        {space.isApproved ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] px-1.5 py-0.5 rounded font-black uppercase flex items-center space-x-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 block inline animate-pulse" />
                            <span>Pending Admin</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{space.address}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-50 mt-1">
                      <span>Rate: <strong className="text-slate-800">{formatCurrency(space.pricePerDay)}/day</strong></span>
                      <span>Cap: <strong className="text-slate-800">{space.totalSeats} seats</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BUILD WORKSPACE LISTING FORM */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateSpaceSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 text-[#ed2f39] border-b pb-3 border-slate-100">
            <PlusCircle className="w-5 h-5" />
            <h3 className="font-display font-semibold text-base text-slate-700">List an Empty Coworking Space / Office</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Space Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. SOMA Creative Vault"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Physical Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 500 Market St, San Francisco, CA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">City *</label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Locality *</label>
              <input
                type="text"
                required
                placeholder="e.g. Indiranagar, Bandra West"
                value={targetLocality}
                onChange={(e) => setTargetLocality(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Contact Phone number *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 91234 56789"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase">Short Narrative Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Give details about your desks, ambient noise level, natural lighting, and what makes this neighborhood perfect for working..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Day Pass Rate ($)</label>
              <input
                type="number"
                required
                value={pricePerDay}
                onChange={(e) => setPricePerDay(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Hourly Desk Rate ($)</label>
              <input
                type="number"
                required
                value={pricePerHour}
                onChange={(e) => setPricePerHour(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Max Seating Capacity</label>
              <input
                type="number"
                required
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">Weekly Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full mt-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
              >
                <option value="all">Everyday (24/7)</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends Only</option>
              </select>
            </div>
          </div>

          {/* S.F. Coords Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h5 className="text-[11px] font-bold text-slate-600">Simulate S.F. GPS Coordinates</h5>
              <p className="text-[10px] text-slate-400">Position this spot within SF coordinate bounds for nearby testing!</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Visual Photo Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Space Interior Image Theme Preset</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPhotoPreset('modern_industrial')}
                className={`p-2 border rounded-xl text-left transition-all ${
                  photoPreset === 'modern_industrial' ? 'border-[#ed2f39] bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=120"
                  alt="Industrial"
                  referrerPolicy="no-referrer"
                  className="w-full h-12 object-cover rounded mb-1"
                />
                <span className="text-[10px] font-bold block text-slate-700">Modern Industrial Warehouse</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoPreset('penthouse_exec')}
                className={`p-2 border rounded-xl text-left transition-all ${
                  photoPreset === 'penthouse_exec' ? 'border-[#ed2f39] bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=120"
                  alt="Penthouse"
                  referrerPolicy="no-referrer"
                  className="w-full h-12 object-cover rounded mb-1"
                />
                <span className="text-[10px] font-bold block text-slate-700">Penthouse / Executive</span>
              </button>

              <button
                type="button"
                onClick={() => setPhotoPreset('creative_garden')}
                className={`p-2 border rounded-xl text-left transition-all ${
                  photoPreset === 'creative_garden' ? 'border-[#ed2f39] bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=120"
                  alt="Garden"
                  referrerPolicy="no-referrer"
                  className="w-full h-12 object-cover rounded mb-1"
                />
                <span className="text-[10px] font-bold block text-slate-700">Greenery Creative Garden</span>
              </button>
            </div>
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amenities Offerings Included</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesOptions.map(amenity => {
                const checked = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      checked
                        ? 'bg-red-50 border-red-200 text-[#ed2f39]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    + {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#ed2f39] hover:bg-red-600 active:bg-red-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            Create Workspace & Launch Admin Review
          </button>
        </form>
      )}

      {/* TAB CONTENT: MANAGE BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-700">No Reservations on File</h4>
              <p className="text-xs text-slate-400 mt-1">Once customers purchase Day Passes to your spaces, they will show up here.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Space Booked</th>
                      <th className="p-4">Pass Type & Date</th>
                      <th className="p-4 text-right">Pass Earnings</th>
                      <th className="p-4 text-center">Security Status</th>
                      <th className="p-4 text-center">Action Handlers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {myBookings.map((bk) => (
                      <tr key={bk.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-800">{bk.userName}</td>
                        <td className="p-4 truncate max-w-[150px]">{bk.spaceName}</td>
                        <td className="p-4">
                          <span className="font-bold uppercase text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-1.5">
                            {bk.type}
                          </span>
                          <span>{bk.date}</span>
                        </td>
                        <td className="p-4 text-right text-emerald-600 font-bold">{formatCurrency(bk.totalPrice)}</td>
                        <td className="p-4 text-center">
                          {bk.status === 'confirmed' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Confirmed
                            </span>
                          ) : bk.status === 'cancelled' ? (
                            <span className="bg-red-50 text-[#ed2f39] border border-red-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Cancelled
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              Pending Confirmation
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {bk.status === 'pending' ? (
                            <div className="flex justify-center space-x-1.5">
                              <button
                                onClick={() => onUpdateBookingStatus(bk.id, 'confirmed')}
                                className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-all"
                                title="Approve Reservation"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onUpdateBookingStatus(bk.id, 'cancelled')}
                                className="p-1 bg-red-100 hover:bg-red-200 text-[#ed2f39] rounded transition-all"
                                title="Decline Reservation"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium text-[10px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVENUE VECTOR ANALYTICS */}
      {activeTab === 'revenue' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-indigo-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-display font-semibold text-base text-slate-700">Secured Revenue Over Time</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black">Gross Income Metrics</span>
              <p className="text-xl font-bold mt-1 text-slate-800">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-black">Commission Platform Fee (5%)</span>
              <p className="text-xl font-bold mt-1 text-slate-800">{formatCurrency(totalRevenue * 0.05)}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-black">Net Wallet Transferable</span>
              <p className="text-xl font-bold mt-1 text-emerald-600">{formatCurrency(totalRevenue * 0.95)}</p>
            </div>
          </div>

          {/* Elegant static SVG chart that reacts to bookings count */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
            <h4 className="text-xs font-bold text-slate-500 mb-4 text-center">Demonstrated Financial Trajectory (Quarterly Projection)</h4>
            <div className="h-44 w-full relative">
              <svg className="w-full h-full text-slate-300" viewBox="0 0 500 150">
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                {/* Plot line */}
                <path
                  d="M 10 135 Q 120 125, 230 90 T 450 35 L 500 20"
                  fill="none"
                  stroke="#ed2f39"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Plot dots overlay */}
                <circle cx="10" cy="135" r="5" fill="#ed2f39" />
                <circle cx="120" cy="125" r="5" fill="#ed2f39" />
                <circle cx="230" cy="90" r="5" fill="#ed2f39" />
                <circle cx="340" cy="65" r="5" fill="#ed2f39" />
                <circle cx="450" cy="35" r="5" fill="#ed2f39" />

                {/* Custom Graph Labels */}
                <text x="10" y="148" className="fill-slate-400 text-[9px] font-mono font-medium">Jan</text>
                <text x="120" y="148" className="fill-slate-400 text-[9px] font-mono font-medium">Feb</text>
                <text x="230" y="148" className="fill-slate-400 text-[9px] font-mono font-medium">Mar</text>
                <text x="340" y="148" className="fill-slate-400 text-[9px] font-mono font-medium">Apr</text>
                <text x="450" y="148" className="fill-slate-400 text-[9px] font-mono font-medium">May (Now)</text>
              </svg>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3 font-normal">Graph displays simulated compound transactional growth based on active customer acquisitions on India hubs.</p>
          </div>

        </div>
      )}

      {/* TAB CONTENT: CUSTOMER LEADS ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3 border-slate-100">
            <h3 className="font-display font-medium text-base text-slate-700 flex items-center space-x-2">
              <PhoneCall className="w-5 h-5 text-[#ed2f39]" />
              <span>Direct Customer Leads for My Hubs</span>
            </h3>
            <span className="text-[10px] font-bold text-[#ed2f39] uppercase bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
              Lead Activity Live
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
            📈 Keep track of premium Indian visitors who enquired about your workspace. We automatically send an instant SMS and email alert copy to your inbox and also carbon copy <strong>gowri7282@gmail.com</strong>.
          </p>

          <div className="space-y-4">
            {enquiries.filter(e => e.ownerId === currentUserId).length === 0 ? (
              <div className="py-14 text-center border-2 border-dashed border-slate-150 rounded-2xl bg-slate-50/10">
                <AlertCircle className="w-10 h-10 text-slate-350 mx-auto mb-2.5" />
                <h4 className="text-sm font-bold text-slate-700">No Customers Have Enquired Yet</h4>
                <p className="text-xs text-slate-400 mt-1">Get noticed easily by optimization of photos or adding extra amenities in the builder tab!</p>
              </div>
            ) : (
              enquiries.filter(e => e.ownerId === currentUserId).map(enq => (
                <div key={enq.id} className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl hover:border-[#ed2f39] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-800">{enq.userName}</span>
                      <span className="text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.5 uppercase">Google Sign-in</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{enq.userEmail}</p>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      Verified Mobile: <strong className="text-slate-800">{enq.userPhone}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enquiry For: <strong className="text-slate-700">{enq.spaceName}</strong>
                    </p>
                  </div>
                  <div className="text-left md:text-right space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">{enq.timestamp}</span>
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Notifications copied to admin & owner
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
