import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .chat-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 820px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #e8f4fd 0%, #dbeeff 30%, #e0f0ff 60%, #f0e8ff 100%);
    border-radius: 1rem;
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  }

  .chat-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
    pointer-events: none;
    z-index: 0;
    animation: chatFloat 8s ease-in-out infinite alternate;
  }
  .chat-blob-1 { width:380px;height:380px;background:radial-gradient(circle,#1a8cff,#0055cc);top:-100px;left:-80px;animation-delay:0s; }
  .chat-blob-2 { width:300px;height:300px;background:radial-gradient(circle,#f5a623,#ff6b00);top:100px;right:-80px;animation-delay:2s; }
  .chat-blob-3 { width:250px;height:250px;background:radial-gradient(circle,#7c3aed,#4f46e5);bottom:200px;left:-60px;animation-delay:4s; }
  .chat-blob-4 { width:200px;height:200px;background:radial-gradient(circle,#06b6d4,#0891b2);bottom:100px;right:50px;animation-delay:1s; }
  @keyframes chatFloat {
    0% { transform: translate(0,0) scale(1); }
    100% { transform: translate(20px,30px) scale(1.08); }
  }

  .chat-header {
    display:flex;align-items:center;justify-content:space-between;
    padding:14px 20px;
    background:rgba(255,255,255,0.85);
    backdrop-filter:blur(12px);
    border-bottom:2px solid #1a8cff;
    flex-shrink:0;position:relative;z-index:10;
    box-shadow:0 2px 16px #1a8cff22;
  }
  .chat-header-left { display:flex;align-items:center;gap:12px; }
  .chat-logo-wrap {
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    border-radius:12px;width:42px;height:42px;
    display:flex;align-items:center;justify-content:center;
    font-size:22px;box-shadow:0 4px 12px #1a8cff44;
  }
  .chat-title {
    font-size:17px;font-weight:800;
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }
  .chat-subtitle { font-size:11px;color:#888;margin-top:1px; }
  .chat-header-right { display:flex;align-items:center;gap:8px; }
  .chat-status-wrap {
    display:flex;align-items:center;gap:6px;
    background:#e8fff0;border:1px solid #22c55e44;
    padding:4px 10px;border-radius:20px;
  }
  .chat-status {
    width:8px;height:8px;border-radius:50%;
    background:#22c55e;box-shadow:0 0 6px #22c55e;
    animation:pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
  .chat-status-text { font-size:11px;color:#16a34a;font-weight:600; }

  .chat-messages {
    flex:1;overflow-y:auto;
    padding:20px 16px;
    display:flex;flex-direction:column;gap:16px;
    position:relative;z-index:5;
  }
  .chat-messages::-webkit-scrollbar { width:4px; }
  .chat-messages::-webkit-scrollbar-thumb { background:#1a8cff44;border-radius:4px; }

  .chat-msg { display:flex;flex-direction:column;max-width:88%; }
  .chat-msg.user { align-self:flex-end;align-items:flex-end; }
  .chat-msg.bot  { align-self:flex-start;align-items:flex-start; }

  .chat-bubble {
    display:flex;align-items:flex-start;gap:10px;
    padding:13px 16px;border-radius:18px;
    font-size:14px;line-height:1.6;word-break:break-word;
  }
  .chat-msg.user .chat-bubble {
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    color:#fff;font-weight:500;border-bottom-right-radius:4px;
    box-shadow:0 4px 16px #1a8cff44;
  }
  .chat-msg.bot .chat-bubble {
    background:transparent;color:#1a2540;
    border:none;border-bottom-left-radius:4px;box-shadow:none;
  }
  .chat-icon-wrap {
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    border-radius:10px;width:32px;height:32px;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;flex-shrink:0;box-shadow:0 2px 8px #1a8cff44;
  }
  .chat-time { font-size:11px;color:#aaa;margin-top:5px;padding:0 4px; }

  .chat-points { display:flex;flex-direction:column;gap:6px;width:100%; }
  .chat-point {
    padding:8px 12px;border-radius:10px;
    font-size:13.5px;line-height:1.5;
    background:#f0f6ff;border-left:3px solid #1a8cff;color:#1a2540;
  }
  .chat-point b { color:#0055cc; }
  .chat-point.highlight { background:linear-gradient(135deg,#fff8e6,#fff3cc);border-left:3px solid #f5a623; }

  .chat-buses { display:flex;flex-direction:column;gap:8px;margin-top:10px;width:100%; }
  .chat-bus-card {
    background:linear-gradient(135deg,#f0f6ff,#e8f0ff);
    border:1px solid #1a8cff33;border-left:4px solid #1a8cff;
    border-radius:12px;padding:12px 14px;
    box-shadow:0 2px 10px #1a8cff11;
  }
  .chat-bus-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:6px; }
  .chat-bus-number { font-size:16px;font-weight:800;color:#0055cc;display:flex;align-items:center;gap:6px; }
  .chat-bus-type {
    font-size:11px;
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    color:#fff;padding:3px 10px;border-radius:20px;font-weight:600;
  }
  .chat-bus-route { font-size:13px;color:#555;margin-bottom:8px;font-weight:500; }
  .chat-bus-stops { display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px; }
  .chat-stop-tag {
    background:#fff;border:1px solid #1a8cff44;
    color:#1a8cff;padding:2px 9px;
    border-radius:20px;font-size:11px;font-weight:500;
  }
  .chat-bus-timings { display:flex;flex-wrap:wrap;gap:5px; }
  .chat-timing-tag {
    background:#f5a62322;border:1px solid #f5a62366;
    color:#b86000;padding:2px 9px;
    border-radius:20px;font-size:11px;font-weight:600;
  }

  .chat-map-container {
    width:100%;height:230px;
    border-radius:14px;overflow:hidden;
    border:1px solid #1a8cff33;
    margin-top:12px;
    box-shadow:0 4px 20px #1a8cff22;
  }

  .chat-dots { display:flex;align-items:center;gap:5px;padding:4px 2px; }
  .chat-dots span {
    width:8px;height:8px;
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    border-radius:50%;animation:chatBounce 1.2s infinite;
  }
  .chat-dots span:nth-child(2){animation-delay:0.2s}
  .chat-dots span:nth-child(3){animation-delay:0.4s}
  @keyframes chatBounce {
    0%,60%,100%{transform:translateY(0);opacity:0.4}
    30%{transform:translateY(-8px);opacity:1}
  }

  .chat-quick {
    display:flex;gap:8px;padding:10px 16px;
    overflow-x:auto;border-top:1px solid #1a8cff22;
    flex-shrink:0;scrollbar-width:none;
    position:relative;z-index:5;
    background:rgba(255,255,255,0.7);backdrop-filter:blur(10px);
  }
  .chat-quick::-webkit-scrollbar{display:none}
  .chat-qbtn {
    flex-shrink:0;padding:7px 16px;
    background:rgba(255,255,255,0.9);
    border:1.5px solid #1a8cff55;
    color:#1a8cff;border-radius:20px;
    font-size:12px;font-family:inherit;
    font-weight:600;cursor:pointer;
    transition:all 0.18s;white-space:nowrap;
    box-shadow:0 2px 8px #1a8cff11;
  }
  .chat-qbtn:hover {
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    color:#fff;border-color:transparent;
    box-shadow:0 4px 12px #1a8cff44;transform:translateY(-1px);
  }

  .chat-input-row {
    display:flex;gap:10px;padding:14px 16px;
    background:rgba(255,255,255,0.85);
    backdrop-filter:blur(12px);
    border-top:1px solid #1a8cff22;
    flex-shrink:0;position:relative;z-index:5;
    box-shadow:0 -2px 16px #1a8cff11;
  }
  .chat-input-row input {
    flex:1;padding:11px 18px;
    background:#f0f6ff;border:1.5px solid #1a8cff33;
    border-radius:25px;color:#1a2540;
    font-size:14px;font-family:inherit;outline:none;transition:all 0.2s;
  }
  .chat-input-row input:focus {
    border-color:#1a8cff;background:#fff;box-shadow:0 0 0 3px #1a8cff18;
  }
  .chat-input-row input::placeholder{color:#aab}
  .chat-input-row button {
    padding:11px 24px;
    background:linear-gradient(135deg,#1a8cff,#0055cc);
    color:#fff;border:none;border-radius:25px;
    font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;
    transition:all 0.18s;box-shadow:0 4px 14px #1a8cff44;
  }
  .chat-input-row button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 18px #1a8cff55}
  .chat-input-row button:disabled{opacity:0.45;cursor:not-allowed;transform:none}

  @media(max-width:480px){
    .chat-msg{max-width:95%}
    .chat-bubble{font-size:13px}
  }
`;

const QUICK_PROMPTS = [
  { label: "🚌 Bus 5 SG schedule",               query: "schedule of bus 5SG" },
  { label: "🚉 Railway Station to Autonagar",     query: "Railway Station to Autonagar" },
  { label: "🗺️ Benz Circle to Kankipadu",        query: "Benz Circle to Kankipadu" },
  { label: "🛑 Buses via Benz Circle",            query: "buses via Benz Circle" },
  { label: "⏰ Next bus from KR Market",          query: "next bus from KR Market" },
  { label: "🕐 Patamata buses after 8 AM",        query: "buses from Patamata after 8:00 AM" },
  { label: "🚌 Vijayawada to Machilipatnam",      query: "Vijayawada to Machilipatnam" },
  { label: "🚌 Vijayawada to Guntur",             query: "Vijayawada to Guntur" },
  { label: "🟢 Benz Circle → Bus Stand",          query: "I am right here at benz circle I want to go to vijayawada bus stand" },
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function BusMap({ mapRoute }) {
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let mapInstance = null;

    async function initMap() {
      await loadLeaflet();
      if (cancelled || !mapRef.current) return;
      const L = window.L;

      mapInstance = L.map(mapRef.current, { zoomControl: true }).setView([16.5062, 80.648], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(mapInstance);

      const coords = mapRoute
        .filter((p) => p.lat && p.lon)
        .map((p) => ({ coord: [p.lat, p.lon], label: p.name }));

      if (!coords.length) return;

      if (coords.length >= 2) {
        L.polyline(coords.map((c) => c.coord), {
          color: "#1a8cff", weight: 5, opacity: 0.85,
        }).addTo(mapInstance);
      }

      coords.forEach(({ coord, label }, i) => {
        const isFirst = i === 0;
        const isLast = i === coords.length - 1;
        const color = isFirst ? "#22c55e" : isLast ? "#ef4444" : "#1a8cff";
        const icon = L.divIcon({
          html: `<div style="background:${color};color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.25)">${isFirst ? "A" : isLast ? "B" : i}</div>`,
          className: "", iconSize: [30, 30], iconAnchor: [15, 15],
        });
        L.marker(coord, { icon }).addTo(mapInstance).bindPopup(`<b style="color:#0055cc">${label}</b>`);
      });

      const bounds = L.latLngBounds(coords.map((c) => c.coord));
      mapInstance.fitBounds(bounds, { padding: [30, 30] });
    }

    initMap();
    return () => {
      cancelled = true;
      if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    };
  }, []);

  return <div ref={mapRef} className="chat-map-container" />;
}

function highlightText(text, highlights = []) {
  if (!highlights.length) return text;
  let result = text;
  highlights.forEach((h) => {
    try {
      const clean = h.replace(/\*/g, "").trim();
      if (!clean) return;
      const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`(${escaped})`, "gi"), "<b>$1</b>");
    } catch {}
  });
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

function BusCard({ bus }) {
  return (
    <div className="chat-bus-card">
      <div className="chat-bus-header">
        <span className="chat-bus-number">🚌 Bus {bus.busNumber}</span>
        <span className="chat-bus-type">{bus.type || "City Ordinary"}</span>
      </div>
      <div className="chat-bus-route">📍 {bus.from} → {bus.to}</div>
      {bus.stops?.length > 0 && (
        <div className="chat-bus-stops">
          {bus.stops.slice(0, 8).map((s, i) => (
            <span key={i} className="chat-stop-tag">🛑 {s}</span>
          ))}
          {bus.stops.length > 8 && (
            <span className="chat-stop-tag">+{bus.stops.length - 8} more</span>
          )}
        </div>
      )}
      {bus.timings?.length > 0 && (
        <div className="chat-bus-timings">
          {bus.timings.slice(0, 6).map((t, i) => (
            <span key={i} className="chat-timing-tag">⏰ {t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Message({ msg }) {
  return (
    <div className={`chat-msg ${msg.role}`}>
      <div className="chat-bubble">
        {msg.role === "bot" && <div className="chat-icon-wrap">🚌</div>}
        <div style={{ width: "100%" }}>
          {msg.points?.length > 0 ? (
            <div className="chat-points">
              {msg.points.map((p, i) => (
                <div key={i} className={`chat-point ${i === 0 ? "highlight" : ""}`}>
                  {highlightText(p, msg.highlights || [])}
                </div>
              ))}
            </div>
          ) : (
            <span>{msg.text}</span>
          )}

          {msg.buses?.length > 0 && (
            <div className="chat-buses">
              {msg.buses.slice(0, 5).map((bus, i) => <BusCard key={i} bus={bus} />)}
            </div>
          )}

          {msg.showMap && msg.mapRoute?.length >= 1 && (
            <BusMap mapRoute={msg.mapRoute} />
          )}
        </div>
      </div>
      <span className="chat-time">{msg.time}</span>
    </div>
  );
}

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "",
      points: [
        "👋 Hi! I'm Smart Transit AI — powered by real APSRTC GTFS data for Vijayawada!",
        "🚌 Ask me about bus routes, schedules, next buses, stops and I'll show live data on a map.",
        "💡 Try: \"Vijayawada to Machilipatnam\" or \"next bus from KR Market\"",
      ],
      highlights: ["Smart Transit AI", "GTFS"],
      buses: [],
      showMap: false,
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (document.getElementById("chat-styles")) return;
    const tag = document.createElement("style");
    tag.id = "chat-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg, time: getTime() }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.answer || "",
          points: data.points || [],
          highlights: data.highlights || [],
          buses: data.buses || [],
          showMap: data.showMap || false,
          mapRoute: data.mapRoute || [],
          time: getTime(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Could not reach the server. Is the backend running?",
          points: [],
          highlights: [],
          buses: [],
          showMap: false,
          time: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="chat-wrapper">
        <div className="chat-blob chat-blob-1" />
        <div className="chat-blob chat-blob-2" />
        <div className="chat-blob chat-blob-3" />
        <div className="chat-blob chat-blob-4" />

        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo-wrap">🚌</div>
            <div>
              <div className="chat-title">Smart Transit AI</div>
              <div className="chat-subtitle">Powered by APSRTC GTFS · Vijayawada</div>
            </div>
          </div>
          <div className="chat-header-right">
            <div className="chat-status-wrap">
              <div className="chat-status" />
              <span className="chat-status-text">Online</span>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div className="chat-msg bot">
              <div className="chat-bubble">
                <div className="chat-icon-wrap">🚌</div>
                <div className="chat-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-quick">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              className="chat-qbtn"
              onClick={() => sendMessage(p.query)}
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Ask about buses, routes, stops, timings..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? "..." : "Send →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
