const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Gemini AI
const model = new GoogleGenAI({
    apiKey: process.env.GEMENI_API_KEY
});

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

        // Send conversation to Gemini
        const response = await model.models.generateContent({
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
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});