const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3001;

// Middleware
app.use(cors({
    origin: "http://localhost:4173", // Allow requests from your React app
    methods: ["GET", "POST"],
    credentials: true, // Optional, if you need to send cookies or other credentials
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb+srv://amolspatil018:amolspatil018@cluster0.6ysqk.mongodb.net/....", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));

// Define a message schema
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

// Create a message model
const Message = mongoose.model("Message", messageSchema);

// Socket.IO connection
io.on("connection", (socket) => {
    console.log("A user connected");

    // Load previous messages
    Message.find().then(messages => {
        socket.emit("previous messages", messages);
    });

    // Listen for chat messages
    socket.on("chat message", (data) => {
        console.log("Message received:", data); // Log the received message

        // Save message to the database
        const message = new Message(data);
        message.save().then(() => {
            io.emit("chat message", data); // Emit the message to all connected clients
            console.log("Message sent to clients:", data); // Log the sent message
        });
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});