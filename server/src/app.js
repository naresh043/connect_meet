const express = require("express");
const cors = require("cors");

const app = express();

/*
=====================================================
MIDDLEWARE
=====================================================
*/

// Parse incoming JSON data
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

/*
=====================================================
HEALTH CHECK
=====================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ConnectMeet API is running 🚀",
  });
});

/*
=====================================================
API ROUTES
=====================================================
*/

// Authentication routes
// app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/auth", require('./routes/authRoutes') );

// User routes
// app.use("/api/users", require("./routes/userRoutes"));

// Meeting routes
// app.use("/api/meetings", require("./routes/meetingRoutes"));
app.use("/api/meetings", require("./routes/meetingRoutes"));


// Message routes
// app.use("/api/messages", require("./routes/messageRoutes"));

/*
=====================================================
404 HANDLER
=====================================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/*
=====================================================
GLOBAL ERROR HANDLER
=====================================================
*/

app.use((err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/*
=====================================================
EXPORT APP
=====================================================
*/

module.exports = app;
