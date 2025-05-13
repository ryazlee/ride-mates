import { useEffect, useState } from "react";

type Rider = {
    id: string;
    name: string;
    location: { lat: number; lon: number };
    destination: string;
};

export default function Main() {
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [destination, setDestination] = useState("");
    const [name, setName] = useState("");
    const [riders, setRiders] = useState<Rider[]>([]);

    // 1. Get user location
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation(pos),
            (err) => console.error("Location error", err)
        );
    }, []);

    // 2. Fetch riders on mount
    useEffect(() => {
        fetch("http://localhost:3000/riders")
            .then((res) => res.json())
            .then(setRiders)
            .catch((err) => console.error("Failed to fetch riders", err));
    }, []);

    // 3. Post new rider to backend
    const handleSubmit = async () => {
        if (!location || !destination || !name) return;

        const newRider: Omit<Rider, "id"> = {
            name,
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

            const created = await res.json();
            setRiders((prev) => [...prev, created]);
            setDestination("");
            setName("");
        } catch (err) {
            console.error("Failed to submit rider", err);
        }
    };

    return (
        <div className="p-4 font-sans">
            <h1 className="text-2xl mb-2">✈️ Need a ride?</h1>
            <p className="mb-4">See who's headed your way from the airport.</p>

            {location ? (
                <p className="mb-4 text-sm text-gray-600">
                    Your location: {location.coords.latitude.toFixed(4)},{" "}
                    {location.coords.longitude.toFixed(4)}
                </p>
            ) : (
                <p className="mb-4 text-sm text-gray-600">We are trying to get your location...</p>
            )}

            <input
                type="text"
                placeholder="Enter your name"
                className="w-full p-2 mb-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

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

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Other riders near you:</h2>
                {riders.length === 0 ? (
                    <p className="text-sm text-gray-500">No one else yet.</p>
                ) : (
                    <ul>
                        {riders.map((rider) => (
                            <li key={rider.id} className="mb-2">
                                <strong>{rider.name}</strong> ➡️ {rider.destination}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
