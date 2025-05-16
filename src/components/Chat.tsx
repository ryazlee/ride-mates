import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Chat({
    username,
    roomId,
    onDidCloseChat,
}: {
    username: string;
    roomId: string;
    onDidCloseChat: () => void;
}) {
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
        if (!message.trim()) return;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const msg = `[${timestamp}] ${username}: ${message}`;
        socket.emit("send_message", { roomId, message: msg });
        setMessages((prev) => [...prev, msg]);
        setMessage("");
    };

    return (
        <div className="flex justify-center z-50">
            <div className="w-full max-w-md bg-white border-t border-gray-200 p-3 shadow-md rounded-t-md">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{roomId}</span>
                    <button
                        onClick={onDidCloseChat}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                        aria-label="Close chat"
                    >
                        &times;
                    </button>
                </div>

                <div className="h-48 overflow-y-auto text-sm border rounded p-2 mb-2 bg-gray-50 space-y-1">
                    <div className="text-gray-500 text-center text-xs mb-2">
                        Welcome to the chat room!  This Room will be deleted in 30 minutes, so we suggest you
                        find a meeting point and time.  Happy chatting! 🚕
                    </div>
                    {messages.map((msg, idx) => (
                        <div key={idx} className="break-words">{msg}</div>
                    ))}
                </div>

                <input
                    className="w-full p-2 border rounded mb-2 text-sm"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm p-2 rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
