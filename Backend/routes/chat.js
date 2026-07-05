// Import Express to create routes
import express from "express";

// Import the Thread model to interact with the MongoDB collection
import Threads from "../models/Threads.js";

// Import the function that sends a message to Gemini and returns its response
import getGeminiAPIResponse from "../utils/gemini.js";

// Create a new Express Router
// Instead of writing all routes inside server.js, we keep them here
const router = express.Router();

// ====================================================
// TEST ROUTE
// ====================================================
// This route creates a dummy thread in MongoDB
// URL: POST /test
router.post("/test", async (req, res) => {
  try {
    // Create a new Thread document
    const thread = new Threads({
      threadId: "xyz",
      title: "testing new thread",
    });

    // Save the document into MongoDB
    const response = await thread.save();

    // Send the saved document back
    res.send(response);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "failed to save in db",
    });
  }
});

// ====================================================
// GET ALL THREADS
// ====================================================
// URL: GET /thread
// Returns all chat threads
router.get("/thread", async (req, res) => {
  try {
    // Fetch all threads
    // Sort them in descending order using updatedAt
    // The most recently updated chat appears first
    const threads = await Threads.find({}).sort({ updatedAt: -1 });

    res.json(threads);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "failed to fetch threads",
    });
  }
});

// ====================================================
// GET ALL MESSAGES OF A SINGLE THREAD
// ====================================================
// URL Example:
// GET /thread/abc123
router.get("/thread/:threadId", async (req, res) => {
  // Extract threadId from the URL
  const { threadId } = req.params;

  try {
    // Find the thread using threadId
    const thread = await Threads.findOne({ threadId });

    // If no thread exists
    if (!thread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    // Return only the messages
    res.json(thread.messages);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch chat",
    });
  }
});

// ====================================================
// DELETE A THREAD
// ====================================================
// URL Example:
// DELETE /thread/abc123
router.delete("/thread/:threadId", async (req, res) => {
  // Read threadId from URL
  const { threadId } = req.params;

  try {
    // Delete the thread from MongoDB
    const deletedThread = await Threads.findOneAndDelete({ threadId });

    // If thread doesn't exist
    if (!deletedThread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    // Success response
    res.status(200).json({
      success: "Thread deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to delete thread",
    });
  }
});

// ====================================================
// CHAT ROUTE
// ====================================================
// URL: POST /chat
//
// Expected Request:
//
// {
//     "threadId": "123",
//     "message": "Hello"
// }
router.post("/chat", async (req, res) => {
  // Read data sent by frontend
  const { threadId, message } = req.body;

  // Validate request
  if (!threadId || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    // Search for the conversation in MongoDB
    let thread = await Threads.findOne({ threadId });

    // ========================================
    // CASE 1
    // Thread does not exist
    // ========================================
    if (!thread) {
      // Create a new conversation
      thread = new Threads({
        threadId,

        // Use the first message as title
        title: message,

        // Store the user's first message
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });
    }

    // ========================================
    // CASE 2
    // Thread already exists
    // ========================================
    else {
      // Add the user's new message
      thread.messages.push({
        role: "user",
        content: message,
      });
    }

    // ========================================
    // Send message to Gemini
    // ========================================
    const assistantReply = await getGeminiAPIResponse(message);

    // Save Gemini's reply into the conversation
    thread.messages.push({
      role: "assistant",

      content: assistantReply,
    });

    // Update the last modified time
    thread.updatedAt = new Date();

    // Save updated conversation
    await thread.save();

    // Send Gemini's reply back to frontend
    res.json({
      reply: assistantReply,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

// Export the router
// It will be imported into server.js
export default router;
