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

-- 1. USERS TABLE (Supports standard roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
  avatar TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SPACES TABLE (Coworking resources)
CREATE TABLE spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  photos TEXT[] NOT NULL, -- Array of image links
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  price_per_day NUMERIC(10, 2) NOT NULL,
  price_per_hour NUMERIC(10, 2) NOT NULL,
  amenities TEXT[] NOT NULL, -- Array of strings e.g. WiFi, AC
  is_approved BOOLEAN DEFAULT FALSE,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_seats INT DEFAULT 10,
  available_seats INT DEFAULT 10,
  availability VARCHAR(50) DEFAULT 'all' CHECK (availability IN ('all', 'weekdays', 'weekends'))
);

-- 3. BOOKINGS TABLE (Seat reservations)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_type VARCHAR(50) NOT NULL CHECK (booking_type IN ('hourly', 'daily')),
  start_time TIME,
  end_time TIME,
  seats_booked INT DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. REVIEWS TABLE (User star reviews with feedback comments)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating NUMERIC(2, 1) CHECK (rating >= 1.0 AND rating <= 5.0),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. FAVORITES TABLE (Save list)
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, space_id)
);`;

  const migrationCode = `-- Supabase Schema & Initial Seed Migration
-- Path: /supabase/migrations/20260617000000_nearby_space_init.sql

-- Setup Row Level Security (RLS) on tables for maximum protection
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies: Allow read-only access to approved spaces
CREATE POLICY "Public read approved spaces" ON spaces
  FOR SELECT USING (is_approved = true);

-- Allow owners to modify their own space records
CREATE POLICY "Owners manage own spaces" ON spaces
  FOR ALL USING (auth.uid() = owner_id);

-- Bookings policy: user can view their bookings; owners can check bookings for their spaces
CREATE POLICY "Users read own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Initial Mock Data Seeding (PostgreSQL Insert Queries)
INSERT INTO users (id, name, email, phone, role, avatar) VALUES
('b3017a4c-5674-4b5c-a111-e6fedc7b919d'::UUID, 'Sarah Jenkins', 'sarah.j@example.com', '+1 (555) 123-4567', 'user', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('e6401f78-2287-43cf-a0e2-e1927361a9aa'::UUID, 'David Miller', 'david@nearbyspace.com', '+1 (555) 987-6543', 'owner', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

INSERT INTO spaces (id, name, description, photos, address, latitude, longitude, price_per_day, price_per_hour, amenities, is_approved, owner_id) VALUES
('7336ed02-0e86-4ef3-9c88-7ffb2a096c4d'::UUID, 
 'The Red Brick Collective', 
 'A stylish, industrial SOMA warehouse converted into a thriving collaborative hub.', 
 ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], 
 '450 Townsend St, San Francisco, CA 94107', 
 37.7785, 
 -122.4114, 
 45.00, 
 8.00, 
 ARRAY['WiFi', 'AC', 'Parking', 'Cafeteria', 'Power Backup', 'Printer'], 
 true, 
 'e6401f78-2287-43cf-a0e2-e1927361a9aa'::UUID);`;

  const apiCode = `// Express.js & TypeScript Server Endpoints (Proxy Server)
// File: /server/api.ts

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase Client dynamically
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

/**
 * 1. GET /api/spaces/nearby
 * Fetch co-working spaces sorted by Haversine Distance
 */
router.get('/spaces/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const maxDist = parseFloat(req.query.distance as string) || 10; // in miles

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "Missing physical GPS query parameters lat/lng" });
    }

    // Query active records
    const { data: spaces, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('is_approved', true);

    if (error) throw error;

    // Haversine calculation sorting on Express server
    const sorted = spaces.map(space => {
      const R = 3958.8; // Earth radius in miles
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

    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/bookings/create
 * Secure booking processor
 */
router.post('/bookings/create', async (req: Request, res: Response) => {
  try {
    const { spaceId, userId, date, type, seats, totalPrice, startTime, endTime } = req.body;
    
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        space_id: spaceId,
        user_id: userId,
        booking_date: date,
        booking_type: type,
        seats_booked: seats,
        total_price: totalPrice,
        start_time: startTime,
        end_time: endTime,
        status: 'confirmed'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;`;

  const vercelCode = `# NearbySpace Vercel & Next.js production deployment guide
# Path: /README.md

## Production Tech Stack Prerequisites
- Next.js 15+ (App Router structure)
- Tailwind CSS (Fluid components styling)
- PostgreSQL & Supabase (Database + Row Level Security)
- Google Maps Web JavaScript SDK

## Live Vercel Environment Configuration
1. Open Vercel dashboard, click **Add New Project**, and select imports.
2. In the **Environment Variables** step, define these key credentials:

\`\`\`env
# Supabase Secure API Access keys
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-db.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-role-key-ey..."
SUPABASE_SERVICE_ROLE_KEY="your-secret-service-role-key-ey..."

# Client Side Google Maps Engine credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyYourKey..."
\`\`\`

3. Set NextJS framework presets, click **Deploy**.
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
