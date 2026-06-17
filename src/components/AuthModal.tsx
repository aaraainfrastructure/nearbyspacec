import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, Sparkles, LogIn, Laptop, ShieldCheck } from 'lucide-react';
import { User, Role } from '../types';
import { INITIAL_USERS } from '../mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<'otp' | 'google' | 'quick'>('quick');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpSent(true);
      setTimer(30);
      // Help the user know what code to enter
      console.log('SIMULATED NearbySpace OTP Code is: 4812');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '4812') {
      setError('Incorrect verification code. Please try 4812 (dev demo code)');
      return;
    }
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Login as a user-generated profile using the entered phone
      const phoneUser: User = {
        id: `usr-custom-${Date.now()}`,
        name: `User ${phone.slice(-4)}`,
        email: `phone_user_${phone.slice(-4)}@nearbyspace.com`,
        phone: phone,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        isBlocked: false,
        registeredAt: new Date().toISOString().split('T')[0]
      };
      onLogin(phoneUser);
      onClose();
    }, 1000);
  };

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = googleEmail || 'guest.user@gmail.com';
    const name = googleName || 'Guest Explorer';

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const googleUser: User = {
        id: `usr-google-${Date.now()}`,
        name: name,
        email: email,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        isBlocked: false,
        registeredAt: new Date().toISOString().split('T')[0]
      };
      onLogin(googleUser);
      onClose();
    }, 1200);
  };

  const handleQuickLogin = (role: Role) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const defaultUser = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
      onLogin(defaultUser);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col">
        {/* Top Accent Line */}
        <div className="h-1.5 bg-[#ed2f39]" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
        >
          &times;
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-2 text-[#ed2f39]">
            <Sparkles className="w-6 h-6" />
            <span className="font-display font-bold text-xl tracking-wide text-slate-800">NearbySpace Auth</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Sign in to discover premium coworking seats, review rooms, and post listings.</p>

          {/* Tab buttons */}
          <div className="grid grid-cols-3 gap-1 mt-6 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => { setAuthMethod('quick'); setError(''); }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMethod === 'quick' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quick Test
            </button>
            <button
              onClick={() => { setAuthMethod('otp'); setError(''); }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMethod === 'otp' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mobile OTP
            </button>
            <button
              onClick={() => { setAuthMethod('google'); setError(''); }}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMethod === 'google' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Google Auth
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-xs text-[#ed2f39] border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Login Tabs */}
          {authMethod === 'quick' && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Demo Access Profiles</p>
              
              <button
                onClick={() => handleQuickLogin('user')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-red-200 hover:bg-red-50/20 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-lg bg-red-100 text-[#ed2f39]">
                    <LogIn className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Sarah Jenkins (Customer View)</h4>
                    <p className="text-xs text-slate-400">Discover spaces, post reviews, save favorites, book</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('owner')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-slate-50 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                    <Laptop className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">David Miller (Space Owner View)</h4>
                    <p className="text-xs text-slate-400">Create listings, edit availability, check reservations</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin('admin')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-[#ed2f39] hover:bg-emerald-50/20 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <span className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Alex Rivera (Platform Admin View)</h4>
                    <p className="text-xs text-slate-400">Approve listings, audit users list, platform analytics</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Secure OTP Verification Form */}
          {authMethod === 'otp' && (
            <div className="mt-6">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Mobile Phone Number</label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Phone className="w-4 h-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#ed2f39] transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#ed2f39] hover:bg-red-600 active:bg-red-700 text-white font-medium text-xs rounded-lg shadow-md shadow-red-200/50 hover:shadow-red-200/80 transition-all flex items-center justify-center space-x-1 uppercase tracking-wide cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Send OTP Verification Code'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Enter 4-Digit OTP Code</label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder="Type 4812 to verify"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-center text-lg tracking-[0.5em] font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-[#ed2f39] transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-lg shadow-md shadow-emerald-200/50 transition-all flex items-center justify-center space-x-1 uppercase tracking-wide cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Verify & Register Session'
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Demo Bypass Code: <strong className="text-slate-600">4812</strong></span>
                    {timer > 0 ? (
                      <span>Resend in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setTimer(30); }}
                        className="text-[#ed2f39] hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* simulated Google Login Form */}
          {authMethod === 'google' && (
            <form onSubmit={handleGoogleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Full Name</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#ed2f39] transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Google Email Address</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="jane.doe@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#ed2f39] transition-all bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 border border-slate-300 hover:border-slate-400 active:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-[#ed2f39] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Log in securely with Google</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
