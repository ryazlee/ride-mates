export type Rider = {
    id: string;
    name: string;
    location: { lat: number; lon: number };
    destination: string;
};