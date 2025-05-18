import { useEffect, useState } from "react";
import { createUsername, getColorFromUsername } from "../util/username";
import NearbyRiders from "./NearbyRiders";
import Chat from "./Chat";
import DestinationForm from "./DestinationForm";
import { api } from "../api";
import type { Rider } from "./types/rider";

export default function Main() {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [destination, setDestination] = useState<string | null>(null);
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [nearbyRiders, setNearbyRiders] = useState<Rider[]>([]);

    useEffect(() => {
        const fetchUsername = async () => {
            const stored = localStorage.getItem("username");
            if (stored) {
                const exists = await api.checkUsernameExists(stored);
                if (exists) {
                    setUsername(stored);
                    return;
                }
            }
            localStorage.removeItem("username");
            const newUsername = createUsername();
            localStorage.setItem("username", newUsername);
            setUsername(newUsername);
        };
        fetchUsername();
    }, []);

    useEffect(() => {
        if (location && username) {
            api.registerUser(username, location);
        }
    }, [location, username]);

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
        if (location && username) {
            api.getNearbyRiders(location, undefined, username).then(
                setNearbyRiders
            );
        }
    }, [location, username]);

    const handleDestinationFormSubmit = async (destination: string) => {
        if (!location || !username) return;

        setDestination(destination);
        api.updateRider(username, location, destination);
    };

    const getUserLocationStr = () => {
        return `(${location?.coords.latitude.toFixed(
            4
        )}, ${location?.coords.longitude.toFixed(4)})`;
    };

    return (
        <div className="p-4 font-mono">
            <h1 className="text-2xl mb-2">
                Want to split the rideshare cost? 🚕
            </h1>
            <p className="mb-4">
                See who else near you is headed to your destination
            </p>

            {location && username ? (
                <>
                    <p className="text-sm text-gray-600">
                        Username:{" "}
                        <span style={{ color: getColorFromUsername(username) }}>
                            {username}
                        </span>
                    </p>
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
                </>
            ) : (
                <p className="mb-4 text-sm text-gray-600">
                    Loading.... Please allow location access
                </p>
            )}

            {nearbyRiders && !destination && nearbyRiders.length > 0 && (
                <p className="text-xs text-gray-400 italic">
                    There {nearbyRiders.length === 1 ? "is" : "are"}{" "}
                    {nearbyRiders.length} rider
                    {nearbyRiders.length === 1 ? "" : "s"} nearby!
                </p>
            )}

            {!destination && (
                <DestinationForm onDidSubmit={handleDestinationFormSubmit} />
            )}

            {chatModalOpen && chatRoomId && username && (
                <Chat
                    username={username}
                    roomId={chatRoomId}
                    onDidCloseChat={() => setChatModalOpen(false)}
                />
            )}

            {destination && username && (
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
