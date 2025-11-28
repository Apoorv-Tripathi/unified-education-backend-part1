require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./db");

const chatRoutes = require("./routes/chat.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const studentRoutes = require("./routes/student.routes");
const institutionRoutes = require("./routes/institution.routes");
const teacherRoutes = require("./routes/teacher.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// *********************
// CORS CONFIG
// *********************
const allowedOrigins = [
  process.env.FRONTEND_URL,   // Vercel frontend (production)
  "http://localhost:3000",    // Local frontend (development)
  "http://127.0.0.1:3000",    // Alternate localhost
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS: " + origin), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// *********************
// Connect to MongoDB BEFORE starting server
// *********************
connectDB()
  .then(() => {
    console.log("📦 Database connected.");
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed!", err);
    process.exit(1);
  });

// *********************
// Routes
// *********************
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/users", userRoutes);

// *********************
// Health Check
// *********************
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server running",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// *********************
// 404 Handler
// *********************
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// *********************
// Error Handler
// *********************
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ success: false, message: "Server error" });
});

// *********************
// Start Server
// *********************
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 SERVER STARTED");
  console.log("=".repeat(50));
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Auth: /api/auth`);
  console.log(`👨‍🎓 Students: /api/students`);
  console.log(`🏛️ Institutions: /api/institutions`);
  console.log(`👨‍🏫 Teachers: /api/teachers`);
  console.log(`👥 Users: /api/users`);
  console.log("=".repeat(50) + "\n");
});