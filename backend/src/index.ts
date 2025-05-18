import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { calculateHaversineDistance } from "./utils";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
    "http://localhost:5173",
    "https://ride-mates-one.vercel.app",
    "https://www.ridemates.org",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST"],
        credentials: true,
    })
);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.use(express.json());

type Rider = {
    id: string;
    location: { lat: number; lon: number };
    destination?: string;
    timestamp?: number; // Undefined for persistent riders
};

// Initial fake riders
const riders: Rider[] = [
    {
        id: "Dummy1",
        location: { lat: 37.8032, lon: 37.8032 },
        destination: "Union Square",
    },
    {
        id: "Dummy2",
        location: { lat: 37.7849, lon: -122.4094 },
        destination: "Mission District",
    },
];
const userSockets = new Map<string, { socketId: string; addedAt: number }>(); // userId -> { socketId, addedAt }
const chats = new Map<string, { messages: string[]; createdAt: number }>();
const chatNotified = new Map<string, Set<string>>(); // userId -> Set<roomId>

app.get("/check_username_exists", (req, res) => {
    const { username } = req.query;
    const existingRider = riders.find((r) => r.id === username);
    res.status(200).json({
        exists: existingRider !== undefined,
        allRiders: riders.map((r) => r.id),
    });
});

app.post("/new_rider", (req, res) => {
    const rider: Rider = { ...req.body, timestamp: Date.now() };
    const existingRider = riders.find((r) => r.id === rider.id);
    if (existingRider) {
        const index = riders.findIndex((r) => r.id === rider.id);
        riders[index] = rider;
    } else {
        riders.push(rider);
    }

    chatNotified.set(rider.id, new Set());

    res.status(200).json(rider); // send back with ID
});

// GET route to filter nearby riders based on location and maxDistance (in km)
app.get("/nearby_riders", (req, res) => {
    const { lat, lon, maxDistance = 2 } = req.query;

    const nearbyRiders = riders.filter((rider) => {
        if (!rider.location || !rider.destination) return false;

        const distance = calculateHaversineDistance(
            Number(lat),
            Number(lon),
            rider.location.lat,
            rider.location.lon
        );
        return distance <= Number(maxDistance);
    });

    res.json(nearbyRiders);
});

io.on("connection", (socket) => {
    socket.on("register_user", ({ userId }) => {
        userSockets.set(userId, {
            socketId: socket.id,
            addedAt: Date.now(),
        });
        chatNotified.set(userId, chatNotified.get(userId) || new Set());
    });

    socket.on("start_chat_with", ({ fromUserId, toUserId, roomId }) => {
        if (!chats.has(roomId)) {
            chats.set(roomId, { messages: [], createdAt: Date.now() });
        }

        // Check if this user has already received a notification for this chat room
        const notifiedUsers = chatNotified.get(toUserId) || new Set();

        if (!notifiedUsers.has(roomId)) {
            const toUserSocket = userSockets.get(toUserId);
            if (toUserSocket) {
                io.to(toUserSocket.socketId).emit("notify_chat_request", {
                    fromUserId,
                    roomId,
                });
                // Mark the notification as sent for this room
                notifiedUsers.add(roomId);
                chatNotified.set(toUserId, notifiedUsers);
            }
        }
    });

    socket.on("join_room", (roomId) => {
        if (!chats.has(roomId)) {
            chats.set(roomId, { messages: [], createdAt: Date.now() });
        }

        socket.join(roomId);

        // Emit to everyone in the room, including the joining socket
        io.to(roomId).emit("chat_metadata", chats.get(roomId));
    });

    socket.on("send_message", ({ roomId, message }) => {
        chats.get(roomId)?.messages.push(message);

        // Emit updated chat to all clients in the room
        io.to(roomId).emit("chat_metadata", chats.get(roomId));
    });

    socket.on("disconnect", () => {
        for (const [userId, { socketId }] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                chatNotified.delete(userId);
            }
        }
    });
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log(`[INFO] Backend running on port ${port}`);
});

// Chron Cleanup Job
const CLEANUP_INTERVAL = 60 * 1000; // every 1 min
const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour

setInterval(() => {
    const now = Date.now();

    // Clean riders
    let removedRiders = 0;
    for (let i = riders.length - 1; i >= 0; i--) {
        const rider = riders[i];
        if (!rider.timestamp) continue; // Skip persistent riders
        if (now - rider.timestamp > EXPIRY_TIME) {
            riders.splice(i, 1);
            removedRiders++;
        }
    }
    if (removedRiders > 0) {
        console.log(`[INFO] Removed ${removedRiders} expired rider(s).`);
    }

    // Clean user sockets
    let removedSockets = 0;
    for (const [userId, { addedAt }] of userSockets.entries()) {
        if (now - addedAt > EXPIRY_TIME) {
            userSockets.delete(userId);
            chatNotified.delete(userId);
            removedSockets++;
        }
    }
    if (removedSockets > 0) {
        console.log(`[INFO] Removed ${removedSockets} expired user socket(s).`);
    }

    // Clean chats
    let removedChats = 0;
    for (const [roomId, { createdAt }] of chats.entries()) {
        if (now - createdAt > EXPIRY_TIME) {
            chats.delete(roomId);
            removedChats++;
        }
    }
    if (removedChats > 0) {
        console.log(`[INFO] Removed ${removedChats} expired chat(s).`);
    }
}, CLEANUP_INTERVAL);
