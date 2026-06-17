import React, { useState } from 'react';
import { Space } from '../types';
import { MapPin, Navigation, ZoomIn, ZoomOut, Compass, Info, Star } from 'lucide-react';
import { calculateDistance, DEFAULT_LAT, DEFAULT_LNG, formatCurrency } from '../utils';

interface MapViewProps {
  spaces: Space[];
  selectedSpace: Space | null;
  onSelectSpace: (space: Space | null) => void;
  userLat: number;
  userLng: number;
  onUpdateUserLocation: (lat: number, lng: number) => void;
  onOpenBooking: (space: Space) => void;
}

export default function MapView({
  spaces,
  selectedSpace,
  onSelectSpace,
  userLat,
  userLng,
  onUpdateUserLocation,
  onOpenBooking
}: MapViewProps) {
  const [zoom, setZoom] = useState(14);
  const [dragMsg, setDragMsg] = useState('');

  // S.F. coordinates bounds to scale layout onto SVG coordinates
  // S Soma, FiDi, Mission, Nob hill are in this bounding box:
  // Lat: 37.7500 to 37.8100 (diff 0.0600)
  // Lng: -122.4500 to -122.3900 (diff 0.0600)
  const minLat = 37.7500;
  const maxLat = 37.8200;
  const minLng = -122.4600;
  const maxLng = -122.3800;

  const getSvgCoordinates = (lat: number, lng: number) => {
    // Convert GPS coordinates to 0-300 SVG viewbox coordinates
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100; // Flip Y as SVG 0 is top
    return { x: `${x}%`, y: `${y}%` };
  };

  // Simulates GPS coordinate adjustment by double clicking on the map
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXPercent = (e.clientX - rect.left) / rect.width;
    const clickYPercent = (e.clientY - rect.top) / rect.height;

    // Convert back from 0-1 percentage to coordinates
    const newLng = minLng + clickXPercent * (maxLng - minLng);
    const newLat = minLat + (1 - clickYPercent) * (maxLat - minLat); // Flip back Y

    onUpdateUserLocation(
      parseFloat(newLat.toFixed(5)),
      parseFloat(newLng.toFixed(5))
    );
    setDragMsg('GPS Origin Updated! Distances recalculated.');
    setTimeout(() => setDragMsg(''), 4000);
  };

  const activeUserPos = getSvgCoordinates(userLat, userLng);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[520px] shadow-inner relative">
      
      {/* Search Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-100">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-[#ed2f39] animate-spin-slow" />
          <div>
            <h4 className="text-xs font-bold text-slate-700">Digital City Radar</h4>
            <p className="text-[10px] text-slate-500">Double-click grid to reposition your GPS anchor</p>
          </div>
        </div>
        <div className="bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-600 font-semibold">
          Lat: {userLat.toFixed(4)}, Lng: {userLng.toFixed(4)}
        </div>
      </div>

      {dragMsg && (
        <div className="absolute top-18 left-1/2 transform -translate-x-1/2 z-10 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-md animate-bounce">
          {dragMsg}
        </div>
      )}

      {/* Primary Visual Vector Grid Map representing Downtown San Francisco */}
      <div className="relative flex-1 bg-[#f4f3f0] cursor-crosshair overflow-hidden">
        
        {/* Draw Custom Map Lines & Landmark Overlays */}
        <svg
          onTouchStart={() => {}} // prevent scroll lock
          onClick={handleMapClick}
          className="absolute inset-0 w-full h-full select-none"
        >
          {/* Simulate Water Area (The Bay) in top right */}
          <path
            d="M 68 0 L 100 0 L 100 80 Q 85 70 80 50 Z"
            fill="#dbeafe"
            className="opacity-70 transition-all duration-300"
          />
          <text x="85%" y="22%" className="fill-blue-500 font-sans font-semibold text-[10px] select-none opacity-40">San Francisco Bay</text>

          {/* Golden Gate Bridge side indicator top left */}
          <path
            d="M 0 10 L 25 15 M 25 15 Q 15 5 0 0"
            stroke="#ed2f39"
            strokeWidth="1.5"
            strokeDasharray="2"
            fill="none"
            className="opacity-40"
          />

          {/* Draw Gridlines representing physical streets */}
          {/* Lateral Avenues */}
          <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#e2e8f0" strokeWidth="1.5" /> {/* Market Street */}
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#e2e8f0" strokeWidth="1" />

          {/* Diagonal Streets */}
          <line x1="10%" y1="0" x2="40%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="30%" y1="0" x2="60%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="50%" y1="0" x2="80%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="70%" y1="0" x2="100%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />

          {/* Label Major Streets */}
          <text x="2%" y="62%" className="fill-slate-400 font-mono text-[8px] tracking-wide font-normal opacity-50 uppercase">Market St</text>
          <text x="52%" y="45%" className="fill-slate-400 font-mono text-[8px] tracking-wide font-normal opacity-50 uppercase">Montgomery St</text>
          <text x="18%" y="15%" className="fill-emerald-800 font-sans text-[8px] font-bold opacity-30">SOMA District</text>
          <text x="65%" y="65%" className="fill-emerald-800 font-sans text-[8px] font-bold opacity-30 font-medium">Financial District</text>

          {/* User Location Pulsing Dot */}
          <g transform={`translate(${activeUserPos.x}, ${activeUserPos.y})`}>
            {/* outer halo pulses */}
            <circle r="12" fill="#3b82f6" className="opacity-20 animate-ping" />
            <circle r="6" fill="#3b82f6" className="stroke-white stroke-2" />
          </g>
        </svg>

        {/* Place Space Marker Nodes */}
        {spaces.map((space) => {
          if (!space.isApproved) return null;
          const pos = getSvgCoordinates(space.lat, space.lng);
          const distance = calculateDistance(userLat, userLng, space.lat, space.lng);
          const isSelected = selectedSpace?.id === space.id;

          return (
            <div
              key={space.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.x, top: pos.y }}
            >
              <button
                type="button"
                onClick={() => onSelectSpace(space)}
                className={`relative p-1.5 rounded-full shadow-lg border transition-all ${
                  isSelected
                    ? 'bg-[#ed2f39] text-white scale-125 border-white ring-4 ring-red-100 z-30'
                    : 'bg-white text-[#ed2f39] hover:bg-[#ed2f39] hover:text-white border-slate-200 z-20 hover:scale-110'
                }`}
                title={space.name}
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          );
        })}

        {/* Side Controls */}
        <div className="absolute right-3 bottom-18 flex flex-col space-y-1 bg-white p-1 rounded-xl shadow-lg border border-slate-100">
          <button
            onClick={() => setZoom(prev => Math.min(18, prev + 1))}
            className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(10, prev - 1))}
            className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-[#ed2f39] rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Details Overlay Card */}
        {selectedSpace && (
          <div className="absolute bottom-3 left-3 right-3 bg-white p-4 rounded-xl shadow-lg border border-slate-100 animate-slide-up flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-start space-x-3 max-w-[280px]">
              <img
                src={selectedSpace.photos[0]}
                alt={selectedSpace.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="truncate">
                <h4 className="text-xs font-bold text-slate-800 truncate">{selectedSpace.name}</h4>
                <div className="flex items-center space-x-1.5 mt-0.5 text-[10px]">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-current mr-0.5" />
                    {selectedSpace.rating || 'New'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-medium">
                    {calculateDistance(userLat, userLng, selectedSpace.lat, selectedSpace.lng)} miles away
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{selectedSpace.address}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <div className="text-right pr-2">
                <p className="text-[9px] uppercase font-bold text-slate-400">DAILY PASS</p>
                <span className="text-sm font-black text-[#ed2f39]">{formatCurrency(selectedSpace.pricePerDay)}</span>
              </div>
              <button
                onClick={() => onOpenBooking(selectedSpace)}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#ed2f39] hover:bg-red-600 active:bg-red-700 text-white font-bold text-[10px] rounded-lg shadow-md shadow-red-100 uppercase tracking-wider"
              >
                Instant Book
              </button>
              <button
                onClick={() => onSelectSpace(null)}
                className="px-2 py-2 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg text-xs font-bold"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="bg-white px-4 py-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block inline" />
          <span className="font-semibold">Your Location Anchor</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ed2f39]" />
          <span className="font-semibold">Approved Workspaces ({spaces.filter(s => s.isApproved).length})</span>
        </div>
      </div>

    </div>
  );
}
