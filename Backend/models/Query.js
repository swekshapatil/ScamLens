const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        question: {
            type: String,
            required: true,
            trim: true
        }
    },

    {
        timestamps: true
    }
);

const Query = mongoose.model("Query", querySchema);

module.exports = Query;