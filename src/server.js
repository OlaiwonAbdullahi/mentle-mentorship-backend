const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

// Apply rate limiter to all routes
app.use("/api/", limiter);

// Stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts, please try again later",
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/waitlist", require("./routes/waitlistRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Swagger Documentation
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Mantle Mentorship API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      courses: "/api/courses",
      schedules: "/api/schedules",
      contact: "/api/contact",
      payments: "/api/payments",
      enrollments: "/api/enrollments",
      dashboard: "/api/dashboard",
      health: "/api/health",
    },
  });
});

// Error handlers (must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  Server running in ${process.env.NODE_ENV} mode
  Port: ${PORT}
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
