const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");
require("dotenv").config();

const app = express();

// Render provides PORT automatically.
// 3000 is used when running locally.
const PORT = process.env.PORT || 3000;

// Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMENI_API_KEY
});

// Check API key
console.log(
    "Gemini API Key loaded:",
    !!process.env.GEMENI_API_KEY
);

// Middleware
app.use(express.json());

// Serve frontend files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Chat API
app.post("/api/chat", async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        // Convert frontend history to Gemini format
        const contents = [];

        if (Array.isArray(history)) {
            for (const item of history) {
                contents.push({
                    role: item.role === "user" ? "user" : "model",
                    parts: [
                        {
                            text: item.content
                        }
                    ]
                });
            }
        }

        // Add current user message
        contents.push({
            role: "user",
            parts: [
                {
                    text: message
                }
            ]
        });

        // Send conversation to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: contents
        });

        // Send Gemini response to frontend
        res.json({
            reply: response.text
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.status(500).json({
            error: "Failed to get response from chatbot"
        });
    }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});