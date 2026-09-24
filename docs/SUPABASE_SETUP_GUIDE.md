# Supabase Database Setup & Configuration Guide

This guide explains how to connect your Team 10 TNVS platform to **Supabase** (Free Cloud PostgreSQL Database) in less than 2 minutes.

---

## Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in (or sign up with GitHub/Google).
2. Click **"New Project"**.
3. Set:
   - **Name**: `tnvs-team10-db`
   - **Database Password**: *(Create a strong password and save it)*
   - **Region**: `Southeast Asia (Singapore)` *(Fastest for the Philippines)*
4. Click **"Create new project"**.

---

## Step 2: Run the SQL Schema & Seed Data

1. In your Supabase project dashboard, click on the **"SQL Editor"** icon on the left sidebar (looks like `>_`).
2. Click **"New Query"**.
3. Open [`database/schema.sql`](file:///c:/Users/Asus/OneDrive/Documents/Projects/tnvs-team10/database/schema.sql) in this project, copy its entire contents, paste it into the Supabase SQL editor, and click **"Run"**.
   - *Result: All tables (`bookings`, `drivers`, `users`, `payments`, `audit_logs`, etc.) are created instantly!*
4. Create another new query, copy the contents of [`database/seed.sql`](file:///c:/Users/Asus/OneDrive/Documents/Projects/tnvs-team10/database/seed.sql), paste it, and click **"Run"**.
   - *Result: Realistic demo records (Makati to BGC trips, pre-trip audit logs, drivers) are loaded.*

---

## Step 3: Connect to Your Web App

1. In Supabase, go to **Project Settings** (gear icon) ➔ **API**.
2. Copy your **Project URL** and **`anon` `public` Key**.
3. Open [`assets/js/supabase-config.js`](file:///c:/Users/Asus/OneDrive/Documents/Projects/tnvs-team10/assets/js/supabase-config.js) and paste them:

```javascript
const SupabaseBridge = {
    config: {
        supabaseUrl: "https://xyzcompany.supabase.co", // Your Supabase URL
        supabaseAnonKey: "eyJhbGciOiJIUzI1Ni...",       // Your Anon Key
        useCloud: true
    }
};
```

---

## Note on Offline / Local Demo

If you are presenting in a classroom or defense room with no Wi-Fi, you don't even need Supabase cloud! The app comes with **embedded local data caching** in `database/data.json` that functions 100% offline seamlessly.
