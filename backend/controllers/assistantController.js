const Groq = require("groq-sdk");
const { loadGTFS } = require("../gtfs/loader");
const {
  searchByBusNumber,
  searchByRoute,
  getStopInfo,
  getBusesViaStop,
  getSchedule,
  getNextBus,
  filterByTime,
  detectIntent,
} = require("../gtfs/query");

const gtfsReady = loadGTFS().catch((err) => {
  console.error("GTFS load failed:", err);
});

function getCoords(stopName) {
  const { stops: gtfsStops } = require("../gtfs/loader");
  for (const [, s] of gtfsStops) {
    if (s.stop_name === stopName && s.stop_lat && s.stop_lon) {
      return { name: s.stop_name, lat: s.stop_lat, lon: s.stop_lon };
    }
  }
  return null;
}

function mapRouteFromStops(stopNames) {
  return stopNames
    .map((n) => getCoords(n))
    .filter(Boolean)
    .slice(0, 10);
}

function buildDirectResponse(intent, params, data) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return {
      points: [
        `No results found for "${params.stop || params.from || params.busNumber || "your query"}"`,
        "Try searching with a different stop name or bus number",
        "Available major stops: Vijayawada, Guntur, Benz Circle, KR Market, Railway Station, Hyderabad, Tirupati",
      ],
      highlights: [],
      buses: [],
      showMap: false,
      mapRoute: [],
    };
  }

  switch (intent) {
    case "route_search": {
      const buses = data.slice(0, 8);
      const first = buses[0];
      const mapRoute = mapRouteFromStops(first.stops);
      return {
        points: [
          `Found ${data.length} bus${data.length > 1 ? "es" : ""} from ${params.from.toUpperCase()} to ${params.to.toUpperCase()}`,
          `First bus: ${first.busNumber} | Departs ${first.timings[0] || "N/A"}`,
          `Route: ${first.stops.slice(0, 6).join(" → ")}${first.stops.length > 6 ? ` (+${first.stops.length - 6} more stops)` : ""}`,
          data.length > 1 ? `Other buses: ${buses.slice(1).map(b => b.busNumber).join(", ")}` : null,
        ].filter(Boolean),
        highlights: [params.from.toUpperCase(), params.to.toUpperCase(), first.busNumber],
        buses,
        showMap: true,
        mapRoute,
      };
    }

    case "bus_number":
    case "schedule": {
      const buses = data.slice(0, 3);
      const first = buses[0];
      const mapRoute = mapRouteFromStops(first.stops);
      return {
        points: [
          `Bus ${first.busNumber}: ${first.from} → ${first.to}`,
          `Stops (${first.stops.length}): ${first.stops.join(" → ")}`,
          `Timings: ${first.timings.join(" | ")}`,
          `Type: ${first.type}`,
        ],
        highlights: [first.busNumber, first.from, first.to],
        buses,
        showMap: true,
        mapRoute,
      };
    }

    case "buses_via_stop": {
      const buses = data.slice(0, 8);
      const stopName = params.stop.toUpperCase();
      return {
        points: [
          `${data.length} bus${data.length > 1 ? "es" : ""} pass through ${stopName}`,
          `Bus numbers: ${buses.map(b => b.busNumber).join(", ")}${data.length > 8 ? ` and ${data.length - 8} more` : ""}`,
          `Routes: ${buses.slice(0, 4).map(b => `${b.busNumber} (${b.from} → ${b.to})`).join(", ")}`,
        ],
        highlights: [stopName, ...buses.slice(0, 3).map(b => b.busNumber)],
        buses,
        showMap: false,
        mapRoute: [],
      };
    }

    case "stop_lookup": {
      const stop = data;
      const mapRoute = stop.stop_lat ? [{ name: stop.stop_name, lat: stop.stop_lat, lon: stop.stop_lon }] : [];
      return {
        points: [
          `Stop: ${stop.stop_name}`,
          `Buses served: ${stop.busesServed.slice(0, 10).join(", ")}${stop.busesServed.length > 10 ? ` (+${stop.busesServed.length - 10} more)` : ""}`,
          `GPS: ${stop.stop_lat}, ${stop.stop_lon}`,
        ],
        highlights: [stop.stop_name],
        buses: [],
        showMap: true,
        mapRoute,
      };
    }

    case "next_bus":
    case "last_bus": {
      const upcoming = data.slice(0, 6);
      return {
        points: [
          `${data.length} upcoming bus${data.length > 1 ? "es" : ""} from ${params.stop?.toUpperCase() || "stop"}`,
          ...upcoming.map(n => `Bus ${n.busNumber} → ${n.headsign || "N/A"} at ${n.departureTime} (${n.minutesAway} mins away)`),
        ],
        highlights: upcoming.map(n => n.busNumber),
        buses: upcoming.map(n => ({ busNumber: n.busNumber, from: params.stop, to: n.headsign, stops: [], timings: [n.departureTime], type: "APSRTC" })),
        showMap: false,
        mapRoute: [],
      };
    }

    case "time_filter": {
      return {
        points: [
          `${data.length} bus${data.length > 1 ? "es" : ""} from ${params.stop?.toUpperCase()} in that time window`,
          ...data.slice(0, 6).map(n => `Bus ${n.busNumber} → ${n.headsign || "N/A"} at ${n.departureTime}`),
        ],
        highlights: data.slice(0, 5).map(n => n.busNumber),
        buses: data.slice(0, 6).map(n => ({ busNumber: n.busNumber, from: params.stop, to: n.headsign, stops: [], timings: [n.departureTime], type: "APSRTC" })),
        showMap: false,
        mapRoute: [],
      };
    }

    default:
      return null;
  }
}

async function askGroq(message, gtfsContext) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = `You are Smart Transit AI for APSRTC buses in Andhra Pradesh.
REAL GTFS DATA:
${gtfsContext}

User: "${message}"

Reply ONLY in this JSON (no markdown):
{"points":["..."],"highlights":["..."],"buses":[],"showMap":false,"mapRoute":[]}

Rules:
- Use ONLY the data above. Never invent routes.
- points: 3-5 bullets with emojis
- If no data found, say so clearly`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 1000,
  });

  const raw = completion.choices[0].message.content || "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

exports.askAssistant = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    await gtfsReady;

    const { intent, params } = detectIntent(message);
    let gtfsData = null;

    switch (intent) {
      case "bus_number":    gtfsData = searchByBusNumber(params.busNumber); break;
      case "route_search":  gtfsData = searchByRoute(params.from, params.to); break;
      case "stop_lookup":   gtfsData = getStopInfo(params.stop); break;
      case "buses_via_stop":gtfsData = getBusesViaStop(params.stop); break;
      case "schedule":      gtfsData = getSchedule(params.busNumber); break;
      case "next_bus":      gtfsData = getNextBus(params.stop, params.afterTime); break;
      case "last_bus": {
        const all = getNextBus(params.stop, "00:00:00");
        gtfsData = all.slice(-5).reverse();
        break;
      }
      case "time_filter":   gtfsData = filterByTime(params.stop, params.from, params.to); break;
      default:              gtfsData = getBusesViaStop(message);
    }

    const direct = buildDirectResponse(intent, params, gtfsData);
    if (direct) return res.json(direct);

    const hasData = gtfsData && (Array.isArray(gtfsData) ? gtfsData.length > 0 : true);
    const ctxLines = hasData
      ? (Array.isArray(gtfsData)
          ? gtfsData.slice(0, 5).map(b => `Bus ${b.busNumber}: ${b.from} → ${b.to}`).join("\n")
          : JSON.stringify(gtfsData))
      : "No data found";

    const parsed = await askGroq(message, ctxLines);

    if (!parsed.buses?.length && Array.isArray(gtfsData) && gtfsData.length > 0) {
      parsed.buses = gtfsData.slice(0, 5);
    }

    res.json(parsed);

  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({
      points: ["Error: " + err.message],
      highlights: [], buses: [], showMap: false, mapRoute: [],
    });
  }
};
