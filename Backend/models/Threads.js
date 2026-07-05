import mongoose from "mongoose";

// ---------------------------------------
// Schema for a single message in a chat
// ---------------------------------------
const MessageSchema = new mongoose.Schema({

    // Stores who sent the message
    // It can only be "user" or "assistant"
    role: {
        type: String,
        enum: ["user", "assistant"], // Allowed values
        required: true               // This field is mandatory
    },

    // Stores the actual message text
    content: {
        type: String,
        required: true               // Every message must have content
    },

    // Stores the time when the message was created
    // Date.now is called automatically whenever a new message is added
    timestamp: {
        type: Date,
        default: Date.now
    }
});


// ---------------------------------------
// Schema for an entire chat thread
// A thread contains multiple messages
// ---------------------------------------
const ThreadSchema = new mongoose.Schema({

    // Unique ID for each conversation
    // Example:
    // "thread_12345"
    threadId: {
        type: String,
        required: true,
        unique: true                 // No two threads can have the same ID
    },

    // Title of the chat
    // Initially every chat is named "New Chat"
    // Later you can update it based on the conversation
    title: {
        type: String,
        default: "New Chat"
    },

    // Array of messages
    // Every element inside this array follows MessageSchema
    // Example:
    // [
    //   { role: "user", content: "Hello" },
    //   { role: "assistant", content: "Hi!" }
    // ]
    messages: [MessageSchema],

    // Stores when the chat was created
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Stores the last time this chat was updated
    // You should update this field whenever a new message is added
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


// ---------------------------------------
// Create a MongoDB model named "Thread"
// This model is used to perform CRUD
// operations on the threads collection
// ---------------------------------------
export default mongoose.model("Thread", ThreadSchema);