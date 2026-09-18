const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
    {
        input: {
            type: String,
            required: true
        },

        riskScore: {
            type: Number,
            required: true
        },

        riskLevel: {
            type: String,
            required: true
        },

        messageType: {
            type: String,
            default: "Unknown"
        },

        scamCategory: {
    type: String,
    default: "General Suspicious Activity"
},

        reasons: {
            type: [String],
            default: []
        }
    },

    {
        timestamps: true
    }
);

const Scan = mongoose.model("Scan", scanSchema);

module.exports = Scan;