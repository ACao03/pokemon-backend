const axios = require("axios");
const open = require("open");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// ===== SERVER SETUP =====
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// ===== STATE =====
const productState = new Map();
const history = new Map();
const seenStock = new Map();

// ===== API ROUTES =====
app.get("/api/products", (req, res) => {
  res.json(Array.from(productState.values()));
});

app.get("/api/history/:tcin", (req, res) => {
  res.json(history.get(req.params.tcin) || []);
});

// ===== CONFIG =====
const SEARCH_TERMS = [
  "pokemon elite trainer box",
  "pokemon 151",
  "pokemon booster bundle"
];

const CHECK_INTERVAL = 7000;

// ===== AXIOS =====
const client = axios.create({
  headers: { "User-Agent": "Mozilla/5.0" },
  timeout: 5000
});

// ===== HELPERS =====

function updateDashboard(tcin, data) {
  productState.set(tcin, data);
  io.emit("update", Array.from(productState.values()));
}

function trackHistory(tcin, inStock) {
  if (!history.has(tcin)) history.set(tcin, []);

  history.get(tcin).push({
    time: Date.now(),
    inStock
  });

  if (history.get(tcin).length > 50) {
    history.get(tcin).shift();
  }
}

// ===== API CALLS =====

async function search(term) {
  const url = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v1?key=redsky&keyword=${encodeURIComponent(term)}`;
  const res = await client.get(url);
  return res.data?.data?.search?.products || [];
}

async function fetchPDP(tcin) {
  const url = `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=redsky&tcin=${tcin}`;
  const res = await client.get(url);
  return res.data?.data?.product || null;
}

// ===== CORE =====

async function checkTCIN(tcin) {
  try {
    const product = await fetchPDP(tcin);
    if (!product) return;

    const title = product.item.product_description.title;
    const availability =
      product.fulfillment?.shipping_options?.availability_status;

    const inStock = availability === "IN_STOCK";

    // ✅ track history AFTER we know inStock
    trackHistory(tcin, inStock);

    const state = {
      tcin,
      title,
      inStock,
      link: `https://www.target.com/p/-/A-${tcin}`,
      lastChecked: new Date().toLocaleTimeString()
    };

    updateDashboard(tcin, state);

    const prev = seenStock.get(tcin) || false;

    if (inStock && !prev) {
      seenStock.set(tcin, true);
      console.log("🔥 HIT:", title);

      open(state.link);
    } else if (!inStock) {
      seenStock.set(tcin, false);
    }

  } catch (err) {
    console.log("Error:", err.message);
  }
}

// ===== LOOP =====

async function monitor() {
  console.log("⚡ Monitor + Dashboard running...");

  while (true) {
    let discovered = [];

    for (const term of SEARCH_TERMS) {
      try {
        const results = await search(term);
        discovered.push(...results);
      } catch {}
    }

    const unique = new Set(discovered.map(p => p.tcin).filter(Boolean));

    await Promise.all(
      Array.from(unique).map(tcin => checkTCIN(tcin))
    );

    await new Promise(res =>
      setTimeout(res, Math.random() * 3000 + CHECK_INTERVAL)
    );
  }
}

monitor();