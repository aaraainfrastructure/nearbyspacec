import React, { useState } from 'react';
import { Database, FileCode, Server, Play, Copy, Check } from 'lucide-react';

export default function TechDocs() {
  const [activeTab, setActiveTab] = useState<'schema' | 'migration' | 'api' | 'vercel'>('schema');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaCode = `-- PostgreSQL Database Schema for NearbySpace
-- Designed for Supabase Relational Database Engine

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
  avatar TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SPACES TABLE
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[] NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(255) NOT NULL,
  locality VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  price_per_day NUMERIC(10, 2) NOT NULL,
  price_per_hour NUMERIC(10, 2) NOT NULL,
  amenities TEXT[] NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  owner_phone VARCHAR(50),
  total_seats INT DEFAULT 10,
  available_seats INT DEFAULT 10,
  availability VARCHAR(50) DEFAULT 'all' CHECK (availability IN ('all', 'weekdays', 'weekends')),
  rating NUMERIC(3, 2) DEFAULT 0.0,
  reviews_count INT DEFAULT 0
);

-- 3. BOOKINGS TABLE
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  space_name VARCHAR(255) NOT NULL,
  space_photo TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  duration_days INT,
  start_time TIME,
  end_time TIME,
  booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN ('hourly', 'daily')),
  seats_booked INT DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const migrationCode = `-- Supabase Schema & Initial Seed Migration
-- Setup Row Level Security (RLS) on tables for maximum protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies: Allow read-only access to approved spaces
CREATE POLICY "Public read approved spaces" ON spaces
  FOR SELECT USING (is_approved = true);

-- Allow owners to modify their own space records
CREATE POLICY "Owners manage own spaces" ON spaces
  FOR ALL USING (auth.uid() = owner_id);

-- Bookings policy: user can view their bookings; owners can check bookings for their spaces
CREATE POLICY "Users read own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Seed Data Setup (Example user and space)
INSERT INTO users (id, name, email, phone, role, avatar) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', 'rahul.sharma@gmail.com', '+91 98765 43210', 'user', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150');

INSERT INTO spaces (id, name, description, photos, address, city, locality, latitude, longitude, price_per_day, price_per_hour, amenities, is_approved, owner_id) VALUES
('e6401f78-1111-43cf-a0e2-e1927361a9aa', 'Bengaluru Tech Sanctuary', 'A premium, modern workspace featuring raw wooden aesthetic desks...', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], 'Indiranagar, Bengaluru', 'Bengaluru', 'Indiranagar', 12.9784, 77.6408, 450.00, 80.00, ARRAY['WiFi', 'AC'], true, '550e8400-e29b-41d4-a716-446655440001');`;

  const apiCode = `// Cloudflare Worker API proxy for NearbySpace
// File: /worker/index.ts

import { createClient } from '@supabase/supabase-js';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      if (url.pathname === "/api/spaces/nearby" && request.method === "GET") {
        const lat = parseFloat(url.searchParams.get("lat") || "");
        const lng = parseFloat(url.searchParams.get("lng") || "");
        const maxDist = parseFloat(url.searchParams.get("distance") || "10");
        
        if (isNaN(lat) || isNaN(lng)) {
          return new Response(JSON.stringify({ error: "Missing coordinates lat/lng" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        
        const { data: spaces, error } = await supabase
          .from("spaces")
          .select("*")
          .eq("is_approved", true);
          
        if (error) throw error;
        
        // Haversine sorting (km)
        const sorted = (spaces || []).map(space => {
          const R = 6371; // Earth radius in km
          const dLat = (space.latitude - lat) * (Math.PI / 180);
          const dLon = (space.longitude - lng) * (Math.PI / 180);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat * (Math.PI / 180)) * Math.cos(space.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;
          return { ...space, distance: Math.round(dist * 10) / 10 };
        })
        .filter(space => space.distance <= maxDist)
        .sort((a, b) => a.distance - b.distance);
        
        return new Response(JSON.stringify(sorted), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};`;

  const vercelCode = `# NearbySpace Vercel & React (Vite) production deployment guide
# Path: /README.md

## Live Vercel Environment Configuration
1. Open Vercel dashboard, click **Add New Project**, and select imports.
2. In the **Environment Variables** step, define these key credentials:

\`\`\`env
# Supabase Secure API Access keys
VITE_SUPABASE_URL="https://your-supabase-db.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-role-key-ey..."

# Cloudflare Configuration
VITE_CLOUDFLARE_WORKER_URL="https://nearbyspacec.aaraainfrastructure.workers.dev/"
\`\`\`

3. Set Vite framework presets, click **Deploy**.
4. In Supabase Dashboard, run the standard PostgreSQL DB schema inside Sql Editor to allocate migrations.`;

  const getCodeContent = () => {
    switch (activeTab) {
      case 'schema': return schemaCode;
      case 'migration': return migrationCode;
      case 'api': return apiCode;
      case 'vercel': return vercelCode;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Visual documentation header */}
      <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Database className="w-5 h-5 text-[#ed2f39]" />
          <div>
            <h3 className="font-display font-semibold text-sm">NearbySpace Production Blueprints</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Copy production schemas, REST APIs and hosting presets</p>
          </div>
        </div>
        
        <button
          onClick={() => handleCopy(getCodeContent())}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-[#ed2f39] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied Blueprint!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Segment</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center space-x-1 px-4 py-3 text-[10px] font-bold border-b-2 transition-all ${
            activeTab === 'schema'
              ? 'border-[#ed2f39] text-[#ed2f39] bg-slate-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Schema</span>
        </button>
        <button
          onClick={() => setActiveTab('migration')}
          className={`flex items-center space-x-1 px-4 py-3 text-[10px] font-bold border-b-2 transition-all ${
            activeTab === 'migration'
              ? 'border-[#ed2f39] text-[#ed2f39] bg-slate-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Supabase Migration</span>
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center space-x-1 px-4 py-3 text-[10px] font-bold border-b-2 transition-all ${
            activeTab === 'api'
              ? 'border-[#ed2f39] text-[#ed2f39] bg-slate-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Express proxy API</span>
        </button>
        <button
          onClick={() => setActiveTab('vercel')}
          className={`flex items-center space-x-1 px-4 py-3 text-[10px] font-bold border-b-2 transition-all ${
            activeTab === 'vercel'
              ? 'border-[#ed2f39] text-[#ed2f39] bg-slate-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Vercel Hosting Guide</span>
        </button>
      </div>

      {/* Code window block detail */}
      <div className="p-5 font-mono text-xs overflow-x-auto max-h-[380px] bg-slate-950/20 text-slate-300">
        <pre className="whitespace-pre">{getCodeContent()}</pre>
      </div>

    </div>
  );
}
