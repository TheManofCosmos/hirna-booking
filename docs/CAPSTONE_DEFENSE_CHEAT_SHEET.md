# Capstone Defense Cheat Sheet: Team 10 (TNVS)

**Research Title**: *"Design and Development of a Predictive AI-Driven Booking, Dynamic Fare Collection, and Intelligent Transport Analytics System for Transportation Services Organization"*

---

## 1. The 30-Second Elevator Pitch (Memorize This!)

> *"Good morning, honorable panelists. Our capstone project, **Team 10**, covers the **Booking, Payments, and Customer Experience core** for a Transport Network Vehicle Service (TNVS). 
>
> Unlike traditional static booking apps, our platform integrates **Predictive AI** to dynamically forecast passenger demand, calculate real-time surge pricing based on supply-demand elasticity, perform NLP sentiment analysis on passenger feedback, and monitor driver safety through GPS telemetry anomaly scoring."*

---

## 2. Likely Panel Questions & Your Exact Answers

### Q1: "Where and how is the AI actually implemented in your system?"
**Your Answer**:
> *"The AI is implemented as a **server-side predictive decision engine** in our Laravel/PHP backend and JavaScript client services. It consists of 5 focused engines:
> 1. **Dynamic Surge Pricing Engine**: Automatically computes fare multipliers using real-time supply vs. demand ratios, weather factors, and peak hour congestion.
> 2. **Predictive Demand & Hotspot Forecaster**: Uses time-series regression and historical booking density to forecast high-demand zones (e.g., Makati CBD vs BGC).
> 3. **GPS Telemetry Anomaly Scorer**: Evaluates speed trajectories during trip playback to detect speeding and harsh braking violations, generating a Driver Safety Score.
> 4. **Revenue & Fleet Forecaster**: Uses exponential smoothing to project the next 7-day gross revenue and trip volume on the executive dashboard.
> 5. **NLP Sentiment Classifier**: Evaluates customer text feedback to score polarity and categorize complaints (e.g., Fare Dispute, Driver Conduct, Vehicle Cleanliness)."*

---

### Q2: "How does Team 10 communicate with other teams according to the BPA diagram?"
**Your Answer**:
> *"Our system acts as the customer-facing and financial frontend of the organization. Through REST API endpoints and webhooks:
> - **Team 9 (Operations & Dispatch)**: We send trip requests and receive driver dispatch confirmation.
> - **Team 5 (Financial Management)**: Every completed payment automatically syncs with the Accounts Receivable ledger.
> - **Team 8 (Facilities & Admin)**: We store driver pre-trip SOP audit logs and document validity records.
> - **Team 3 (Performance & Development)**: We transmit the driver safety score and ratings for driver training evaluation.
> - **Team 7 (Fleet Management)**: We update route progress and vehicle availability status."*

---

### Q3: "What database did you use and why?"
**Your Answer**:
> *"We designed a **Relational SQL Database schema implemented on Supabase (PostgreSQL)**. We chose Supabase because it provides cloud high-availability, automatic backups, and seamless REST and Realtime data synchronization. For offline local presentations, the system also supports local embedded SQL data."*

---

### Q4: "What is your role and how is the work divided among team members?"
**Your Answer**:
> - **Project Manager & Systems Architect**: Led system architecture, BPA integration mapping, and feature orchestration.
> - **Backend & AI Developer**: Implemented the dynamic surge algorithm, database schema, and REST API controllers.
> - **Frontend & UX Lead**: Developed the interactive Leaflet map interface, trip playback scrubber, and responsive passenger portal.
> - **QA & Documentation Specialist**: Conducted system testing, test case documentation, and SOP compliance audit verification.

---

## 3. Live System Demo Checklist (During Defense)

1. **Open the Web Portal** (`http://localhost:8000/main.html` or `http://localhost:8000/public/main.html`).
2. **1. Booking Module** (`booking.html`): Select *Ayala Malls Circuit* ➔ *BGC High Street*. Change the *Demand Level* to **Peak Rush** to show the live **AI Surge Multiplier (1.35x)** and reason update in real-time. Click **"Book Ride Now"**.
3. **2. Payments Module** (`payments.html`): Click **GCash** or **Maya** to process the payment and show the automated invoice receipt.
4. **3. CRM & NLP AI Module** (`crm.html`): Type a sample review (*"Kuya driver was very polite but fare was a bit high"*) to show the **live NLP Sentiment Classifier** tag it as Positive/Fare Dispute.
5. **4. GPS Playback Module** (`gps.html`): Click **"▶ Play"** on the Leaflet map to watch the car move along the route and show the live **Speed HUD and Driver Safety Score (98/100)**.
6. **Tab 5 (Analytics)**: Show the **7-Day Revenue Forecast Line Chart** and the **Hourly Demand Curve**.
7. **Tab 6 (SOP Audit)**: Show the **Immutable System Audit Trail** recording every timestamp, user, and transaction.
8. **Tab 7 (BPA Integrations)**: Click **"Team 5: Financial Management"** to demonstrate live JSON data transmission to Accounts Receivable.
