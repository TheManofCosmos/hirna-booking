/**
 * Supabase Client Configuration & Local Database Synchronization Bridge
 */
const DEFAULT_INITIAL_DATA = {
  "users": [
    {
      "id": "usr-001",
      "email": "juan.delacruz@example.com",
      "full_name": "Juan Dela Cruz",
      "phone": "+63 917 123 4567",
      "role": "passenger",
      "loyalty_tier": "Gold",
      "loyalty_points": 850,
      "total_trips": 42,
      "rating": 4.95,
      "preferred_payment": "GCash",
      "is_vip": true
    },
    {
      "id": "usr-002",
      "email": "maria.santos@example.com",
      "full_name": "Maria Santos",
      "phone": "+63 918 987 6543",
      "role": "passenger",
      "loyalty_tier": "Silver",
      "loyalty_points": 320,
      "total_trips": 18,
      "rating": 4.88,
      "preferred_payment": "Maya",
      "is_vip": false
    }
  ],
  "drivers": [
    {
      "id": "drv-101",
      "name": "Ricardo Dalisay",
      "phone": "+63 920 555 1234",
      "license": "N01-19-123456",
      "vehicle_model": "Toyota Vios 1.5G (Silver)",
      "vehicle_plate": "NFD-8892",
      "vehicle_class": "Sedan (4-Seater)",
      "status": "available",
      "lat": 14.5547,
      "lng": 121.0244,
      "rating": 4.92,
      "safety_score": 99,
      "total_trips": 520
    },
    {
      "id": "drv-102",
      "name": "Elena Roces",
      "phone": "+63 922 444 9876",
      "license": "N02-20-654321",
      "vehicle_model": "Mitsubishi Xpander (White)",
      "vehicle_plate": "NBL-3301",
      "vehicle_class": "MPV (6-Seater)",
      "status": "available",
      "lat": 14.5833,
      "lng": 121.0583,
      "rating": 4.85,
      "safety_score": 96,
      "total_trips": 310
    },
    {
      "id": "drv-103",
      "name": "Arman Mendoza",
      "phone": "+63 919 777 4321",
      "license": "N03-21-987123",
      "vehicle_model": "Honda Civic RS (Black)",
      "vehicle_plate": "NDS-4099",
      "vehicle_class": "Executive (4-Seater)",
      "status": "available",
      "lat": 14.5580,
      "lng": 121.0190,
      "rating": 4.98,
      "safety_score": 100,
      "total_trips": 415
    },
    {
      "id": "drv-104",
      "name": "Danilo Cruz",
      "phone": "+63 918 333 4455",
      "license": "N04-22-334455",
      "vehicle_model": "Yamaha NMAX 155 (Midnight Blue)",
      "vehicle_plate": "MTR-9821",
      "vehicle_class": "Scooter (155cc)",
      "vehicle_type": "scooter",
      "status": "available",
      "lat": 14.5583,
      "lng": 121.0189,
      "rating": 4.95,
      "safety_score": 99,
      "total_trips": 680
    },
    {
      "id": "drv-105",
      "name": "Jomar Reyes",
      "phone": "+63 917 888 1122",
      "license": "N05-23-556677",
      "vehicle_model": "Honda Click 125i (Pearl White)",
      "vehicle_plate": "MC-4412",
      "vehicle_class": "Scooter (125cc)",
      "vehicle_type": "scooter",
      "status": "available",
      "lat": 14.5610,
      "lng": 121.0220,
      "rating": 4.91,
      "safety_score": 98,
      "total_trips": 450
    },
    {
      "id": "drv-106",
      "name": "Arnel Bautista",
      "phone": "+63 928 444 3322",
      "license": "N06-20-112233",
      "vehicle_model": "Honda Wave 125i (Sport Red)",
      "vehicle_plate": "MC-8109",
      "vehicle_class": "Manual/Underbone (125cc)",
      "vehicle_type": "manual",
      "status": "available",
      "lat": 14.5540,
      "lng": 121.0280,
      "rating": 4.89,
      "safety_score": 97,
      "total_trips": 520
    },
    {
      "id": "drv-107",
      "name": "Mark Dizon",
      "phone": "+63 915 222 7788",
      "license": "N07-21-998877",
      "vehicle_model": "Yamaha Aerox 155 (Racing Cyan)",
      "vehicle_plate": "MC-2930",
      "vehicle_class": "Scooter (155cc)",
      "vehicle_type": "scooter",
      "status": "available",
      "lat": 14.5595,
      "lng": 121.0150,
      "rating": 4.93,
      "safety_score": 99,
      "total_trips": 610
    },
    {
      "id": "drv-108",
      "name": "Roderick Tan",
      "phone": "+63 929 666 4433",
      "license": "N08-22-445566",
      "vehicle_model": "Yamaha Sniper 155 (Matte Black)",
      "vehicle_plate": "MC-6754",
      "vehicle_class": "Manual (155cc)",
      "vehicle_type": "manual",
      "status": "available",
      "lat": 14.5520,
      "lng": 121.0210,
      "rating": 4.94,
      "safety_score": 100,
      "total_trips": 580
    },
    {
      "id": "drv-109",
      "name": "Carlo Mendoza",
      "phone": "+63 916 555 9900",
      "license": "N09-24-778899",
      "vehicle_model": "Honda ADV 160 (Matte Solar Red)",
      "vehicle_plate": "MC-5128",
      "vehicle_class": "Scooter (160cc)",
      "vehicle_type": "scooter",
      "status": "available",
      "lat": 14.5570,
      "lng": 121.0260,
      "rating": 4.97,
      "safety_score": 100,
      "total_trips": 720
    }
  ],
  "bookings": [
    {
      "id": "c0000001-0000-0000-0000-000000000001",
      "booking_code": "TNVS-2026-0091",
      "service_type": "standard",
      "passenger_name": "Juan Dela Cruz",
      "passenger_phone": "+63 917 123 4567",
      "driver_name": "Ricardo Dalisay",
      "vehicle_plate": "NFD-8892",
      "vehicle_model": "Toyota Vios 1.5G",
      "vehicle_class": "Sedan (4-Seater)",
      "pickup": "Ayala Malls Circuit, Makati City",
      "pickup_coords": [14.5758, 121.0183],
      "dropoff": "Bonifacio High Street, BGC, Taguig",
      "dropoff_coords": [14.5517, 121.0509],
      "distance_km": 5.8,
      "duration_min": 22,
      "base_fare": 45.00,
      "distance_fare": 87.00,
      "time_fare": 44.00,
      "surge_multiplier": 1.35,
      "surge_reason": "Morning Rush in Makati CBD (Demand/Supply = 2.4)",
      "total_fare": 237.60,
      "payment_method": "GCash",
      "payment_status": "completed",
      "status": "completed",
      "created_at": "2026-08-20 08:30:00",
      "safety_score": 98
    },
    {
      "id": "c0000001-0000-0000-0000-000000000002",
      "booking_code": "TNVS-2026-0092",
      "service_type": "premium",
      "passenger_name": "Maria Santos",
      "passenger_phone": "+63 918 987 6543",
      "driver_name": "Elena Roces",
      "vehicle_plate": "NBL-3301",
      "vehicle_model": "Mitsubishi Xpander",
      "vehicle_class": "MPV (6-Seater)",
      "pickup": "Ortigas Center, Pasig City",
      "pickup_coords": [14.5869, 121.0614],
      "dropoff": "SM Mall of Asia, Pasay City",
      "dropoff_coords": [14.5353, 120.9829],
      "distance_km": 14.2,
      "duration_min": 45,
      "base_fare": 60.00,
      "distance_fare": 284.00,
      "time_fare": 90.00,
      "surge_multiplier": 1.20,
      "surge_reason": "Moderate Rain & EDSA Congestion",
      "total_fare": 520.80,
      "payment_method": "Maya",
      "payment_status": "completed",
      "status": "completed",
      "created_at": "2026-08-20 11:15:00",
      "safety_score": 95
    },
    {
      "id": "c0000001-0000-0000-0000-000000000003",
      "booking_code": "HIRNA-PCL-892104",
      "service_type": "parcel",
      "passenger_name": "Danilo Cruz (Sender)",
      "sender_name": "Danilo Cruz",
      "sender_phone": "+63 928 345 6789",
      "passenger_phone": "+63 928 345 6789",
      "recipient_name": "Ana Patricia Non",
      "recipient_phone": "+63 917 555 4321",
      "driver_name": "Arnel Bautista",
      "vehicle_plate": "MC-8109",
      "vehicle_model": "Honda Wave 125i (Sport Red)",
      "vehicle_class": "Parcel Courier (Motorcycle)",
      "pickup": "Maginhawa St, Teachers Village, QC",
      "pickup_coords": [14.6465, 121.0588],
      "dropoff": "Ateneo de Manila University, Katipunan Ave, QC",
      "dropoff_coords": [14.6393, 121.0772],
      "distance_km": 3.4,
      "duration_min": 14,
      "base_fare": 60.00,
      "distance_fare": 45.00,
      "time_fare": 15.00,
      "surge_multiplier": 1.0,
      "surge_reason": "Standard parcel courier tariff",
      "total_fare": 120.00,
      "payment_method": "GCash",
      "payment_status": "completed",
      "status": "completed",
      "created_at": "2026-08-20 14:20:00",
      "safety_score": 100
    }
  ],
  "telemetry_routes": {
  "c0000001-0000-0000-0000-000000000001": [
    {
      "lat": 14.57558,
      "lng": 121.01826,
      "speed": 0.0,
      "time": "08:30:00",
      "anomaly": null
    },
    {
      "lat": 14.57564,
      "lng": 121.01793,
      "speed": 26.7,
      "time": "08:30:05",
      "anomaly": null
    },
    {
      "lat": 14.57568,
      "lng": 121.01771,
      "speed": 28.3,
      "time": "08:30:10",
      "anomaly": null
    },
    {
      "lat": 14.57575,
      "lng": 121.01738,
      "speed": 30.0,
      "time": "08:30:16",
      "anomaly": null
    },
    {
      "lat": 14.57575,
      "lng": 121.01736,
      "speed": 31.7,
      "time": "08:30:21",
      "anomaly": null
    },
    {
      "lat": 14.57576,
      "lng": 121.01733,
      "speed": 33.3,
      "time": "08:30:27",
      "anomaly": null
    },
    {
      "lat": 14.57575,
      "lng": 121.01731,
      "speed": 35.0,
      "time": "08:30:32",
      "anomaly": null
    },
    {
      "lat": 14.57574,
      "lng": 121.01725,
      "speed": 36.7,
      "time": "08:30:38",
      "anomaly": null
    },
    {
      "lat": 14.57571,
      "lng": 121.0172,
      "speed": 38.3,
      "time": "08:30:43",
      "anomaly": null
    },
    {
      "lat": 14.57539,
      "lng": 121.01688,
      "speed": 40.0,
      "time": "08:30:48",
      "anomaly": null
    },
    {
      "lat": 14.57534,
      "lng": 121.01683,
      "speed": 41.7,
      "time": "08:30:54",
      "anomaly": null
    },
    {
      "lat": 14.57524,
      "lng": 121.0167,
      "speed": 43.3,
      "time": "08:30:59",
      "anomaly": null
    },
    {
      "lat": 14.57518,
      "lng": 121.01666,
      "speed": 45.0,
      "time": "08:31:05",
      "anomaly": null
    },
    {
      "lat": 14.57511,
      "lng": 121.01661,
      "speed": 46.7,
      "time": "08:31:10",
      "anomaly": null
    },
    {
      "lat": 14.57503,
      "lng": 121.01658,
      "speed": 48.3,
      "time": "08:31:16",
      "anomaly": null
    },
    {
      "lat": 14.57486,
      "lng": 121.01651,
      "speed": 25.0,
      "time": "08:31:21",
      "anomaly": null
    },
    {
      "lat": 14.57471,
      "lng": 121.01645,
      "speed": 26.7,
      "time": "08:31:26",
      "anomaly": null
    },
    {
      "lat": 14.57448,
      "lng": 121.01638,
      "speed": 28.3,
      "time": "08:31:32",
      "anomaly": null
    },
    {
      "lat": 14.57418,
      "lng": 121.0163,
      "speed": 30.0,
      "time": "08:31:37",
      "anomaly": null
    },
    {
      "lat": 14.57409,
      "lng": 121.01627,
      "speed": 31.7,
      "time": "08:31:43",
      "anomaly": null
    },
    {
      "lat": 14.57373,
      "lng": 121.01617,
      "speed": 33.3,
      "time": "08:31:48",
      "anomaly": null
    },
    {
      "lat": 14.57337,
      "lng": 121.01608,
      "speed": 35.0,
      "time": "08:31:54",
      "anomaly": null
    },
    {
      "lat": 14.57324,
      "lng": 121.01604,
      "speed": 36.7,
      "time": "08:31:59",
      "anomaly": null
    },
    {
      "lat": 14.57299,
      "lng": 121.01598,
      "speed": 38.3,
      "time": "08:32:04",
      "anomaly": null
    },
    {
      "lat": 14.57244,
      "lng": 121.01583,
      "speed": 40.0,
      "time": "08:32:10",
      "anomaly": null
    },
    {
      "lat": 14.57217,
      "lng": 121.01575,
      "speed": 41.7,
      "time": "08:32:15",
      "anomaly": null
    },
    {
      "lat": 14.57189,
      "lng": 121.01567,
      "speed": 43.3,
      "time": "08:32:21",
      "anomaly": null
    },
    {
      "lat": 14.57177,
      "lng": 121.01566,
      "speed": 45.0,
      "time": "08:32:26",
      "anomaly": null
    },
    {
      "lat": 14.57173,
      "lng": 121.01562,
      "speed": 46.7,
      "time": "08:32:32",
      "anomaly": null
    },
    {
      "lat": 14.57169,
      "lng": 121.01558,
      "speed": 48.3,
      "time": "08:32:37",
      "anomaly": null
    },
    {
      "lat": 14.57135,
      "lng": 121.01539,
      "speed": 25.0,
      "time": "08:32:42",
      "anomaly": null
    },
    {
      "lat": 14.57131,
      "lng": 121.01537,
      "speed": 26.7,
      "time": "08:32:48",
      "anomaly": null
    },
    {
      "lat": 14.57097,
      "lng": 121.01519,
      "speed": 28.3,
      "time": "08:32:53",
      "anomaly": null
    },
    {
      "lat": 14.57095,
      "lng": 121.01517,
      "speed": 30.0,
      "time": "08:32:59",
      "anomaly": null
    },
    {
      "lat": 14.5709,
      "lng": 121.01515,
      "speed": 31.7,
      "time": "08:33:04",
      "anomaly": null
    },
    {
      "lat": 14.57087,
      "lng": 121.01513,
      "speed": 33.3,
      "time": "08:33:10",
      "anomaly": null
    },
    {
      "lat": 14.57067,
      "lng": 121.01502,
      "speed": 35.0,
      "time": "08:33:15",
      "anomaly": null
    },
    {
      "lat": 14.5706,
      "lng": 121.01499,
      "speed": 36.7,
      "time": "08:33:20",
      "anomaly": null
    },
    {
      "lat": 14.57056,
      "lng": 121.01503,
      "speed": 38.3,
      "time": "08:33:26",
      "anomaly": null
    },
    {
      "lat": 14.57048,
      "lng": 121.01513,
      "speed": 40.0,
      "time": "08:33:31",
      "anomaly": null
    },
    {
      "lat": 14.57034,
      "lng": 121.01528,
      "speed": 41.7,
      "time": "08:33:37",
      "anomaly": null
    },
    {
      "lat": 14.5701,
      "lng": 121.01557,
      "speed": 43.3,
      "time": "08:33:42",
      "anomaly": null
    },
    {
      "lat": 14.56994,
      "lng": 121.01576,
      "speed": 45.0,
      "time": "08:33:48",
      "anomaly": null
    },
    {
      "lat": 14.56975,
      "lng": 121.01601,
      "speed": 46.7,
      "time": "08:33:53",
      "anomaly": null
    },
    {
      "lat": 14.56957,
      "lng": 121.01628,
      "speed": 48.3,
      "time": "08:33:59",
      "anomaly": null
    },
    {
      "lat": 14.56954,
      "lng": 121.01632,
      "speed": 25.0,
      "time": "08:34:04",
      "anomaly": null
    },
    {
      "lat": 14.56949,
      "lng": 121.01639,
      "speed": 26.7,
      "time": "08:34:09",
      "anomaly": null
    },
    {
      "lat": 14.56929,
      "lng": 121.01674,
      "speed": 28.3,
      "time": "08:34:15",
      "anomaly": null
    },
    {
      "lat": 14.56907,
      "lng": 121.01716,
      "speed": 30.0,
      "time": "08:34:20",
      "anomaly": null
    },
    {
      "lat": 14.56888,
      "lng": 121.01756,
      "speed": 31.7,
      "time": "08:34:26",
      "anomaly": null
    },
    {
      "lat": 14.56875,
      "lng": 121.01791,
      "speed": 33.3,
      "time": "08:34:31",
      "anomaly": null
    },
    {
      "lat": 14.56871,
      "lng": 121.01801,
      "speed": 35.0,
      "time": "08:34:37",
      "anomaly": null
    },
    {
      "lat": 14.56867,
      "lng": 121.01811,
      "speed": 36.7,
      "time": "08:34:42",
      "anomaly": null
    },
    {
      "lat": 14.56857,
      "lng": 121.01837,
      "speed": 38.3,
      "time": "08:34:47",
      "anomaly": null
    },
    {
      "lat": 14.56855,
      "lng": 121.01843,
      "speed": 40.0,
      "time": "08:34:53",
      "anomaly": null
    },
    {
      "lat": 14.56819,
      "lng": 121.0194,
      "speed": 41.7,
      "time": "08:34:58",
      "anomaly": null
    },
    {
      "lat": 14.56781,
      "lng": 121.02043,
      "speed": 43.3,
      "time": "08:35:04",
      "anomaly": null
    },
    {
      "lat": 14.56779,
      "lng": 121.02049,
      "speed": 45.0,
      "time": "08:35:09",
      "anomaly": null
    },
    {
      "lat": 14.56776,
      "lng": 121.02056,
      "speed": 46.7,
      "time": "08:35:15",
      "anomaly": null
    },
    {
      "lat": 14.56761,
      "lng": 121.02097,
      "speed": 48.3,
      "time": "08:35:20",
      "anomaly": null
    },
    {
      "lat": 14.56716,
      "lng": 121.0222,
      "speed": 25.0,
      "time": "08:35:25",
      "anomaly": null
    },
    {
      "lat": 14.56713,
      "lng": 121.02227,
      "speed": 26.7,
      "time": "08:35:31",
      "anomaly": null
    },
    {
      "lat": 14.56667,
      "lng": 121.02353,
      "speed": 28.3,
      "time": "08:35:36",
      "anomaly": null
    },
    {
      "lat": 14.56665,
      "lng": 121.02358,
      "speed": 30.0,
      "time": "08:35:42",
      "anomaly": null
    },
    {
      "lat": 14.56663,
      "lng": 121.02357,
      "speed": 31.7,
      "time": "08:35:47",
      "anomaly": null
    },
    {
      "lat": 14.56662,
      "lng": 121.02357,
      "speed": 33.3,
      "time": "08:35:53",
      "anomaly": null
    },
    {
      "lat": 14.56661,
      "lng": 121.02357,
      "speed": 35.0,
      "time": "08:35:58",
      "anomaly": null
    },
    {
      "lat": 14.56659,
      "lng": 121.02356,
      "speed": 36.7,
      "time": "08:36:03",
      "anomaly": null
    },
    {
      "lat": 14.56655,
      "lng": 121.02354,
      "speed": 38.3,
      "time": "08:36:09",
      "anomaly": null
    },
    {
      "lat": 14.56636,
      "lng": 121.02346,
      "speed": 40.0,
      "time": "08:36:14",
      "anomaly": null
    },
    {
      "lat": 14.56613,
      "lng": 121.02338,
      "speed": 41.7,
      "time": "08:36:20",
      "anomaly": null
    },
    {
      "lat": 14.56594,
      "lng": 121.0233,
      "speed": 43.3,
      "time": "08:36:25",
      "anomaly": null
    },
    {
      "lat": 14.56589,
      "lng": 121.02328,
      "speed": 45.0,
      "time": "08:36:31",
      "anomaly": null
    },
    {
      "lat": 14.56586,
      "lng": 121.02327,
      "speed": 46.7,
      "time": "08:36:36",
      "anomaly": null
    },
    {
      "lat": 14.56541,
      "lng": 121.02309,
      "speed": 48.3,
      "time": "08:36:41",
      "anomaly": null
    },
    {
      "lat": 14.56537,
      "lng": 121.02307,
      "speed": 25.0,
      "time": "08:36:47",
      "anomaly": null
    },
    {
      "lat": 14.56508,
      "lng": 121.02295,
      "speed": 26.7,
      "time": "08:36:52",
      "anomaly": null
    },
    {
      "lat": 14.565,
      "lng": 121.02291,
      "speed": 28.3,
      "time": "08:36:58",
      "anomaly": null
    },
    {
      "lat": 14.56458,
      "lng": 121.02274,
      "speed": 30.0,
      "time": "08:37:03",
      "anomaly": null
    },
    {
      "lat": 14.56423,
      "lng": 121.02261,
      "speed": 31.7,
      "time": "08:37:09",
      "anomaly": null
    },
    {
      "lat": 14.56336,
      "lng": 121.02228,
      "speed": 33.3,
      "time": "08:37:14",
      "anomaly": null
    },
    {
      "lat": 14.56325,
      "lng": 121.02226,
      "speed": 35.0,
      "time": "08:37:20",
      "anomaly": null
    },
    {
      "lat": 14.56313,
      "lng": 121.02224,
      "speed": 36.7,
      "time": "08:37:25",
      "anomaly": null
    },
    {
      "lat": 14.56307,
      "lng": 121.02223,
      "speed": 38.3,
      "time": "08:37:30",
      "anomaly": null
    },
    {
      "lat": 14.56301,
      "lng": 121.02224,
      "speed": 40.0,
      "time": "08:37:36",
      "anomaly": null
    },
    {
      "lat": 14.56293,
      "lng": 121.02227,
      "speed": 41.7,
      "time": "08:37:41",
      "anomaly": null
    },
    {
      "lat": 14.56287,
      "lng": 121.02229,
      "speed": 43.3,
      "time": "08:37:47",
      "anomaly": null
    },
    {
      "lat": 14.56279,
      "lng": 121.02229,
      "speed": 45.0,
      "time": "08:37:52",
      "anomaly": null
    },
    {
      "lat": 14.5627,
      "lng": 121.02229,
      "speed": 46.7,
      "time": "08:37:58",
      "anomaly": null
    },
    {
      "lat": 14.5623,
      "lng": 121.02233,
      "speed": 48.3,
      "time": "08:38:03",
      "anomaly": null
    },
    {
      "lat": 14.56219,
      "lng": 121.02234,
      "speed": 25.0,
      "time": "08:38:08",
      "anomaly": null
    },
    {
      "lat": 14.56207,
      "lng": 121.02235,
      "speed": 26.7,
      "time": "08:38:14",
      "anomaly": null
    },
    {
      "lat": 14.56208,
      "lng": 121.02242,
      "speed": 28.3,
      "time": "08:38:19",
      "anomaly": null
    },
    {
      "lat": 14.56209,
      "lng": 121.02259,
      "speed": 30.0,
      "time": "08:38:25",
      "anomaly": null
    },
    {
      "lat": 14.56213,
      "lng": 121.02315,
      "speed": 31.7,
      "time": "08:38:30",
      "anomaly": null
    },
    {
      "lat": 14.56214,
      "lng": 121.02371,
      "speed": 33.3,
      "time": "08:38:36",
      "anomaly": null
    },
    {
      "lat": 14.56213,
      "lng": 121.02417,
      "speed": 35.0,
      "time": "08:38:41",
      "anomaly": null
    },
    {
      "lat": 14.56212,
      "lng": 121.02446,
      "speed": 36.7,
      "time": "08:38:46",
      "anomaly": null
    },
    {
      "lat": 14.5621,
      "lng": 121.02476,
      "speed": 38.3,
      "time": "08:38:52",
      "anomaly": null
    },
    {
      "lat": 14.56207,
      "lng": 121.02515,
      "speed": 40.0,
      "time": "08:38:57",
      "anomaly": null
    },
    {
      "lat": 14.56205,
      "lng": 121.02534,
      "speed": 41.7,
      "time": "08:39:03",
      "anomaly": null
    },
    {
      "lat": 14.56202,
      "lng": 121.02555,
      "speed": 43.3,
      "time": "08:39:08",
      "anomaly": null
    },
    {
      "lat": 14.56196,
      "lng": 121.02587,
      "speed": 45.0,
      "time": "08:39:14",
      "anomaly": null
    },
    {
      "lat": 14.56188,
      "lng": 121.02628,
      "speed": 46.7,
      "time": "08:39:19",
      "anomaly": null
    },
    {
      "lat": 14.5618,
      "lng": 121.02656,
      "speed": 48.3,
      "time": "08:39:24",
      "anomaly": null
    },
    {
      "lat": 14.56171,
      "lng": 121.02687,
      "speed": 25.0,
      "time": "08:39:30",
      "anomaly": null
    },
    {
      "lat": 14.56164,
      "lng": 121.02713,
      "speed": 26.7,
      "time": "08:39:35",
      "anomaly": null
    },
    {
      "lat": 14.56157,
      "lng": 121.02735,
      "speed": 28.3,
      "time": "08:39:41",
      "anomaly": null
    },
    {
      "lat": 14.56151,
      "lng": 121.02749,
      "speed": 30.0,
      "time": "08:39:46",
      "anomaly": null
    },
    {
      "lat": 14.56145,
      "lng": 121.02768,
      "speed": 31.7,
      "time": "08:39:52",
      "anomaly": null
    },
    {
      "lat": 14.56142,
      "lng": 121.02774,
      "speed": 33.3,
      "time": "08:39:57",
      "anomaly": null
    },
    {
      "lat": 14.56137,
      "lng": 121.02785,
      "speed": 35.0,
      "time": "08:40:02",
      "anomaly": null
    },
    {
      "lat": 14.56133,
      "lng": 121.02794,
      "speed": 36.7,
      "time": "08:40:08",
      "anomaly": null
    },
    {
      "lat": 14.56126,
      "lng": 121.02808,
      "speed": 38.3,
      "time": "08:40:13",
      "anomaly": null
    },
    {
      "lat": 14.5611,
      "lng": 121.02844,
      "speed": 40.0,
      "time": "08:40:19",
      "anomaly": null
    },
    {
      "lat": 14.56096,
      "lng": 121.02871,
      "speed": 41.7,
      "time": "08:40:24",
      "anomaly": null
    },
    {
      "lat": 14.56088,
      "lng": 121.02886,
      "speed": 43.3,
      "time": "08:40:30",
      "anomaly": null
    },
    {
      "lat": 14.56066,
      "lng": 121.02925,
      "speed": 45.0,
      "time": "08:40:35",
      "anomaly": null
    },
    {
      "lat": 14.56048,
      "lng": 121.02953,
      "speed": 46.7,
      "time": "08:40:40",
      "anomaly": null
    },
    {
      "lat": 14.56024,
      "lng": 121.0299,
      "speed": 48.3,
      "time": "08:40:46",
      "anomaly": null
    },
    {
      "lat": 14.56007,
      "lng": 121.03012,
      "speed": 25.0,
      "time": "08:40:51",
      "anomaly": null
    },
    {
      "lat": 14.55989,
      "lng": 121.03034,
      "speed": 26.7,
      "time": "08:40:57",
      "anomaly": null
    },
    {
      "lat": 14.55975,
      "lng": 121.03052,
      "speed": 28.3,
      "time": "08:41:02",
      "anomaly": null
    },
    {
      "lat": 14.55965,
      "lng": 121.03064,
      "speed": 30.0,
      "time": "08:41:08",
      "anomaly": null
    },
    {
      "lat": 14.55951,
      "lng": 121.03079,
      "speed": 31.7,
      "time": "08:41:13",
      "anomaly": null
    },
    {
      "lat": 14.55945,
      "lng": 121.03086,
      "speed": 33.3,
      "time": "08:41:19",
      "anomaly": null
    },
    {
      "lat": 14.55921,
      "lng": 121.03116,
      "speed": 35.0,
      "time": "08:41:24",
      "anomaly": null
    },
    {
      "lat": 14.55904,
      "lng": 121.03136,
      "speed": 36.7,
      "time": "08:41:29",
      "anomaly": null
    },
    {
      "lat": 14.5586,
      "lng": 121.0318,
      "speed": 38.3,
      "time": "08:41:35",
      "anomaly": null
    },
    {
      "lat": 14.55819,
      "lng": 121.03218,
      "speed": 40.0,
      "time": "08:41:40",
      "anomaly": null
    },
    {
      "lat": 14.55778,
      "lng": 121.03254,
      "speed": 41.7,
      "time": "08:41:46",
      "anomaly": null
    },
    {
      "lat": 14.55763,
      "lng": 121.03266,
      "speed": 43.3,
      "time": "08:41:51",
      "anomaly": null
    },
    {
      "lat": 14.55722,
      "lng": 121.03299,
      "speed": 45.0,
      "time": "08:41:57",
      "anomaly": null
    },
    {
      "lat": 14.55706,
      "lng": 121.03312,
      "speed": 46.7,
      "time": "08:42:02",
      "anomaly": null
    },
    {
      "lat": 14.55673,
      "lng": 121.03339,
      "speed": 48.3,
      "time": "08:42:07",
      "anomaly": null
    },
    {
      "lat": 14.55611,
      "lng": 121.0339,
      "speed": 25.0,
      "time": "08:42:13",
      "anomaly": null
    },
    {
      "lat": 14.55552,
      "lng": 121.03438,
      "speed": 26.7,
      "time": "08:42:18",
      "anomaly": null
    },
    {
      "lat": 14.55542,
      "lng": 121.03447,
      "speed": 28.3,
      "time": "08:42:24",
      "anomaly": null
    },
    {
      "lat": 14.55531,
      "lng": 121.03459,
      "speed": 30.0,
      "time": "08:42:29",
      "anomaly": null
    },
    {
      "lat": 14.55524,
      "lng": 121.03474,
      "speed": 31.7,
      "time": "08:42:35",
      "anomaly": null
    },
    {
      "lat": 14.55523,
      "lng": 121.03481,
      "speed": 33.3,
      "time": "08:42:40",
      "anomaly": null
    },
    {
      "lat": 14.55522,
      "lng": 121.03487,
      "speed": 35.0,
      "time": "08:42:45",
      "anomaly": null
    },
    {
      "lat": 14.55522,
      "lng": 121.03498,
      "speed": 36.7,
      "time": "08:42:51",
      "anomaly": null
    },
    {
      "lat": 14.55523,
      "lng": 121.03504,
      "speed": 38.3,
      "time": "08:42:56",
      "anomaly": null
    },
    {
      "lat": 14.55524,
      "lng": 121.03508,
      "speed": 40.0,
      "time": "08:43:02",
      "anomaly": null
    },
    {
      "lat": 14.55525,
      "lng": 121.03514,
      "speed": 41.7,
      "time": "08:43:07",
      "anomaly": null
    },
    {
      "lat": 14.55527,
      "lng": 121.0352,
      "speed": 43.3,
      "time": "08:43:13",
      "anomaly": null
    },
    {
      "lat": 14.55529,
      "lng": 121.03526,
      "speed": 45.0,
      "time": "08:43:18",
      "anomaly": null
    },
    {
      "lat": 14.55532,
      "lng": 121.03531,
      "speed": 46.7,
      "time": "08:43:23",
      "anomaly": null
    },
    {
      "lat": 14.55535,
      "lng": 121.03537,
      "speed": 48.3,
      "time": "08:43:29",
      "anomaly": null
    },
    {
      "lat": 14.55539,
      "lng": 121.03542,
      "speed": 25.0,
      "time": "08:43:34",
      "anomaly": null
    },
    {
      "lat": 14.55573,
      "lng": 121.03583,
      "speed": 26.7,
      "time": "08:43:40",
      "anomaly": null
    },
    {
      "lat": 14.55598,
      "lng": 121.03613,
      "speed": 28.3,
      "time": "08:43:45",
      "anomaly": null
    },
    {
      "lat": 14.55616,
      "lng": 121.03639,
      "speed": 30.0,
      "time": "08:43:51",
      "anomaly": null
    },
    {
      "lat": 14.55648,
      "lng": 121.03683,
      "speed": 31.7,
      "time": "08:43:56",
      "anomaly": null
    },
    {
      "lat": 14.55672,
      "lng": 121.03712,
      "speed": 33.3,
      "time": "08:44:01",
      "anomaly": null
    },
    {
      "lat": 14.55719,
      "lng": 121.03769,
      "speed": 35.0,
      "time": "08:44:07",
      "anomaly": null
    },
    {
      "lat": 14.55725,
      "lng": 121.03776,
      "speed": 36.7,
      "time": "08:44:12",
      "anomaly": null
    },
    {
      "lat": 14.5573,
      "lng": 121.03783,
      "speed": 38.3,
      "time": "08:44:18",
      "anomaly": null
    },
    {
      "lat": 14.55736,
      "lng": 121.03791,
      "speed": 40.0,
      "time": "08:44:23",
      "anomaly": null
    },
    {
      "lat": 14.55741,
      "lng": 121.03801,
      "speed": 41.7,
      "time": "08:44:29",
      "anomaly": null
    },
    {
      "lat": 14.55745,
      "lng": 121.03809,
      "speed": 43.3,
      "time": "08:44:34",
      "anomaly": null
    },
    {
      "lat": 14.55747,
      "lng": 121.03817,
      "speed": 45.0,
      "time": "08:44:40",
      "anomaly": null
    },
    {
      "lat": 14.55748,
      "lng": 121.03822,
      "speed": 46.7,
      "time": "08:44:45",
      "anomaly": null
    },
    {
      "lat": 14.55749,
      "lng": 121.0383,
      "speed": 48.3,
      "time": "08:44:50",
      "anomaly": null
    },
    {
      "lat": 14.55749,
      "lng": 121.03835,
      "speed": 25.0,
      "time": "08:44:56",
      "anomaly": null
    },
    {
      "lat": 14.55749,
      "lng": 121.03839,
      "speed": 26.7,
      "time": "08:45:01",
      "anomaly": null
    },
    {
      "lat": 14.55749,
      "lng": 121.03844,
      "speed": 28.3,
      "time": "08:45:07",
      "anomaly": null
    },
    {
      "lat": 14.55749,
      "lng": 121.03853,
      "speed": 30.0,
      "time": "08:45:12",
      "anomaly": null
    },
    {
      "lat": 14.55743,
      "lng": 121.03879,
      "speed": 31.7,
      "time": "08:45:18",
      "anomaly": null
    },
    {
      "lat": 14.55732,
      "lng": 121.0393,
      "speed": 33.3,
      "time": "08:45:23",
      "anomaly": null
    },
    {
      "lat": 14.55729,
      "lng": 121.03949,
      "speed": 35.0,
      "time": "08:45:28",
      "anomaly": null
    },
    {
      "lat": 14.55727,
      "lng": 121.03981,
      "speed": 36.7,
      "time": "08:45:34",
      "anomaly": null
    },
    {
      "lat": 14.55724,
      "lng": 121.04032,
      "speed": 38.3,
      "time": "08:45:39",
      "anomaly": null
    },
    {
      "lat": 14.55721,
      "lng": 121.04119,
      "speed": 40.0,
      "time": "08:45:45",
      "anomaly": null
    },
    {
      "lat": 14.55721,
      "lng": 121.04126,
      "speed": 41.7,
      "time": "08:45:50",
      "anomaly": null
    },
    {
      "lat": 14.5572,
      "lng": 121.04159,
      "speed": 43.3,
      "time": "08:45:56",
      "anomaly": null
    },
    {
      "lat": 14.5572,
      "lng": 121.0418,
      "speed": 45.0,
      "time": "08:46:01",
      "anomaly": null
    },
    {
      "lat": 14.55718,
      "lng": 121.04191,
      "speed": 46.7,
      "time": "08:46:06",
      "anomaly": null
    },
    {
      "lat": 14.55716,
      "lng": 121.04197,
      "speed": 48.3,
      "time": "08:46:12",
      "anomaly": null
    },
    {
      "lat": 14.55713,
      "lng": 121.04204,
      "speed": 25.0,
      "time": "08:46:17",
      "anomaly": null
    },
    {
      "lat": 14.5571,
      "lng": 121.04212,
      "speed": 26.7,
      "time": "08:46:23",
      "anomaly": null
    },
    {
      "lat": 14.55705,
      "lng": 121.0422,
      "speed": 28.3,
      "time": "08:46:28",
      "anomaly": null
    },
    {
      "lat": 14.557,
      "lng": 121.04227,
      "speed": 30.0,
      "time": "08:46:34",
      "anomaly": null
    },
    {
      "lat": 14.55693,
      "lng": 121.04234,
      "speed": 31.7,
      "time": "08:46:39",
      "anomaly": null
    },
    {
      "lat": 14.55689,
      "lng": 121.04238,
      "speed": 33.3,
      "time": "08:46:44",
      "anomaly": null
    },
    {
      "lat": 14.55672,
      "lng": 121.04252,
      "speed": 35.0,
      "time": "08:46:50",
      "anomaly": null
    },
    {
      "lat": 14.55584,
      "lng": 121.0432,
      "speed": 36.7,
      "time": "08:46:55",
      "anomaly": null
    },
    {
      "lat": 14.55576,
      "lng": 121.04327,
      "speed": 38.3,
      "time": "08:47:01",
      "anomaly": null
    },
    {
      "lat": 14.55569,
      "lng": 121.04335,
      "speed": 40.0,
      "time": "08:47:06",
      "anomaly": null
    },
    {
      "lat": 14.55563,
      "lng": 121.04343,
      "speed": 41.7,
      "time": "08:47:12",
      "anomaly": null
    },
    {
      "lat": 14.55558,
      "lng": 121.04352,
      "speed": 43.3,
      "time": "08:47:17",
      "anomaly": null
    },
    {
      "lat": 14.55555,
      "lng": 121.04359,
      "speed": 45.0,
      "time": "08:47:22",
      "anomaly": null
    },
    {
      "lat": 14.55552,
      "lng": 121.04367,
      "speed": 46.7,
      "time": "08:47:28",
      "anomaly": null
    },
    {
      "lat": 14.5555,
      "lng": 121.04376,
      "speed": 48.3,
      "time": "08:47:33",
      "anomaly": null
    },
    {
      "lat": 14.55539,
      "lng": 121.04473,
      "speed": 25.0,
      "time": "08:47:39",
      "anomaly": null
    },
    {
      "lat": 14.55538,
      "lng": 121.04481,
      "speed": 26.7,
      "time": "08:47:44",
      "anomaly": null
    },
    {
      "lat": 14.55532,
      "lng": 121.0452,
      "speed": 28.3,
      "time": "08:47:50",
      "anomaly": null
    },
    {
      "lat": 14.5552,
      "lng": 121.04557,
      "speed": 30.0,
      "time": "08:47:55",
      "anomaly": null
    },
    {
      "lat": 14.55513,
      "lng": 121.04577,
      "speed": 31.7,
      "time": "08:48:00",
      "anomaly": null
    },
    {
      "lat": 14.55504,
      "lng": 121.04604,
      "speed": 33.3,
      "time": "08:48:06",
      "anomaly": null
    },
    {
      "lat": 14.55502,
      "lng": 121.0461,
      "speed": 35.0,
      "time": "08:48:11",
      "anomaly": null
    },
    {
      "lat": 14.55484,
      "lng": 121.04662,
      "speed": 36.7,
      "time": "08:48:17",
      "anomaly": null
    },
    {
      "lat": 14.55478,
      "lng": 121.04681,
      "speed": 38.3,
      "time": "08:48:22",
      "anomaly": null
    },
    {
      "lat": 14.55474,
      "lng": 121.04692,
      "speed": 40.0,
      "time": "08:48:28",
      "anomaly": null
    },
    {
      "lat": 14.55472,
      "lng": 121.04699,
      "speed": 41.7,
      "time": "08:48:33",
      "anomaly": null
    },
    {
      "lat": 14.55461,
      "lng": 121.04733,
      "speed": 43.3,
      "time": "08:48:39",
      "anomaly": null
    },
    {
      "lat": 14.55446,
      "lng": 121.04778,
      "speed": 45.0,
      "time": "08:48:44",
      "anomaly": null
    },
    {
      "lat": 14.55429,
      "lng": 121.04828,
      "speed": 46.7,
      "time": "08:48:49",
      "anomaly": null
    },
    {
      "lat": 14.55418,
      "lng": 121.04861,
      "speed": 48.3,
      "time": "08:48:55",
      "anomaly": null
    },
    {
      "lat": 14.55416,
      "lng": 121.04867,
      "speed": 25.0,
      "time": "08:49:00",
      "anomaly": null
    },
    {
      "lat": 14.55414,
      "lng": 121.04874,
      "speed": 26.7,
      "time": "08:49:06",
      "anomaly": null
    },
    {
      "lat": 14.55406,
      "lng": 121.04898,
      "speed": 28.3,
      "time": "08:49:11",
      "anomaly": null
    },
    {
      "lat": 14.55397,
      "lng": 121.04927,
      "speed": 30.0,
      "time": "08:49:17",
      "anomaly": null
    },
    {
      "lat": 14.55382,
      "lng": 121.04974,
      "speed": 31.7,
      "time": "08:49:22",
      "anomaly": null
    },
    {
      "lat": 14.55363,
      "lng": 121.05034,
      "speed": 33.3,
      "time": "08:49:27",
      "anomaly": null
    },
    {
      "lat": 14.5536,
      "lng": 121.05043,
      "speed": 35.0,
      "time": "08:49:33",
      "anomaly": null
    },
    {
      "lat": 14.55357,
      "lng": 121.05052,
      "speed": 36.7,
      "time": "08:49:38",
      "anomaly": null
    },
    {
      "lat": 14.55351,
      "lng": 121.0507,
      "speed": 38.3,
      "time": "08:49:44",
      "anomaly": null
    },
    {
      "lat": 14.55332,
      "lng": 121.0513,
      "speed": 40.0,
      "time": "08:49:49",
      "anomaly": null
    },
    {
      "lat": 14.5532,
      "lng": 121.05168,
      "speed": 41.7,
      "time": "08:49:55",
      "anomaly": null
    },
    {
      "lat": 14.55313,
      "lng": 121.0519,
      "speed": 43.3,
      "time": "08:50:00",
      "anomaly": null
    },
    {
      "lat": 14.55306,
      "lng": 121.0521,
      "speed": 45.0,
      "time": "08:50:05",
      "anomaly": null
    },
    {
      "lat": 14.55303,
      "lng": 121.05219,
      "speed": 46.7,
      "time": "08:50:11",
      "anomaly": null
    },
    {
      "lat": 14.55301,
      "lng": 121.05227,
      "speed": 48.3,
      "time": "08:50:16",
      "anomaly": null
    },
    {
      "lat": 14.55284,
      "lng": 121.05279,
      "speed": 25.0,
      "time": "08:50:22",
      "anomaly": null
    },
    {
      "lat": 14.55268,
      "lng": 121.05331,
      "speed": 26.7,
      "time": "08:50:27",
      "anomaly": null
    },
    {
      "lat": 14.5526,
      "lng": 121.05329,
      "speed": 28.3,
      "time": "08:50:33",
      "anomaly": null
    },
    {
      "lat": 14.55223,
      "lng": 121.05317,
      "speed": 30.0,
      "time": "08:50:38",
      "anomaly": null
    },
    {
      "lat": 14.55217,
      "lng": 121.05315,
      "speed": 31.7,
      "time": "08:50:43",
      "anomaly": null
    },
    {
      "lat": 14.55212,
      "lng": 121.05313,
      "speed": 33.3,
      "time": "08:50:49",
      "anomaly": null
    },
    {
      "lat": 14.55177,
      "lng": 121.05302,
      "speed": 35.0,
      "time": "08:50:54",
      "anomaly": null
    },
    {
      "lat": 14.55155,
      "lng": 121.05295,
      "speed": 36.7,
      "time": "08:51:00",
      "anomaly": null
    },
    {
      "lat": 14.5513,
      "lng": 121.05286,
      "speed": 38.3,
      "time": "08:51:05",
      "anomaly": null
    },
    {
      "lat": 14.5512,
      "lng": 121.05283,
      "speed": 40.0,
      "time": "08:51:11",
      "anomaly": null
    },
    {
      "lat": 14.55127,
      "lng": 121.05261,
      "speed": 41.7,
      "time": "08:51:16",
      "anomaly": null
    },
    {
      "lat": 14.55131,
      "lng": 121.0525,
      "speed": 43.3,
      "time": "08:51:21",
      "anomaly": null
    },
    {
      "lat": 14.55138,
      "lng": 121.05228,
      "speed": 45.0,
      "time": "08:51:27",
      "anomaly": null
    },
    {
      "lat": 14.55142,
      "lng": 121.05215,
      "speed": 46.7,
      "time": "08:51:32",
      "anomaly": null
    },
    {
      "lat": 14.55154,
      "lng": 121.05178,
      "speed": 48.3,
      "time": "08:51:38",
      "anomaly": null
    },
    {
      "lat": 14.55157,
      "lng": 121.05169,
      "speed": 25.0,
      "time": "08:51:43",
      "anomaly": null
    },
    {
      "lat": 14.5516,
      "lng": 121.0516,
      "speed": 26.7,
      "time": "08:51:49",
      "anomaly": null
    },
    {
      "lat": 14.55171,
      "lng": 121.05123,
      "speed": 28.3,
      "time": "08:51:54",
      "anomaly": null
    },
    {
      "lat": 14.55181,
      "lng": 121.05094,
      "speed": 0.0,
      "time": "08:52:00",
      "anomaly": null
    }
  ],
  "c0000001-0000-0000-0000-000000000002": [
    {
      "lat": 14.58705,
      "lng": 121.0614,
      "speed": 0.0,
      "time": "11:15:00",
      "anomaly": null
    },
    {
      "lat": 14.58705,
      "lng": 121.0615,
      "speed": 31.7,
      "time": "11:15:08",
      "anomaly": null
    },
    {
      "lat": 14.58706,
      "lng": 121.06152,
      "speed": 33.3,
      "time": "11:15:16",
      "anomaly": null
    },
    {
      "lat": 14.58708,
      "lng": 121.06153,
      "speed": 35.0,
      "time": "11:15:24",
      "anomaly": null
    },
    {
      "lat": 14.58714,
      "lng": 121.06154,
      "speed": 36.7,
      "time": "11:15:32",
      "anomaly": null
    },
    {
      "lat": 14.58723,
      "lng": 121.06154,
      "speed": 38.3,
      "time": "11:15:40",
      "anomaly": null
    },
    {
      "lat": 14.58725,
      "lng": 121.06152,
      "speed": 40.0,
      "time": "11:15:48",
      "anomaly": null
    },
    {
      "lat": 14.58726,
      "lng": 121.06151,
      "speed": 41.7,
      "time": "11:15:57",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06147,
      "speed": 43.3,
      "time": "11:16:05",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06141,
      "speed": 45.0,
      "time": "11:16:13",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06117,
      "speed": 46.7,
      "time": "11:16:21",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06111,
      "speed": 48.3,
      "time": "11:16:29",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06107,
      "speed": 30.0,
      "time": "11:16:37",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06104,
      "speed": 31.7,
      "time": "11:16:46",
      "anomaly": null
    },
    {
      "lat": 14.58727,
      "lng": 121.06102,
      "speed": 33.3,
      "time": "11:16:54",
      "anomaly": null
    },
    {
      "lat": 14.58723,
      "lng": 121.06102,
      "speed": 35.0,
      "time": "11:17:02",
      "anomaly": null
    },
    {
      "lat": 14.58714,
      "lng": 121.06102,
      "speed": 36.7,
      "time": "11:17:10",
      "anomaly": null
    },
    {
      "lat": 14.58698,
      "lng": 121.06101,
      "speed": 38.3,
      "time": "11:17:18",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.06101,
      "speed": 40.0,
      "time": "11:17:26",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.06092,
      "speed": 41.7,
      "time": "11:17:34",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.06082,
      "speed": 43.3,
      "time": "11:17:43",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.06057,
      "speed": 45.0,
      "time": "11:17:51",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.06042,
      "speed": 46.7,
      "time": "11:17:59",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.05988,
      "speed": 48.3,
      "time": "11:18:07",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.05983,
      "speed": 30.0,
      "time": "11:18:15",
      "anomaly": null
    },
    {
      "lat": 14.58691,
      "lng": 121.05973,
      "speed": 31.7,
      "time": "11:18:23",
      "anomaly": null
    },
    {
      "lat": 14.5868,
      "lng": 121.05973,
      "speed": 33.3,
      "time": "11:18:32",
      "anomaly": null
    },
    {
      "lat": 14.58672,
      "lng": 121.05974,
      "speed": 35.0,
      "time": "11:18:40",
      "anomaly": null
    },
    {
      "lat": 14.58634,
      "lng": 121.05976,
      "speed": 36.7,
      "time": "11:18:48",
      "anomaly": null
    },
    {
      "lat": 14.58627,
      "lng": 121.05977,
      "speed": 38.3,
      "time": "11:18:56",
      "anomaly": null
    },
    {
      "lat": 14.58618,
      "lng": 121.05977,
      "speed": 40.0,
      "time": "11:19:04",
      "anomaly": null
    },
    {
      "lat": 14.586,
      "lng": 121.05978,
      "speed": 41.7,
      "time": "11:19:12",
      "anomaly": null
    },
    {
      "lat": 14.58591,
      "lng": 121.05979,
      "speed": 43.3,
      "time": "11:19:21",
      "anomaly": null
    },
    {
      "lat": 14.58561,
      "lng": 121.05981,
      "speed": 45.0,
      "time": "11:19:29",
      "anomaly": null
    },
    {
      "lat": 14.58509,
      "lng": 121.05984,
      "speed": 46.7,
      "time": "11:19:37",
      "anomaly": null
    },
    {
      "lat": 14.58503,
      "lng": 121.05985,
      "speed": 48.3,
      "time": "11:19:45",
      "anomaly": null
    },
    {
      "lat": 14.58456,
      "lng": 121.05988,
      "speed": 30.0,
      "time": "11:19:53",
      "anomaly": null
    },
    {
      "lat": 14.58446,
      "lng": 121.05989,
      "speed": 31.7,
      "time": "11:20:01",
      "anomaly": null
    },
    {
      "lat": 14.58438,
      "lng": 121.05989,
      "speed": 33.3,
      "time": "11:20:09",
      "anomaly": null
    },
    {
      "lat": 14.58428,
      "lng": 121.0599,
      "speed": 35.0,
      "time": "11:20:18",
      "anomaly": null
    },
    {
      "lat": 14.58383,
      "lng": 121.05993,
      "speed": 36.7,
      "time": "11:20:26",
      "anomaly": null
    },
    {
      "lat": 14.58355,
      "lng": 121.05994,
      "speed": 38.3,
      "time": "11:20:34",
      "anomaly": null
    },
    {
      "lat": 14.58346,
      "lng": 121.05995,
      "speed": 40.0,
      "time": "11:20:42",
      "anomaly": null
    },
    {
      "lat": 14.58307,
      "lng": 121.05997,
      "speed": 41.7,
      "time": "11:20:50",
      "anomaly": null
    },
    {
      "lat": 14.58299,
      "lng": 121.05997,
      "speed": 43.3,
      "time": "11:20:58",
      "anomaly": null
    },
    {
      "lat": 14.58295,
      "lng": 121.05997,
      "speed": 45.0,
      "time": "11:21:07",
      "anomaly": null
    },
    {
      "lat": 14.58221,
      "lng": 121.06,
      "speed": 46.7,
      "time": "11:21:15",
      "anomaly": null
    },
    {
      "lat": 14.582,
      "lng": 121.06001,
      "speed": 48.3,
      "time": "11:21:23",
      "anomaly": null
    },
    {
      "lat": 14.58188,
      "lng": 121.06002,
      "speed": 30.0,
      "time": "11:21:31",
      "anomaly": null
    },
    {
      "lat": 14.5818,
      "lng": 121.06,
      "speed": 31.7,
      "time": "11:21:39",
      "anomaly": null
    },
    {
      "lat": 14.58171,
      "lng": 121.05995,
      "speed": 33.3,
      "time": "11:21:47",
      "anomaly": null
    },
    {
      "lat": 14.58132,
      "lng": 121.05966,
      "speed": 35.0,
      "time": "11:21:56",
      "anomaly": null
    },
    {
      "lat": 14.58123,
      "lng": 121.05959,
      "speed": 36.7,
      "time": "11:22:04",
      "anomaly": null
    },
    {
      "lat": 14.58115,
      "lng": 121.05953,
      "speed": 38.3,
      "time": "11:22:12",
      "anomaly": null
    },
    {
      "lat": 14.58063,
      "lng": 121.05912,
      "speed": 40.0,
      "time": "11:22:20",
      "anomaly": null
    },
    {
      "lat": 14.58061,
      "lng": 121.0591,
      "speed": 41.7,
      "time": "11:22:28",
      "anomaly": null
    },
    {
      "lat": 14.58032,
      "lng": 121.05887,
      "speed": 43.3,
      "time": "11:22:36",
      "anomaly": null
    },
    {
      "lat": 14.58024,
      "lng": 121.05881,
      "speed": 45.0,
      "time": "11:22:44",
      "anomaly": null
    },
    {
      "lat": 14.58018,
      "lng": 121.05876,
      "speed": 46.7,
      "time": "11:22:53",
      "anomaly": null
    },
    {
      "lat": 14.57954,
      "lng": 121.05823,
      "speed": 48.3,
      "time": "11:23:01",
      "anomaly": null
    },
    {
      "lat": 14.57952,
      "lng": 121.05821,
      "speed": 30.0,
      "time": "11:23:09",
      "anomaly": null
    },
    {
      "lat": 14.5794,
      "lng": 121.05811,
      "speed": 31.7,
      "time": "11:23:17",
      "anomaly": null
    },
    {
      "lat": 14.57891,
      "lng": 121.05773,
      "speed": 33.3,
      "time": "11:23:25",
      "anomaly": null
    },
    {
      "lat": 14.57851,
      "lng": 121.05743,
      "speed": 35.0,
      "time": "11:23:33",
      "anomaly": null
    },
    {
      "lat": 14.57829,
      "lng": 121.05726,
      "speed": 36.7,
      "time": "11:23:42",
      "anomaly": null
    },
    {
      "lat": 14.57824,
      "lng": 121.05723,
      "speed": 38.3,
      "time": "11:23:50",
      "anomaly": null
    },
    {
      "lat": 14.5783,
      "lng": 121.05716,
      "speed": 40.0,
      "time": "11:23:58",
      "anomaly": null
    },
    {
      "lat": 14.57831,
      "lng": 121.05714,
      "speed": 41.7,
      "time": "11:24:06",
      "anomaly": null
    },
    {
      "lat": 14.5787,
      "lng": 121.05669,
      "speed": 43.3,
      "time": "11:24:14",
      "anomaly": null
    },
    {
      "lat": 14.57908,
      "lng": 121.05627,
      "speed": 45.0,
      "time": "11:24:22",
      "anomaly": null
    },
    {
      "lat": 14.57918,
      "lng": 121.05617,
      "speed": 46.7,
      "time": "11:24:30",
      "anomaly": null
    },
    {
      "lat": 14.5794,
      "lng": 121.05596,
      "speed": 48.3,
      "time": "11:24:39",
      "anomaly": null
    },
    {
      "lat": 14.57984,
      "lng": 121.05545,
      "speed": 30.0,
      "time": "11:24:47",
      "anomaly": null
    },
    {
      "lat": 14.58015,
      "lng": 121.05509,
      "speed": 31.7,
      "time": "11:24:55",
      "anomaly": null
    },
    {
      "lat": 14.58036,
      "lng": 121.05486,
      "speed": 33.3,
      "time": "11:25:03",
      "anomaly": null
    },
    {
      "lat": 14.58051,
      "lng": 121.05468,
      "speed": 35.0,
      "time": "11:25:11",
      "anomaly": null
    },
    {
      "lat": 14.5806,
      "lng": 121.05458,
      "speed": 36.7,
      "time": "11:25:19",
      "anomaly": null
    },
    {
      "lat": 14.58063,
      "lng": 121.05454,
      "speed": 38.3,
      "time": "11:25:28",
      "anomaly": null
    },
    {
      "lat": 14.58063,
      "lng": 121.05448,
      "speed": 40.0,
      "time": "11:25:36",
      "anomaly": null
    },
    {
      "lat": 14.58065,
      "lng": 121.05442,
      "speed": 41.7,
      "time": "11:25:44",
      "anomaly": null
    },
    {
      "lat": 14.58075,
      "lng": 121.05423,
      "speed": 43.3,
      "time": "11:25:52",
      "anomaly": null
    },
    {
      "lat": 14.58109,
      "lng": 121.05384,
      "speed": 45.0,
      "time": "11:26:00",
      "anomaly": null
    },
    {
      "lat": 14.58117,
      "lng": 121.05375,
      "speed": 46.7,
      "time": "11:26:08",
      "anomaly": null
    },
    {
      "lat": 14.58117,
      "lng": 121.05374,
      "speed": 48.3,
      "time": "11:26:17",
      "anomaly": null
    },
    {
      "lat": 14.58129,
      "lng": 121.05356,
      "speed": 30.0,
      "time": "11:26:25",
      "anomaly": null
    },
    {
      "lat": 14.5813,
      "lng": 121.05353,
      "speed": 31.7,
      "time": "11:26:33",
      "anomaly": null
    },
    {
      "lat": 14.5813,
      "lng": 121.0535,
      "speed": 33.3,
      "time": "11:26:41",
      "anomaly": null
    },
    {
      "lat": 14.5813,
      "lng": 121.05344,
      "speed": 35.0,
      "time": "11:26:49",
      "anomaly": null
    },
    {
      "lat": 14.58068,
      "lng": 121.05302,
      "speed": 36.7,
      "time": "11:26:57",
      "anomaly": null
    },
    {
      "lat": 14.58058,
      "lng": 121.05295,
      "speed": 38.3,
      "time": "11:27:05",
      "anomaly": null
    },
    {
      "lat": 14.57858,
      "lng": 121.05154,
      "speed": 40.0,
      "time": "11:27:14",
      "anomaly": null
    },
    {
      "lat": 14.57842,
      "lng": 121.05142,
      "speed": 41.7,
      "time": "11:27:22",
      "anomaly": null
    },
    {
      "lat": 14.57831,
      "lng": 121.05134,
      "speed": 43.3,
      "time": "11:27:30",
      "anomaly": null
    },
    {
      "lat": 14.57803,
      "lng": 121.05116,
      "speed": 45.0,
      "time": "11:27:38",
      "anomaly": null
    },
    {
      "lat": 14.57775,
      "lng": 121.05094,
      "speed": 46.7,
      "time": "11:27:46",
      "anomaly": null
    },
    {
      "lat": 14.57765,
      "lng": 121.05086,
      "speed": 48.3,
      "time": "11:27:54",
      "anomaly": null
    },
    {
      "lat": 14.57733,
      "lng": 121.05063,
      "speed": 30.0,
      "time": "11:28:03",
      "anomaly": null
    },
    {
      "lat": 14.5772,
      "lng": 121.05052,
      "speed": 31.7,
      "time": "11:28:11",
      "anomaly": null
    },
    {
      "lat": 14.5767,
      "lng": 121.05015,
      "speed": 33.3,
      "time": "11:28:19",
      "anomaly": null
    },
    {
      "lat": 14.57663,
      "lng": 121.0501,
      "speed": 35.0,
      "time": "11:28:27",
      "anomaly": null
    },
    {
      "lat": 14.57431,
      "lng": 121.04839,
      "speed": 36.7,
      "time": "11:28:35",
      "anomaly": null
    },
    {
      "lat": 14.57425,
      "lng": 121.04835,
      "speed": 38.3,
      "time": "11:28:43",
      "anomaly": null
    },
    {
      "lat": 14.57419,
      "lng": 121.0483,
      "speed": 40.0,
      "time": "11:28:52",
      "anomaly": null
    },
    {
      "lat": 14.57361,
      "lng": 121.04788,
      "speed": 41.7,
      "time": "11:29:00",
      "anomaly": null
    },
    {
      "lat": 14.57343,
      "lng": 121.04775,
      "speed": 43.3,
      "time": "11:29:08",
      "anomaly": null
    },
    {
      "lat": 14.57309,
      "lng": 121.04752,
      "speed": 45.0,
      "time": "11:29:16",
      "anomaly": null
    },
    {
      "lat": 14.57263,
      "lng": 121.04725,
      "speed": 46.7,
      "time": "11:29:24",
      "anomaly": null
    },
    {
      "lat": 14.57242,
      "lng": 121.04714,
      "speed": 48.3,
      "time": "11:29:32",
      "anomaly": null
    },
    {
      "lat": 14.57218,
      "lng": 121.04702,
      "speed": 30.0,
      "time": "11:29:40",
      "anomaly": null
    },
    {
      "lat": 14.57206,
      "lng": 121.04696,
      "speed": 31.7,
      "time": "11:29:49",
      "anomaly": null
    },
    {
      "lat": 14.57191,
      "lng": 121.04688,
      "speed": 33.3,
      "time": "11:29:57",
      "anomaly": null
    },
    {
      "lat": 14.57185,
      "lng": 121.04685,
      "speed": 35.0,
      "time": "11:30:05",
      "anomaly": null
    },
    {
      "lat": 14.57158,
      "lng": 121.04673,
      "speed": 36.7,
      "time": "11:30:13",
      "anomaly": null
    },
    {
      "lat": 14.57135,
      "lng": 121.04665,
      "speed": 38.3,
      "time": "11:30:21",
      "anomaly": null
    },
    {
      "lat": 14.57101,
      "lng": 121.04653,
      "speed": 40.0,
      "time": "11:30:29",
      "anomaly": null
    },
    {
      "lat": 14.57066,
      "lng": 121.04643,
      "speed": 41.7,
      "time": "11:30:38",
      "anomaly": null
    },
    {
      "lat": 14.5706,
      "lng": 121.04641,
      "speed": 43.3,
      "time": "11:30:46",
      "anomaly": null
    },
    {
      "lat": 14.57014,
      "lng": 121.04628,
      "speed": 45.0,
      "time": "11:30:54",
      "anomaly": null
    },
    {
      "lat": 14.56996,
      "lng": 121.04624,
      "speed": 46.7,
      "time": "11:31:02",
      "anomaly": null
    },
    {
      "lat": 14.56952,
      "lng": 121.04613,
      "speed": 48.3,
      "time": "11:31:10",
      "anomaly": null
    },
    {
      "lat": 14.56939,
      "lng": 121.0461,
      "speed": 30.0,
      "time": "11:31:18",
      "anomaly": null
    },
    {
      "lat": 14.56909,
      "lng": 121.04605,
      "speed": 31.7,
      "time": "11:31:27",
      "anomaly": null
    },
    {
      "lat": 14.56894,
      "lng": 121.04601,
      "speed": 33.3,
      "time": "11:31:35",
      "anomaly": null
    },
    {
      "lat": 14.56786,
      "lng": 121.04569,
      "speed": 35.0,
      "time": "11:31:43",
      "anomaly": null
    },
    {
      "lat": 14.56747,
      "lng": 121.04555,
      "speed": 36.7,
      "time": "11:31:51",
      "anomaly": null
    },
    {
      "lat": 14.5671,
      "lng": 121.04544,
      "speed": 38.3,
      "time": "11:31:59",
      "anomaly": null
    },
    {
      "lat": 14.56678,
      "lng": 121.04536,
      "speed": 40.0,
      "time": "11:32:07",
      "anomaly": null
    },
    {
      "lat": 14.56664,
      "lng": 121.04532,
      "speed": 41.7,
      "time": "11:32:15",
      "anomaly": null
    },
    {
      "lat": 14.56564,
      "lng": 121.04503,
      "speed": 43.3,
      "time": "11:32:24",
      "anomaly": null
    },
    {
      "lat": 14.56511,
      "lng": 121.04489,
      "speed": 45.0,
      "time": "11:32:32",
      "anomaly": null
    },
    {
      "lat": 14.56449,
      "lng": 121.04465,
      "speed": 46.7,
      "time": "11:32:40",
      "anomaly": null
    },
    {
      "lat": 14.56414,
      "lng": 121.0445,
      "speed": 48.3,
      "time": "11:32:48",
      "anomaly": null
    },
    {
      "lat": 14.56366,
      "lng": 121.04424,
      "speed": 30.0,
      "time": "11:32:56",
      "anomaly": null
    },
    {
      "lat": 14.56333,
      "lng": 121.04405,
      "speed": 31.7,
      "time": "11:33:04",
      "anomaly": null
    },
    {
      "lat": 14.56276,
      "lng": 121.04366,
      "speed": 33.3,
      "time": "11:33:13",
      "anomaly": null
    },
    {
      "lat": 14.56268,
      "lng": 121.0436,
      "speed": 35.0,
      "time": "11:33:21",
      "anomaly": null
    },
    {
      "lat": 14.56227,
      "lng": 121.04326,
      "speed": 36.7,
      "time": "11:33:29",
      "anomaly": null
    },
    {
      "lat": 14.56185,
      "lng": 121.04288,
      "speed": 38.3,
      "time": "11:33:37",
      "anomaly": null
    },
    {
      "lat": 14.56175,
      "lng": 121.04278,
      "speed": 40.0,
      "time": "11:33:45",
      "anomaly": null
    },
    {
      "lat": 14.56171,
      "lng": 121.04274,
      "speed": 41.7,
      "time": "11:33:53",
      "anomaly": null
    },
    {
      "lat": 14.56167,
      "lng": 121.0427,
      "speed": 43.3,
      "time": "11:34:01",
      "anomaly": null
    },
    {
      "lat": 14.56132,
      "lng": 121.04229,
      "speed": 45.0,
      "time": "11:34:10",
      "anomaly": null
    },
    {
      "lat": 14.55997,
      "lng": 121.04068,
      "speed": 46.7,
      "time": "11:34:18",
      "anomaly": null
    },
    {
      "lat": 14.55982,
      "lng": 121.04051,
      "speed": 48.3,
      "time": "11:34:26",
      "anomaly": null
    },
    {
      "lat": 14.55938,
      "lng": 121.04001,
      "speed": 30.0,
      "time": "11:34:34",
      "anomaly": null
    },
    {
      "lat": 14.55823,
      "lng": 121.03861,
      "speed": 31.7,
      "time": "11:34:42",
      "anomaly": null
    },
    {
      "lat": 14.55787,
      "lng": 121.03811,
      "speed": 33.3,
      "time": "11:34:50",
      "anomaly": null
    },
    {
      "lat": 14.55738,
      "lng": 121.03754,
      "speed": 35.0,
      "time": "11:34:59",
      "anomaly": null
    },
    {
      "lat": 14.55692,
      "lng": 121.03696,
      "speed": 36.7,
      "time": "11:35:07",
      "anomaly": null
    },
    {
      "lat": 14.55565,
      "lng": 121.03546,
      "speed": 38.3,
      "time": "11:35:15",
      "anomaly": null
    },
    {
      "lat": 14.55554,
      "lng": 121.03533,
      "speed": 40.0,
      "time": "11:35:23",
      "anomaly": null
    },
    {
      "lat": 14.55554,
      "lng": 121.03532,
      "speed": 41.7,
      "time": "11:35:31",
      "anomaly": null
    },
    {
      "lat": 14.55551,
      "lng": 121.03529,
      "speed": 43.3,
      "time": "11:35:39",
      "anomaly": null
    },
    {
      "lat": 14.55532,
      "lng": 121.03507,
      "speed": 45.0,
      "time": "11:35:48",
      "anomaly": null
    },
    {
      "lat": 14.55512,
      "lng": 121.03486,
      "speed": 46.7,
      "time": "11:35:56",
      "anomaly": null
    },
    {
      "lat": 14.5549,
      "lng": 121.03468,
      "speed": 48.3,
      "time": "11:36:04",
      "anomaly": null
    },
    {
      "lat": 14.55481,
      "lng": 121.03456,
      "speed": 30.0,
      "time": "11:36:12",
      "anomaly": null
    },
    {
      "lat": 14.55477,
      "lng": 121.03451,
      "speed": 31.7,
      "time": "11:36:20",
      "anomaly": null
    },
    {
      "lat": 14.55459,
      "lng": 121.0343,
      "speed": 33.3,
      "time": "11:36:28",
      "anomaly": null
    },
    {
      "lat": 14.55436,
      "lng": 121.034,
      "speed": 35.0,
      "time": "11:36:36",
      "anomaly": null
    },
    {
      "lat": 14.552,
      "lng": 121.03122,
      "speed": 36.7,
      "time": "11:36:45",
      "anomaly": null
    },
    {
      "lat": 14.55177,
      "lng": 121.03095,
      "speed": 38.3,
      "time": "11:36:53",
      "anomaly": null
    },
    {
      "lat": 14.55074,
      "lng": 121.02977,
      "speed": 40.0,
      "time": "11:37:01",
      "anomaly": null
    },
    {
      "lat": 14.54959,
      "lng": 121.02837,
      "speed": 41.7,
      "time": "11:37:09",
      "anomaly": null
    },
    {
      "lat": 14.54878,
      "lng": 121.02736,
      "speed": 43.3,
      "time": "11:37:17",
      "anomaly": null
    },
    {
      "lat": 14.54778,
      "lng": 121.02617,
      "speed": 45.0,
      "time": "11:37:25",
      "anomaly": null
    },
    {
      "lat": 14.5472,
      "lng": 121.02551,
      "speed": 46.7,
      "time": "11:37:34",
      "anomaly": null
    },
    {
      "lat": 14.54704,
      "lng": 121.02532,
      "speed": 48.3,
      "time": "11:37:42",
      "anomaly": null
    },
    {
      "lat": 14.54675,
      "lng": 121.02499,
      "speed": 30.0,
      "time": "11:37:50",
      "anomaly": null
    },
    {
      "lat": 14.54634,
      "lng": 121.02452,
      "speed": 31.7,
      "time": "11:37:58",
      "anomaly": null
    },
    {
      "lat": 14.54591,
      "lng": 121.02399,
      "speed": 33.3,
      "time": "11:38:06",
      "anomaly": null
    },
    {
      "lat": 14.54557,
      "lng": 121.02358,
      "speed": 35.0,
      "time": "11:38:14",
      "anomaly": null
    },
    {
      "lat": 14.54542,
      "lng": 121.02336,
      "speed": 36.7,
      "time": "11:38:23",
      "anomaly": null
    },
    {
      "lat": 14.54468,
      "lng": 121.02253,
      "speed": 38.3,
      "time": "11:38:31",
      "anomaly": null
    },
    {
      "lat": 14.5438,
      "lng": 121.02148,
      "speed": 40.0,
      "time": "11:38:39",
      "anomaly": null
    },
    {
      "lat": 14.54304,
      "lng": 121.02059,
      "speed": 41.7,
      "time": "11:38:47",
      "anomaly": null
    },
    {
      "lat": 14.54245,
      "lng": 121.01981,
      "speed": 43.3,
      "time": "11:38:55",
      "anomaly": null
    },
    {
      "lat": 14.5423,
      "lng": 121.01963,
      "speed": 45.0,
      "time": "11:39:03",
      "anomaly": null
    },
    {
      "lat": 14.54209,
      "lng": 121.01932,
      "speed": 46.7,
      "time": "11:39:11",
      "anomaly": null
    },
    {
      "lat": 14.54187,
      "lng": 121.01907,
      "speed": 48.3,
      "time": "11:39:20",
      "anomaly": null
    },
    {
      "lat": 14.54173,
      "lng": 121.01888,
      "speed": 30.0,
      "time": "11:39:28",
      "anomaly": null
    },
    {
      "lat": 14.54155,
      "lng": 121.01861,
      "speed": 31.7,
      "time": "11:39:36",
      "anomaly": null
    },
    {
      "lat": 14.54113,
      "lng": 121.01791,
      "speed": 33.3,
      "time": "11:39:44",
      "anomaly": null
    },
    {
      "lat": 14.541,
      "lng": 121.01768,
      "speed": 35.0,
      "time": "11:39:52",
      "anomaly": null
    },
    {
      "lat": 14.54086,
      "lng": 121.01742,
      "speed": 36.7,
      "time": "11:40:00",
      "anomaly": null
    },
    {
      "lat": 14.54081,
      "lng": 121.01732,
      "speed": 38.3,
      "time": "11:40:09",
      "anomaly": null
    },
    {
      "lat": 14.54073,
      "lng": 121.01717,
      "speed": 40.0,
      "time": "11:40:17",
      "anomaly": null
    },
    {
      "lat": 14.5406,
      "lng": 121.0169,
      "speed": 41.7,
      "time": "11:40:25",
      "anomaly": null
    },
    {
      "lat": 14.54047,
      "lng": 121.01662,
      "speed": 43.3,
      "time": "11:40:33",
      "anomaly": null
    },
    {
      "lat": 14.54038,
      "lng": 121.01641,
      "speed": 45.0,
      "time": "11:40:41",
      "anomaly": null
    },
    {
      "lat": 14.54002,
      "lng": 121.01559,
      "speed": 46.7,
      "time": "11:40:49",
      "anomaly": null
    },
    {
      "lat": 14.53983,
      "lng": 121.01509,
      "speed": 48.3,
      "time": "11:40:58",
      "anomaly": null
    },
    {
      "lat": 14.53971,
      "lng": 121.01476,
      "speed": 30.0,
      "time": "11:41:06",
      "anomaly": null
    },
    {
      "lat": 14.53954,
      "lng": 121.01429,
      "speed": 31.7,
      "time": "11:41:14",
      "anomaly": null
    },
    {
      "lat": 14.53943,
      "lng": 121.01396,
      "speed": 33.3,
      "time": "11:41:22",
      "anomaly": null
    },
    {
      "lat": 14.53934,
      "lng": 121.0136,
      "speed": 35.0,
      "time": "11:41:30",
      "anomaly": null
    },
    {
      "lat": 14.53929,
      "lng": 121.01333,
      "speed": 36.7,
      "time": "11:41:38",
      "anomaly": null
    },
    {
      "lat": 14.53927,
      "lng": 121.01319,
      "speed": 38.3,
      "time": "11:41:46",
      "anomaly": null
    },
    {
      "lat": 14.53922,
      "lng": 121.01296,
      "speed": 40.0,
      "time": "11:41:55",
      "anomaly": null
    },
    {
      "lat": 14.53918,
      "lng": 121.01274,
      "speed": 41.7,
      "time": "11:42:03",
      "anomaly": null
    },
    {
      "lat": 14.53912,
      "lng": 121.0123,
      "speed": 43.3,
      "time": "11:42:11",
      "anomaly": null
    },
    {
      "lat": 14.5391,
      "lng": 121.01221,
      "speed": 45.0,
      "time": "11:42:19",
      "anomaly": null
    },
    {
      "lat": 14.539,
      "lng": 121.01165,
      "speed": 46.7,
      "time": "11:42:27",
      "anomaly": null
    },
    {
      "lat": 14.53888,
      "lng": 121.01082,
      "speed": 48.3,
      "time": "11:42:35",
      "anomaly": null
    },
    {
      "lat": 14.5387,
      "lng": 121.00942,
      "speed": 30.0,
      "time": "11:42:44",
      "anomaly": null
    },
    {
      "lat": 14.53863,
      "lng": 121.00885,
      "speed": 31.7,
      "time": "11:42:52",
      "anomaly": null
    },
    {
      "lat": 14.53863,
      "lng": 121.00862,
      "speed": 33.3,
      "time": "11:43:00",
      "anomaly": null
    },
    {
      "lat": 14.53857,
      "lng": 121.00806,
      "speed": 35.0,
      "time": "11:43:08",
      "anomaly": null
    },
    {
      "lat": 14.53855,
      "lng": 121.00781,
      "speed": 36.7,
      "time": "11:43:16",
      "anomaly": null
    },
    {
      "lat": 14.53849,
      "lng": 121.00741,
      "speed": 38.3,
      "time": "11:43:24",
      "anomaly": null
    },
    {
      "lat": 14.53839,
      "lng": 121.00662,
      "speed": 40.0,
      "time": "11:43:32",
      "anomaly": null
    },
    {
      "lat": 14.53836,
      "lng": 121.0064,
      "speed": 41.7,
      "time": "11:43:41",
      "anomaly": null
    },
    {
      "lat": 14.53835,
      "lng": 121.0063,
      "speed": 43.3,
      "time": "11:43:49",
      "anomaly": null
    },
    {
      "lat": 14.53834,
      "lng": 121.00626,
      "speed": 45.0,
      "time": "11:43:57",
      "anomaly": null
    },
    {
      "lat": 14.53832,
      "lng": 121.00606,
      "speed": 46.7,
      "time": "11:44:05",
      "anomaly": null
    },
    {
      "lat": 14.53817,
      "lng": 121.00485,
      "speed": 48.3,
      "time": "11:44:13",
      "anomaly": null
    },
    {
      "lat": 14.53814,
      "lng": 121.00459,
      "speed": 30.0,
      "time": "11:44:21",
      "anomaly": null
    },
    {
      "lat": 14.53813,
      "lng": 121.00443,
      "speed": 31.7,
      "time": "11:44:30",
      "anomaly": null
    },
    {
      "lat": 14.53808,
      "lng": 121.00407,
      "speed": 33.3,
      "time": "11:44:38",
      "anomaly": null
    },
    {
      "lat": 14.53805,
      "lng": 121.00382,
      "speed": 35.0,
      "time": "11:44:46",
      "anomaly": null
    },
    {
      "lat": 14.53805,
      "lng": 121.00377,
      "speed": 36.7,
      "time": "11:44:54",
      "anomaly": null
    },
    {
      "lat": 14.53798,
      "lng": 121.00319,
      "speed": 38.3,
      "time": "11:45:02",
      "anomaly": null
    },
    {
      "lat": 14.53788,
      "lng": 121.00246,
      "speed": 40.0,
      "time": "11:45:10",
      "anomaly": null
    },
    {
      "lat": 14.53775,
      "lng": 121.00143,
      "speed": 41.7,
      "time": "11:45:19",
      "anomaly": null
    },
    {
      "lat": 14.53774,
      "lng": 121.0014,
      "speed": 43.3,
      "time": "11:45:27",
      "anomaly": null
    },
    {
      "lat": 14.53772,
      "lng": 121.00118,
      "speed": 45.0,
      "time": "11:45:35",
      "anomaly": null
    },
    {
      "lat": 14.53767,
      "lng": 121.00074,
      "speed": 46.7,
      "time": "11:45:43",
      "anomaly": null
    },
    {
      "lat": 14.53767,
      "lng": 121.00069,
      "speed": 48.3,
      "time": "11:45:51",
      "anomaly": null
    },
    {
      "lat": 14.53766,
      "lng": 121.00064,
      "speed": 30.0,
      "time": "11:45:59",
      "anomaly": null
    },
    {
      "lat": 14.53766,
      "lng": 121.00049,
      "speed": 31.7,
      "time": "11:46:07",
      "anomaly": null
    },
    {
      "lat": 14.53766,
      "lng": 121.00046,
      "speed": 33.3,
      "time": "11:46:16",
      "anomaly": null
    },
    {
      "lat": 14.53769,
      "lng": 120.99964,
      "speed": 35.0,
      "time": "11:46:24",
      "anomaly": null
    },
    {
      "lat": 14.53772,
      "lng": 120.9993,
      "speed": 36.7,
      "time": "11:46:32",
      "anomaly": null
    },
    {
      "lat": 14.53774,
      "lng": 120.99907,
      "speed": 38.3,
      "time": "11:46:40",
      "anomaly": null
    },
    {
      "lat": 14.53775,
      "lng": 120.99896,
      "speed": 40.0,
      "time": "11:46:48",
      "anomaly": null
    },
    {
      "lat": 14.5378,
      "lng": 120.9983,
      "speed": 41.7,
      "time": "11:46:56",
      "anomaly": null
    },
    {
      "lat": 14.53787,
      "lng": 120.99742,
      "speed": 43.3,
      "time": "11:47:05",
      "anomaly": null
    },
    {
      "lat": 14.53787,
      "lng": 120.99737,
      "speed": 45.0,
      "time": "11:47:13",
      "anomaly": null
    },
    {
      "lat": 14.53788,
      "lng": 120.99719,
      "speed": 46.7,
      "time": "11:47:21",
      "anomaly": null
    },
    {
      "lat": 14.5379,
      "lng": 120.99696,
      "speed": 48.3,
      "time": "11:47:29",
      "anomaly": null
    },
    {
      "lat": 14.5379,
      "lng": 120.99686,
      "speed": 30.0,
      "time": "11:47:37",
      "anomaly": null
    },
    {
      "lat": 14.5379,
      "lng": 120.9966,
      "speed": 31.7,
      "time": "11:47:45",
      "anomaly": null
    },
    {
      "lat": 14.53787,
      "lng": 120.99573,
      "speed": 33.3,
      "time": "11:47:54",
      "anomaly": null
    },
    {
      "lat": 14.5378,
      "lng": 120.99516,
      "speed": 35.0,
      "time": "11:48:02",
      "anomaly": null
    },
    {
      "lat": 14.53761,
      "lng": 120.99421,
      "speed": 36.7,
      "time": "11:48:10",
      "anomaly": null
    },
    {
      "lat": 14.53759,
      "lng": 120.99413,
      "speed": 38.3,
      "time": "11:48:18",
      "anomaly": null
    },
    {
      "lat": 14.53756,
      "lng": 120.99399,
      "speed": 40.0,
      "time": "11:48:26",
      "anomaly": null
    },
    {
      "lat": 14.53746,
      "lng": 120.99357,
      "speed": 41.7,
      "time": "11:48:34",
      "anomaly": null
    },
    {
      "lat": 14.5373,
      "lng": 120.99288,
      "speed": 43.3,
      "time": "11:48:42",
      "anomaly": null
    },
    {
      "lat": 14.53724,
      "lng": 120.99259,
      "speed": 45.0,
      "time": "11:48:51",
      "anomaly": null
    },
    {
      "lat": 14.53719,
      "lng": 120.99234,
      "speed": 46.7,
      "time": "11:48:59",
      "anomaly": null
    },
    {
      "lat": 14.53717,
      "lng": 120.99224,
      "speed": 48.3,
      "time": "11:49:07",
      "anomaly": null
    },
    {
      "lat": 14.53713,
      "lng": 120.99205,
      "speed": 30.0,
      "time": "11:49:15",
      "anomaly": null
    },
    {
      "lat": 14.5371,
      "lng": 120.99194,
      "speed": 31.7,
      "time": "11:49:23",
      "anomaly": null
    },
    {
      "lat": 14.53706,
      "lng": 120.99178,
      "speed": 33.3,
      "time": "11:49:31",
      "anomaly": null
    },
    {
      "lat": 14.53701,
      "lng": 120.99155,
      "speed": 35.0,
      "time": "11:49:40",
      "anomaly": null
    },
    {
      "lat": 14.53694,
      "lng": 120.99125,
      "speed": 36.7,
      "time": "11:49:48",
      "anomaly": null
    },
    {
      "lat": 14.53687,
      "lng": 120.99099,
      "speed": 38.3,
      "time": "11:49:56",
      "anomaly": null
    },
    {
      "lat": 14.53679,
      "lng": 120.99066,
      "speed": 40.0,
      "time": "11:50:04",
      "anomaly": null
    },
    {
      "lat": 14.53677,
      "lng": 120.99055,
      "speed": 41.7,
      "time": "11:50:12",
      "anomaly": null
    },
    {
      "lat": 14.5367,
      "lng": 120.99027,
      "speed": 43.3,
      "time": "11:50:20",
      "anomaly": null
    },
    {
      "lat": 14.53665,
      "lng": 120.99004,
      "speed": 45.0,
      "time": "11:50:29",
      "anomaly": null
    },
    {
      "lat": 14.53656,
      "lng": 120.98969,
      "speed": 46.7,
      "time": "11:50:37",
      "anomaly": null
    },
    {
      "lat": 14.53643,
      "lng": 120.98912,
      "speed": 48.3,
      "time": "11:50:45",
      "anomaly": null
    },
    {
      "lat": 14.53641,
      "lng": 120.98903,
      "speed": 30.0,
      "time": "11:50:53",
      "anomaly": null
    },
    {
      "lat": 14.53636,
      "lng": 120.98885,
      "speed": 31.7,
      "time": "11:51:01",
      "anomaly": null
    },
    {
      "lat": 14.53634,
      "lng": 120.98872,
      "speed": 33.3,
      "time": "11:51:09",
      "anomaly": null
    },
    {
      "lat": 14.53623,
      "lng": 120.98821,
      "speed": 35.0,
      "time": "11:51:17",
      "anomaly": null
    },
    {
      "lat": 14.53608,
      "lng": 120.98756,
      "speed": 36.7,
      "time": "11:51:26",
      "anomaly": null
    },
    {
      "lat": 14.53605,
      "lng": 120.9874,
      "speed": 38.3,
      "time": "11:51:34",
      "anomaly": null
    },
    {
      "lat": 14.53587,
      "lng": 120.98659,
      "speed": 40.0,
      "time": "11:51:42",
      "anomaly": null
    },
    {
      "lat": 14.53572,
      "lng": 120.98589,
      "speed": 41.7,
      "time": "11:51:50",
      "anomaly": null
    },
    {
      "lat": 14.53564,
      "lng": 120.98553,
      "speed": 43.3,
      "time": "11:51:58",
      "anomaly": null
    },
    {
      "lat": 14.53552,
      "lng": 120.98504,
      "speed": 45.0,
      "time": "11:52:06",
      "anomaly": null
    },
    {
      "lat": 14.53552,
      "lng": 120.98495,
      "speed": 46.7,
      "time": "11:52:15",
      "anomaly": null
    },
    {
      "lat": 14.53553,
      "lng": 120.98488,
      "speed": 48.3,
      "time": "11:52:23",
      "anomaly": null
    },
    {
      "lat": 14.53555,
      "lng": 120.98484,
      "speed": 30.0,
      "time": "11:52:31",
      "anomaly": null
    },
    {
      "lat": 14.53559,
      "lng": 120.98479,
      "speed": 31.7,
      "time": "11:52:39",
      "anomaly": null
    },
    {
      "lat": 14.53562,
      "lng": 120.98476,
      "speed": 33.3,
      "time": "11:52:47",
      "anomaly": null
    },
    {
      "lat": 14.53565,
      "lng": 120.98474,
      "speed": 35.0,
      "time": "11:52:55",
      "anomaly": null
    },
    {
      "lat": 14.53569,
      "lng": 120.98469,
      "speed": 36.7,
      "time": "11:53:03",
      "anomaly": null
    },
    {
      "lat": 14.53573,
      "lng": 120.98463,
      "speed": 38.3,
      "time": "11:53:12",
      "anomaly": null
    },
    {
      "lat": 14.53577,
      "lng": 120.98457,
      "speed": 40.0,
      "time": "11:53:20",
      "anomaly": null
    },
    {
      "lat": 14.5358,
      "lng": 120.98451,
      "speed": 41.7,
      "time": "11:53:28",
      "anomaly": null
    },
    {
      "lat": 14.53582,
      "lng": 120.98444,
      "speed": 43.3,
      "time": "11:53:36",
      "anomaly": null
    },
    {
      "lat": 14.53589,
      "lng": 120.98436,
      "speed": 45.0,
      "time": "11:53:44",
      "anomaly": null
    },
    {
      "lat": 14.53595,
      "lng": 120.98431,
      "speed": 46.7,
      "time": "11:53:52",
      "anomaly": null
    },
    {
      "lat": 14.53603,
      "lng": 120.98428,
      "speed": 48.3,
      "time": "11:54:01",
      "anomaly": null
    },
    {
      "lat": 14.53657,
      "lng": 120.98424,
      "speed": 30.0,
      "time": "11:54:09",
      "anomaly": null
    },
    {
      "lat": 14.537,
      "lng": 120.9842,
      "speed": 31.7,
      "time": "11:54:17",
      "anomaly": null
    },
    {
      "lat": 14.53737,
      "lng": 120.98417,
      "speed": 33.3,
      "time": "11:54:25",
      "anomaly": null
    },
    {
      "lat": 14.53747,
      "lng": 120.98416,
      "speed": 35.0,
      "time": "11:54:33",
      "anomaly": null
    },
    {
      "lat": 14.53773,
      "lng": 120.98413,
      "speed": 36.7,
      "time": "11:54:41",
      "anomaly": null
    },
    {
      "lat": 14.5383,
      "lng": 120.98408,
      "speed": 38.3,
      "time": "11:54:50",
      "anomaly": null
    },
    {
      "lat": 14.53874,
      "lng": 120.98402,
      "speed": 40.0,
      "time": "11:54:58",
      "anomaly": null
    },
    {
      "lat": 14.53941,
      "lng": 120.98389,
      "speed": 41.7,
      "time": "11:55:06",
      "anomaly": null
    },
    {
      "lat": 14.53971,
      "lng": 120.98383,
      "speed": 43.3,
      "time": "11:55:14",
      "anomaly": null
    },
    {
      "lat": 14.54,
      "lng": 120.98376,
      "speed": 45.0,
      "time": "11:55:22",
      "anomaly": null
    },
    {
      "lat": 14.5401,
      "lng": 120.98373,
      "speed": 46.7,
      "time": "11:55:30",
      "anomaly": null
    },
    {
      "lat": 14.5401,
      "lng": 120.98355,
      "speed": 48.3,
      "time": "11:55:38",
      "anomaly": null
    },
    {
      "lat": 14.54009,
      "lng": 120.98343,
      "speed": 30.0,
      "time": "11:55:47",
      "anomaly": null
    },
    {
      "lat": 14.54009,
      "lng": 120.98334,
      "speed": 31.7,
      "time": "11:55:55",
      "anomaly": null
    },
    {
      "lat": 14.54008,
      "lng": 120.98316,
      "speed": 33.3,
      "time": "11:56:03",
      "anomaly": null
    },
    {
      "lat": 14.54008,
      "lng": 120.98313,
      "speed": 35.0,
      "time": "11:56:11",
      "anomaly": null
    },
    {
      "lat": 14.54008,
      "lng": 120.98304,
      "speed": 36.7,
      "time": "11:56:19",
      "anomaly": null
    },
    {
      "lat": 14.53999,
      "lng": 120.98304,
      "speed": 38.3,
      "time": "11:56:27",
      "anomaly": null
    },
    {
      "lat": 14.53963,
      "lng": 120.98305,
      "speed": 40.0,
      "time": "11:56:36",
      "anomaly": null
    },
    {
      "lat": 14.53881,
      "lng": 120.98307,
      "speed": 41.7,
      "time": "11:56:44",
      "anomaly": null
    },
    {
      "lat": 14.53872,
      "lng": 120.98308,
      "speed": 43.3,
      "time": "11:56:52",
      "anomaly": null
    },
    {
      "lat": 14.53862,
      "lng": 120.98308,
      "speed": 45.0,
      "time": "11:57:00",
      "anomaly": null
    },
    {
      "lat": 14.53861,
      "lng": 120.98308,
      "speed": 46.7,
      "time": "11:57:08",
      "anomaly": null
    },
    {
      "lat": 14.53852,
      "lng": 120.98309,
      "speed": 48.3,
      "time": "11:57:16",
      "anomaly": null
    },
    {
      "lat": 14.53835,
      "lng": 120.98309,
      "speed": 30.0,
      "time": "11:57:25",
      "anomaly": null
    },
    {
      "lat": 14.53775,
      "lng": 120.98311,
      "speed": 31.7,
      "time": "11:57:33",
      "anomaly": null
    },
    {
      "lat": 14.53756,
      "lng": 120.98312,
      "speed": 33.3,
      "time": "11:57:41",
      "anomaly": null
    },
    {
      "lat": 14.53748,
      "lng": 120.98312,
      "speed": 35.0,
      "time": "11:57:49",
      "anomaly": null
    },
    {
      "lat": 14.53744,
      "lng": 120.98312,
      "speed": 36.7,
      "time": "11:57:57",
      "anomaly": null
    },
    {
      "lat": 14.53733,
      "lng": 120.98313,
      "speed": 38.3,
      "time": "11:58:05",
      "anomaly": null
    },
    {
      "lat": 14.53723,
      "lng": 120.98313,
      "speed": 40.0,
      "time": "11:58:13",
      "anomaly": null
    },
    {
      "lat": 14.5371,
      "lng": 120.98313,
      "speed": 41.7,
      "time": "11:58:22",
      "anomaly": null
    },
    {
      "lat": 14.53699,
      "lng": 120.98314,
      "speed": 43.3,
      "time": "11:58:30",
      "anomaly": null
    },
    {
      "lat": 14.53695,
      "lng": 120.98314,
      "speed": 45.0,
      "time": "11:58:38",
      "anomaly": null
    },
    {
      "lat": 14.53661,
      "lng": 120.98315,
      "speed": 46.7,
      "time": "11:58:46",
      "anomaly": null
    },
    {
      "lat": 14.53655,
      "lng": 120.98315,
      "speed": 48.3,
      "time": "11:58:54",
      "anomaly": null
    },
    {
      "lat": 14.53624,
      "lng": 120.98316,
      "speed": 30.0,
      "time": "11:59:02",
      "anomaly": null
    },
    {
      "lat": 14.53551,
      "lng": 120.98319,
      "speed": 31.7,
      "time": "11:59:11",
      "anomaly": null
    },
    {
      "lat": 14.5355,
      "lng": 120.98319,
      "speed": 33.3,
      "time": "11:59:19",
      "anomaly": null
    },
    {
      "lat": 14.53546,
      "lng": 120.98314,
      "speed": 35.0,
      "time": "11:59:27",
      "anomaly": null
    },
    {
      "lat": 14.53545,
      "lng": 120.98313,
      "speed": 36.7,
      "time": "11:59:35",
      "anomaly": null
    },
    {
      "lat": 14.53543,
      "lng": 120.98312,
      "speed": 38.3,
      "time": "11:59:43",
      "anomaly": null
    },
    {
      "lat": 14.53541,
      "lng": 120.98312,
      "speed": 40.0,
      "time": "11:59:51",
      "anomaly": null
    },
    {
      "lat": 14.53531,
      "lng": 120.98312,
      "speed": 0.0,
      "time": "12:00:00",
      "anomaly": null
    }
  ],
  "c0000001-0000-0000-0000-000000000003": [
    {
      "lat": 14.64654,
      "lng": 121.05881,
      "speed": 0.0,
      "time": "11:20:00",
      "anomaly": null
    },
    {
      "lat": 14.64649,
      "lng": 121.05898,
      "speed": 31.7,
      "time": "11:20:05",
      "anomaly": null
    },
    {
      "lat": 14.64648,
      "lng": 121.05902,
      "speed": 33.3,
      "time": "11:20:10",
      "anomaly": null
    },
    {
      "lat": 14.64645,
      "lng": 121.05912,
      "speed": 35.0,
      "time": "11:20:16",
      "anomaly": null
    },
    {
      "lat": 14.64636,
      "lng": 121.05938,
      "speed": 36.7,
      "time": "11:20:21",
      "anomaly": null
    },
    {
      "lat": 14.64633,
      "lng": 121.05948,
      "speed": 38.3,
      "time": "11:20:27",
      "anomaly": null
    },
    {
      "lat": 14.64622,
      "lng": 121.05982,
      "speed": 40.0,
      "time": "11:20:32",
      "anomaly": null
    },
    {
      "lat": 14.6461,
      "lng": 121.06021,
      "speed": 41.7,
      "time": "11:20:38",
      "anomaly": null
    },
    {
      "lat": 14.64606,
      "lng": 121.06032,
      "speed": 43.3,
      "time": "11:20:43",
      "anomaly": null
    },
    {
      "lat": 14.64606,
      "lng": 121.06033,
      "speed": 45.0,
      "time": "11:20:49",
      "anomaly": null
    },
    {
      "lat": 14.64603,
      "lng": 121.0604,
      "speed": 46.7,
      "time": "11:20:54",
      "anomaly": null
    },
    {
      "lat": 14.64599,
      "lng": 121.06046,
      "speed": 48.3,
      "time": "11:21:00",
      "anomaly": null
    },
    {
      "lat": 14.64596,
      "lng": 121.06051,
      "speed": 30.0,
      "time": "11:21:05",
      "anomaly": null
    },
    {
      "lat": 14.64581,
      "lng": 121.06066,
      "speed": 31.7,
      "time": "11:21:11",
      "anomaly": null
    },
    {
      "lat": 14.64578,
      "lng": 121.06069,
      "speed": 33.3,
      "time": "11:21:16",
      "anomaly": null
    },
    {
      "lat": 14.64569,
      "lng": 121.06076,
      "speed": 35.0,
      "time": "11:21:22",
      "anomaly": null
    },
    {
      "lat": 14.64561,
      "lng": 121.06082,
      "speed": 36.7,
      "time": "11:21:27",
      "anomaly": null
    },
    {
      "lat": 14.6455,
      "lng": 121.06088,
      "speed": 38.3,
      "time": "11:21:33",
      "anomaly": null
    },
    {
      "lat": 14.6456,
      "lng": 121.06091,
      "speed": 40.0,
      "time": "11:21:38",
      "anomaly": null
    },
    {
      "lat": 14.64582,
      "lng": 121.0609,
      "speed": 41.7,
      "time": "11:21:44",
      "anomaly": null
    },
    {
      "lat": 14.64671,
      "lng": 121.06085,
      "speed": 43.3,
      "time": "11:21:49",
      "anomaly": null
    },
    {
      "lat": 14.64686,
      "lng": 121.06084,
      "speed": 45.0,
      "time": "11:21:55",
      "anomaly": null
    },
    {
      "lat": 14.64713,
      "lng": 121.06084,
      "speed": 46.7,
      "time": "11:22:00",
      "anomaly": null
    },
    {
      "lat": 14.64713,
      "lng": 121.06097,
      "speed": 48.3,
      "time": "11:22:06",
      "anomaly": null
    },
    {
      "lat": 14.64713,
      "lng": 121.06113,
      "speed": 30.0,
      "time": "11:22:11",
      "anomaly": null
    },
    {
      "lat": 14.64713,
      "lng": 121.06122,
      "speed": 31.7,
      "time": "11:22:17",
      "anomaly": null
    },
    {
      "lat": 14.64714,
      "lng": 121.06133,
      "speed": 33.3,
      "time": "11:22:22",
      "anomaly": null
    },
    {
      "lat": 14.64715,
      "lng": 121.06146,
      "speed": 35.0,
      "time": "11:22:28",
      "anomaly": null
    },
    {
      "lat": 14.64717,
      "lng": 121.0616,
      "speed": 36.7,
      "time": "11:22:33",
      "anomaly": null
    },
    {
      "lat": 14.64719,
      "lng": 121.06169,
      "speed": 38.3,
      "time": "11:22:39",
      "anomaly": null
    },
    {
      "lat": 14.64734,
      "lng": 121.06232,
      "speed": 40.0,
      "time": "11:22:44",
      "anomaly": null
    },
    {
      "lat": 14.64735,
      "lng": 121.06238,
      "speed": 41.7,
      "time": "11:22:50",
      "anomaly": null
    },
    {
      "lat": 14.64739,
      "lng": 121.06253,
      "speed": 43.3,
      "time": "11:22:55",
      "anomaly": null
    },
    {
      "lat": 14.6475,
      "lng": 121.06298,
      "speed": 45.0,
      "time": "11:23:01",
      "anomaly": null
    },
    {
      "lat": 14.64766,
      "lng": 121.06365,
      "speed": 46.7,
      "time": "11:23:06",
      "anomaly": null
    },
    {
      "lat": 14.64768,
      "lng": 121.06381,
      "speed": 48.3,
      "time": "11:23:12",
      "anomaly": null
    },
    {
      "lat": 14.64769,
      "lng": 121.06395,
      "speed": 30.0,
      "time": "11:23:17",
      "anomaly": null
    },
    {
      "lat": 14.6477,
      "lng": 121.06409,
      "speed": 31.7,
      "time": "11:23:23",
      "anomaly": null
    },
    {
      "lat": 14.6477,
      "lng": 121.06421,
      "speed": 33.3,
      "time": "11:23:28",
      "anomaly": null
    },
    {
      "lat": 14.64769,
      "lng": 121.06429,
      "speed": 35.0,
      "time": "11:23:34",
      "anomaly": null
    },
    {
      "lat": 14.64768,
      "lng": 121.06438,
      "speed": 36.7,
      "time": "11:23:39",
      "anomaly": null
    },
    {
      "lat": 14.64767,
      "lng": 121.06446,
      "speed": 38.3,
      "time": "11:23:45",
      "anomaly": null
    },
    {
      "lat": 14.64768,
      "lng": 121.06457,
      "speed": 40.0,
      "time": "11:23:50",
      "anomaly": null
    },
    {
      "lat": 14.64768,
      "lng": 121.06466,
      "speed": 41.7,
      "time": "11:23:56",
      "anomaly": null
    },
    {
      "lat": 14.64771,
      "lng": 121.06484,
      "speed": 43.3,
      "time": "11:24:01",
      "anomaly": null
    },
    {
      "lat": 14.64773,
      "lng": 121.06503,
      "speed": 45.0,
      "time": "11:24:07",
      "anomaly": null
    },
    {
      "lat": 14.64775,
      "lng": 121.06516,
      "speed": 46.7,
      "time": "11:24:12",
      "anomaly": null
    },
    {
      "lat": 14.64776,
      "lng": 121.06524,
      "speed": 48.3,
      "time": "11:24:18",
      "anomaly": null
    },
    {
      "lat": 14.64778,
      "lng": 121.06531,
      "speed": 30.0,
      "time": "11:24:23",
      "anomaly": null
    },
    {
      "lat": 14.6478,
      "lng": 121.06539,
      "speed": 31.7,
      "time": "11:24:29",
      "anomaly": null
    },
    {
      "lat": 14.64783,
      "lng": 121.06546,
      "speed": 33.3,
      "time": "11:24:34",
      "anomaly": null
    },
    {
      "lat": 14.64794,
      "lng": 121.06572,
      "speed": 35.0,
      "time": "11:24:39",
      "anomaly": null
    },
    {
      "lat": 14.64796,
      "lng": 121.06578,
      "speed": 36.7,
      "time": "11:24:45",
      "anomaly": null
    },
    {
      "lat": 14.64796,
      "lng": 121.06581,
      "speed": 38.3,
      "time": "11:24:50",
      "anomaly": null
    },
    {
      "lat": 14.64797,
      "lng": 121.06585,
      "speed": 40.0,
      "time": "11:24:56",
      "anomaly": null
    },
    {
      "lat": 14.64798,
      "lng": 121.06592,
      "speed": 41.7,
      "time": "11:25:01",
      "anomaly": null
    },
    {
      "lat": 14.64798,
      "lng": 121.06598,
      "speed": 43.3,
      "time": "11:25:07",
      "anomaly": null
    },
    {
      "lat": 14.64798,
      "lng": 121.06605,
      "speed": 45.0,
      "time": "11:25:12",
      "anomaly": null
    },
    {
      "lat": 14.64797,
      "lng": 121.06616,
      "speed": 46.7,
      "time": "11:25:18",
      "anomaly": null
    },
    {
      "lat": 14.64795,
      "lng": 121.06629,
      "speed": 48.3,
      "time": "11:25:23",
      "anomaly": null
    },
    {
      "lat": 14.6479,
      "lng": 121.06643,
      "speed": 30.0,
      "time": "11:25:29",
      "anomaly": null
    },
    {
      "lat": 14.64771,
      "lng": 121.0669,
      "speed": 31.7,
      "time": "11:25:34",
      "anomaly": null
    },
    {
      "lat": 14.64767,
      "lng": 121.06697,
      "speed": 33.3,
      "time": "11:25:40",
      "anomaly": null
    },
    {
      "lat": 14.64751,
      "lng": 121.06732,
      "speed": 35.0,
      "time": "11:25:45",
      "anomaly": null
    },
    {
      "lat": 14.64735,
      "lng": 121.06768,
      "speed": 36.7,
      "time": "11:25:51",
      "anomaly": null
    },
    {
      "lat": 14.64725,
      "lng": 121.06787,
      "speed": 38.3,
      "time": "11:25:56",
      "anomaly": null
    },
    {
      "lat": 14.64723,
      "lng": 121.06794,
      "speed": 40.0,
      "time": "11:26:02",
      "anomaly": null
    },
    {
      "lat": 14.64721,
      "lng": 121.06803,
      "speed": 41.7,
      "time": "11:26:07",
      "anomaly": null
    },
    {
      "lat": 14.64721,
      "lng": 121.06812,
      "speed": 43.3,
      "time": "11:26:13",
      "anomaly": null
    },
    {
      "lat": 14.64721,
      "lng": 121.06824,
      "speed": 45.0,
      "time": "11:26:18",
      "anomaly": null
    },
    {
      "lat": 14.6472,
      "lng": 121.06885,
      "speed": 46.7,
      "time": "11:26:24",
      "anomaly": null
    },
    {
      "lat": 14.6472,
      "lng": 121.06889,
      "speed": 48.3,
      "time": "11:26:29",
      "anomaly": null
    },
    {
      "lat": 14.6472,
      "lng": 121.06897,
      "speed": 30.0,
      "time": "11:26:35",
      "anomaly": null
    },
    {
      "lat": 14.6472,
      "lng": 121.06936,
      "speed": 31.7,
      "time": "11:26:40",
      "anomaly": null
    },
    {
      "lat": 14.64719,
      "lng": 121.06961,
      "speed": 33.3,
      "time": "11:26:46",
      "anomaly": null
    },
    {
      "lat": 14.6472,
      "lng": 121.06985,
      "speed": 35.0,
      "time": "11:26:51",
      "anomaly": null
    },
    {
      "lat": 14.64724,
      "lng": 121.07022,
      "speed": 36.7,
      "time": "11:26:57",
      "anomaly": null
    },
    {
      "lat": 14.64728,
      "lng": 121.07052,
      "speed": 38.3,
      "time": "11:27:02",
      "anomaly": null
    },
    {
      "lat": 14.6473,
      "lng": 121.07066,
      "speed": 40.0,
      "time": "11:27:08",
      "anomaly": null
    },
    {
      "lat": 14.64733,
      "lng": 121.07082,
      "speed": 41.7,
      "time": "11:27:13",
      "anomaly": null
    },
    {
      "lat": 14.64739,
      "lng": 121.07103,
      "speed": 43.3,
      "time": "11:27:19",
      "anomaly": null
    },
    {
      "lat": 14.64744,
      "lng": 121.07113,
      "speed": 45.0,
      "time": "11:27:24",
      "anomaly": null
    },
    {
      "lat": 14.64749,
      "lng": 121.07123,
      "speed": 46.7,
      "time": "11:27:30",
      "anomaly": null
    },
    {
      "lat": 14.64762,
      "lng": 121.07141,
      "speed": 48.3,
      "time": "11:27:35",
      "anomaly": null
    },
    {
      "lat": 14.64773,
      "lng": 121.07158,
      "speed": 30.0,
      "time": "11:27:41",
      "anomaly": null
    },
    {
      "lat": 14.64779,
      "lng": 121.07168,
      "speed": 31.7,
      "time": "11:27:46",
      "anomaly": null
    },
    {
      "lat": 14.64798,
      "lng": 121.07198,
      "speed": 33.3,
      "time": "11:27:52",
      "anomaly": null
    },
    {
      "lat": 14.64805,
      "lng": 121.0721,
      "speed": 35.0,
      "time": "11:27:57",
      "anomaly": null
    },
    {
      "lat": 14.64812,
      "lng": 121.07225,
      "speed": 36.7,
      "time": "11:28:03",
      "anomaly": null
    },
    {
      "lat": 14.64816,
      "lng": 121.07236,
      "speed": 38.3,
      "time": "11:28:08",
      "anomaly": null
    },
    {
      "lat": 14.64818,
      "lng": 121.07243,
      "speed": 40.0,
      "time": "11:28:14",
      "anomaly": null
    },
    {
      "lat": 14.64821,
      "lng": 121.07254,
      "speed": 41.7,
      "time": "11:28:19",
      "anomaly": null
    },
    {
      "lat": 14.64825,
      "lng": 121.07274,
      "speed": 43.3,
      "time": "11:28:25",
      "anomaly": null
    },
    {
      "lat": 14.64826,
      "lng": 121.07292,
      "speed": 45.0,
      "time": "11:28:30",
      "anomaly": null
    },
    {
      "lat": 14.64827,
      "lng": 121.07312,
      "speed": 46.7,
      "time": "11:28:36",
      "anomaly": null
    },
    {
      "lat": 14.64823,
      "lng": 121.07326,
      "speed": 48.3,
      "time": "11:28:41",
      "anomaly": null
    },
    {
      "lat": 14.64824,
      "lng": 121.07347,
      "speed": 30.0,
      "time": "11:28:47",
      "anomaly": null
    },
    {
      "lat": 14.64825,
      "lng": 121.07382,
      "speed": 31.7,
      "time": "11:28:52",
      "anomaly": null
    },
    {
      "lat": 14.64825,
      "lng": 121.07407,
      "speed": 33.3,
      "time": "11:28:58",
      "anomaly": null
    },
    {
      "lat": 14.64821,
      "lng": 121.07418,
      "speed": 35.0,
      "time": "11:29:03",
      "anomaly": null
    },
    {
      "lat": 14.64816,
      "lng": 121.07426,
      "speed": 36.7,
      "time": "11:29:09",
      "anomaly": null
    },
    {
      "lat": 14.64805,
      "lng": 121.0743,
      "speed": 38.3,
      "time": "11:29:14",
      "anomaly": null
    },
    {
      "lat": 14.64765,
      "lng": 121.0743,
      "speed": 40.0,
      "time": "11:29:19",
      "anomaly": null
    },
    {
      "lat": 14.64719,
      "lng": 121.07428,
      "speed": 41.7,
      "time": "11:29:25",
      "anomaly": null
    },
    {
      "lat": 14.64709,
      "lng": 121.07429,
      "speed": 43.3,
      "time": "11:29:30",
      "anomaly": null
    },
    {
      "lat": 14.64692,
      "lng": 121.07428,
      "speed": 45.0,
      "time": "11:29:36",
      "anomaly": null
    },
    {
      "lat": 14.6469,
      "lng": 121.07428,
      "speed": 46.7,
      "time": "11:29:41",
      "anomaly": null
    },
    {
      "lat": 14.64679,
      "lng": 121.07428,
      "speed": 48.3,
      "time": "11:29:47",
      "anomaly": null
    },
    {
      "lat": 14.6466,
      "lng": 121.07427,
      "speed": 30.0,
      "time": "11:29:52",
      "anomaly": null
    },
    {
      "lat": 14.64633,
      "lng": 121.0743,
      "speed": 31.7,
      "time": "11:29:58",
      "anomaly": null
    },
    {
      "lat": 14.64615,
      "lng": 121.07432,
      "speed": 33.3,
      "time": "11:30:03",
      "anomaly": null
    },
    {
      "lat": 14.6459,
      "lng": 121.07435,
      "speed": 35.0,
      "time": "11:30:09",
      "anomaly": null
    },
    {
      "lat": 14.64537,
      "lng": 121.07442,
      "speed": 36.7,
      "time": "11:30:14",
      "anomaly": null
    },
    {
      "lat": 14.64499,
      "lng": 121.07447,
      "speed": 38.3,
      "time": "11:30:20",
      "anomaly": null
    },
    {
      "lat": 14.64444,
      "lng": 121.07454,
      "speed": 40.0,
      "time": "11:30:25",
      "anomaly": null
    },
    {
      "lat": 14.64424,
      "lng": 121.07457,
      "speed": 41.7,
      "time": "11:30:31",
      "anomaly": null
    },
    {
      "lat": 14.64399,
      "lng": 121.0746,
      "speed": 43.3,
      "time": "11:30:36",
      "anomaly": null
    },
    {
      "lat": 14.64344,
      "lng": 121.07463,
      "speed": 45.0,
      "time": "11:30:42",
      "anomaly": null
    },
    {
      "lat": 14.6429,
      "lng": 121.07461,
      "speed": 46.7,
      "time": "11:30:47",
      "anomaly": null
    },
    {
      "lat": 14.64245,
      "lng": 121.07459,
      "speed": 48.3,
      "time": "11:30:53",
      "anomaly": null
    },
    {
      "lat": 14.64224,
      "lng": 121.07458,
      "speed": 30.0,
      "time": "11:30:58",
      "anomaly": null
    },
    {
      "lat": 14.64171,
      "lng": 121.07456,
      "speed": 31.7,
      "time": "11:31:04",
      "anomaly": null
    },
    {
      "lat": 14.64161,
      "lng": 121.07456,
      "speed": 33.3,
      "time": "11:31:09",
      "anomaly": null
    },
    {
      "lat": 14.64156,
      "lng": 121.07455,
      "speed": 35.0,
      "time": "11:31:15",
      "anomaly": null
    },
    {
      "lat": 14.64142,
      "lng": 121.07455,
      "speed": 36.7,
      "time": "11:31:20",
      "anomaly": null
    },
    {
      "lat": 14.64119,
      "lng": 121.07454,
      "speed": 38.3,
      "time": "11:31:26",
      "anomaly": null
    },
    {
      "lat": 14.64097,
      "lng": 121.07453,
      "speed": 40.0,
      "time": "11:31:31",
      "anomaly": null
    },
    {
      "lat": 14.64076,
      "lng": 121.07452,
      "speed": 41.7,
      "time": "11:31:37",
      "anomaly": null
    },
    {
      "lat": 14.64054,
      "lng": 121.07451,
      "speed": 43.3,
      "time": "11:31:42",
      "anomaly": null
    },
    {
      "lat": 14.64053,
      "lng": 121.07465,
      "speed": 45.0,
      "time": "11:31:48",
      "anomaly": null
    },
    {
      "lat": 14.64053,
      "lng": 121.07469,
      "speed": 46.7,
      "time": "11:31:53",
      "anomaly": null
    },
    {
      "lat": 14.64053,
      "lng": 121.07476,
      "speed": 48.3,
      "time": "11:31:59",
      "anomaly": null
    },
    {
      "lat": 14.64053,
      "lng": 121.07479,
      "speed": 30.0,
      "time": "11:32:04",
      "anomaly": null
    },
    {
      "lat": 14.64052,
      "lng": 121.07501,
      "speed": 31.7,
      "time": "11:32:10",
      "anomaly": null
    },
    {
      "lat": 14.64052,
      "lng": 121.07525,
      "speed": 33.3,
      "time": "11:32:15",
      "anomaly": null
    },
    {
      "lat": 14.64053,
      "lng": 121.07538,
      "speed": 35.0,
      "time": "11:32:21",
      "anomaly": null
    },
    {
      "lat": 14.64055,
      "lng": 121.07547,
      "speed": 36.7,
      "time": "11:32:26",
      "anomaly": null
    },
    {
      "lat": 14.64061,
      "lng": 121.07562,
      "speed": 38.3,
      "time": "11:32:32",
      "anomaly": null
    },
    {
      "lat": 14.64064,
      "lng": 121.07569,
      "speed": 40.0,
      "time": "11:32:37",
      "anomaly": null
    },
    {
      "lat": 14.64076,
      "lng": 121.0759,
      "speed": 41.7,
      "time": "11:32:43",
      "anomaly": null
    },
    {
      "lat": 14.6409,
      "lng": 121.07614,
      "speed": 43.3,
      "time": "11:32:48",
      "anomaly": null
    },
    {
      "lat": 14.64093,
      "lng": 121.07619,
      "speed": 45.0,
      "time": "11:32:54",
      "anomaly": null
    },
    {
      "lat": 14.64105,
      "lng": 121.0764,
      "speed": 46.7,
      "time": "11:32:59",
      "anomaly": null
    },
    {
      "lat": 14.6411,
      "lng": 121.07655,
      "speed": 48.3,
      "time": "11:33:05",
      "anomaly": null
    },
    {
      "lat": 14.64111,
      "lng": 121.07671,
      "speed": 30.0,
      "time": "11:33:10",
      "anomaly": null
    },
    {
      "lat": 14.64108,
      "lng": 121.0769,
      "speed": 31.7,
      "time": "11:33:16",
      "anomaly": null
    },
    {
      "lat": 14.64101,
      "lng": 121.07709,
      "speed": 33.3,
      "time": "11:33:21",
      "anomaly": null
    },
    {
      "lat": 14.641,
      "lng": 121.07713,
      "speed": 35.0,
      "time": "11:33:27",
      "anomaly": null
    },
    {
      "lat": 14.6405,
      "lng": 121.07809,
      "speed": 36.7,
      "time": "11:33:32",
      "anomaly": null
    },
    {
      "lat": 14.64045,
      "lng": 121.07809,
      "speed": 38.3,
      "time": "11:33:38",
      "anomaly": null
    },
    {
      "lat": 14.64039,
      "lng": 121.07809,
      "speed": 40.0,
      "time": "11:33:43",
      "anomaly": null
    },
    {
      "lat": 14.64033,
      "lng": 121.07813,
      "speed": 41.7,
      "time": "11:33:49",
      "anomaly": null
    },
    {
      "lat": 14.64028,
      "lng": 121.07817,
      "speed": 43.3,
      "time": "11:33:54",
      "anomaly": null
    },
    {
      "lat": 14.64028,
      "lng": 121.07817,
      "speed": 0.0,
      "time": "11:34:00",
      "anomaly": null
    }
  ]
},
  "feedback": [
    {
      "id": "fb-007",
      "booking_code": "TNVS-2026-0097",
      "passenger": "Roselle Tan",
      "rating": 1,
      "comment": "Driver was rude and reckless on the highway. Harassed me about paying cash instead of Maya.",
      "sentiment": "Critical",
      "score": -0.92,
      "category": "Driver Conduct",
      "date": "2026-09-21"
    },
    {
      "id": "fb-005",
      "booking_code": "TNVS-2026-0095",
      "passenger": "Bea Alonzo",
      "rating": 5,
      "comment": "Excellent and fast pickup! Driver greeted warmly and vehicle was clean, quiet, and very comfortable.",
      "sentiment": "Positive",
      "score": 0.96,
      "category": "Vehicle Condition & Cleanliness",
      "date": "2026-09-19"
    },
    {
      "id": "fb-006",
      "booking_code": "TNVS-2026-0096",
      "passenger": "Carlos Mendoza",
      "rating": 4,
      "comment": "Great smooth ride along EDSA. Aircon was cold and arrival was punctual.",
      "sentiment": "Positive",
      "score": 0.82,
      "category": "Driver Conduct",
      "date": "2026-09-12"
    },
    {
      "id": "fb-008",
      "booking_code": "TNVS-2026-0098",
      "passenger": "Gabriel Ramos",
      "rating": 3,
      "comment": "Acceptable travel time, but driver missed the initial u-turn slot in Makati CBD.",
      "sentiment": "Neutral",
      "score": -0.05,
      "category": "Safety & Route Navigation",
      "date": "2026-09-08"
    },
    {
      "id": "fb-004",
      "booking_code": "TNVS-2026-0094",
      "passenger": "Angelo Diaz",
      "rating": 2,
      "comment": "Driver took a longer route without notice. Aircon was warm and radio was loud.",
      "sentiment": "Negative",
      "score": -0.58,
      "category": "Driver Conduct",
      "date": "2026-09-02"
    },
    {
      "id": "fb-003",
      "booking_code": "TNVS-2026-0093",
      "passenger": "Patricia Reyes",
      "rating": 3,
      "comment": "The ride was okay but dynamic fare surge multiplier was slightly higher than expected.",
      "sentiment": "Neutral",
      "score": 0.10,
      "category": "Fare & Billing Dispute",
      "date": "2026-08-25"
    },
    {
      "id": "fb-001",
      "booking_code": "TNVS-2026-0091",
      "passenger": "Juan Dela Cruz",
      "rating": 5,
      "comment": "Kuya Ricardo was very polite, smooth ride, and the car smelled great! Fair surge pricing.",
      "sentiment": "Positive",
      "score": 0.94,
      "category": "Driver Attitude & Cleanliness",
      "date": "2026-08-20"
    },
    {
      "id": "fb-002",
      "booking_code": "TNVS-2026-0092",
      "passenger": "Maria Santos",
      "rating": 4,
      "comment": "Driver was careful during heavy rain. Took a slight detour due to flood but informed me beforehand.",
      "sentiment": "Positive",
      "score": 0.78,
      "category": "Route & Safety",
      "date": "2026-08-20"
    }
  ],
  "support_tickets": [
    {
      "id": "TCK-2026-0044",
      "user": "Maria Santos",
      "subject": "Dispute over GCash cashback voucher",
      "category": "Billing & Fare",
      "priority": "Medium",
      "status": "Resolved",
      "date": "2026-08-20"
    },
    {
      "id": "TCK-2026-0045",
      "user": "Juan Dela Cruz",
      "subject": "Request for monthly business expense invoice",
      "category": "Corporate Account",
      "priority": "Low",
      "status": "Open",
      "date": "2026-08-20"
    }
  ],
  "audit_logs": []
};

const SupabaseBridge = {
    config: {
        supabaseUrl: "https://your-project.supabase.co",
        supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key",
        useCloud: false
    },

    db: JSON.parse(JSON.stringify(DEFAULT_INITIAL_DATA)),

    generateAuditHash(id, timestamp, event, entity) {
        // Deterministic cryptographic-style SHA-256 simulation
        const str = `${id}|${timestamp}|${event}|${entity}|HIRNA-SYSLOG-2026-RFC5424`;
        let hash1 = 0xdeadbeef ^ 0;
        let hash2 = 0x41c6ce57 ^ 0;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            hash1 = Math.imul(hash1 ^ ch, 2654435761);
            hash2 = Math.imul(hash2 ^ ch, 1597334677);
        }
        hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
        hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
        const p1 = (hash1 >>> 0).toString(16).padStart(8, '0');
        const p2 = (hash2 >>> 0).toString(16).padStart(8, '0');
        const p3 = Math.abs(hash1 ^ hash2).toString(16).padStart(8, '0');
        const p4 = (Math.imul(hash2, 31) >>> 0).toString(16).padStart(8, '0');
        return `e3b0${p1}${p2}${p3}${p4}`.padEnd(64, 'a').substring(0, 64);
    },

    getBaselineAuditLogs() {
        return [
            {
                id: "AUD-9010",
                module: "Payment Gateway",
                event: "PAYMENT_CONFIRMED",
                entity: "INV-2026-00091",
                user: "juan.delacruz@example.com",
                ip: "120.28.17.44",
                status: "SUCCESS",
                timestamp: "2026-09-23 10:45:12",
                details: "Amount: ₱237.60 | Channel: GCash | Invoice: INV-2026-00091 | Status: SETTLED",
                payload: {
                    invoice_no: "INV-2026-00091",
                    txn_ref: "TXN-GCASH-998812",
                    amount: 237.60,
                    base_fare: 45.00,
                    distance_fare: 130.00,
                    time_fare: 35.00,
                    surge_multiplier: 1.35,
                    vat_amount: 28.51,
                    channel: "GCash",
                    payment_status: "SETTLED",
                    settled_at: "2026-09-23 10:45:12",
                    customer: "Juan Dela Cruz (juan.delacruz@example.com)"
                },
                syslog_hash: this.generateAuditHash("AUD-9010", "2026-09-23 10:45:12", "PAYMENT_CONFIRMED", "INV-2026-00091")
            },
            {
                id: "AUD-9009",
                module: "Booking System",
                event: "TRIP_COMPLETED",
                entity: "HIRNA-994120",
                user: "juan.delacruz@example.com",
                ip: "120.28.17.44",
                status: "SUCCESS",
                timestamp: "2026-09-23 10:42:05",
                details: "Trip Completed: Ayala Malls Circuit -> Bonifacio High Street, BGC | Driver: Ricardo Dalisay (TXI-5431)",
                payload: {
                    booking_code: "HIRNA-994120",
                    service_type: "transport",
                    vehicle_class: "Sedan (4-Seater)",
                    pickup: "Ayala Malls Circuit, Makati City",
                    dropoff: "Bonifacio High Street, BGC, Taguig",
                    driver_name: "Ricardo Dalisay",
                    driver_plate: "TXI-5431",
                    passenger_name: "Juan Dela Cruz",
                    distance: "6.4 km",
                    duration: "24 mins",
                    total_fare: 237.60
                },
                syslog_hash: this.generateAuditHash("AUD-9009", "2026-09-23 10:42:05", "TRIP_COMPLETED", "HIRNA-994120")
            },
            {
                id: "AUD-9008",
                module: "BPA Integration",
                event: "TEAM5_GL_SYNC",
                entity: "TXN-GCASH-998812",
                user: "SYSTEM_DAEMON",
                ip: "127.0.0.1",
                status: "SUCCESS",
                timestamp: "2026-09-23 10:45:14",
                details: "Auto-transmitted revenue record to Team 5 Accounts Receivable & General Ledger",
                payload: {
                    target_subsystem: "Team 5 Financial & General Ledger",
                    action: "RECORD_FARE_COLLECTION",
                    invoice: "INV-2026-00091",
                    gross_revenue: 237.60,
                    driver_payout: 190.08,
                    platform_commission: 47.52,
                    tax_withheld: 28.51,
                    api_status: "200_OK_VERIFIED"
                },
                syslog_hash: this.generateAuditHash("AUD-9008", "2026-09-23 10:45:14", "TEAM5_GL_SYNC", "TXN-GCASH-998812")
            },
            {
                id: "AUD-9007",
                module: "SOP Compliance",
                event: "DRIVER_PRE_TRIP_INSPECTION",
                entity: "N01-19-123456",
                user: "Safety_Auditor",
                ip: "127.0.0.1",
                status: "SUCCESS",
                timestamp: "2026-09-23 09:30:00",
                details: "Driver SOP Inspection Passed: Ricardo Dalisay | License: N01-19-123456 (Valid 2028) | Compliance: 100%",
                payload: {
                    driver: "Ricardo Dalisay",
                    license_no: "N01-19-123456",
                    license_status: "VALID_UNTIL_2028",
                    ltfrb_franchise: "ACTIVE_VERIFIED_LTFRB-2026-TXI-041",
                    vehicle_plate: "NFD-8892",
                    checklist: {
                        brakes_and_tires: "PASSED",
                        dashcam_telemetry: "PASSED",
                        headlights_and_signals: "PASSED",
                        first_aid_kit: "PASSED",
                        seatbelts_and_airbags: "PASSED"
                    },
                    compliance_score: "100%",
                    auditor: "Engr. Ramon Bautista (Chief Safety Inspector)"
                },
                syslog_hash: this.generateAuditHash("AUD-9007", "2026-09-23 09:30:00", "DRIVER_PRE_TRIP_INSPECTION", "N01-19-123456")
            },
            {
                id: "AUD-9006",
                module: "Demand Analytics",
                event: "SURGE_PRICING_UPDATED",
                entity: "ZONE-MAKATI-CBD",
                user: "AI_SURGE_ENGINE",
                ip: "127.0.0.1",
                status: "SUCCESS",
                timestamp: "2026-09-23 09:15:22",
                details: "Dynamic AI Surge updated: 1.0x -> 1.35x across Makati CBD due to morning rush demand (89 active ride requests)",
                payload: {
                    zone: "Makati Central Business District",
                    multiplier_before: 1.00,
                    multiplier_after: 1.35,
                    active_requests: 89,
                    available_drivers: 64,
                    demand_ratio: "1.39x",
                    weather_condition: "Scattered Rain Showers",
                    applied_policy: "LTFRB Fare Matrix Dynamic Surge Cap 2.0x"
                },
                syslog_hash: this.generateAuditHash("AUD-9006", "2026-09-23 09:15:22", "SURGE_PRICING_UPDATED", "ZONE-MAKATI-CBD")
            },
            {
                id: "AUD-9005",
                module: "Authentication",
                event: "ADMIN_LOGIN_SUCCESS",
                entity: "SES-2026-9811",
                user: "superadmin@hirna.ph",
                ip: "120.28.17.44",
                status: "SUCCESS",
                timestamp: "2026-09-23 08:30:15",
                details: "Admin session authenticated via Google 2FA OTP for superadmin@hirna.ph (Role: Superadmin)",
                payload: {
                    operator: "Engr. Hirna Admin",
                    email: "superadmin@hirna.ph",
                    auth_method: "2FA_GMAIL_OTP_VERIFIED",
                    role: "Superadmin",
                    session_token: "jwt_sess_20260923_a9b8c7",
                    permissions: ["FULL_SYSTEM_ACCESS", "FINANCE_LEDGER", "DISPATCH_OVERRIDE", "AUDIT_VIEW_PRINT"]
                },
                syslog_hash: this.generateAuditHash("AUD-9005", "2026-09-23 08:30:15", "ADMIN_LOGIN_SUCCESS", "SES-2026-9811")
            },
            {
                id: "AUD-9004",
                module: "SSO Gateway",
                event: "ACCOUNT_ROLE_CONFIGURED",
                entity: "ROLE-FINANCE-AUDITOR",
                user: "superadmin@hirna.ph",
                ip: "120.28.17.44",
                status: "SUCCESS",
                timestamp: "2026-09-23 08:12:40",
                details: "RBAC security role updated for auditor@hirna.ph to Finance & Compliance Auditor",
                payload: {
                    target_account: "auditor@hirna.ph",
                    assigned_role: "Finance & Compliance Auditor",
                    clearance_level: "Tier 3 - Full Audit Access",
                    subsystems_permitted: ["audit", "payments", "crm", "analytics"],
                    approved_by: "superadmin@hirna.ph"
                },
                syslog_hash: this.generateAuditHash("AUD-9004", "2026-09-23 08:12:40", "ACCOUNT_ROLE_CONFIGURED", "ROLE-FINANCE-AUDITOR")
            },
            {
                id: "AUD-9003",
                module: "CRM & Retention",
                event: "SUPPORT_TICKET_CREATED",
                entity: "TCK-2026-0045",
                user: "juan.delacruz@example.com",
                ip: "120.28.17.44",
                status: "SUCCESS",
                timestamp: "2026-09-23 08:05:11",
                details: "Corporate Passenger Ticket logged: Request for monthly business expense invoice",
                payload: {
                    ticket_id: "TCK-2026-0045",
                    passenger: "Juan Dela Cruz",
                    subject: "Request for monthly business expense invoice",
                    category: "Corporate Account",
                    priority: "Low",
                    status: "Open",
                    assigned_desk: "Billing & Enterprise Retention"
                },
                syslog_hash: this.generateAuditHash("AUD-9003", "2026-09-23 08:05:11", "SUPPORT_TICKET_CREATED", "TCK-2026-0045")
            },
            {
                id: "AUD-9002",
                module: "GPS & Telemetry",
                event: "GEOFENCE_VERIFIED",
                entity: "GEO-BGC-ZONE1",
                user: "TELEMETRY_ENGINE",
                ip: "127.0.0.1",
                status: "SUCCESS",
                timestamp: "2026-09-23 07:55:00",
                details: "Fleet vehicle TXI-5431 entered BGC Commercial Zone Boundary (Lat: 14.5517, Lng: 121.0509)",
                payload: {
                    vehicle_plate: "TXI-5431",
                    driver: "Ricardo Dalisay",
                    speed_kmh: 42.5,
                    geofence_zone: "BGC Commercial Core",
                    safety_status: "NORMAL_ROUTE_COMPLIANT",
                    coordinates: { lat: 14.5517, lng: 121.0509 }
                },
                syslog_hash: this.generateAuditHash("AUD-9002", "2026-09-23 07:55:00", "GEOFENCE_VERIFIED", "GEO-BGC-ZONE1")
            },
            {
                id: "AUD-9001",
                module: "Database",
                event: "SYSTEM_INITIALIZED",
                entity: "SYS-CORE",
                user: "SYSTEM_ROOT",
                ip: "127.0.0.1",
                status: "SUCCESS",
                timestamp: "2026-09-23 07:00:00",
                details: "Hirna TNVS Subsystem Core initialized. All database entities, audit pipelines & cryptographic keys active.",
                payload: {
                    version: "2026.09.23-PROD-RC1",
                    environment: "Production High-Availability Node",
                    rfc5424_syslog_compliance: "VERIFIED",
                    tables_mounted: ["users", "drivers", "bookings", "vehicles", "tickets", "audit_logs"]
                },
                syslog_hash: this.generateAuditHash("AUD-9001", "2026-09-23 07:00:00", "SYSTEM_INITIALIZED", "SYS-CORE")
            }
        ];
    },

    loadPersistedAuditLogs() {
        try {
            const saved = localStorage.getItem('hirna_audit_logs');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.db.audit_logs = parsed;
                    return;
                }
            }
        } catch (e) {
            console.warn("Failed loading saved audit logs", e);
        }

        // Initialize comprehensive baseline audit logs if none exist
        if (!this.db.audit_logs || this.db.audit_logs.length < 5) {
            this.db.audit_logs = this.getBaselineAuditLogs();
            try {
                localStorage.setItem('hirna_audit_logs', JSON.stringify(this.db.audit_logs));
            } catch (e) {}
        }
    },

    getApiBase() {
        if (typeof window !== 'undefined' && window.location) {
            if (window.location.protocol === 'file:') {
                return window._hirnaApiBase || 'http://127.0.0.1:8000';
            }
            if (window.location.origin && window.location.origin !== 'null') {
                return window.location.origin;
            }
        }
        return '';
    },

    async init() {
        let apiBase = this.getApiBase();
        // 1. First fetch central server database (/api/db or database/data.json)
        try {
            let res = await fetch(`${apiBase}/api/db`, { cache: 'no-store' }).catch(() => null);
            if (!res || !res.ok) {
                if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
                    const fallbackPorts = ['http://127.0.0.1:8001', 'http://127.0.0.1:8002', 'http://127.0.0.1:8080'];
                    for (const fallback of fallbackPorts) {
                        res = await fetch(`${fallback}/api/db`, { cache: 'no-store' }).catch(() => null);
                        if (res && res.ok) {
                            window._hirnaApiBase = fallback;
                            apiBase = fallback;
                            break;
                        }
                    }
                }
            }
            if (!res || !res.ok) {
                res = await fetch('database/data.json', { cache: 'no-store' }).catch(() => null);
            }
            if (!res || !res.ok) {
                res = await fetch('../database/data.json', { cache: 'no-store' }).catch(() => null);
            }
            if (res && res.ok) {
                const serverDb = await res.json();
                if (serverDb && typeof serverDb === 'object') {
                    if (!this.db) this.db = {};
                    // Merge tables from central server
                    Object.keys(serverDb).forEach(tbl => {
                        if (Array.isArray(serverDb[tbl])) {
                            this.mergeTableRecords(tbl, serverDb[tbl]);
                        }
                    });
                    console.log("[SupabaseBridge] Synced with central cloud/server database.");
                }
            } else {
                console.log("[SupabaseBridge] Using embedded in-memory database.");
            }
        } catch (e) {
            console.log("[SupabaseBridge] Using embedded in-memory database.");
        }

        // 2. Load persisted local tables and merge them
        this.loadPersistedAuditLogs();
        const tables = ['bookings', 'feedback', 'support_tickets', 'payments', 'users', 'drivers', 'vehicles'];
        tables.forEach(t => this.loadPersistedData(t));

        // 3. Sync local data up to central database so any offline/previous records are universally shared
        this.syncAllToRemote();

        // 4. Setup periodic poll for fresh data from other devices (every 3s)
        if (!this._pollTimer) {
            this._pollTimer = setInterval(() => {
                this.pollRemoteUpdates();
            }, 3000);
        }
    },

    mergeTableRecords(table, newRecords) {
        if (!this.db) this.db = {};
        if (!this.db[table]) this.db[table] = [];
        if (!Array.isArray(newRecords)) return false;

        let changed = false;
        const getKey = (r) => {
            if (!r || typeof r !== 'object') return null;
            return r.booking_code || r.id || r.ticket_id || r.invoice_no || r.txn_ref || null;
        };

        const existingMap = new Map();
        this.db[table].forEach((item, idx) => {
            const k = getKey(item);
            if (k) existingMap.set(String(k), idx);
        });

        const toPrepend = [];
        newRecords.forEach(r => {
            if (!r || typeof r !== 'object') return;
            const k = getKey(r);
            if (k && existingMap.has(String(k))) {
                const idx = existingMap.get(String(k));
                const current = this.db[table][idx];

                const isCurrentArchived = !!current.is_archived;
                const isNewArchived = (r.is_archived !== undefined) ? !!r.is_archived : isCurrentArchived;

                let recordChanged = false;
                for (const prop of Object.keys(r)) {
                    if (r[prop] !== current[prop]) {
                        recordChanged = true;
                        break;
                    }
                }
                if (isCurrentArchived !== isNewArchived) {
                    recordChanged = true;
                }

                if (recordChanged) {
                    this.db[table][idx] = { ...current, ...r };
                    if (isCurrentArchived && r.is_archived === undefined) {
                        this.db[table][idx].is_archived = true;
                    }
                    changed = true;
                }
            } else {
                toPrepend.push(r);
                if (k) existingMap.set(String(k), -1);
                changed = true;
            }
        });

        if (toPrepend.length > 0) {
            this.db[table] = [...toPrepend, ...this.db[table]];
        }

        if (changed) {
            try {
                if (table === 'audit_logs') {
                    localStorage.setItem('hirna_audit_logs', JSON.stringify(this.db.audit_logs));
                } else {
                    localStorage.setItem(`hirna_db_${table}`, JSON.stringify(this.db[table]));
                }
            } catch(e) {}
        }
        return changed;
    },

    async pollRemoteUpdates() {
        try {
            const apiBase = this.getApiBase();
            const res = await fetch(`${apiBase}/api/db`, { cache: 'no-store' }).catch(() => null);
            if (res && res.ok) {
                const remoteDb = await res.json();
                if (remoteDb && typeof remoteDb === 'object') {
                    let hasChanged = false;
                    ['bookings', 'payments', 'support_tickets', 'feedback', 'audit_logs'].forEach(tbl => {
                        if (Array.isArray(remoteDb[tbl])) {
                            const changed = this.mergeTableRecords(tbl, remoteDb[tbl]);
                            if (changed) {
                                hasChanged = true;
                                this.refreshActiveModules(tbl);
                            }
                        }
                    });
                    if (hasChanged) {
                        try {
                            window.dispatchEvent(new CustomEvent('hirna:db_updated', { detail: { action: 'remote_sync' } }));
                        } catch(e) {}
                    }
                }
            }
        } catch (e) {}
    },

    async syncAllToRemote() {
        if (!this.db) return;
        try {
            const apiBase = this.getApiBase();
            await fetch(`${apiBase}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sync_all',
                    data: this.db
                })
            }).catch(() => null);
        } catch(e) {}
    },

    savePersistedData(table) {
        if (!this.db || !this.db[table]) return;
        try {
            localStorage.setItem(`hirna_db_${table}`, JSON.stringify(this.db[table]));
            if (this.channel) {
                try {
                    this.channel.postMessage({ type: 'DB_UPDATE', table: table });
                } catch(e) {}
            }
        } catch (e) {
            console.warn(`Could not persist ${table} to localStorage:`, e);
        }

        // Push update to central server so all other devices see it
        try {
            const apiBase = this.getApiBase();
            fetch(`${apiBase}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'sync_all',
                    data: { [table]: this.db[table] }
                })
            }).catch(() => null);
        } catch(e) {}
    },

    loadPersistedData(table) {
        try {
            const saved = localStorage.getItem(`hirna_db_${table}`);
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.mergeTableRecords(table, parsed);
                }
            }
        } catch (e) {
            console.warn(`Could not load ${table} from localStorage:`, e);
        }
    },

    getData(table, includeArchived = false) {
        if (table === 'audit_logs') {
            if (!this.db || !this.db.audit_logs || this.db.audit_logs.length === 0) {
                this.loadPersistedAuditLogs();
            }
            return this.db.audit_logs || [];
        }
        if (!this.db) this.db = {};
        if (this.db[table] === undefined) {
            this.loadPersistedData(table);
        }
        const list = this.db[table] || [];
        if (!includeArchived) {
            return list.filter(item => !item.is_archived);
        }
        return list;
    },

    archive(table, idOrBookingCode, reason = "Archived by user") {
        if (!this.db || !this.db[table]) {
            this.loadPersistedData(table);
        }
        if (!this.db || !this.db[table]) return false;
        const idStr = String(idOrBookingCode);
        const item = this.db[table].find(i => 
            (i.id && String(i.id) === idStr) ||
            (i.booking_code && String(i.booking_code) === idStr) ||
            (i.ticket_id && String(i.ticket_id) === idStr) ||
            (i.invoice_no && String(i.invoice_no) === idStr)
        );
        if (!item) return false;

        const userEmail = (typeof AuthModule !== 'undefined' && AuthModule.currentUser && AuthModule.currentUser.email)
            ? AuthModule.currentUser.email
            : "superadmin@hirna.ph";

        item.is_archived = true;
        item.archived_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        item.archived_by = userEmail;
        item.archive_reason = reason;
        item._table = table;

        this.savePersistedData(table);

        // Send explicit archive action to central database
        try {
            const apiBase = this.getApiBase();
            fetch(`${apiBase}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: table,
                    action: 'archive',
                    id: idStr,
                    reason: reason,
                    user: userEmail,
                    timestamp: item.archived_at
                })
            }).catch(() => null);
        } catch(e) {}

        this.logAudit("Compliance & Archival", "RECORD_ARCHIVED", idStr, userEmail, {
            table: table,
            archived_id: idStr,
            reason: reason
        });

        try {
            window.dispatchEvent(new CustomEvent('hirna:db_updated', { detail: { table, action: 'archive', id: idStr } }));
        } catch(e) {}

        if (this.channel) {
            try {
                this.channel.postMessage({ type: 'DB_UPDATE', table: table, action: 'archive', id: idStr });
            } catch(e) {}
        }

        this.refreshActiveModules(table);
        return true;
    },

    unarchive(table, idOrBookingCode) {
        if (!this.db || !this.db[table]) {
            this.loadPersistedData(table);
        }
        if (!this.db || !this.db[table]) return false;
        const idStr = String(idOrBookingCode);
        const item = this.db[table].find(i => 
            (i.id && String(i.id) === idStr) ||
            (i.booking_code && String(i.booking_code) === idStr) ||
            (i.ticket_id && String(i.ticket_id) === idStr) ||
            (i.invoice_no && String(i.invoice_no) === idStr)
        );
        if (!item) return false;

        const userEmail = (typeof AuthModule !== 'undefined' && AuthModule.currentUser && AuthModule.currentUser.email)
            ? AuthModule.currentUser.email
            : "superadmin@hirna.ph";

        item.is_archived = false;
        delete item.archived_at;
        delete item.archived_by;
        delete item.archive_reason;

        this.savePersistedData(table);

        // Send explicit unarchive action to central database
        try {
            const apiBase = this.getApiBase();
            fetch(`${apiBase}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: table,
                    action: 'unarchive',
                    id: idStr
                })
            }).catch(() => null);
        } catch(e) {}

        this.logAudit("Compliance & Archival", "RECORD_RESTORED", idStr, userEmail, {
            table: table,
            restored_id: idStr,
            restored_from_archive: true
        });

        try {
            window.dispatchEvent(new CustomEvent('hirna:db_updated', { detail: { table, action: 'unarchive', id: idStr } }));
        } catch(e) {}

        if (this.channel) {
            try {
                this.channel.postMessage({ type: 'DB_UPDATE', table: table, action: 'unarchive', id: idStr });
            } catch(e) {}
        }

        this.refreshActiveModules(table);
        return true;
    },

    delete(table, idOrBookingCode) {
        // Replacement: Permanent deletion requests are safely preserved in regulatory archives
        return this.archive(table, idOrBookingCode, "Archived via deletion request");
    },

    getAllArchives(filterTable = null) {
        const knownTables = ['bookings', 'payments', 'support_tickets', 'feedback', 'users', 'drivers'];
        const tablesToScan = (filterTable && filterTable !== 'ALL') ? [filterTable] : knownTables;
        const archives = [];

        tablesToScan.forEach(tbl => {
            if (!this.db || this.db[tbl] === undefined) {
                this.loadPersistedData(tbl);
            }
            const records = this.db[tbl] || [];
            records.forEach(item => {
                if (item && item.is_archived) {
                    const idDisplay = item.id || item.booking_code || item.ticket_id || item.invoice_no || 'REC-UNKNOWN';
                    archives.push({
                        ...item,
                        _table: tbl,
                        _displayId: idDisplay
                    });
                }
            });
        });

        archives.sort((a, b) => new Date(b.archived_at || 0) - new Date(a.archived_at || 0));
        return archives;
    },

    refreshActiveModules(table) {
        try {
            if (table === 'bookings' || table === 'payments') {
                if (typeof PaymentsModule !== 'undefined' && PaymentsModule.renderLedger) PaymentsModule.renderLedger();
                if (typeof BookingModule !== 'undefined' && BookingModule.renderRecentPlaces) BookingModule.renderRecentPlaces();
            }
            if (table === 'support_tickets' || table === 'feedback') {
                if (typeof CRMModule !== 'undefined') {
                    if (CRMModule.renderTickets) CRMModule.renderTickets();
                    if (CRMModule.renderFeedback) CRMModule.renderFeedback();
                }
            }
            if (typeof AuditModule !== 'undefined') {
                if (AuditModule.isArchivesUnlocked && AuditModule.renderArchives) AuditModule.renderArchives();
                if (AuditModule.renderAuditLogs) AuditModule.renderAuditLogs();
            }
        } catch (e) {
            console.warn("[SupabaseBridge] Module refresh notice:", e);
        }
    },

    update(table, idOrBookingCode, updates) {
        if (!this.db || !this.db[table]) return null;
        const idx = this.db[table].findIndex(item => 
            (item.id && item.id === idOrBookingCode) || 
            (item.booking_code && item.booking_code === idOrBookingCode)
        );
        if (idx !== -1) {
            this.db[table][idx] = { ...this.db[table][idx], ...updates };
            this.savePersistedData(table);

            try {
                const apiBase = this.getApiBase();
                fetch(`${apiBase}/api/db`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        table: table,
                        action: 'update',
                        id: idOrBookingCode,
                        updates: updates
                    })
                }).catch(() => null);
            } catch(e) {}

            return this.db[table][idx];
        }
        return null;
    },

    insert(table, record) {
        if (!this.db[table]) this.db[table] = [];
        
        // Prevent duplicate insertion if booking_code or id already exists in table
        if (record && (record.booking_code || record.id)) {
            const exists = this.db[table].some(item => 
                (record.id && item.id === record.id) || 
                (record.booking_code && item.booking_code === record.booking_code)
            );
            if (exists) {
                console.warn(`[SupabaseBridge] Duplicate prevented for ${record.booking_code || record.id}`);
                return record;
            }
        }

        this.db[table].unshift(record);
        this.savePersistedData(table);

        try {
            const apiBase = this.getApiBase();
            fetch(`${apiBase}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: table,
                    action: 'insert',
                    record: record
                })
            }).catch(() => null);
        } catch(e) {}
        
        // Auto-create informative audit log
        if (table === 'bookings') {
            this.logAudit("Booking System", "TRIP_CREATED", record.booking_code || record.id || "N/A", record.passenger_name || record.sender_name || "juan.delacruz@example.com", {
                booking_code: record.booking_code,
                service_type: record.service_type || 'transport',
                vehicle_class: record.vehicle_class || 'Standard Taxi',
                pickup: record.pickup,
                dropoff: record.dropoff,
                total_fare: record.total_fare,
                payment_method: record.payment_method,
                surge_multiplier: record.surge_multiplier
            });
        } else if (table === 'payments' || table === 'transactions') {
            this.logAudit("Payment Gateway", "PAYMENT_RECORDED", record.id || record.invoice_no || "N/A", record.user || "customer@hirna.ph", record);
        } else if (table === 'feedback') {
            this.logAudit("CRM & Retention", "PASSENGER_RATING_SUBMITTED", record.id || "N/A", record.passenger || "passenger@tnvs.ph", {
                passenger: record.passenger,
                rating: record.rating,
                sentiment: record.sentiment,
                score: record.score,
                category: record.category,
                comment: record.comment
            });
        } else if (table === 'support_tickets' || table === 'tickets') {
            this.logAudit("CRM & Retention", "SUPPORT_TICKET_CREATED", record.id || "N/A", record.user || "customer@hirna.ph", {
                ticket_id: record.id,
                passenger: record.user,
                subject: record.subject,
                category: record.category,
                priority: record.priority,
                status: record.status
            });
        } else {
            this.logAudit("Database", "INSERT_RECORD", record.id || "N/A", "System Auto-Sync", { table, record });
        }

        return record;
    },

    logAudit(module, event, entityId, user, details) {
        const id = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
        const currentUserEmail = (typeof AuthModule !== 'undefined' && AuthModule.currentUser && AuthModule.currentUser.email) 
            ? AuthModule.currentUser.email 
            : (user || "superadmin@hirna.ph");
        
        const payload = (typeof details === 'object' && details !== null) ? details : { summary: String(details) };
        const detailsStr = typeof details === 'string' ? details : (details.summary || JSON.stringify(details));

        const log = {
            id: id,
            module: module || "System Core",
            event: event || "SYSTEM_EVENT",
            entity: entityId || "SYSTEM",
            user: currentUserEmail,
            ip: "120.28.17.44",
            status: "SUCCESS",
            timestamp: timestamp,
            details: detailsStr,
            payload: payload,
            syslog_hash: this.generateAuditHash(id, timestamp, event, entityId)
        };

        if (!this.db) this.db = {};
        if (!this.db.audit_logs) this.db.audit_logs = [];
        this.db.audit_logs.unshift(log);

        if (this.db.audit_logs.length > 500) {
            this.db.audit_logs = this.db.audit_logs.slice(0, 500);
        }

        try {
            localStorage.setItem('hirna_audit_logs', JSON.stringify(this.db.audit_logs));
        } catch (e) {
            console.warn("Could not save audit log to localStorage:", e);
        }

        try {
            window.dispatchEvent(new CustomEvent('hirna:audit_logged', { detail: log }));
        } catch(e) {}

        if (this.channel) {
            try {
                this.channel.postMessage({ type: 'AUDIT_LOG', log: log });
            } catch(e) {}
        }

        try {
            const apiBase = this.getApiBase();
            fetch(`${apiBase}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    table: 'audit_logs',
                    action: 'insert',
                    record: log
                })
            }).catch(() => null);
        } catch(e) {}

        return log;
    }
};

// Multi-Tab & Cross-Module Synchronization Engine
SupabaseBridge.channel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('hirna_sync') : null;

if (SupabaseBridge.channel) {
    SupabaseBridge.channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'DB_UPDATE' && data.table) {
            SupabaseBridge.loadPersistedData(data.table);
            SupabaseBridge.refreshActiveModules(data.table);
            try {
                window.dispatchEvent(new CustomEvent('hirna:db_updated', { detail: data }));
            } catch(e) {}
        } else if (data.type === 'AUDIT_LOG') {
            SupabaseBridge.loadPersistedAuditLogs();
            if (typeof AuditModule !== 'undefined' && AuditModule.renderAuditLogs) {
                AuditModule.renderAuditLogs();
            }
        }
    };
}

window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key.startsWith('hirna_db_')) {
        const table = e.key.replace('hirna_db_', '');
        SupabaseBridge.loadPersistedData(table);
        SupabaseBridge.refreshActiveModules(table);
        try {
            window.dispatchEvent(new CustomEvent('hirna:db_updated', { detail: { table, action: 'storage_sync' } }));
        } catch(err) {}
    } else if (e.key === 'hirna_audit_logs') {
        SupabaseBridge.loadPersistedAuditLogs();
        if (typeof AuditModule !== 'undefined' && AuditModule.renderAuditLogs) {
            AuditModule.renderAuditLogs();
        }
    }
});

