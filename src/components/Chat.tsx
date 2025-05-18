import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getColorFromUsername } from "../util/username";
import { API_URL } from "../util/url";

const socket = io(API_URL);

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
    const [chatCreatedAt, setChatCreatedAt] = useState<Date | null>(null);

    useEffect(() => {
        socket.emit("join_room", roomId);

        socket.on(
            "chat_metadata",
            (chatMetadata: { messages: string[]; createdAt: Date }) => {
                setMessages(chatMetadata.messages);
                setChatCreatedAt(chatMetadata.createdAt);
            }
        );

        return () => {
            socket.off("chat_metadata");
        };
    }, [roomId]);

    const sendMessage = () => {
        if (!message.trim()) return;
        const timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        const msg = `[${timestamp}] ${username}: ${message}`;
        socket.emit("send_message", { roomId, message: msg });
        setMessage("");
    };

    return (
        <div className="flex z-50">
            <div className="w-full max-w-md bg-white border border-gray-200 p-4 shadow-lg rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {roomId}
                    </span>
                    {chatCreatedAt && (
                        <span className="text-xs text-gray-500 ml-2">
                            Expires:{" "}
                            {new Date(
                                new Date(chatCreatedAt).getTime() +
                                    60 * 60 * 1000
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}
                        </span>
                    )}
                    <button
                        onClick={onDidCloseChat}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                        aria-label="Close chat"
                    >
                        &times;
                    </button>
                </div>

                <div
                    className="h-48 overflow-y-auto text-sm border rounded p-2 mb-2 bg-gray-50 space-y-1"
                    ref={(el) => {
                        // Save ref for scrolling
                        if (el) {
                            // Scroll to bottom on mount/update
                            el.scrollTop = el.scrollHeight;
                        }
                    }}
                >
                    <div className="text-gray-500 text-center text-xs mb-2">
                        Welcome to the chat room! This room will be deleted in
                        30 minutes, so we suggest you coordinate a meeting
                        location and time. Happy chatting! 🚕
                    </div>
                    {messages.map((msg, idx) => {
                        // Extract username using regex: [HH:MM] username:
                        const match = msg.match(/^\[\d{2}:\d{2}\]\s+([^:]+):/);
                        const user = match ? match[1] : "";
                        const color = getColorFromUsername(user);
                        return (
                            <div
                                key={idx}
                                className="break-words"
                                style={{ color }}
                            >
                                {msg}
                            </div>
                        );
                    })}
                </div>

                <input
                    className="w-full p-2 border rounded mb-2 text-sm"
                    value={message}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            sendMessage();
                        }
                    }}
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
