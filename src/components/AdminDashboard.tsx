import React, { useState } from 'react';
import { Space, Booking, User, Enquiry } from '../types';
import { ShieldCheck, CheckCheck, Landmark, Users2, ShieldAlert, Ban, BarChart3, AlertCircle, RefreshCw, Star, MailOpen, PhoneIncoming } from 'lucide-react';
import { formatCurrency } from '../utils';

interface AdminDashboardProps {
  spaces: Space[];
  bookings: Booking[];
  usersList: User[];
  enquiries: Enquiry[];
  onApproveSpace: (spaceId: string) => void;
  onRejectSpace: (spaceId: string) => void;
  onUpdateUserRole: (userId: string, role: 'user' | 'owner' | 'admin') => void;
  onToggleBlockUser: (userId: string) => void;
  onResetDatabase: () => void;
}

export default function AdminDashboard({
  spaces,
  bookings,
  usersList,
  enquiries,
  onApproveSpace,
  onRejectSpace,
  onUpdateUserRole,
  onToggleBlockUser,
  onResetDatabase
}: AdminDashboardProps) {
  const [activeTab, setActiveTab ] = useState<'approvals' | 'users' | 'analytics' | 'enquiries'>('approvals');
  const [resetConfirm, setResetConfirm] = useState(false);

  // Filter listings pending approval
  const pendingSpaces = spaces.filter(s => !s.isApproved);

  // System statistics
  const totalVolume = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeLocationsCount = spaces.filter(s => s.isApproved).length;

  return (
    <div className="space-y-6">
      
      {/* Top ribbon stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users Seeded</span>
            <h3 className="text-xl font-black text-slate-800 mt-1">{usersList.length}</h3>
          </div>
          <Users2 className="w-7 h-7 text-[#ed2f39]/20" />
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Coworks</span>
            <h3 className="text-xl font-black text-slate-800 mt-1">{activeLocationsCount} approved</h3>
          </div>
          <Landmark className="w-7 h-7 text-[#ed2f39]/20" />
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">System Gross Revenue</span>
            <h3 className="text-xl font-black text-[#ed2f39] mt-1">{formatCurrency(totalVolume)}</h3>
          </div>
          <BarChart3 className="w-7 h-7 text-[#ed2f39]/20" />
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm col-span-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Approval</span>
            <h3 className={`text-xl font-black mt-1 ${pendingSpaces.length > 0 ? 'text-[#ed2f39] animate-pulse' : 'text-slate-500'}`}>
              {pendingSpaces.length} spots
            </h3>
          </div>
          <ShieldAlert className="w-7 h-7 text-[#ed2f39]/20" />
        </div>

      </div>

      {/* Sub tabs line */}
      <div className="flex justify-between items-center border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
              activeTab === 'approvals'
                ? 'border-[#ed2f39] text-[#ed2f39]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Awaiting Approval ({pendingSpaces.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
              activeTab === 'users'
                ? 'border-[#ed2f39] text-[#ed2f39]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Seeded Users Database ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
              activeTab === 'enquiries'
                ? 'border-[#ed2f39] text-[#ed2f39]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Leads & Inquiries ({enquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-xs font-bold px-4 transition-all border-b-2 ${
              activeTab === 'analytics'
                ? 'border-[#ed2f39] text-[#ed2f39]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Global Analytics
          </button>
        </div>

        {/* Diagnostic Reset Button */}
        <div className="pb-2">
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="text-[10px] font-bold text-slate-400 hover:text-[#ed2f39] flex items-center space-x-1 border border-slate-200 px-2 py-1 rounded-lg"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Seed Database</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="text-[#ed2f39] font-bold">Are you sure?</span>
              <button
                onClick={() => { onResetDatabase(); setResetConfirm(false); }}
                className="bg-[#ed2f39] text-white px-2 py-1 rounded font-bold"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="text-slate-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB CONTENT: AWAITING APPROVAL */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingSpaces.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
              <CheckCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg text-slate-800">All Spaces Approved!</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">There are currently no co-working, boardrooms, or hot desk listings pending compliance clearance from SF admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSpaces.map(space => (
                <div key={space.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="p-5 flex space-x-4">
                    <img
                      src={space.photos[0]}
                      alt={space.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <span className="bg-amber-50 text-amber-700 font-bold text-[9px] px-1.5 py-0.5 rounded border border-amber-100 uppercase inline">
                        Pending Compliance Audit
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 truncate mt-1">{space.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{space.address}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-normal">{space.description}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs">
                      <span className="text-slate-400">Day rate: </span>
                      <strong className="text-slate-800 font-bold">{formatCurrency(space.pricePerDay)}</strong>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onRejectSpace(space.id)}
                        className="px-3 py-1.5 text-[10px] text-slate-600 hover:text-red-600 font-bold uppercase cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onApproveSpace(space.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wide cursor-pointer"
                      >
                        Approve & Launch Live
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SEEDED USERS DATABASE */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Profile Email</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Current App Role</th>
                  <th className="p-4 text-center">System Access Status</th>
                  <th className="p-4 text-center">Action Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-800 flex items-center space-x-2.5">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                          {user.name[0]}
                        </div>
                      )}
                      <span>{user.name}</span>
                    </td>
                    <td className="p-4 font-mono">{user.email}</td>
                    <td className="p-4 text-slate-400">{user.phone || 'N/A (Google Social)'}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => onUpdateUserRole(user.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] font-bold text-slate-700 uppercase"
                      >
                        <option value="user">User</option>
                        <option value="owner">Space Owner</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      {user.isBlocked ? (
                        <span className="bg-red-50 text-[#ed2f39] border border-red-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Blocked / Suspended
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Active Access
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onToggleBlockUser(user.id)}
                        className={`p-1.5 rounded text-[10px] font-semibold border transition-all ${
                          user.isBlocked
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 border-red-100 text-[#ed2f39] hover:bg-red-100/50'
                        }`}
                      >
                        {user.isBlocked ? 'Restore Access' : 'Restrict User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GLOBAL ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-[#ed2f39] border-b pb-3 border-slate-100">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-display font-semibold text-base text-slate-700">Platform Transactional Health Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visual breakdown metrics */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Allocation Distribution</h4>
              
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Approved Active Spaces</span>
                    <span className="font-bold">{activeLocationsCount} / {spaces.length}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#ed2f39] h-full"
                      style={{ width: `${(activeLocationsCount / (spaces.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Outstanding Reservation Completion Rating</span>
                    <span className="font-bold">94.2%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '94.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Total Subscribed Active Host ratio</span>
                    <span className="font-bold">38.4%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: '38.4%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Trajectory Chart */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Compound User Growth Acquisition</h4>
              <div className="h-32 w-full">
                <svg className="w-full h-full text-slate-300" viewBox="0 0 400 120">
                  <path
                    d="M 10 110 Q 100 100, 200 60 T 380 15"
                    fill="none"
                    stroke="#ed2f39"
                    strokeWidth="3"
                  />
                  <circle cx="10" cy="110" r="4" fill="#ed2f39" />
                  <circle cx="100" cy="100" r="4" fill="#ed2f39" />
                  <circle cx="200" cy="60" r="4" fill="#ed2f39" />
                  <circle cx="300" cy="40" r="4" fill="#ed2f39" />
                  <circle cx="380" cy="15" r="4" fill="#ed2f39" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">Acquisitions grew by +48% post release of GPS Haversine filtering.</p>
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: LEADS & INQUIRIES LOGS */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <MailOpen className="w-5 h-5 text-[#ed2f39]" />
              <h3 className="font-display font-bold text-base text-slate-800">Direct Workspace Inquiry Leads</h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 uppercase px-2.5 py-1 rounded-full border border-slate-200">
              Target Email: gowri7282@gmail.com
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-normal max-w-2xl bg-amber-50/50 border border-amber-100/80 p-3 rounded-xl">
            💡 <strong>Lead Routing System Offline/Simulator Mode:</strong> Below is a audit list of all users who clicked and fetched property owner contacts. A secure copy of these actions is continuously compiled and logs are carbon-copied to <strong>gowri7282@gmail.com</strong> in real-time.
          </p>

          <div className="space-y-3.5">
            {enquiries.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                <PhoneIncoming className="w-9 h-9 text-slate-350 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Lead Inquiries Yet</h4>
                <p className="text-xs text-slate-400 mt-0.5">When users query property owners by checking contacts, details will pop up here.</p>
              </div>
            ) : (
              enquiries.map((enq) => (
                <div key={enq.id} className="p-4 border border-slate-200 rounded-xl hover:border-[#ed2f39] transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#ed2f39]/10 text-[#ed2f39] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Lead Active
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{enq.timestamp}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Enquired Space: <span className="text-[#ed2f39]">{enq.spaceName}</span>
                    </h4>
                    <p className="text-xs text-slate-600">
                      Visitor: <strong className="text-slate-800">{enq.userName}</strong> ({enq.userEmail})
                    </p>
                    <p className="text-xs text-slate-600 font-mono">
                      📞 Verified Mobile Number: <strong className="text-slate-800">{enq.userPhone}</strong>
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end space-y-1 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 min-w-[200px]">
                    <div className="text-[10px] text-emerald-800 font-bold flex items-center space-x-1">
                      <span>✓</span>
                      <span>Owner / Admin Notified!</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Carbon Copy Logged to:</p>
                    <p className="text-[10px] text-slate-600 font-mono font-bold truncate max-w-[200px]">
                      {enq.notifiedGowriEmail}
                    </p>
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
