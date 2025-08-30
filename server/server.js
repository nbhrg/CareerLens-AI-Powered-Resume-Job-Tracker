const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const candidateAuthRoutes = require("./routes/authCandidate");
const recruiterAuthRoutes = require("./routes/authRecruiter");
const jobRoutes = require("./routes/jobs");
const resumeRoutes = require("./routes/resume");
const interviewRoutes = require("./routes/interviews");

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(
    cors({
        origin: [
            process.env.CLIENT_URL || "http://localhost:3000",
            "http://localhost:5173", // Vite default port
            "http://localhost:3000", // Create React App default port
        ],
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth/candidate", candidateAuthRoutes);
app.use("/api/auth/recruiter", recruiterAuthRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidate", resumeRoutes);
app.use("/api/interviews", interviewRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "Job Orbit Server is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);

    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: Object.values(err.errors).map((e) => e.message),
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate field value entered",
        });
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log();
    console.log(`Server running on port ${PORT}`);
});
