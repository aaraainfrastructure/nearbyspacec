# 🔍 NearbySpace — Consolidated Project Audit Report (Updated)

**Date:** June 17, 2026  
**Project:** NearbySpace (Coworking Space Booking Platform)  
**Location:** `d:\Web_Projects\nearbyspace`  
**GitHub Repository:** [aaraainfrastructure/nearbyspacec](https://github.com/aaraainfrastructure/nearbyspacec)  

---

## 1. Executive Summary

We performed a deep-dive audit of the NearbySpace codebase and its backend integrations. We verified database connectivity, checked the file storage capabilities, identified and fixed key schema mismatches, and pushed all updates to the GitHub repository.

| Layer | Status | Verdict & Findings |
| :--- | :--- | :--- |
| **Database** | ✅ **Connected & Aligned** | Connected to Supabase PostgreSQL backend. Mismatched column schemas in code were successfully corrected. |
| **RLS Policies** | ⚠️ **Action Required** | Row-Level Security is active, but anonymous inserts are currently blocked on the remote DB. |
| **File Storage** | ❌ **Not Implemented** | Image URLs are stored as hardcoded Unsplash preset strings. No file uploading capabilities exist. |
| **Security & Build** | ✅ **Verified** | Linting passes with **0 errors**; builds compile successfully for production. |

---

## 2. Database Connectivity & Schema Audit

### 2.1 Verdict: ✅ DATABASE IS CONNECTED
The application is connected to the live Supabase database instance:
`https://vpgljsmgemlkgqdnqich.supabase.co`

All keys are loaded securely from your local config file [`.env.local`](file:///d:/Web_Projects/nearbyspace/.env.local) (which is correctly git-ignored).

### 2.2 Critical Schema Mismatch Identified & Fixed
During database query testing, we discovered that the actual table schemas in the remote Supabase database had different column names than what the code expected. This would have caused runtime crashes and parsed GPS coordinates to `NaN`. 

We have **successfully updated** the mappings to match your remote database schema:
1. **`spaces` table**: Mapped `latitude` / `longitude` to the actual columns `lat` / `lng`.
2. **`bookings` table**: Mapped `booking_date` / `booking_type` to the actual columns `date` / `type`.
3. **`reviews` table**: Mapped `created_at` to the actual column `date`.

All changes have been committed and pushed to your [GitHub repository](https://github.com/aaraainfrastructure/nearbyspacec).

### 2.3 Row-Level Security (RLS) Write Permissions
While tables (`users`, `spaces`, `bookings`, `reviews`) exist and can be read by the frontend, write operations (inserts/updates) are blocked on the remote database by default Postgres security policies:
> `new row violates row-level security policy for table "<table_name>"`

**How to Fix:** Copy and run the SQL script in **Section 5** inside your Supabase Console SQL Editor to apply permissive anonymous RLS policies and insert the seed data.

---

## 3. File Storage Audit

### 3.1 Verdict: ❌ FILE STORAGE IS NOT WORKING / NOT IMPLEMENTED
The application currently has **no file storage integration** in the codebase.

### 3.2 Key Findings
1. **No File Upload Element**: There are no `<input type="file" />` tags or uploading views anywhere in the frontend files.
2. **Unsplash Preset Links**: When an owner adds a space in the dashboard, the photos are picked from pre-defined mock Unsplash photo arrays.
3. **Storage Bucket**: There is no code interacting with Supabase Storage buckets or external CDNs like Cloudinary or AWS S3.

---

## 4. Full Codebase Inventory & Line Counts

Below is the file inventory for the NearbySpace project source code:

| Component / Path | File Type | Approx. Lines | Purpose / Responsibility |
|---|---|---|---|
| **[`App.tsx`](file:///d:/Web_Projects/nearbyspace/src/App.tsx)** | React Component | 1,410 | Core shell, routing tabs, layout state, global loading overlay |
| **[`supabase.ts`](file:///d:/Web_Projects/nearbyspace/src/lib/supabase.ts)** | TypeScript | 11 | Initializes the Supabase client connection singleton |
| **[`mappers.ts`](file:///d:/Web_Projects/nearbyspace/src/lib/mappers.ts)** | TypeScript | 175 | Maps columns between database rows and TypeScript interfaces |
| **[`spacesService.ts`](file:///d:/Web_Projects/nearbyspace/src/services/spacesService.ts)** | TypeScript | 67 | Fetch approved/unapproved spaces, insert new spaces |
| **[`bookingsService.ts`](file:///d:/Web_Projects/nearbyspace/src/services/bookingsService.ts)** | TypeScript | 115 | Handles booking reservations, seats decrement/refund |
| **[`reviewsService.ts`](file:///d:/Web_Projects/nearbyspace/src/services/reviewsService.ts)** | TypeScript | 63 | Reviews logging, order sorting by date, and avg ratings |
| **[`usersService.ts`](file:///d:/Web_Projects/nearbyspace/src/services/usersService.ts)** | TypeScript | 66 | Handles admin moderation of roles and blocking |
| **[`favouritesService.ts`](file:///d:/Web_Projects/nearbyspace/src/services/favouritesService.ts)** | TypeScript | 39 | Persists and toggles user favorites list |
| **[`enquiriesService.ts`](file:///d:/Web_Projects/nearbyspace/src/services/enquiriesService.ts)** | TypeScript | 37 | Captures lead enquiries |
| **[`migration.sql`](file:///d:/Web_Projects/nearbyspace/supabase/migration.sql)** | PostgreSQL | 162 | Reference schema definitions, seed queries, and RLS |
| **[`MapView.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/MapView.tsx)** | React Component | 249 | Interactive SVG city map scaled dynamically based on space bounds |
| **[`OwnerDashboard.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/OwnerDashboard.tsx)** | React Component | 719 | Add listings, review revenue statistics, manage space seats |
| **[`AdminDashboard.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/AdminDashboard.tsx)** | React Component | 315 | Moderate pending listings, modify user permissions, block lists |
| **[`UserSpaceList.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/UserSpaceList.tsx)** | React Component | 618 | Dynamic feed filters (Search, City, Price, Amenities, Distance) |
| **[`AuthModal.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/AuthModal.tsx)** | React Component | 386 | Authentication popups (OTP verification codes, Google flow) |
| **[`BookingModal.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/BookingModal.tsx)** | React Component | 471 | Date picking and checkout confirmation |
| **[`LeadPopupModal.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/LeadPopupModal.tsx)** | React Component | 301 | Lead popup modal requesting quick phone verification |
| **[`TechDocs.tsx`](file:///d:/Web_Projects/nearbyspace/src/components/TechDocs.tsx)** | React Component | 338 | Code blueprints shown on the documentation tab |
| **[`types.ts`](file:///d:/Web_Projects/nearbyspace/src/types.ts)** | TypeScript | 83 | Platform type declarations (User, Space, Booking, etc.) |

---

## 5. SQL Actions: Supabase RLS Fixes & Seeding

Since the remote database is running on Supabase, DDL and seeder commands are blocked when executed from our client-side keys. 

To configure your database permissions and insert seed users, spaces, and bookings, please follow these steps:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to your project: **`vpgljsmgemlkgqdnqich`**.
3. Click on the **SQL Editor** on the left menu.
4. Click **New Query**.
5. Copy and paste the following SQL script, then click **Run**:

```sql
-- 1. SETUP PUBLIC RLS WRITE ACCESS (For prototype simulated login session)
CREATE POLICY "Allow anonymous read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read spaces" ON spaces FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert spaces" ON spaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update spaces" ON spaces FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete spaces" ON spaces FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update bookings" ON bookings FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert reviews" ON reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete favorites" ON favorites FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update enquiries" ON enquiries FOR UPDATE USING (true);

-- 2. INSERT INITIAL SEED DATA
INSERT INTO users (id, name, email, phone, role, avatar, is_blocked, registered_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', 'rahul.sharma@gmail.com', '+91 98765 43210', 'user', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', false, '2026-02-15T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440001', 'Rajesh Gupta', 'rajesh.gupta@coworkindia.com', '+91 91234 56789', 'owner', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', false, '2026-01-10T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Gowri Shanker', 'gowri7282@gmail.com', '+91 99887 76655', 'admin', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', false, '2025-12-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO spaces (id, name, description, photos, address, city, locality, lat, lng, price_per_day, price_per_hour, amenities, is_approved, owner_id, owner_phone, total_seats, available_seats, availability, rating, reviews_count) VALUES
('e6401f78-1111-43cf-a0e2-e1927361a9aa', 'Bengaluru Tech Sanctuary', 'A premium, modern workspace featuring raw wooden aesthetic desks, natural layout ergonomics, plant decorations, high-fidelity acoustics, professional enterprise routers, soundproof phone booths, and free-flowing South Indian filter coffee. Extremely close to Metro Station.', ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600'], '98, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038', 'Bengaluru', 'Indiranagar', 12.9784, 77.6408, 450.00, 80.00, ARRAY['WiFi', 'AC', 'Parking', 'Cafeteria', 'Power Backup', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 98765 12345', 32, 18, 'weekdays', 4.8, 3),
('e6401f78-2222-43cf-a0e2-e1927361a9aa', 'Zenith Premium Mumbai Cabin', 'Elevate your enterprise team with panoramic top-deck views of the Arabian Sea in our Bandra West shared workspaces. Perfect for executives, tech leads, and founders. Handcrafted workspace design with ergonomic desks, executive layout, and instant 1 Gbps broadband connection.', ARRAY['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', 'https://images.unsplash.com/photo-1542744095-29185346892f?w=600', 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'], 'Link Road, Bandra West, Mumbai, Maharashtra 400050', 'Mumbai', 'Bandra West', 19.0596, 72.8295, 850.00, 150.00, ARRAY['WiFi', 'AC', 'Meeting Room', 'Power Backup', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 91234 98765', 15, 7, 'all', 4.9, 2),
('e6401f78-3333-43cf-a0e2-e1927361a9aa', 'Innovate Hub Gurugram', 'A vibrant collaborative hot seat environment right in DLF CyberCity, Delhi NCR. Flooded with natural radiant lighting, customized posture chairs, quiet privacy pods, secure document storage lockers, and custom snack bar. Designed for active dreamers and startups.', ARRAY['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600'], 'DLF CyberCity, Phase 3, Gurugram, Haryana 122002', 'Delhi NCR', 'DLF CyberCity', 28.4595, 77.0266, 350.00, 60.00, ARRAY['WiFi', 'AC', 'Parking', 'Cafeteria', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 99445 56677', 40, 30, 'all', 4.5, 1),
('e6401f78-4444-43cf-a0e2-e1927361a9aa', 'Summit Executive Gachibowli', 'State-of-the-art private meeting room and conference deck. Explicitly optimized for board interactions, pitch presentations, and developer offline strategy alignments. High-speed multi-gig fiber, surround-sound smart LED panels, and premium caterings upon request.', ARRAY['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800', 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600'], 'Hitech City Road, Gachibowli, Hyderabad, Telangana 500032', 'Hyderabad', 'Gachibowli', 17.4401, 78.3489, 1500.00, 300.00, ARRAY['WiFi', 'AC', 'Meeting Room', 'Parking', 'Power Backup', 'Printer'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 90001 20002', 12, 12, 'weekdays', 4.7, 1),
('e6401f78-5555-43cf-a0e2-e1927361a9aa', 'The Oasis Koregaon Park', 'A cozy boutique workstation set amidst the leafy lanes of Lane 5, Koregaon Park, Pune. Features standing desks, private laptop docks, comfortable lounge beanbags, local bakery partnerships, and extremely silent outdoor terrace section.', ARRAY['https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600'], 'Koregaon Park, Lane 5, Pune, Maharashtra 411001', 'Pune', 'Koregaon Park', 18.5362, 73.8940, 299.00, 50.00, ARRAY['WiFi', 'AC', 'Cafeteria', 'Power Backup'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 88888 77777', 25, 15, 'all', 4.6, 2),
('e6401f78-6666-43cf-a0e2-e1927361a9aa', 'Hive West OMR Shared Desks', 'An upcoming modern architectural co-working facility located right on the IT Corridor in OMR Chennai. Clean concrete design, rooftop workspace, high-density secure locks, high-capacity generators, and soundproof study bays.', ARRAY['https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'], 'OMR Road, Karapakkam, Chennai, Tamil Nadu 600097', 'Chennai', 'OMR Road', 12.9229, 80.2224, 550.00, 90.00, ARRAY['WiFi', 'AC', 'Parking', 'Meeting Room', 'Power Backup'], true, '550e8400-e29b-41d4-a716-446655440001', '+91 97766 55443', 20, 20, 'weekdays', 4.4, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, space_id, space_name, space_photo, user_id, user_name, date, type, seats_booked, total_price, status, created_at) VALUES
('b0000000-0000-0000-0000-000000000001', 'e6401f78-1111-43cf-a0e2-e1927361a9aa', 'Bengaluru Tech Sanctuary', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', '550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', '2026-06-20', 'daily', 1, 450.00, 'confirmed', '2026-06-15T10:30:00Z'),
('b0000000-0000-0000-0000-000000000002', 'e6401f78-2222-43cf-a0e2-e1927361a9aa', 'Zenith Premium Mumbai Cabin', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', '550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', '2026-06-18', 'hourly', 2, 1200.00, 'confirmed', '2026-06-16T15:45:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, space_id, user_id, user_name, user_avatar, rating, comment, date) VALUES
('r0000000-0000-0000-0000-000000000001', 'e6401f78-1111-43cf-a0e2-e1927361a9aa', '550e8400-e29b-41d4-a716-446655440001', 'Rajesh Gupta', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 5.0, 'Superb atmosphere! Quick access to Indiranagar Metro Station makes commuting flawless. Blazing symmetric internet speed.', '2026-06-05T00:00:00Z'),
('r0000000-0000-0000-0000-000000000002', 'e6401f78-1111-43cf-a0e2-e1927361a9aa', '550e8400-e29b-41d4-a716-446655440000', 'Rahul Sharma', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 5.0, 'The South Indian filter coffee is incredible! Highly recommended daily desk.', '2026-06-14T00:00:00Z')
ON CONFLICT (id) DO NOTHING;
```
