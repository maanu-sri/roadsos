# 🚨 RoadSoS — Emergency Road Assistance Platform

> **Road Safety Hackathon 2026 | IIT Madras (CoERS) × RBG Labs**  
> Problem Statement: **RoadSoS (1.3)** — Location-based emergency services for road accident victims

[![Live Demo](https://img.shields.io/badge/Live%20Demo-roadsos--one.vercel.app-red?style=for-the-badge)](https://roadsos-one.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-maanu--sri%2Froadsos-black?style=for-the-badge&logo=github)](https://github.com/maanu-sri/roadsos)

---

## 🎯 Problem

Every second counts after a road accident. Victims and bystanders struggle to:
- Find the **nearest trauma hospital** in panic
- Know which **ambulance number** to call
- **Share their location** with family instantly
- Access help when **internet is unavailable**

Delays in the critical **"golden hour"** after an accident directly cost lives.

---

## 💡 Our Solution — RoadSoS

RoadSoS is a **Progressive Web App (PWA)** that gives accident victims and bystanders instant access to nearby emergency services — working even **without internet**.

### How it works in 3 steps:
1. **Open the app** → location detected instantly
2. **See nearby services** → hospitals, police, ambulance sorted by distance
3. **Take action** → one tap to call or send SOS to family via WhatsApp

---

## ✨ Key Features

### 🆘 One-Tap Emergency Calls
- **108** (Ambulance), **112** (Emergency), **100** (Police) always visible on home screen
- No searching, no menus — immediate access

### 📍 Instant Nearby Services
- Nearest hospitals (with trauma center indicator)
- Police stations
- Ambulance services
- Towing services
- Vehicle service centers
- Fuel stations
- Results appear in **under 1 second** from local dataset

### 📲 SOS Family Alert
- One tap sends your **GPS location + nearest hospital details** to your emergency contact via WhatsApp
- No internet needed for the core functionality
- Message includes Google Maps link to your exact location

### 🗺 Live Map View
- Interactive map powered by **Leaflet.js + OpenStreetMap**
- All nearby services pinned with category icons
- Filter by service type on the map

### 📶 Offline Mode
- App works **fully offline** using embedded dataset
- Service Worker caches app shell for offline access
- IndexedDB stores last known location and services
- Shows "offline mode" indicator clearly to user
- Falls back to cached data when network is unavailable

### 🌍 Global Coverage
- **91 verified services** across **12 cities**
- Tamil Nadu: Coimbatore, Chennai, Madurai, Trichy, Salem
- Indian metros: Bangalore, Mumbai, Delhi, Hyderabad
- International: Singapore, London, Dubai

---

## 📊 Data Sources

All data is verified from official government and public sources:

| Source | Data Type |
|--------|-----------|
| [data.gov.in](https://data.gov.in) | Hospital directory, India |
| [NHP India](https://nhp.gov.in) | National Health Portal hospital data |
| [112 India](https://112.gov.in) | Emergency service contacts |
| OpenStreetMap | Fuel stations, service centers, police stations |
| Official hospital websites | Phone numbers, trauma center status |

Every entry includes: name, address, phone, coordinates, trauma status, 24h availability, and data source.

---

## 🏗 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite | Fast, component-based UI |
| Maps | Leaflet.js + OpenStreetMap | Free, no API key, global coverage |
| Location | Browser Geolocation API | Built-in, zero cost |
| Offline | Service Worker + IndexedDB | PWA offline capability |
| Hosting | Vercel | Free, auto-deploy from GitHub |
| Data | Embedded JSON dataset | Instant load, works offline |

**Total infrastructure cost: ₹0**

---

## 🎯 Judging Criteria Coverage

| Criteria | Our Implementation |
|----------|-------------------|
| ✅ Reliability & data accuracy | Verified govt sources, offline-first architecture |
| ✅ Number of contacts fetched | 91 services across 12 cities |
| ✅ Offline functionality | Service Worker + IndexedDB + embedded dataset |
| ✅ Innovation & additional features | SOS WhatsApp alert, trauma center filter, panic-mode UI |
| ✅ Information integration across countries | India + Singapore + London + Dubai |

---

## 🚀 Live Demo

**Try it now:** [roadsos-one.vercel.app](https://roadsos-one.vercel.app)

> Works best on mobile — open on your phone for the full experience

### Test scenarios:
1. Open app → allow location → see nearest services instantly
2. Tap **108** → calls ambulance directly
3. Tap **SOS** → sends WhatsApp alert with your GPS to family
4. Tap **Map** → see all services pinned on map
5. Turn off WiFi → app still shows all services (offline mode)

---

## 💻 Run Locally

```bash
# Clone the repo
git clone https://github.com/maanu-sri/roadsos.git
cd roadsos

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

**Requirements:** Node.js 18+, npm

---

## 📱 Screenshots

> Open [roadsos-one.vercel.app](https://roadsos-one.vercel.app) on mobile to see the full experience

**Home Screen** — Emergency numbers + nearby services list  
**Map View** — All services pinned on interactive map  
**SOS Screen** — One-tap family alert with GPS  

---

## 🏗 Architecture

```
User opens app
      ↓
GPS Location detected (< 2 seconds)
      ↓
Nearest city detected via Haversine formula
      ↓
Local dataset loaded INSTANTLY (offline-first)
      ↓
Services sorted by distance → shown to user
      ↓
[If online] Overpass API fetches additional live data
      ↓
Results cached in IndexedDB for next offline use
```

---

## 👨‍💻 Team

**Built for:** Road Safety Hackathon 2026, Centre of Excellence for Road Safety (CoERS), RBG Labs, IIT Madras

**Theme:** AI in Road Safety  
**Problem:** RoadSoS (1.3)

---

## 📄 License

MIT License — built for public good

---

*RoadSoS — Because every second in the golden hour matters.*
