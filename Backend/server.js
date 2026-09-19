const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const scanRoutes = require("./routes/scanRoutes");
const queryRoutes = require("./routes/queryRoutes");
const app = express();

app.use(cors());
app.use(express.json());

const scanLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        message: "Too many scan requests. Please try again later."
    }
});

app.use("/api/scan", scanLimiter);
app.use("/api/scan", scanRoutes);
app.use("/api/queries", queryRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
    });

app.get("/", (req, res) => {
    res.json({
        message: "ScamLens backend is running!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`ScamLens server running on http://localhost:${PORT}`);
});