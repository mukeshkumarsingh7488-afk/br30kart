/* ================== ENV CONFIG ================== */
require("dotenv").config(); // .env file load karega

/* ================== IMPORTS ================== */
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

/* ================== ROUTES ================== */
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/pementRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const sellerRoutes = require("./routes/sellerRoutes");

/* ================== APP & SERVER INIT ================== */
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:56680",
      "http://127.0.0.1:62115",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🔥 Socket.io को ग्लोबल एक्सेस दें ताकि Controllers में use कर सकें
app.set("socketio", io);

/* ================== MIDDLEWARES ================== */
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:56680",
      "http://127.0.0.1:62115",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

/* ================== SOCKET.IO LOGIC ================== */
let liveUsers = 0;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  liveUsers++;
  io.emit("live_users_count", liveUsers);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    liveUsers--;
    io.emit("live_users_count", liveUsers);
  });
});

/* ================== ROUTES SETTINGS ================== */
// 👉 Auth routes (login/register)
app.use("/api/auth", authRoutes);

// 👉 Product routes
app.use("/api/products", productRoutes);

// 👉 Payment routes
app.use("/api/payment", paymentRoutes);

// 👉 Admin routes
app.use("/api/admin", adminRoutes);
console.log("Seller Routes loading...");
app.use("/api/seller", sellerRoutes);

/* ================== DATABASE CONNECTION ================== */

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 BR30Kart Database Connected!"))
  .catch((err) => console.error("❌ DB Error:", err.message));

app.get("/", (req, res) =>
  res.send("🚀 BR30Kart API is Running with Socket.io!"),
);

/* ================== TEST ROUTE ================== */

// Health check (browser me check karne ke liye)
app.get("/", (req, res) => {
  res.send("🚀 BR30Kart API is Running!");
});

/* ================== 404 HANDLER ================== */

// Agar koi route match na kare
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route nahi mila!" });
});

/* ================== GLOBAL ERROR HANDLER ================== */

// Server error catch karega
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Server mein kuch problem ho gaya!" });
});

/* ================== SERVER START ================== */
const PORT = process.env.PORT || 5000;
// ⚠️ IMPORTANT: app.listen की जगह server.listen यूज़ करें
server.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
});
