// src/components/Chat.tsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // backend

export default function Chat({ roomId }: { roomId: string }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        socket.emit("join_room", roomId);

        socket.on("receive_message", (msg: string) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("receive_message");
        };
    }, [roomId]);

    const sendMessage = () => {
        if (!message) return;
        socket.emit("send_message", { roomId, message });
        setMessages((prev) => [...prev, message]); // locally echo
        setMessage("");
    };

    return (
        <div className="border p-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Chat Room: {roomId}</h2>
            <div className="h-40 overflow-y-auto mb-2 border p-2 bg-gray-50">
                {messages.map((msg, idx) => (
                    <p key={idx}>{msg}</p>
                ))}
            </div>
            <input
                className="w-full p-2 border rounded mb-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something..."
            />
            <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded w-full"
            >
                Send
            </button>
        </div>
    );
}
