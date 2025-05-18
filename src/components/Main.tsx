import { useEffect, useState } from "react";
import { createUsername, getColorFromUsername } from "../util/username";
import type { Rider } from "./types/rider";
import NearbyRiders from "./NearbyRiders";
import socket from "../socket/socket";
import Chat from "./Chat";
import DestinationForm from "./DestinationForm";

export default function Main() {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [destination, setDestination] = useState<string | null>(null);
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
            navigator.geolocation.getCurrentPosition(setLocation, (err) =>
                console.error("Location error", err)
            );
        } else {
            console.error("Geolocation is not supported.");
        }
    }, []);

    useEffect(() => {
        socket.emit("register_user", username);
    }, []);

    const handleDestinationFormSubmit = async (destination: string) => {
        if (!location) return;

        setDestination(destination);

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
            const res = await fetch("http://localhost:3000/new_rider", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRider),
            });

            if (!res.ok) throw new Error("Failed to post rider");
        } catch (err) {
            console.error("Failed to submit rider", err);
        }
    };

    const getUserLocationStr = () => {
        return `(${location?.coords.latitude.toFixed(
            4
        )}, ${location?.coords.latitude.toFixed(4)})`;
    };

    return (
        <div className="p-4 font-mono">
            <h1 className="text-2xl mb-2">
                Want to split the rideshare cost? 🚕
            </h1>
            <p className="mb-4">
                See who else near you is headed to your destination
            </p>
            <p className="text-sm text-gray-600">
                Username:{" "}
                <span style={{ color: getColorFromUsername(username) }}>
                    {username}
                </span>
            </p>

            {location ? (
                <p className="mb-4 text-sm text-gray-600">
                    Location:{" "}
                    <span style={{ color: getColorFromUsername(username) }}>
                        {getUserLocationStr()}
                    </span>
                    <br />
                    {destination && (
                        <>
                            Destination:{" "}
                            <span
                                style={{
                                    color: getColorFromUsername(username),
                                }}
                            >
                                {destination}
                            </span>
                        </>
                    )}
                </p>
            ) : (
                <p className="mb-4 text-sm text-gray-600">
                    We are trying to get your location...
                </p>
            )}

            {!destination && (
                <DestinationForm onDidSubmit={handleDestinationFormSubmit} />
            )}

            {chatModalOpen && chatRoomId && (
                <Chat
                    username={username}
                    roomId={chatRoomId}
                    onDidCloseChat={() => setChatModalOpen(false)}
                />
            )}

            {destination && (
                <>
                    <NearbyRiders
                        username={username}
                        userLocation={location}
                        onDidOpenChat={(roomId) => {
                            setChatRoomId(roomId);
                            setChatModalOpen(true);
                        }}
                    />
                </>
            )}
        </div>
    );
}
