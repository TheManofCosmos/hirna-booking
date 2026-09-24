-- ==============================================================================
-- TNVS TEAM 10: SEED DATA
-- Preloaded demo records for instant testing & capstone presentation
-- ==============================================================================

-- 1. SEED USERS
INSERT INTO users (id, email, full_name, phone_number, role) VALUES
('a0000001-0000-0000-0000-000000000001', 'juan.delacruz@example.com', 'Juan Dela Cruz', '+63 917 123 4567', 'passenger'),
('a0000001-0000-0000-0000-000000000002', 'maria.santos@example.com', 'Maria Santos', '+63 918 987 6543', 'passenger'),
('a0000001-0000-0000-0000-000000000003', 'ricardo.dalisay@example.com', 'Ricardo Dalisay', '+63 920 555 1234', 'driver'),
('a0000001-0000-0000-0000-000000000004', 'elena.roces@example.com', 'Elena Roces', '+63 922 444 9876', 'driver'),
('a0000001-0000-0000-0000-000000000005', 'admin.tnvs@example.com', 'Team 10 Ops Admin', '+63 919 000 1122', 'admin')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED CUSTOMER PROFILES
INSERT INTO customer_profiles (id, user_id, loyalty_tier, loyalty_points, total_trips, rating_average, preferred_payment, is_vip) VALUES
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Gold', 850, 42, 4.95, 'GCash', TRUE),
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'Silver', 320, 18, 4.88, 'Maya', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED DRIVERS
INSERT INTO drivers (id, user_id, license_number, license_expiry, vehicle_model, vehicle_plate, vehicle_class, status, current_lat, current_lng, rating_score, safety_compliance_score, total_completed_trips) VALUES
('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'N01-19-123456', '2028-10-15', 'Toyota Vios 1.5G 2023 (Silver)', 'NFD-8892', 'Sedan (4-Seater)', 'available', 14.5547, 121.0244, 4.92, 99, 520),
('d0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004', 'N02-20-654321', '2027-05-20', 'Mitsubishi Xpander 2024 (White)', 'NBL-3301', 'MPV (6-Seater)', 'available', 14.5833, 121.0583, 4.85, 96, 310)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE BOOKINGS
INSERT INTO bookings (
    id, booking_code, customer_id, driver_id, 
    pickup_address, pickup_lat, pickup_lng, 
    dropoff_address, dropoff_lat, dropoff_lng, 
    vehicle_class, distance_km, estimated_duration_min, 
    base_fare, distance_fare, time_fare, ai_surge_multiplier, ai_surge_reason, total_fare, 
    status, dispatch_timestamp, start_timestamp, completion_timestamp
) VALUES
(
    'c0000001-0000-0000-0000-000000000001', 'TNVS-2026-0091', 'a0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
    'Ayala Malls Circuit, Makati City', 14.5758, 121.0183,
    'Bonifacio High Street, BGC, Taguig', 14.5517, 121.0509,
    'Sedan (4-Seater)', 5.80, 22,
    45.00, 87.00, 44.00, 1.35, 'Peak Morning Rush in Makati CBD (Demand/Supply = 2.4)', 237.60,
    'completed', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '25 minutes'
),
(
    'c0000001-0000-0000-0000-000000000002', 'TNVS-2026-0092', 'a0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002',
    'Ortigas Center, Pasig City', 14.5869, 121.0614,
    'SM Mall of Asia, Pasay City', 14.5353, 120.9829,
    'MPV (6-Seater)', 14.20, 45,
    60.00, 284.00, 90.00, 1.20, 'Moderate Rain & Congestion Factor', 520.80,
    'in_transit', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '15 minutes', NULL
)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED PAYMENT TRANSACTIONS
INSERT INTO payment_transactions (id, transaction_ref, booking_id, amount, payment_method, status, invoice_number, team5_gl_synced) VALUES
('p0000001-0000-0000-0000-000000000001', 'TXN-GCASH-998812', 'c0000001-0000-0000-0000-000000000001', 237.60, 'GCash', 'completed', 'INV-2026-00091', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED GPS PLAYBACK TELEMETRY LOGS (Makati to BGC Route)
INSERT INTO gps_telemetry_logs (booking_id, driver_id, latitude, longitude, speed_kmh, heading, is_anomaly, anomaly_type, logged_at) VALUES
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 14.5758, 121.0183, 0.0, 90, FALSE, NULL, NOW() - INTERVAL '50 minutes'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 14.5710, 121.0225, 34.5, 110, FALSE, NULL, NOW() - INTERVAL '45 minutes'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 14.5635, 121.0310, 48.2, 125, FALSE, NULL, NOW() - INTERVAL '40 minutes'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 14.5580, 121.0420, 22.0, 105, FALSE, NULL, NOW() - INTERVAL '35 minutes'),
('c0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 14.5517, 121.0509, 0.0, 95, FALSE, NULL, NOW() - INTERVAL '25 minutes');

-- 7. SEED CRM FEEDBACK & TICKETS
INSERT INTO customer_feedback (booking_id, user_id, rating, feedback_text, ai_sentiment, ai_sentiment_score, ai_category) VALUES
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 5, 'Kuya Ricardo was very polite, smooth ride, and the car smelled great! Fair surge pricing.', 'Positive', 0.94, 'Driver Attitude');

INSERT INTO support_tickets (id, ticket_code, user_id, subject, category, priority, status, description) VALUES
('t0000001-0000-0000-0000-000000000001', 'TCK-2026-0044', 'a0000001-0000-0000-0000-000000000002', 'Dispute over GCash cashback credit', 'Billing', 'Low', 'Resolved', 'Inquired about the 10% promo discount voucher application on trip.')
ON CONFLICT (id) DO NOTHING;

-- 8. SEED AUDIT LOGS (MODULE 6)
INSERT INTO audit_logs (module_name, event_type, entity_id, user_identifier, ip_address, details, status) VALUES
('Booking System', 'TRIP_CREATED', 'TNVS-2026-0091', 'juan.delacruz@example.com', '120.28.17.44', '{"pickup":"Ayala Malls Circuit","dropoff":"Bonifacio High Street","surge":1.35}', 'SUCCESS'),
('Payment Gateway', 'PAYMENT_CONFIRMED', 'TXN-GCASH-998812', 'juan.delacruz@example.com', '120.28.17.44', '{"amount":237.60,"channel":"GCash"}', 'SUCCESS'),
('BPA Integration', 'TEAM5_GL_SYNC', 'INV-2026-00091', 'SYSTEM_DAEMON', '127.0.0.1', '{"target":"Team 5 Accounts Receivable","status":"ACCEPTED"}', 'SUCCESS');
