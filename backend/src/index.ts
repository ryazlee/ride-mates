import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Vite frontend
        methods: ["GET", "POST"],
    },
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
        location: { lat: 40.7368, lon: -73.9817 },
        destination: "Union Square",
    },
    {
        id: "2",
        name: "Bob Lee",
        location: { lat: 37.7849, lon: -122.4094 },
        destination: "Mission District",
    },
];

// Haversine formula to calculate the distance between two geographical points
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // returns the distance in kilometers
}

// Helper function to convert degrees to radians
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// POST route to register a rider
app.post("/riders", (req, res) => {
    const rider: Rider = { ...req.body };
    const existingRider = riders.find((r) => r.name === rider.name);
    if (existingRider) {
        const index = riders.findIndex((r) => r.name === rider.name);
        riders[index] = rider;
    } else {
        riders.push(rider);
    }

    // Emit to all connected clients
    io.emit("new_rider", rider);

    res.status(200).json(rider); // send back with ID
});

// GET route to get all riders
app.get("/riders", (req, res) => {
    res.json(riders);
});

// GET route to filter nearby riders based on location and maxDistance (in km)
app.get("/nearby_riders", (req, res) => {
    const { lat, lon, maxDistance = 5 } = req.query; // maxDistance in km (default 5 km)

    const nearbyRiders = riders.filter((rider) => {
        const distance = calculateDistance(
            Number(lat),
            Number(lon),
            rider.location.lat,
            rider.location.lon
        );
        return distance <= Number(maxDistance);
    });

    res.json(nearbyRiders);
});

const userSockets = new Map<string, string>(); // userId -> socket.id
const chatNotified = new Map<string, Set<string>>(); // userId -> Set<roomId>

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.on("register_user", (userId) => {
        userSockets.set(userId, socket.id);
        // Initialize notification state for new users
        chatNotified.set(userId, new Set());
    });

    socket.on("start_chat_with", ({ fromUserId, toUserId, roomId }) => {
        // Check if this user has already received a notification for this chat room
        const notifiedUsers = chatNotified.get(toUserId) || new Set();

        if (!notifiedUsers.has(roomId)) {
            const toSocketId = userSockets.get(toUserId);
            if (toSocketId) {
                // Send chat request notification
                io.to(toSocketId).emit("notify_chat_request", {
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
