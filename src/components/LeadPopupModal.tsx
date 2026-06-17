import React, { useState } from 'react';
import { ShieldCheck, Mail, Phone, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Space, User, Enquiry } from '../types';

interface LeadPopupModalProps {
  isOpen: boolean;
  space: Space | null;
  onClose: () => void;
  currentUser: User | null;
  onLoginAndVerify: (user: User, enquiry: Enquiry) => void;
}

export default function LeadPopupModal({
  isOpen,
  space,
  onClose,
  currentUser,
  onLoginAndVerify,
}: LeadPopupModalProps) {
  const [googleStep, setGoogleStep] = useState<'pending' | 'authenticated'>(
    currentUser && currentUser.email.includes('@gmail.com') ? 'authenticated' : 'pending'
  );
  
  const [googleEmail, setGoogleEmail] = useState(currentUser?.email || '');
  const [googleName, setGoogleName] = useState(currentUser?.name || '');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !space) return null;

  const handleSimulateGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      setError('Please enter a valid Google email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setGoogleStep('authenticated');
    }, 1000);
  };

  const handleCompleteVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleStep !== 'authenticated') {
      setError('Please authenticate with Google first.');
      return;
    }

    // Validate Indian Phone Number: 10 digits
    const cleanedPhone = mobileNumber.replace(/\s+/g, '').replace(/[-()]/g, '');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    
    if (!cleanedPhone || !indianPhoneRegex.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit Indian Mobile Number (starts with 6, 7, 8 or 9).');
      return;
    }

    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Create or update authenticated user
      const loggedInUser: User = {
        id: currentUser?.id || crypto.randomUUID(),
        name: googleName || currentUser?.name || 'Verified Indian Visitor',
        email: googleEmail || currentUser?.email || 'visitor@gmail.com',
        phone: '+91 ' + cleanedPhone,
        role: currentUser?.role || 'user',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isBlocked: false,
        registeredAt: currentUser?.registeredAt || new Date().toISOString().split('T')[0],
      };

      // Create lead enquiry entity
      const newEnquiry: Enquiry = {
        id: crypto.randomUUID(),
        spaceId: space.id,
        spaceName: space.name,
        ownerId: space.ownerId,
        userId: loggedInUser.id,
        userName: loggedInUser.name,
        userEmail: loggedInUser.email,
        userPhone: loggedInUser.phone || '',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        notifiedGowriEmail: 'gowri7282@gmail.com',
        ownerNotified: true,
      };

      onLoginAndVerify(loggedInUser, newEnquiry);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col">
        {/* Top brand header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#ed2f39]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base leading-none text-white">Owner Contact Reveal</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">Instant Lead Notification Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-light w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Target property preview */}
          <div className="p-3 bg-red-50/40 border border-red-100 rounded-2xl flex items-center space-x-3">
            <img
              src={space.photos[0]}
              alt={space.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-[#ed2f39] uppercase bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                {space.city} • {space.locality}
              </span>
              <h4 className="text-xs font-bold text-slate-800 truncate mt-1">{space.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">Owner ID: {space.ownerId}</p>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Sign Up to Connect Directly</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Retrieved contacts trigger verified local lead alerts to our administrators and property owners.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-[#ed2f39] font-medium font-sans">
              ⚠️ {error}
            </div>
          )}

          {/* Steps */}
          <div className="space-y-4">
            {/* Step 1: Google Login */}
            <div className={`p-4 rounded-2xl border transition-all ${
              googleStep === 'authenticated'
                ? 'bg-emerald-50/40 border-emerald-100'
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    googleStep === 'authenticated' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {googleStep === 'authenticated' ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </div>
                  <span className="text-xs font-bold text-slate-800">Authenticate Google Session</span>
                </div>
                {googleStep === 'authenticated' && (
                  <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Connected</span>
                )}
              </div>

              {googleStep === 'pending' ? (
                <form onSubmit={handleSimulateGoogleLogin} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amit Patel"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#ed2f39] text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Google Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="username@gmail.com"
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#ed2f39] text-slate-800"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.215-5.107 4.215-3.41 0-6.173-2.777-6.173-6.17s2.763-6.17 6.173-6.17c1.47 0 2.83.513 3.9 1.382l3.078-3.078C19.145 2.858 15.932 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.385 0 10.155-3.825 10.155-10.5 0-.585-.045-1.125-.135-1.715H12.24z"
                      />
                    </svg>
                    <span>Connect with Google G-Suite</span>
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[#ed2f39]">
                    G
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{googleName}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{googleEmail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGoogleStep('pending')}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-semibold"
                  >
                    Change Account
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Mobile Number */}
            <div className={`p-4 rounded-2xl border transition-all ${
              googleStep === 'authenticated'
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-50 border-slate-100 opacity-60'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black">
                    2
                  </div>
                  <span className="text-xs font-bold text-slate-800">Enter Active Indian Mobile Number</span>
                </div>
              </div>

              <form onSubmit={handleCompleteVerification} className="space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-xs pointer-events-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    disabled={googleStep !== 'authenticated' || isSubmitting}
                    maxLength={10}
                    required
                    placeholder="98765 12345"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-15 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#ed2f39] text-slate-800 font-bold tracking-wider"
                  />
                </div>

                <p className="text-[10px] text-slate-400 leading-normal">
                  * A real-time lead notification copy will immediately be forwarded to <strong>gowri7282@gmail.com</strong> for monitoring.
                </p>

                <button
                  type="submit"
                  disabled={googleStep !== 'authenticated' || isSubmitting}
                  className="w-full py-3 mt-4 bg-[#ed2f39] hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-md shadow-red-200/50 hover:shadow-red-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Retrieving Contact Details...</span>
                  ) : (
                    <>
                      <span>Verify & Reveal Owner Number</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sponsor Banner / Revenue placeholder as instructed */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Ad sponsorship</span>
          <span className="text-[9px] font-semibold text-slate-500 italic">Sponsored by ACT Fibernet Enterprise</span>
        </div>
      </div>
    </div>
  );
}
