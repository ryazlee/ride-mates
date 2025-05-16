import { useEffect, useState } from "react";
import { createUsername } from "../util/username";
import type { Rider } from "./types/rider";
import NearbyRiders from "./NearbyRiders";
import socket from "../socket/socket";
import Chat from "./Chat";

export default function Main() {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [destination, setDestination] = useState("");
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);

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
            <p className="mb-2 text-sm text-gray-500">
                Username: <span className="font-mono">{username}</span>
            </p>

            {location ? (
                <p className="mb-4 text-sm text-gray-600">
                    Your location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </p>
            ) : (
                <p className="mb-4 text-sm text-gray-600">
                    We are trying to get your location...
                </p>
            )}

            <div className="mb-4 flex flex-col gap-2">
                <input
                    type="text"
                    placeholder="Destination"
                    className="p-2 border rounded"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
                <button
                    onClick={handleSubmit}
                    className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 transition"
                >
                    Need a ride
                </button>
            </div>

            {chatModalOpen && chatRoomId && (
                <Chat
                    username={username}
                    roomId={chatRoomId}
                    onDidCloseChat={() => setChatModalOpen(false)}
                />
            )}

            <NearbyRiders
                username={username}
                userLocation={location}
                onDidOpenChat={(roomId) => {
                    setChatRoomId(roomId);
                    setChatModalOpen(true);
                }}
            />


        </div>
    );
}
