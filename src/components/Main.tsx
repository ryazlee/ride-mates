import { useEffect, useState } from "react";
import { createUsername } from "../util/username";
import type { Rider } from "./types/rider";
import NearbyRiders from "./NearbyRiders";
import socket from "../socket/socket";

export default function Main() {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [destination, setDestination] = useState("");
    const [pendingChats, setPendingChats] = useState<{ fromUserId: string; roomId: string }[]>([]);

    const [username] = useState(() => {
        const stored = localStorage.getItem("username");
        if (stored) return stored;
        const newUsername = createUsername();
        localStorage.setItem("username", newUsername);
        return newUsername;
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                setLocation,
                (err) => console.error("Location error", err)
            );
        } else {
            console.error("Geolocation is not supported.");
        }
    }, []);

    useEffect(() => {
        socket.emit("register_user", username);
    }, []);

    useEffect(() => {
        const handleChatRequest = ({ fromUserId, roomId }: { fromUserId: string; roomId: string }) => {
            setPendingChats((prev) => [...prev, { fromUserId, roomId }]);
        };

        socket.on("notify_chat_request", handleChatRequest);
        return () => {
            socket.off("notify_chat_request", handleChatRequest);
        };
    }, []);

    const handleSubmit = async () => {
        if (!location || !destination) return;

        const newRider: Rider = {
            id: username,
            name: username,
            location: {
                lat: location.coords.latitude,
                lon: location.coords.longitude,
            },
            destination,
        };

        try {
            const res = await fetch("http://localhost:3000/riders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRider),
            });

            if (!res.ok) throw new Error("Failed to post rider");

            // No need to add to state here — the socket's "new_rider" event will do it
            setDestination("");
        } catch (err) {
            console.error("Failed to submit rider", err);
        }
    };

    return (
        <div className="p-4 font-sans">
            <h1 className="text-2xl mb-2">Want to split a ride? 🚕</h1>
            <p className="mb-4">See who's headed your way from the airport.</p>
            <p className="mb-2 text-sm text-gray-500">Username: <span className="font-mono">{username}</span></p>

            {location ? (
                <p className="mb-4 text-sm text-gray-600">
                    Your location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </p>
            ) : (
                <p className="mb-4 text-sm text-gray-600">We are trying to get your location...</p>
            )}

            <input
                type="text"
                placeholder="Enter your destination"
                className="w-full p-2 mb-2 border rounded"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
            />

            <button
                onClick={handleSubmit}
                className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg text-lg hover:bg-gray-300 transition duration-200"
            >
                I need a ride
            </button>

            <NearbyRiders username={username} userLocation={location} />

            {pendingChats.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg mb-2">Pending Chat Requests</h2>
                    <ul>
                        {pendingChats.map((chat, idx) => (
                            <li key={idx}>
                                <p>Chat request from {chat.fromUserId}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
