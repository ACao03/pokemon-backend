const axios = require("axios");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const RetailerManager = require("./scrapers/RetailerManager");

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

// ===== STATE =====
const retailerManager = new RetailerManager();
let consolidatedState = [];
let retailerHistory = new Map(); // Track stock history per retailer/product
const MAX_HISTORY = 50;

// ===== API ROUTES =====

app.get("/api/products", (req, res) => {
  res.json(consolidatedState);
});

app.get("/api/products/in-stock", (req, res) => {
  res.json(retailerManager.getInStockProducts());
});

app.get("/api/products/out-of-stock", (req, res) => {
  res.json(retailerManager.getOutOfStockProducts());
});

app.get("/api/retailers", (req, res) => {
  res.json(retailerManager.getRetailers());
});

app.get("/api/retailers/:name/products", (req, res) => {
  const products = retailerManager.getByRetailer(req.params.name);
  res.json(products);
});

app.get("/api/price-comparison/:product", (req, res) => {
  const comparison = retailerManager.getPriceComparison(req.params.product);
  if (!comparison) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(comparison);
});

app.get("/api/history/:productTitle", (req, res) => {
  const key = req.params.productTitle.toLowerCase();
  const history = retailerHistory.get(key) || [];
  res.json(history);
});

// ===== CONFIG =====
const CHECK_INTERVAL = 30000; // Check every 30 seconds

// ===== HELPERS =====

function trackHistory(productTitle, stockData) {
  const key = productTitle.toLowerCase();
  if (!retailerHistory.has(key)) {
    retailerHistory.set(key, []);
  }

  const history = retailerHistory.get(key);
  history.push({
    time: Date.now(),
    ...stockData
  });

  // Keep only last MAX_HISTORY entries
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
}

// ===== MONITORING =====

async function monitor() {
  console.log("\n⏱️  Monitoring cycle started...");

  try {
    consolidatedState = await retailerManager.checkAllRetailers();

    // Track stock changes in history
    consolidatedState.forEach(product => {
      const stockData = {
        inStockCount: product.inStockCount,
        totalRetailers: product.totalRetailers,
        retailers: product.retailers.map(r => ({
          name: r.retailer,
          inStock: r.inStock,
          price: r.price
        }))
      };
      trackHistory(product.title, stockData);
    });

    // Broadcast to connected clients
    io.emit("update", consolidatedState);

    console.log(`✅ Broadcast: ${consolidatedState.length} products to ${io.engine.clientsCount} clients`);
  } catch (err) {
    console.error("❌ Monitor error:", err.message);
  }

  // Schedule next check
  setTimeout(monitor, CHECK_INTERVAL + Math.random() * 5000);
}

// ===== START MONITOR =====
monitor();
