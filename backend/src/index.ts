import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

type Rider = {
  id: string;
  name: string;
  location: { lat: number; lon: number };
  destination: string;
};

// Initial fake riders
const riders: Rider[] = [
  {
    id: "1",
    name: "Alice Johnson",
    location: { lat: 37.7749, lon: -122.4194 },
    destination: "Union Square"
  },
  {
    id: "2",
    name: "Bob Lee",
    location: { lat: 37.7849, lon: -122.4094 },
    destination: "Mission District"
  }
];

// REST endpoint to register a rider
app.post("/riders", (req, res) => {
  const rider: Rider = {
    id: Date.now().toString(), // Add ID server-side
    ...req.body
  };
  riders.push(rider);
  res.status(201).json(rider);
});

// REST endpoint to fetch all riders
app.get("/riders", (req, res) => {
  res.json(riders);
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", ({ roomId, message }) => {
    socket.to(roomId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected:", socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
