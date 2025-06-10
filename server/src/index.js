require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const configureServer = require("./config/server");
const setupSocketHandlers = require("./socket/socketHandlers");
const findAvailablePort = require("./utils/portFinder");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Configure server
configureServer(app);

// Setup socket handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

// Start server with port handling
findAvailablePort(PORT)
  .then((port) => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      process.env.REACT_APP_SERVER_PORT = port;
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
