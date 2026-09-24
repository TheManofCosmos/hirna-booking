# Agile Sprint & Product Backlog: Team 10 (TNVS)

**Research Title**: *"Design and Development of a Predictive AI-Driven Booking, Dynamic Fare Collection, and Intelligent Transport Analytics System for Transportation Services Organization"*  
**Framework**: Agile / Scrum (4 Sprints × 2 Weeks)  
**Team Roles**:
- **PM**: Project Manager & Systems Architect
- **BE**: Backend & AI Developer
- **FE**: Frontend & UX Lead
- **QA**: QA & Documentation Specialist

---

## 📊 Sprint Overview & Roadmap

```
+-------------------------------------------------------------------------------+
| SPRINT 1: Core Booking, Leaflet Geocoding & Relational Schema (34 pts)        |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| SPRINT 2: Predictive AI Engines, Dynamic Pricing & Surge Forecasting (37 pts) |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| SPRINT 3: Multi-Payment Gateway, Invoicing & Cross-Team BPA Sync (31 pts)     |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
| SPRINT 4: Safety Telemetry, CRM Sentiment, Analytics & Audit (33 pts)         |
+-------------------------------------------------------------------------------+
```

| Sprint | Focus Area | Goal | Points | Status |
| :--- | :--- | :--- | :---: | :---: |
| **Sprint 1** | System Foundation & Booking Core | Setup database schema, interactive Leaflet routing, passenger portal | 34 | ✅ Completed |
| **Sprint 2** | Predictive AI & Dynamic Surge | Implement supply/demand elasticity, surge pricing, hotspot forecaster | 37 | ✅ Completed |
| **Sprint 3** | Payments & BPA Webhooks | Multi-gateway fare collection, receipt generation, Team 5/9 integrations | 31 | ✅ Completed |
| **Sprint 4** | Safety, CRM NLP & Analytics | Telemetry anomaly scoring, sentiment NLP, executive KPIs, audit trail | 33 | ✅ Completed |
| **Total** | **Full System Lifecycle** | **Complete Capstone System Ready for Defense** | **135 pts** | **100%** |

---

## 🗂️ Product Backlog (Epics & User Stories)

### Epic 1: Infrastructure, Database Architecture & Core Booking (Sprint 1)

#### US-101: Relational Database & Seed Data Architecture
- **As a**: System Architect  
- **I want**: A normalized PostgreSQL/Supabase database schema with realistic Philippine transport seed data  
- **So that**: The system can persist passenger profiles, vehicle states, trip bookings, and financial ledgers reliably.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: PM / BE  
- **Acceptance Criteria**:
  1. `schema.sql` creates tables for `users`, `drivers`, `trips`, `payments`, `telemetry_logs`, `audit_logs`, and `reviews`.
  2. Foreign keys and indexes are properly defined on trip and payment records.
  3. `seed.sql` populates realistic Metro Manila routes (Makati CBD, BGC, Circuit Makati, NAIA).
  4. Local embedded `data.json` exists for offline presentation fallback.

#### US-102: Interactive Leaflet Map & Pickup/Dropoff Geocoding
- **As a**: Commuter / Passenger  
- **I want**: An interactive map where I can select pickup and drop-off locations with visual markers and route lines  
- **So that**: I can intuitively see the travel route, distance, and estimated travel time before booking.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: FE  
- **Acceptance Criteria**:
  1. Leaflet map renders smoothly centered on Metro Manila coordinates.
  2. Users can pick predefined stops or drag markers to update coordinates.
  3. Polyline connects the pickup and dropoff points with distance calculation in kilometers.

#### US-103: Passenger Portal UI & Vehicle Class Selection
- **As a**: Passenger  
- **I want**: A responsive booking interface (`passenger.html`) to choose between Economy Sedan, Premium, and Hirna Transport  
- **So that**: I can tailor my booking according to my budget and comfort needs.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: FE  
- **Acceptance Criteria**:
  1. Clean cards displaying vehicle class, seat capacity, base rate, and per-km rate.
  2. Active vehicle selection dynamically updates the estimated fare summary.
  3. Responsive on desktop and mobile viewports.

#### US-104: Booking Submission & Trip State Management
- **As a**: Operations Dispatcher  
- **I want**: Trip requests to trigger status transitions (`PENDING`, `DISPATCHED`, `IN_TRANSIT`, `COMPLETED`)  
- **So that**: Trip lifecycles are strictly tracked from passenger request to arrival.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: BE / FE  
- **Acceptance Criteria**:
  1. Clicking "Book Ride Now" creates a valid trip record with a unique UUID (`TRP-XXXXX`).
  2. Booking status updates in real-time on both passenger view and operations dashboard.
  3. Validations prevent booking without valid pickup and dropoff locations.

#### US-105: Automated Test Suite for Booking Flow
- **As a**: QA Specialist  
- **I want**: Unit and integration test cases covering route calculation and trip creation  
- **So that**: Regressions in distance algorithms and state transitions are prevented.  
- **Priority**: Should Have  
- **Story Points**: 5  
- **Assignee**: QA  
- **Acceptance Criteria**:
  1. Distance matrix test passes with variance < 2%.
  2. Zero-distance and invalid boundary checks reject booking attempts gracefully.

---

### Epic 2: Predictive AI Engines & Dynamic Surge Pricing (Sprint 2)

#### US-201: Dynamic Surge Pricing Algorithm
- **As a**: TNVS Operator  
- **I want**: An AI pricing engine that computes real-time surge multipliers based on supply-demand elasticity and weather  
- **So that**: Driver supply is incentivized during peak rush hours and inclement weather conditions.  
- **Priority**: Must Have  
- **Story Points**: 13  
- **Assignee**: BE / PM  
- **Acceptance Criteria**:
  1. Implements formula: $\text{Fare} = (\text{Base} + (\text{Distance} \times \text{Rate})) \times \text{SurgeMultiplier} \times \text{WeatherFactor}$.
  2. Surge multiplier scales between 1.00x (Normal) up to 2.00x (Extreme Peak).
  3. Returns human-readable justification (e.g., *"Peak Rush Hour: +35% surge applied"*).

#### US-202: Predictive Demand & Hotspot Forecaster
- **As a**: Fleet Dispatcher  
- **I want**: Time-series predictive density to identify emerging booking hotspots (e.g., Makati vs BGC)  
- **So that**: Drivers can be proactively repositioned to areas with high passenger demand.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: BE  
- **Acceptance Criteria**:
  1. Uses historical density and time-of-day weighting to score zone demand (0-100 index).
  2. Displays top 3 predicted demand clusters on the analytics dashboard.
  3. Generates recommended driver staging coordinates.

#### US-203: Real-Time Fare Transparency UI
- **As a**: Passenger  
- **I want**: Full transparency on how the total fare was calculated before I confirm the booking  
- **So that**: I understand the base fare, per-kilometer charge, surge multiplier, and tax breakdown.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: FE  
- **Acceptance Criteria**:
  1. Fare modal breaks down: Base Fare + Distance Cost + Surge Surcharge + 12% VAT.
  2. Visual badge indicates current surge state (Normal / Moderate / High Demand).

#### US-204: AI Pricing Boundary & Stress Testing
- **As a**: QA Specialist  
- **I want**: Edge-case validation on extreme surge inputs and weather conditions  
- **So that**: Multipliers never produce negative fares or exceed LTFRB regulatory price caps.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: QA  
- **Acceptance Criteria**:
  1. Pricing engine clamps multipliers to regulatory ceilings ($M \le 2.0\times$).
  2. Null or undefined weather and demand parameters fall back to safe baseline (1.0x).

#### US-205: Laravel PHP AI Service Classes Refactor
- **As a**: Backend Developer  
- **I want**: Standalone PHP service classes in `app/Services/AI/` mirroring the client-side AI engines  
- **So that**: Dynamic pricing and demand models can run either server-side or offline in client preview.  
- **Priority**: Should Have  
- **Story Points**: 6  
- **Assignee**: BE  
- **Acceptance Criteria**:
  1. `DynamicPricingEngine.php` and `DemandPredictionEngine.php` classes implemented.
  2. Both accept identical JSON payloads and yield identical multiplier outputs.

---

### Epic 3: Multi-Payment Gateway, Invoicing & Cross-Team BPA Sync (Sprint 3)

#### US-301: Simulated Multi-Channel Payment Gateway
- **As a**: Passenger  
- **I want**: To pay through Cash, GCash, Maya, or In-App Wallet with payment method management  
- **So that**: I have flexible, cashless transaction options tailored to Philippine payment habits.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: FE / BE  
- **Acceptance Criteria**:
  1. Payment options render with official branding (GCash blue, Maya green, Cash, Wallet).
  2. Simulated OTP verification and wallet balance deduction flow.
  3. Support for "Add Payment Method" bridge linking to official payment portals.

#### US-302: Automated Digital Receipt & VAT Breakdown
- **As a**: Passenger / Corporate Commuter  
- **I want**: An itemized electronic receipt generated immediately upon payment confirmation  
- **So that**: I have official proof of payment for personal records and company expense reimbursements.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: FE  
- **Acceptance Criteria**:
  1. Receipt displays: Transaction Ref, Driver Name, Plate #, Route, Date/Time, Payment Method, 12% VAT.
  2. Printable / downloadable modal with clean receipt formatting.

#### US-303: Team 5 (Financial Management) Accounts Receivable Sync
- **As a**: TNVS Finance Officer  
- **I want**: Completed payments to automatically post gross revenue and tax breakdown to Team 5's General Ledger  
- **So that**: Financial accounts are reconciled in real-time without manual bookkeeping.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: BE / PM  
- **Acceptance Criteria**:
  1. Dispatches webhook: `POST /api/integrations.php?action=RECORD_FARE_COLLECTION`.
  2. Sends gross amount, 80% driver payout split, 20% platform commission, and 12% VAT.
  3. Receives ledger acknowledgment code (`SYNCED_TO_GENERAL_LEDGER`).

#### US-304: Team 9 (Operations & Driver Dispatch) Webhook Bridge
- **As a**: Operations Lead  
- **I want**: New trip requests to notify Team 9 Dispatch and receive assigned driver details  
- **So that**: Vehicles are dispatched dynamically according to proximity and driver availability.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: BE / PM  
- **Acceptance Criteria**:
  1. Dispatches `DISPATCH_TRIP_REQUEST` with pickup coordinates and required vehicle class.
  2. Receives driver confirmation: Driver Name, Vehicle Plate Number, and initial GPS pin.

#### US-305: Payment Reconciliation & Double-Charge Validation Tests
- **As a**: QA Specialist  
- **I want**: Automated tests verifying idempotent payment processing  
- **So that**: Duplicate clicks on "Pay Now" do not result in double charging the passenger.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: QA  
- **Acceptance Criteria**:
  1. Idempotency key or transaction locking prevents concurrent duplicate payment requests.
  2. Failed simulated payments display informative user error with retry capability.

---

### Epic 4: Safety Telemetry, CRM NLP Sentiment, Analytics & Audit (Sprint 4)

#### US-401: GPS Trip Playback & Speed HUD Simulation
- **As a**: Fleet Safety Auditor  
- **I want**: An interactive route scrubber that replays vehicle trips with live speed telemetry and GPS coordinates  
- **So that**: We can inspect driver trajectory, stops, and compliance post-trip.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: FE  
- **Acceptance Criteria**:
  1. Play/Pause/Scrub controls along trip route waypoints.
  2. Real-time Speed HUD updates in km/h based on timestamp delta.
  3. Visual map marker moves synchronously along the polyline.

#### US-402: Telemetry Anomaly Engine & Driver Safety Score
- **As a**: Safety Officer  
- **I want**: An anomaly detection engine that flags speeding violations (>80 km/h) and harsh braking (>15 km/h deceleration)  
- **So that**: A Driver Safety Score (0-100) is generated for quality control and driver training.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: BE / PM  
- **Acceptance Criteria**:
  1. Computes Driver Safety Score based on penalty deductions per detected telemetry violation.
  2. Flags violation timestamps directly on the trip timeline.
  3. Dispatches safety summary report to Team 3 (Performance & Development).

#### US-403: Customer Relationship Management (CRM) & NLP Sentiment Classifier
- **As a**: Customer Experience Specialist  
- **I want**: An NLP engine that analyzes customer review text, scores sentiment polarity, and categorizes complaints  
- **So that**: Negative feedback regarding fare disputes, driver conduct, or vehicle hygiene is automatically escalated.  
- **Priority**: Must Have  
- **Story Points**: 8  
- **Assignee**: BE / FE  
- **Acceptance Criteria**:
  1. Tokenizes customer review text and scores polarity (Positive / Neutral / Negative).
  2. Automatically assigns categories: *Fare Dispute*, *Driver Conduct*, *Vehicle Cleanliness*, or *Route Efficiency*.
  3. Displays customer loyalty status (Silver, Gold, Platinum) with lifetime ride counts.

#### US-404: Executive KPI Dashboard & 7-Day Revenue Forecaster
- **As a**: TNVS General Manager  
- **I want**: Interactive Chart.js visualizations of 7-day revenue projections and hourly trip demand curves  
- **So that**: Strategic decisions regarding fleet scaling and marketing can be made based on predictive trends.  
- **Priority**: Must Have  
- **Story Points**: 5  
- **Assignee**: FE / BE  
- **Acceptance Criteria**:
  1. Line chart displaying projected gross revenue using exponential smoothing.
  2. Bar chart showing peak hourly trip volume distribution (06:00 to 22:00).
  3. Top-level metric cards: Total Revenue, Total Trips, Active Drivers, Average Safety Index.

#### US-405: Immutable System Audit Trail & Driver SOP Checklist
- **As a**: Compliance & Legal Officer  
- **I want**: A tamper-evident audit log recording every system action with user ID, timestamp, and action signature  
- **So that**: Regulatory compliance and pre-trip driver SOP checks (license, tires, brakes) are permanently verifiable.  
- **Priority**: Must Have  
- **Story Points**: 4  
- **Assignee**: BE / QA  
- **Acceptance Criteria**:
  1. Every booking, payment, and dispatch generates an immutable audit record.
  2. Driver pre-trip SOP checklist verifies physical readiness before trip dispatch.
  3. Integration webhook pushes audit compliance proofs to Team 8 (Administrative Management).

---

## 📅 Sprint Allocations & Team Velocity

### Sprint 1: System Foundation & Booking Core
- **Sprint Goal**: Deliver an end-to-end working passenger booking prototype connected to database schema and map routing.
- **Sprint Velocity**: 34 Story Points

| Story ID | Story Title | Points | Owner | Status |
| :--- | :--- | :---: | :---: | :---: |
| **US-101** | Relational Database & Seed Data Architecture | 8 | PM / BE | Done |
| **US-102** | Interactive Leaflet Map & Pickup/Dropoff Geocoding | 8 | FE | Done |
| **US-103** | Passenger Portal UI & Vehicle Class Selection | 5 | FE | Done |
| **US-104** | Booking Submission & Trip State Management | 8 | BE / FE | Done |
| **US-105** | Automated Test Suite for Booking Flow | 5 | QA | Done |

---

### Sprint 2: Predictive AI Engines & Dynamic Surge Pricing
- **Sprint Goal**: Integrate server and client-side predictive AI algorithms to automate dynamic surge pricing and demand forecasting.
- **Sprint Velocity**: 37 Story Points

| Story ID | Story Title | Points | Owner | Status |
| :--- | :--- | :---: | :---: | :---: |
| **US-201** | Dynamic Surge Pricing Algorithm | 13 | BE / PM | Done |
| **US-202** | Predictive Demand & Hotspot Forecaster | 8 | BE | Done |
| **US-203** | Real-Time Fare Transparency UI | 5 | FE | Done |
| **US-204** | AI Pricing Boundary & Stress Testing | 5 | QA | Done |
| **US-205** | Laravel PHP AI Service Classes Refactor | 6 | BE | Done |

---

### Sprint 3: Multi-Payment Gateway, Invoicing & Cross-Team BPA Sync
- **Sprint Goal**: Enable multi-channel payment simulations, digital receipts, and real-time webhook sync to Teams 5 & 9.
- **Sprint Velocity**: 31 Story Points

| Story ID | Story Title | Points | Owner | Status |
| :--- | :--- | :---: | :---: | :---: |
| **US-301** | Simulated Multi-Channel Payment Gateway | 8 | FE / BE | Done |
| **US-302** | Automated Digital Receipt & VAT Breakdown | 5 | FE | Done |
| **US-303** | Team 5 Accounts Receivable General Ledger Sync | 8 | BE / PM | Done |
| **US-304** | Team 9 Operations & Dispatch Webhook Bridge | 5 | BE / PM | Done |
| **US-305** | Payment Reconciliation & Double-Charge Tests | 5 | QA | Done |

---

### Sprint 4: Safety Telemetry, CRM Sentiment, Analytics & Audit
- **Sprint Goal**: Deploy safety telemetry anomaly scorer, customer feedback NLP classifier, KPI dashboards, and audit trails.
- **Sprint Velocity**: 33 Story Points

| Story ID | Story Title | Points | Owner | Status |
| :--- | :--- | :---: | :---: | :---: |
| **US-401** | GPS Trip Playback & Speed HUD Simulation | 8 | FE | Done |
| **US-402** | Telemetry Anomaly Engine & Driver Safety Score | 8 | BE / PM | Done |
| **US-403** | CRM Loyalty & NLP Sentiment Classifier | 8 | BE / FE | Done |
| **US-404** | Executive KPI Dashboard & 7-Day Forecaster | 5 | FE / BE | Done |
| **US-405** | Immutable System Audit Trail & Driver SOP Checklist | 4 | BE / QA | Done |

---

## 🎯 Capstone Defense Traceability Matrix

This table maps every capstone requirement directly to its Sprint story and implemented code module:

| Capstone Requirement | Implemented Feature | Sprint Story | Code Location |
| :--- | :--- | :---: | :--- |
| **Predictive AI Dynamic Pricing** | Real-time supply-demand surge multiplier with weather factor | US-201 | `assets/js/ai-engines.js`, `app/Services/AI/DynamicPricingEngine.php` |
| **Predictive Demand Forecasting** | Hotspot density forecasting for driver staging | US-202 | `assets/js/ai-engines.js`, `app/Services/AI/DemandPredictionEngine.php` |
| **Telemetry Anomaly & Safety** | Speeding/braking detection with 0-100 Driver Safety Score | US-402 | `assets/js/gps-playback.js`, `app/Services/AI/TelemetryAnomalyEngine.php` |
| **NLP Review Polarity** | Automated sentiment analysis & review dispute tagging | US-403 | `assets/js/crm.js`, `app/Services/AI/SentimentNLPEngine.php` |
| **Executive Forecasting** | 7-day revenue trend & hourly demand projection | US-404 | `assets/js/analytics.js`, `app/Services/AI/RevenueForecastEngine.php` |
| **BPA Financial Sync** | Automated ledger journal entry transmission to Team 5 | US-303 | `assets/js/payments.js`, `assets/js/integrations.js` |
| **BPA Dispatch Sync** | Automated trip request transmission to Team 9 | US-304 | `assets/js/booking.js`, `assets/js/integrations.js` |
| **SOP & Audit Compliance** | Cryptographically verifiable audit trail & driver pre-trip check | US-405 | `assets/js/audit.js` |
