import { useState } from "react";

export default function DestinationForm({
    onDidSubmit,
}: {
    onDidSubmit: (destination: string) => void;
}) {
    const [destination, setDestination] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!destination.trim()) return;
        onDidSubmit(destination);
        setDestination("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center">
            <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter your destination"
                className="w-full p-2 border rounded text-sm"
            />
            <button type="submit" className="ml-2 bg-blue-500 text-white p-2 rounded">
                Submit
            </button>
        </form>
    );
}