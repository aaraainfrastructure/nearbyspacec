-- PostgreSQL Database Schema for NearbySpace
-- Designed for Supabase Relational Database Engine

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS spaces (
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
CREATE TABLE IF NOT EXISTS bookings (
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
);

-- 4. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_avatar TEXT NOT NULL,
  rating NUMERIC(2, 1) CHECK (rating >= 1.0 AND rating <= 5.0),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, space_id)
);

-- 6. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES spaces(id) ON DELETE CASCADE,
  space_name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notified_gowri_email VARCHAR(255) DEFAULT 'gowri7282@gmail.com',
  owner_notified BOOLEAN DEFAULT FALSE
);

-- Row Level Security (RLS) setup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Permissive RLS Policies to allow the simulated authentication flow to work
-- (Since client uses anonymous key and simulated login sessions)

-- USERS Policies
CREATE POLICY "Allow anonymous read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update users" ON users FOR UPDATE USING (true);

-- SPACES Policies
CREATE POLICY "Allow anonymous read spaces" ON spaces FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert spaces" ON spaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update spaces" ON spaces FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete spaces" ON spaces FOR DELETE USING (true);

-- BOOKINGS Policies
CREATE POLICY "Allow anonymous read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update bookings" ON bookings FOR UPDATE USING (true);

-- REVIEWS Policies
CREATE POLICY "Allow anonymous read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- FAVORITES Policies
CREATE POLICY "Allow anonymous read favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete favorites" ON favorites FOR DELETE USING (true);

-- ENQUIRIES Policies
CREATE POLICY "Allow anonymous read enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update enquiries" ON enquiries FOR UPDATE USING (true);

-- Seed Data Setup
INSERT INTO users (id, name, email, phone, role, avatar, is_blocked, registered_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', 'rahul.sharma@gmail.com', '+91 98765 43210', 'user', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', false, '2026-02-15T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440001', 'Rajesh Gupta', 'rajesh.gupta@coworkindia.com', '+91 91234 56789', 'owner', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', false, '2026-01-10T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Gowri Shanker', 'gowri7282@gmail.com', '+91 99887 76655', 'admin', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', false, '2025-12-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO spaces (id, name, description, photos, address, city, locality, latitude, longitude, price_per_day, price_per_hour, amenities, is_approved, owner_id, owner_phone, total_seats, available_seats, availability, rating, reviews_count) VALUES
('e6401f78-1111-43cf-a0e2-e1927361a9aa', 'Bengaluru Tech Sanctuary', 'A premium, modern workspace featuring raw wooden aesthetic desks, natural layout ergonomics, plant decorations, high-fidelity acoustics, professional enterprise routers, soundproof phone booths, and free-flowing South Indian filter coffee. Extremely close to Metro Station.', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600'], '98, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038', 'Bengaluru', 'Indiranagar', 12.9784, 77.6408, 450.00, 80.00, ARRAY['WiFi', 'AC', 'Parking', 'Cafeteria', 'Power Backup', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 98765 12345', 32, 18, 'weekdays', 4.8, 3),
('e6401f78-2222-43cf-a0e2-e1927361a9aa', 'Zenith Premium Mumbai Cabin', 'Elevate your enterprise team with panoramic top-deck views of the Arabian Sea in our Bandra West shared workspaces. Perfect for executives, tech leads, and founders. Handcrafted workspace design with ergonomic desks, executive layout, and instant 1 Gbps broadband connection.', ARRAY['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', 'https://images.unsplash.com/photo-1542744095-29185346892f?w=600', 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'], 'Link Road, Bandra West, Mumbai, Maharashtra 400050', 'Mumbai', 'Bandra West', 19.0596, 72.8295, 850.00, 150.00, ARRAY['WiFi', 'AC', 'Meeting Room', 'Power Backup', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 91234 98765', 15, 7, 'all', 4.9, 2),
('e6401f78-3333-43cf-a0e2-e1927361a9aa', 'Innovate Hub Gurugram', 'A vibrant collaborative hot seat environment right in DLF CyberCity, Delhi NCR. Flooded with natural radiant lighting, customized posture chairs, quiet privacy pods, secure document storage lockers, and custom snack bar. Designed for active dreamers and startups.', ARRAY['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600'], 'DLF CyberCity, Phase 3, Gurugram, Haryana 122002', 'Delhi NCR', 'DLF CyberCity', 28.4595, 77.0266, 350.00, 60.00, ARRAY['WiFi', 'AC', 'Parking', 'Cafeteria', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 99445 56677', 40, 30, 'all', 4.5, 1),
('e6401f78-4444-43cf-a0e2-e1927361a9aa', 'Summit Executive Gachibowli', 'State-of-the-art private meeting room and conference deck. Explicitly optimized for board interactions, pitch presentations, and developer offline strategy alignments. High-speed multi-gig fiber, surround-sound smart LED panels, and premium caterings upon request.', ARRAY['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800', 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'], 'Hitech City Road, Gachibowli, Hyderabad, Telangana 500032', 'Hyderabad', 'Gachibowli', 17.4401, 78.3489, 1500.00, 300.00, ARRAY['WiFi', 'AC', 'Meeting Room', 'Parking', 'Power Backup', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 90001 20002', 12, 12, 'weekdays', 4.7, 1),
('e6401f78-5555-43cf-a0e2-e1927361a9aa', 'The Oasis Koregaon Park', 'A cozy boutique workstation set amidst the leafy lanes of Lane 5, Koregaon Park, Pune. Features standing desks, private laptop docks, comfortable lounge beanbags, local bakery partnerships, and extremely silent outdoor terrace section.', ARRAY['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'], 'Koregaon Park, Lane 5, Pune, Maharashtra 411001', 'Pune', 'Koregaon Park', 18.5362, 73.8940, 299.00, 50.00, ARRAY['WiFi', 'AC', 'Cafeteria', 'Power Backup'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 88888 77777', 25, 15, 'all', 4.6, 2),
('e6401f78-6666-43cf-a0e2-e1927361a9aa', 'Hive West OMR Shared Desks', 'An upcoming modern architectural co-working facility located right on the IT Corridor in OMR Chennai. Clean concrete design, rooftop workspace, high-density secure locks, high-capacity generators, and soundproof study bays.', ARRAY['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'], 'OMR Road, Karapakkam, Chennai, Tamil Nadu 600097', 'Chennai', 'OMR Road', 12.9229, 80.2224, 550.00, 90.00, ARRAY['WiFi', 'AC', 'Parking', 'Meeting Room', 'Power Backup'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 97766 55443', 20, 20, 'weekdays', 4.4, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, space_id, space_name, space_photo, user_id, user_name, booking_date, booking_type, seats_booked, total_price, status, created_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'e6401f78-1111-43cf-a0e2-e1927361a9aa', 'Bengaluru Tech Sanctuary', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', '550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', '2026-06-20', 'daily', 1, 450.00, 'confirmed', '2026-06-15T10:30:00Z'),
('b0000000-0000-0000-0000-000000000002', 'e6401f78-2222-43cf-a0e2-e1927361a9aa', 'Zenith Premium Mumbai Cabin', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', '550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', '2026-06-18', 'hourly', 2, 1200.00, 'confirmed', '2026-06-16T15:45:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, space_id, user_id, user_name, user_avatar, rating, comment, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'e6401f78-1111-43cf-a0e2-e1927361a9aa', '550e8400-e29b-41d4-a716-446655440001', 'Rajesh Gupta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 5.0, 'Superb atmosphere! Quick access to Indiranagar Metro Station makes commuting flawless. Blazing symmetric internet speed.', '2026-06-05T00:00:00Z'),
('f0000000-0000-0000-0000-000000000002', 'e6401f78-1111-43cf-a0e2-e1927361a9aa', '550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 5.0, 'The South Indian filter coffee is incredible! Highly recommended daily desk.', '2026-06-14T00:00:00Z')
ON CONFLICT (id) DO NOTHING;
