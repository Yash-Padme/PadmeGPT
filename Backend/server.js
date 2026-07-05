// Import required packages
import express from "express";
import "dotenv/config"; // Loads variables from the .env file into process.env
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"
// Create an Express application
const app = express();

// Port number on which the server will run
const port = 8080;

// Middleware to parse incoming JSON requests
// Example:
// {
//    "message": "Hello"
// }
app.use(express.json());

// Enable Cross-Origin Resource Sharing (CORS)
// This allows your frontend (React) to communicate with this backend
app.use(cors());

app.use("/api", chatRoutes);

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);

    // Connect to MongoDB after the server starts
    connectDB();
});


// -------------------------------
// Function to connect with MongoDB
// -------------------------------
const connectDB = async () => {
    try {

        // Connect using the MongoDB URI stored in the .env file
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected with Database MongoDB");

    } catch (err) {

        // Print an error if the connection fails
        console.log("Failed to connect with MongoDB:", err);

    }
};


// ------------------------------------------
// POST API endpoint
// URL: http://localhost:8080/test
// ------------------------------------------
app.post("/test", async (req, res) => {

    try {

        // Send the user's message to the Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.Gemini_API_Key}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                // Request body required by the Gemini API
                body: JSON.stringify({

                    contents: [
                        {
                            parts: [
                                {
                                    // User's message received from the frontend
                                    text: req.body.message
                                }
                            ]
                        }
                    ]

                })
            }
        );

        // Convert the API response into JSON format
        const data = await response.json();

        // If Gemini returns an error, send it back to the frontend
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Extract the AI-generated reply
        // Optional chaining (?) prevents errors if any property is missing
        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response generated.";

        // Send the reply back to the frontend
        res.send(reply);

    } catch (err) {

        // Handle unexpected server errors
        console.error(err);

        res.status(500).send("Internal Server Error");
    }
});