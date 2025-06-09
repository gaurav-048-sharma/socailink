const mongoose = require("mongoose");

const blacklistedSchema =new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true, // ✅ Prevent duplicate tokens
        app: true   // ✅ Faster queries
    },
    created_at : {
        type: Date, 
        default: Date.now,
        expires: 3600 
    }
});

module.exports = mongoose.model("BlacklistedToken",blacklistedSchema );