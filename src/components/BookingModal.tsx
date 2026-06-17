import React, { useState } from 'react';
import { Calendar, Clock, CreditCard, ShieldCheck, Ticket, Users, AlertCircle } from 'lucide-react';
import { Space, Booking } from '../types';
import { formatCurrency } from '../utils';

interface BookingModalProps {
  space: Space;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onConfirmBooking: (booking: Booking) => void;
}

export default function BookingModal({
  space,
  isOpen,
  onClose,
  userId,
  userName,
  onConfirmBooking
}: BookingModalProps) {
  const [bookingType, setBookingType] = useState<'daily' | 'hourly'>('daily');
  const [date, setDate] = useState(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [seats, setSeats] = useState(1);
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');
  
  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  if (!isOpen) return null;

  // Compute pricing
  const calculateHours = () => {
    if (bookingType === 'daily') return 8; // Standard daily equivalent
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalHours = (endH + endM / 60) - (startH + startM / 60);
    return Math.max(0.5, totalHours);
  };

  const hours = calculateHours();
  const subtotal = bookingType === 'daily' 
    ? space.pricePerDay * seats
    : space.pricePerHour * hours * seats;
  
  const tax = subtotal * 0.086; // 8.6% SF city co-working tax
  const platformFee = 2.50; // standard flat platform cost
  const totalPrice = subtotal + tax + platformFee;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours <= 0 && bookingType === 'hourly') {
      alert('End time must be after start time.');
      return;
    }
    setStep('payment');
  };

  const handlePayAndConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      const bookingId = `b-gen-${Math.floor(100000 + Math.random() * 900000)}`;
      setConfirmedBookingId(bookingId);

      // Create booking record
      const newBooking: Booking = {
        id: bookingId,
        spaceId: space.id,
        spaceName: space.name,
        spacePhoto: space.photos[0],
        userId: userId,
        userName: userName,
        date: date,
        type: bookingType,
        seatsBooked: seats,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        ...(bookingType === 'hourly' ? { startTime, endTime } : {})
      };

      onConfirmBooking(newBooking);
      setStep('success');
    }, 1800);
  };

  const resetAndClose = () => {
    setStep('plan');
    setSeats(1);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header visual */}
        <div className="relative p-5 bg-gradient-to-r from-[#ed2f39] to-red-500 text-white flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg">Secure Space Pass Booking</h3>
            <p className="text-xs text-red-100 mt-0.5 truncate max-w-[320px]">{space.name}</p>
          </div>
          <button
            onClick={resetAndClose}
            className="text-white/80 hover:text-white p-1 rounded-full bg-black/10 hover:bg-black/20 font-bold transition-all"
          >
            &times;
          </button>
        </div>

        {/* Dynamic Multi-Step Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* STEP 1: PLAN CHOICES */}
          {step === 'plan' && (
            <form onSubmit={handleNextToPayment} className="space-y-5">
              
              {/* Day vs Hour selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Booking Tier</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingType('daily')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      bookingType === 'daily'
                        ? 'border-[#ed2f39] bg-red-50/20 text-[#ed2f39]'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Calendar className="w-6 h-6 mb-1" />
                    <span className="text-sm font-bold">1-Day Pass</span>
                    <span className="text-xs text-slate-400 mt-1">{formatCurrency(space.pricePerDay)}/day</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('hourly')}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      bookingType === 'hourly'
                        ? 'border-[#ed2f39] bg-red-50/20 text-[#ed2f39]'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Clock className="w-6 h-6 mb-1" />
                    <span className="text-sm font-bold">Hourly Access</span>
                    <span className="text-xs text-slate-400 mt-1">{formatCurrency(space.pricePerHour)}/hour</span>
                  </button>
                </div>
              </div>

              {/* Date selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Booking Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-[#ed2f39]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Quantity (Seats)</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSeats(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-800">{seats}</span>
                    <button
                      type="button"
                      onClick={() => setSeats(prev => Math.min(space.availableSeats, prev + 1))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-700"
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-400">Max: {space.availableSeats}</span>
                  </div>
                </div>
              </div>

              {/* Hourly specific times */}
              {bookingType === 'hourly' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Price Breakdown Preview */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100">
                <div className="pb-3 text-xs text-slate-500 grid gap-1.5">
                  <div className="flex justify-between">
                    <span>Base Fare Subtotal ({seats} {seats > 1 ? 'seats' : 'seat'})</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Municipal Occupancy Tax (8.6%)</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>NearbySpace Care Booking Fee</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(platformFee)}</span>
                  </div>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">Total Price Due</span>
                  <span className="text-xl font-display font-bold text-[#ed2f39]">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Next Step click button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#ed2f39] hover:bg-red-600 active:bg-red-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-red-200"
              >
                Proceed to Secure Payment
              </button>
            </form>
          )}

          {/* STEP 2: CREDIT CARD CHECKOUT */}
          {step === 'payment' && (
            <form onSubmit={handlePayAndConfirm} className="space-y-5">
              
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl flex items-start space-x-3 text-xs font-semibold">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <h4>128-Bit Fully Encrypted Sandbox Payment</h4>
                  <p className="text-emerald-600 font-normal mt-0.5">Your payment is fully details-protected and stored securely via Supabase gateway simulation.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400">Total amount to pay</p>
                  <span className="text-lg font-bold text-slate-700">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="text-right text-xs bg-slate-200 px-3 py-1 rounded-full font-bold text-slate-600 uppercase">
                  {bookingType === 'daily' ? 'Day Pass' : `${hours} Hours`}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    defaultValue={userName}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Credit Card Number</label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">CVV / CVC Code</label>
                    <input
                      type="password"
                      required
                      placeholder="123"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-xl uppercase tracking-wider"
                >
                  Back to Plan
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2 uppercase tracking-wider cursor-pointer"
                >
                  {isPaying ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <span>Submit & Auth Payment</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS BOARDING PASS */}
          {step === 'success' && (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600">
                <Ticket className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-slate-800">Booking Confirmed!</h3>
                <p className="text-sm text-slate-500 mt-1">Your boarding pass and receipt have been registered under your profile.</p>
              </div>

              {/* Visual Printable Ticket */}
              <div className="mx-auto max-w-sm border border-dashed border-slate-300 rounded-2xl bg-slate-50 p-5 align-middle select-none relative overflow-hidden text-left shadow-sm">
                
                {/* Visual left notch */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border-r border-dashed border-slate-300 transform -translate-y-1/2" />
                {/* Visual right notch */}
                <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-l border-dashed border-slate-300 transform -translate-y-1/2" />

                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-3 mb-3">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">Workspace Service</p>
                    <span className="text-xs font-bold text-[#ed2f39]">NearbySpace Pass</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">TICKET ID</p>
                    <span className="font-mono text-xs font-bold text-slate-700">{confirmedBookingId}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">SPACE NAME</p>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{space.name}</h4>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">VISITATION DATE</p>
                    <h4 className="text-xs font-semibold text-slate-700">{date} {bookingType === 'hourly' ? `@ ${startTime} - ${endTime}` : '(All-Day)'}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">QUANTITY</p>
                      <span className="text-xs font-semibold text-slate-700">{seats} {seats > 1 ? 'Seats Allocated' : 'Seat Allocated'}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-semibold">VISITOR</p>
                      <span className="text-xs font-semibold text-slate-700 truncate block">{userName}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-center">
                  {/* Mock barcode/QR overlay */}
                  <div className="flex flex-col items-center justify-center p-1 bg-white border border-slate-100 rounded-lg">
                    <svg className="w-12 h-12 text-slate-800" viewBox="0 0 100 100">
                      {/* Generates a simple pixelated mock QR code */}
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="25" height="25" fill="black" />
                      <rect x="15" y="15" width="15" height="15" fill="white" />
                      <rect x="18" y="18" width="9" height="9" fill="black" />
                      
                      <rect x="65" y="10" width="25" height="25" fill="black" />
                      <rect x="70" y="15" width="15" height="15" fill="white" />
                      <rect x="73" y="18" width="9" height="9" fill="black" />

                      <rect x="10" y="65" width="25" height="25" fill="black" />
                      <rect x="15" y="70" width="15" height="15" fill="white" />
                      <rect x="18" y="73" width="9" height="9" fill="black" />

                      <rect x="45" y="45" width="10" height="10" fill="black" />
                      <rect x="55" y="55" width="10" height="15" fill="black" />
                      <rect x="75" y="75" width="15" height="15" fill="black" />
                      <rect x="40" y="70" width="15" height="10" fill="black" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-400 font-semibold">TOTAL SECURED</p>
                    <span className="text-base font-bold text-slate-800">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg uppercase tracking-wider cursor-pointer"
                >
                  Done, View Booking History
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
