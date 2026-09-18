const express = require("express");
const Query = require("../models/Query");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const {
            name,
            email,
            question
        } = req.body;

        const newQuery = new Query({
            name,
            email,
            question
        });

        const savedQuery = await newQuery.save();

        res.status(201).json({
            message: "Query submitted successfully",
            query: savedQuery
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to submit query",
            error: error.message
        });
    }
});

module.exports = router;