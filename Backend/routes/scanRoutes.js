const express = require("express");
const Scan = require("../models/Scan");
const { analyzeWithAI } = require("../services/aiService");

const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const {
            input,
            riskScore,
            riskLevel,
            messageType,
            scamCategory,
            reasons
        } = req.body;


        // Validate input
        if (
            !input ||
            typeof input !== "string" ||
            !input.trim()
        ) {
            return res.status(400).json({
                message: "Input is required"
            });
        }

        if (input.length > 5000) {
    return res.status(400).json({
        message: "Input is too long. Maximum 5000 characters allowed."
    });
}


        // Validate risk score
        if (
            typeof riskScore !== "number" ||
            riskScore < 0 ||
            riskScore > 100
        ) {
            return res.status(400).json({
                message: "Risk score must be a number between 0 and 100"
            });
        }


        // Validate risk level
        if (!riskLevel) {
            return res.status(400).json({
                message: "Risk level is required"
            });
        }


        const aiAnalysis = await analyzeWithAI(input);


        const newScan = new Scan({
            input,
            riskScore,
            riskLevel,
            messageType,
            scamCategory,
            reasons
        });


        const savedScan = await newScan.save();


        res.status(201).json({
            message: "Scan saved successfully",
            scan: savedScan,
            aiAnalysis
        });


    } catch (error) {

        console.error("SCAN ERROR:", error);

        res.status(500).json({
            message: "Failed to save scan",
            error: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const scans = await Scan.find().sort({ createdAt: -1 });

        res.json({
            scans
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch scans",
            error: error.message
        });
    }
});

// DELETE a single scan

router.delete("/:id", async (req, res) => {

    try {

        const deletedScan =
            await Scan.findByIdAndDelete(
                req.params.id
            );

        if (!deletedScan) {

            return res.status(404).json({
                message: "Scan not found"
            });

        }

        res.json({
            message: "Scan deleted successfully",
            scan: deletedScan
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete scan",
            error: error.message
        });

    }

});

module.exports = router;