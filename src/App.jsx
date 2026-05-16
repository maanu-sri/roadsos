import { useState, useEffect, useRef, useCallback } from "react";

// ─── Embedded offline dataset (Tamil Nadu core cities) ───────────────────────
const OFFLINE_DATA = {
  coimbatore: [
    { id: 1, name: "Coimbatore Medical College Hospital", type: "hospital", isTrauma: true, phone: "0422-2301393", lat: 11.0168, lng: 76.9558, address: "Trichy Road, Coimbatore", open24h: true },
    { id: 2, name: "GKNM Hospital", type: "hospital", isTrauma: true, phone: "0422-4305000", lat: 11.0070, lng: 76.9629, address: "Pappanaickenpalayam, Coimbatore", open24h: true },
    { id: 3, name: "Sri Ramakrishna Hospital", type: "hospital", isTrauma: false, phone: "0422-4500000", lat: 11.0215, lng: 76.9740, address: "395 Sarojini Naidu Road, Coimbatore", open24h: true },
    { id: 4, name: "Coimbatore City Police Control", type: "police", isTrauma: false, phone: "0422-2394444", lat: 11.0050, lng: 76.9630, address: "Race Course Road, Coimbatore", open24h: true },
    { id: 5, name: "RS Puram Police Station", type: "police", isTrauma: false, phone: "0422-2543100", lat: 10.9976, lng: 76.9631, address: "RS Puram, Coimbatore", open24h: true },
    { id: 6, name: "GVK EMRI Ambulance (108)", type: "ambulance", isTrauma: false, phone: "108", lat: 11.0168, lng: 76.9558, address: "Serves all of Coimbatore", open24h: true },
    { id: 7, name: "Sundaram Motors Service", type: "service", isTrauma: false, phone: "0422-4225555", lat: 11.0134, lng: 76.9766, address: "Avinashi Road, Coimbatore", open24h: false },
    { id: 8, name: "HP Petrol Bunk Gandhipuram", type: "fuel", isTrauma: false, phone: null, lat: 11.0174, lng: 76.9674, address: "Gandhipuram, Coimbatore", open24h: true },
    { id: 9, name: "Tata Motors Towing", type: "towing", isTrauma: false, phone: "1800-209-7979", lat: 11.0220, lng: 76.9700, address: "Avinashi Road, Coimbatore", open24h: true },
  ],
  chennai: [
    { id: 10, name: "Rajiv Gandhi Government General Hospital", type: "hospital", isTrauma: true, phone: "044-25305000", lat: 13.0836, lng: 80.2823, address: "Park Town, Chennai", open24h: true },
    { id: 11, name: "Apollo Hospitals Chennai", type: "hospital", isTrauma: true, phone: "044-28296000", lat: 13.0602, lng: 80.2570, address: "Greams Road, Chennai", open24h: true },
    { id: 12, name: "Chennai City Police Control", type: "police", isTrauma: false, phone: "044-28447777", lat: 13.0827, lng: 80.2707, address: "Vepery, Chennai", open24h: true },
    { id: 13, name: "GVK EMRI Ambulance (108)", type: "ambulance", isTrauma: false, phone: "108", lat: 13.0827, lng: 80.2707, address: "Serves all of Chennai", open24h: true },
  ],
  bangalore: [
    { id: 14, name: "Victoria Hospital Bangalore", type: "hospital", isTrauma: true, phone: "080-26701150", lat: 12.9650, lng: 77.5710, address: "Fort Road, Bangalore", open24h: true },
    { id: 15, name: "Manipal Hospital", type: "hospital", isTrauma: true, phone: "080-25024444", lat: 12.9513, lng: 77.5988, address: "HAL Airport Road, Bangalore", open24h: true },
    { id: 16, name: "Bangalore Police Control", type: "police", isTrauma: false, phone: "080-22942222", lat: 12.9716, lng: 77.5946, address: "Infantry Road, Bangalore", open24h: true },
    { id: 17, name: "KSRTC Ambulance (108)", type: "ambulance", isTrauma: false, phone: "108", lat: 12.9716, lng: 77.5946, address: "Serves all of Bangalore", open24h: true },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectCity(lat, lng) {
  const cities = {
    coimbatore: { lat: 11.0168, lng: 76.9558 },
    chennai: { lat: 13.0827, lng: 80.2707 },
    bangalore: { lat: 12.9716, lng: 77.5946 },
  };
  let closest = "coimbatore", minDist = Infinity;
  for (const [city, coords] of Object.entries(cities)) {
    const d = haversineDistance(lat, lng, coords.lat, coords.lng);
    if (d < minDist) { minDist = d; closest = city; }
  }
  return minDist < 100 ? closest : "coimbatore";
}

function getServicesNear(lat, lng, filterType = "all") {
  const city = detectCity(lat, lng);
  const data = OFFLINE_DATA[city] || OFFLINE_DATA.coimbatore;
  return data
    .filter(s => filterType === "all" || s.type === filterType)
    .map(s => ({ ...s, distance: haversineDistance(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.distance - b.distance);
}

const TYPE_CONFIG = {
  all:      { label: "All",       icon: "⊕", color: "#e53e3e" },
  hospital: { label: "Hospitals", icon: "🏥", color: "#e53e3e" },
  police:   { label: "Police",    icon: "🚔", color: "#3182ce" },
  ambulance:{ label: "Ambulance", icon: "🚑", color: "#e53e3e" },
  towing:   { label: "Towing",    icon: "🔧", color: "#dd6b20" },
  fuel:     { label: "Fuel",      icon: "⛽", color: "#38a169" },
  service:  { label: "Service",   icon: "🔩", color: "#805ad5" },
};

// ─── IndexedDB offline cache ──────────────────────────────────────────────────
async function saveToCache(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction("cache", "readwrite");
    tx.objectStore("cache").put({ key, data, ts: Date.now() });
  } catch {}
}

async function loadFromCache(key) {
  try {
    const db = await openDB();
    return new Promise((res) => {
      const tx = db.transaction("cache", "readonly");
      const req = tx.objectStore("cache").get(key);
      req.onsuccess = () => res(req.result?.data || null);
      req.onerror = () => res(null);
    });
  } catch { return null; }
}

function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("roadsos", 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore("cache", { keyPath: "key" });
    req.onsuccess = (e) => res(e.target.result);
    req.onerror = () => rej();
  });
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function RoadSoS() {
  const [screen, setScreen] = useState("home"); // home | map | sos | chat
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locating, setLocating] = useState(false);
  const [sosContact, setSosContact] = useState({ name: "Family", phone: "" });
  const [sosSent, setSosSent] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "I'm here to help. Describe what happened and I'll guide you." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const chatEndRef = useRef(null);

  // Online/offline listener
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Auto-locate on mount
  useEffect(() => { getLocation(); }, []);

  // Load Leaflet
  useEffect(() => {
    if (screen !== "map" || !location) return;
    const timer = setTimeout(() => initMap(), 300);
    return () => clearTimeout(timer);
  }, [screen, location, services]);

  // Scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  function getLocation() {
    setLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      // Fallback to Coimbatore for demo
      const fallback = { lat: 11.0168, lng: 76.9558, city: "Coimbatore (demo)" };
      setLocation(fallback);
      loadServices(fallback.lat, fallback.lng);
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        loadServices(loc.lat, loc.lng);
        setLocating(false);
        saveToCache("lastLocation", loc);
      },
      async () => {
        // Fallback to cached location
        const cached = await loadFromCache("lastLocation");
        if (cached) {
          setLocation({ ...cached, fromCache: true });
          loadServices(cached.lat, cached.lng);
        } else {
          const fallback = { lat: 11.0168, lng: 76.9558, city: "Coimbatore (demo)" };
          setLocation(fallback);
          loadServices(fallback.lat, fallback.lng);
        }
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function loadServices(lat, lng) {
    // Instant from local dataset — zero network needed
    const results = getServicesNear(lat, lng, "all");
    setServices(results);
    saveToCache("lastServices", results);
  }

  async function initMap() {
    if (!mapRef.current || leafletMap.current) return;
    if (!window.L) {
      // Load Leaflet dynamically
      await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
      loadCSS("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
      await new Promise(r => setTimeout(r, 500));
    }
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([location.lat, location.lng], 14);
    leafletMap.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // User marker
    L.circleMarker([location.lat, location.lng], { radius: 10, fillColor: "#e53e3e", fillOpacity: 1, color: "#fff", weight: 3 })
      .addTo(map).bindPopup("<b>You are here</b>").openPopup();

    // Service markers
    const filtered = filter === "all" ? services : services.filter(s => s.type === filter);
    filtered.slice(0, 10).forEach(s => {
      const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.all;
      const icon = L.divIcon({
        html: `<div style="background:${cfg.color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${cfg.icon}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], className: ""
      });
      L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${s.name}</b><br>${s.address}<br>${s.phone ? `<a href="tel:${s.phone}" style="color:#e53e3e;font-weight:600">📞 ${s.phone}</a>` : ""}`)
    });
  }

  function loadScript(src) {
    return new Promise(res => {
      const s = document.createElement("script"); s.src = src; s.onload = res; document.head.appendChild(s);
    });
  }
  function loadCSS(href) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l);
  }

  function sendSOS() {
    if (!location) return;
    const nearest = services.find(s => s.type === "hospital") || services[0];
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const msg = `🚨 EMERGENCY ALERT 🚨\n\nI've been in an accident and need help immediately.\n\n📍 My Location: ${mapsLink}\n\n🏥 Nearest Hospital: ${nearest?.name || "Unknown"}\n📞 Hospital: ${nearest?.phone || "N/A"}\n\nPlease call 112 for emergency services.\n\n— Sent via RoadSoS`;
    const encoded = encodeURIComponent(msg);
    const phone = sosContact.phone.replace(/\D/g, "");
    if (phone) {
      window.open(`https://wa.me/91${phone}?text=${encoded}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
    }
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  }

  async function sendChat(text) {
    if (!text.trim()) return;
    const userMsg = { role: "user", text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    const nearbyList = services.slice(0, 5).map(s =>
      `${s.name} (${s.type}, ${s.distance?.toFixed(1)}km, phone: ${s.phone || "N/A"})`
    ).join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "YOUR_KEY_HERE", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: `You are RoadSoS, an emergency assistant for road accident victims in India. Be extremely concise, calm, and directive. The user is in panic mode. Always tell them which service to call FIRST. Never give long paragraphs. Use short sentences. Nearby services:\n${nearbyList}\nUser location: lat ${location?.lat}, lng ${location?.lng}`,
          messages: [...chatMessages, userMsg].map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Call 108 immediately for an ambulance.";
      setChatMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", text: "No internet. Call 108 for ambulance or 112 for emergency services immediately." }]);
    }
    setChatLoading(false);
  }

  const filteredServices = filter === "all" ? services : services.filter(s => s.type === filter);

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body { background: #0a0a0a; color: #f0f0f0; font-family: 'DM Sans', sans-serif; }
    .app { max-width: 430px; margin: 0 auto; min-height: 100vh; background: #111; position: relative; overflow: hidden; }
    .status-bar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 6px; font-size: 11px; }
    .online-dot { width: 7px; height: 7px; border-radius: 50%; background: #48bb78; display: inline-block; margin-right: 4px; }
    .offline-dot { background: #fc8181; }
    .header { padding: 0 16px 12px; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
    .logo span { color: #e53e3e; }
    .loc-badge { font-size: 11px; color: #a0aec0; background: #1a1a1a; padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 4px; }
    .emergency-strip { margin: 0 16px 16px; background: #1a0000; border: 1px solid #e53e3e33; border-radius: 14px; padding: 12px 14px; display: flex; gap: 10px; }
    .emg-btn { flex: 1; background: #e53e3e; border: none; border-radius: 10px; padding: 12px 8px; color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; transition: transform .1s, background .1s; }
    .emg-btn:active { transform: scale(0.96); background: #c53030; }
    .emg-btn small { font-size: 10px; font-weight: 500; opacity: 0.85; }
    .emg-btn.blue { background: #2b6cb0; }
    .emg-btn.blue:active { background: #2c5282; }
    .sos-mega { margin: 0 16px 16px; }
    .sos-btn { width: 100%; background: linear-gradient(135deg, #c53030, #e53e3e); border: none; border-radius: 16px; padding: 18px; color: #fff; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform .15s; box-shadow: 0 4px 24px #e53e3e44; }
    .sos-btn:active { transform: scale(0.97); }
    .sos-btn.sent { background: linear-gradient(135deg, #276749, #38a169); box-shadow: 0 4px 24px #38a16944; }
    .section-title { padding: 0 16px; font-size: 11px; font-weight: 600; color: #718096; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
    .filter-row { display: flex; gap: 8px; padding: 0 16px; overflow-x: auto; margin-bottom: 14px; scrollbar-width: none; }
    .filter-row::-webkit-scrollbar { display: none; }
    .filter-chip { flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: 1px solid #2d2d2d; background: #1a1a1a; color: #a0aec0; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all .15s; font-family: 'DM Sans', sans-serif; }
    .filter-chip.active { background: #e53e3e; border-color: #e53e3e; color: #fff; }
    .services-list { padding: 0 16px; display: flex; flex-direction: column; gap: 10px; max-height: 340px; overflow-y: auto; }
    .service-card { background: #1a1a1a; border-radius: 14px; padding: 14px; display: flex; gap: 12px; align-items: flex-start; border: 1px solid #2d2d2d; transition: border-color .15s; }
    .service-card:active { border-color: #4a4a4a; }
    .service-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
    .service-info { flex: 1; min-width: 0; }
    .service-name { font-size: 14px; font-weight: 600; color: #f0f0f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .service-addr { font-size: 11px; color: #718096; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .service-meta { display: flex; gap: 6px; margin-top: 6px; align-items: center; }
    .dist-badge { font-size: 10px; background: #2d2d2d; color: #a0aec0; padding: 2px 7px; border-radius: 8px; }
    .trauma-badge { font-size: 10px; background: #1a0000; color: #fc8181; border: 1px solid #e53e3e44; padding: 2px 7px; border-radius: 8px; }
    .open-badge { font-size: 10px; background: #0a1a0f; color: #68d391; border: 1px solid #38a16944; padding: 2px 7px; border-radius: 8px; }
    .call-btn { background: #1a0000; border: 1px solid #e53e3e44; color: #fc8181; border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'DM Sans', sans-serif; flex-shrink: 0; transition: background .15s; }
    .call-btn:active { background: #2d0000; }
    .nav-bar { position: sticky; bottom: 0; background: #111; border-top: 1px solid #2d2d2d; display: flex; padding: 8px 0 12px; }
    .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 6px 0; color: #718096; font-size: 10px; transition: color .15s; border: none; background: none; font-family: 'DM Sans', sans-serif; }
    .nav-item.active { color: #e53e3e; }
    .nav-icon { font-size: 20px; }
    .map-container { height: calc(100vh - 160px); background: #1a1a1a; position: relative; }
    .map-inner { width: 100%; height: 100%; }
    .map-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #718096; gap: 8px; }
    .sos-screen { padding: 16px; }
    .sos-card { background: #1a0000; border: 1px solid #e53e3e44; border-radius: 16px; padding: 20px; margin-bottom: 14px; }
    .sos-card h3 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: #fc8181; margin-bottom: 6px; }
    .sos-card p { font-size: 13px; color: #a0aec0; line-height: 1.5; }
    .input-row { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
    .input-row label { font-size: 12px; color: #718096; }
    .inp { background: #111; border: 1px solid #2d2d2d; border-radius: 10px; padding: 10px 14px; color: #f0f0f0; font-size: 14px; font-family: 'DM Sans', sans-serif; width: 100%; outline: none; }
    .inp:focus { border-color: #e53e3e44; }
    .chat-screen { display: flex; flex-direction: column; height: calc(100vh - 120px); }
    .chat-header { padding: 12px 16px; border-bottom: 1px solid #2d2d2d; }
    .chat-header h3 { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; }
    .chat-header p { font-size: 11px; color: #718096; margin-top: 2px; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .msg { max-width: 82%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; }
    .msg.user { background: #e53e3e; color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .msg.assistant { background: #1a1a1a; color: #f0f0f0; align-self: flex-start; border-bottom-left-radius: 4px; border: 1px solid #2d2d2d; }
    .msg.loading { opacity: 0.6; }
    .chat-input-row { padding: 12px 16px; border-top: 1px solid #2d2d2d; display: flex; gap: 8px; }
    .chat-inp { flex: 1; background: #1a1a1a; border: 1px solid #2d2d2d; border-radius: 24px; padding: 10px 16px; color: #f0f0f0; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
    .chat-send { background: #e53e3e; border: none; border-radius: 50%; width: 42px; height: 42px; color: #fff; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .locating { display: flex; align-items: center; gap: 6px; color: #718096; font-size: 12px; padding: 0 16px 12px; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .pulse { animation: pulse 1.2s ease-in-out infinite; }
    .empty-state { padding: 32px 16px; text-align: center; color: #718096; font-size: 14px; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* Status bar */}
        <div className="status-bar">
          <span>
            <span className={`online-dot ${!isOnline ? "offline-dot" : ""}`} />
            {isOnline ? "Online" : "Offline mode"}
          </span>
          <span style={{ fontSize: 11, color: "#718096" }}>RoadSoS v1.0</span>
        </div>

        {/* Home screen */}
        {screen === "home" && (
          <>
            <div className="header">
              <div className="logo">Road<span>SoS</span></div>
              {location && (
                <div className="loc-badge">
                  📍 {location.city || detectCity(location.lat, location.lng)}
                </div>
              )}
            </div>

            {locating && (
              <div className="locating pulse">
                <span>📡</span> Detecting your location...
              </div>
            )}

            {/* Emergency quick-dial */}
            <div className="emergency-strip">
              <button className="emg-btn" onClick={() => window.location.href = "tel:108"}>
                🚑 108
                <small>Ambulance</small>
              </button>
              <button className="emg-btn blue" onClick={() => window.location.href = "tel:112"}>
                🆘 112
                <small>Emergency</small>
              </button>
              <button className="emg-btn blue" onClick={() => window.location.href = "tel:100"}>
                🚔 100
                <small>Police</small>
              </button>
            </div>

            {/* SOS button */}
            <div className="sos-mega">
              <button className={`sos-btn ${sosSent ? "sent" : ""}`} onClick={sendSOS}>
                {sosSent ? "✓ Alert Sent to Family" : "🆘  SOS — Alert Family"}
              </button>
            </div>

            {/* Filter chips */}
            <p className="section-title">Nearby Services</p>
            <div className="filter-row">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} className={`filter-chip ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>

            {/* Services list */}
            <div className="services-list">
              {filteredServices.length === 0 && (
                <div className="empty-state">No {filter} services found nearby</div>
              )}
              {filteredServices.slice(0, 8).map(s => {
                const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.all;
                return (
                  <div key={s.id} className="service-card">
                    <div className="service-icon" style={{ background: cfg.color + "22" }}>
                      {cfg.icon}
                    </div>
                    <div className="service-info">
                      <div className="service-name">{s.name}</div>
                      <div className="service-addr">{s.address}</div>
                      <div className="service-meta">
                        <span className="dist-badge">{s.distance?.toFixed(1)} km</span>
                        {s.isTrauma && <span className="trauma-badge">Trauma</span>}
                        {s.open24h && <span className="open-badge">24h</span>}
                      </div>
                    </div>
                    {s.phone && (
                      <button className="call-btn" onClick={() => window.location.href = `tel:${s.phone}`}>
                        📞 Call
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Map screen */}
        {screen === "map" && (
          <>
            <div className="header">
              <div className="logo">Road<span>SoS</span> — Map</div>
            </div>
            <div className="filter-row">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <button key={key} className={`filter-chip ${filter === key ? "active" : ""}`}
                  onClick={() => { setFilter(key); if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } }}>
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
            <div className="map-container">
              {location ? (
                <div ref={mapRef} className="map-inner" />
              ) : (
                <div className="map-placeholder">
                  <span style={{ fontSize: 40 }}>🗺</span>
                  <p>Waiting for location...</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* SOS screen */}
        {screen === "sos" && (
          <div className="sos-screen">
            <div className="header">
              <div className="logo">Road<span>SoS</span> — SOS</div>
            </div>
            <div className="sos-card">
              <h3>🆘 Emergency Alert</h3>
              <p>Sends your GPS location and nearest hospital details to your emergency contact via WhatsApp instantly.</p>
              <div className="input-row">
                <label>Emergency contact name</label>
                <input className="inp" placeholder="e.g. Mom" value={sosContact.name}
                  onChange={e => setSosContact(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="input-row">
                <label>WhatsApp number (without country code)</label>
                <input className="inp" placeholder="9876543210" value={sosContact.phone} type="tel"
                  onChange={e => setSosContact(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <button className={`sos-btn ${sosSent ? "sent" : ""}`} style={{ marginTop: 16, fontSize: 16, padding: 14 }} onClick={sendSOS}>
                {sosSent ? "✓ Alert Sent!" : "🆘 Send SOS Now"}
              </button>
            </div>

            {/* Nearest services quick view */}
            <p className="section-title" style={{ marginTop: 8 }}>Nearest Services</p>
            <div className="services-list" style={{ maxHeight: "none" }}>
              {services.slice(0, 4).map(s => {
                const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.all;
                return (
                  <div key={s.id} className="service-card">
                    <div className="service-icon" style={{ background: cfg.color + "22" }}>{cfg.icon}</div>
                    <div className="service-info">
                      <div className="service-name">{s.name}</div>
                      <div className="service-addr">{s.distance?.toFixed(1)} km away</div>
                    </div>
                    {s.phone && (
                      <button className="call-btn" onClick={() => window.location.href = `tel:${s.phone}`}>📞 Call</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat screen */}
        {screen === "chat" && (
          <div className="chat-screen">
            <div className="chat-header">
              <h3>🤖 AI Emergency Assistant</h3>
              <p>Powered by Claude · Describes what happened for instant guidance</p>
            </div>
            <div className="chat-messages">
              {chatMessages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>{m.text}</div>
              ))}
              {chatLoading && <div className="msg assistant loading pulse">Thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-row">
              <input className="chat-inp" placeholder="Describe the accident..."
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat(chatInput)} />
              <button className="chat-send" onClick={() => sendChat(chatInput)}>➤</button>
            </div>
          </div>
        )}

        {/* Nav bar */}
        <div className="nav-bar">
          {[
            { id: "home", icon: "🏠", label: "Home" },
            { id: "map",  icon: "🗺",  label: "Map" },
            { id: "sos",  icon: "🆘",  label: "SOS" },
            { id: "chat", icon: "🤖",  label: "AI Help" },
          ].map(n => (
            <button key={n.id} className={`nav-item ${screen === n.id ? "active" : ""}`}
              onClick={() => setScreen(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </div>

      </div>
    </>
  );
}
