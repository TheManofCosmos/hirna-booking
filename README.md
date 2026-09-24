# TNVS Team 10: Predictive AI Booking, Dynamic Fare & Intelligent Transport Analytics

**Research Title**: *"Design and Development of a Predictive AI-Driven Booking, Dynamic Fare Collection, and Intelligent Transport Analytics System for Transportation Services Organization"*

---

## 🌟 Quick Start Guide (Run the System in 5 Seconds)

### Option A: 1-Click Python Launcher (Recommended)
Open a terminal / PowerShell in the project directory and run:
```bash
python run_server.py
```
*Your default browser will immediately open `http://localhost:8000/main.html`!*

### Option B: PHP Built-in Server
If PHP is installed:
```bash
php -S localhost:8000
```
Then visit: `http://localhost:8000/main.html`

### Option C: Direct Double-Click
You can also directly double-click `main.html` or `public/main.html` in your file explorer to preview all screens offline!

---

## 📁 System Architecture & Directory Structure

- `main.html` / `public/main.html` - Enterprise Operations Center & Dashboard
- `booking.html` - Module 1: Multi-Service Booking & Dispatch (Interactive Leaflet Map + AI Dynamic Surge)
- `payments.html` - Module 2: Fare & Payments (Multi-method gateway + QR Ph generator + Ledger)
- `crm.html` - Module 3: Customer-Relationship Management (NLP Sentiment Polarity Classifier)
- `gps.html` - Module 4: GPS & Trip Playback (Route Telemetry Anomaly & Driver Safety Scorer)
- `analytics.html` - Module 5: Fleet Analytics & KPI (Chart.js 7-Day Revenue & Demand Forecasts)
- `audit.html` - Module 6: SOP & Audit Logs (Immutable compliance audit trail)
- `sso.html` - SuperAdmin SSO Gateway (10 Subsystems launcher)
- `assets/js/`
  - `ai-engines.js` - 5 Predictive AI Engines (Dynamic Pricing, Demand Forecast, Telemetry Anomaly, Revenue Forecast, Sentiment NLP)
  - `booking.js` - Leaflet interactive map, route picker, dynamic fare calculation
  - `payments.js` - Payment gateway simulation (GCash, Maya, Card, Cash) & Team 5 GL Sync
  - `crm.js` - Customer profiles, loyalty tiers & NLP review classifier
  - `gps-playback.js` - Interactive trip playback scrubber, speed HUD, and safety alerts
  - `analytics.js` - Executive KPI dashboard & Chart.js predictive charts
  - `audit.js` - Immutable audit logs & Driver pre-trip SOP checklist
  - `integrations.js` - BPA Inter-Team Webhook simulator (Teams 3, 5, 7, 8, 9)
  - `supabase-config.js` - Supabase cloud database connector
- `database/`
  - `schema.sql` - Supabase PostgreSQL DDL table schemas
  - `seed.sql` - Preloaded realistic Philippine demo data
  - `data.json` - Embedded local database for zero-config offline execution
- `app/Services/AI/` - Laravel PHP Predictive AI service classes
- `docs/`
  - `SPRINT_AND_BACKLOG.md` - Complete Agile Scrum sprints, product backlog, and story point breakdown
  - `CAPSTONE_DEFENSE_CHEAT_SHEET.md` - Complete defense presentation Q&A script
  - `BPA_DATA_FLOW_EXPLANATION.md` - 1-to-1 mapping with your team's BPA diagram
  - `SUPABASE_SETUP_GUIDE.md` - 2-minute Supabase database setup instructions
