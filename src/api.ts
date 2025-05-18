import type { Rider } from "./components/types/rider";
import { registerSocketUser } from "./socket/socket";
import { API_URL } from "./util/url";

class API {
    apiUrl: string;

    constructor() {
        this.apiUrl = API_URL;
    }

    async registerUser(
        id: string,
        location: GeolocationPosition,
        destination?: string
    ) {
        if (!id || !location) {
            throw new Error("User ID and location are required");
        }
        try {
            const { latitude, longitude } = location.coords;
            const res = await fetch(`${this.apiUrl}/new_rider`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    location: {
                        lat: latitude,
                        lon: longitude,
                    },
                    destination,
                }),
            });

            if (!res.ok) throw new Error("Failed to register user");
            registerSocketUser(id);
        } catch (err) {
            console.error("Failed to register user", err);
        }
    }

    async updateRider(
        id: string,
        location: GeolocationPosition,
        destination: string
    ) {
        if (!id || !location) {
            throw new Error("Username and location are required");
        }
        try {
            const { latitude, longitude } = location.coords;
            const res = await fetch(`${this.apiUrl}/new_rider`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    location: {
                        lat: latitude,
                        lon: longitude,
                    },
                    destination,
                }),
            });

            if (!res.ok) throw new Error("Failed to post rider");
        } catch (err) {
            console.error("Failed to submit rider", err);
        }
    }

    async getNearbyRiders(
        location: GeolocationPosition,
        maxDistance: number = 2,
        excludeId?: string
    ): Promise<Rider[]> {
        if (!location) return [];
        try {
            const { latitude, longitude } = location.coords;
            const res = await fetch(
                `${this.apiUrl}/nearby_riders?lat=${latitude}&lon=${longitude}&maxDistance=${maxDistance}`
            );
            if (!res.ok) throw new Error("Failed to fetch riders");
            let data: Rider[] = await res.json();
            if (excludeId) {
                data = data.filter((r) => r.id !== excludeId);
            }
            return data;
        } catch (err) {
            console.error("Failed to fetch riders", err);
            return [];
        }
    }

    checkUsernameExists = async (username: string) => {
        if (!username) return false;
        try {
            const res = await fetch(
                `${this.apiUrl}/check_username_exists?username=${username}`
            );
            if (!res.ok) throw new Error("Failed to check username");
            const { exists } = await res.json();
            return exists;
        } catch (err) {
            console.error("Failed to check username", err);
            return false;
        }
    };
}

export const api = new API();
