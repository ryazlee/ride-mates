import { useEffect, useState } from "react";
import type { Rider } from "./types/rider";
import socket from "../socket/socket";

type PendingChat = {
    fromUserId: string;
    roomId: string;
};

export default function NearbyRiders({
    username,
    userLocation,
    onDidOpenChat,
}: {
    username: string;
    userLocation: GeolocationPosition | null;
    onDidOpenChat: (roomId: string) => void;
}) {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [pendingChats, setPendingChats] = useState<PendingChat[]>([]);

    useEffect(() => {
        const handleChatRequest = ({ fromUserId, roomId }: PendingChat) => {
            setPendingChats((prev) => [...prev, { fromUserId, roomId }]);
        };

        socket.on("notify_chat_request", handleChatRequest);
        return () => {
            socket.off("notify_chat_request", handleChatRequest);
        };
    }, []);

    useEffect(() => {
        const fetchNearby = () => {
            if (!userLocation) return;

            const { latitude, longitude } = userLocation.coords;
            fetch(
                `http://localhost:3000/nearby_riders?lat=${latitude}&lon=${longitude}&maxDistance=10`
            )
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

    const onDidOpenChatHandler = (toUserId: string) => {
        const roomId = [username, toUserId].sort().join("-");
        socket.emit("start_chat_with", {
            fromUserId: username,
            toUserId: toUserId,
            roomId: [username, roomId].sort().join("-"),
        });
        onDidOpenChat(roomId);
    };

    return (
        <div className="mt-6">
            <h2 className="text-lg mb-2">Nearby Riders</h2>
            {riders.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No one nearby yet. Check back soon!
                </p>
            ) : (
                <ul>
                    {riders.map((rider) => (
                        <li key={rider.id} className="flex items-center">
                            <div
                                style={{
                                    position: "relative",
                                    display: "inline-block",
                                }}
                            >
                                <button
                                    onClick={() => {
                                        onDidOpenChatHandler(rider.id);
                                    }}
                                    className="bg-transparent hover:bg-gray-100 rounded p-1"
                                    style={{ cursor: "pointer" }}
                                >
                                    💬
                                </button>
                                {pendingChats.some(
                                    (chat) => chat.fromUserId === rider.id
                                ) && (
                                    <span
                                        className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full"
                                        style={{
                                            transform: "translate(50%, -50%)",
                                        }}
                                    />
                                )}
                            </div>
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
