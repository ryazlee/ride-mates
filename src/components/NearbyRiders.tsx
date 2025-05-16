import { useEffect, useState } from "react";
import type { Rider } from "./types/rider";
import socket from "../socket/socket";

export default function NearbyRiders({
    username,
    userLocation,
}: {
    username: string;
    userLocation: GeolocationPosition | null;
}) {
    const [riders, setRiders] = useState<Rider[]>([]);

    useEffect(() => {
        const fetchNearby = () => {
            if (!userLocation) return;

            const { latitude, longitude } = userLocation.coords;
            fetch(`http://localhost:3000/nearby_riders?lat=${latitude}&lon=${longitude}&maxDistance=10`)
                .then((res) => res.json())
                .then((data: Rider[]) => {
                    const filtered = data.filter((r) => r.id !== username);
                    setRiders(filtered);
                })
                .catch((err) => console.error("Failed to fetch riders", err));
        };

        fetchNearby();
        const interval = setInterval(fetchNearby, 5000);
        return () => clearInterval(interval);
    }, [userLocation]);

    return (
        <div className="mt-6">
            <h2 className="text-lg mb-2">Nearby Riders</h2>
            {riders.length === 0 ? (
                <p className="text-sm text-gray-500">No one nearby yet. Check back soon!</p>
            ) : (
                <ul>
                    {riders.map((rider) => (
                        <li key={rider.id} className="flex items-center space-x-2 mb-2">
                            <button
                                onClick={() => {
                                    socket.emit("start_chat_with", {
                                        fromUserId: username,
                                        toUserId: rider.id,
                                        roomId: [username, rider.id].sort().join("-"),
                                    });
                                }}
                                className="bg-transparent hover:bg-gray-100 rounded p-1"
                                style={{ cursor: "pointer" }}
                                aria-label={`Chat with ${rider.name}`}
                            >
                                💬
                            </button>
                            <span>
                                {rider.name} headed to {rider.destination}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
