import { ACCEPTABLE_TEXT_COLORS, ANIMALS, COLORS } from "../const/constants";

export const createUsername = () => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    return `${randomColor}-${randomAnimal}`.replace(" ", "-");
};

export const getColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = (hash << 5) - hash + username.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const idx = Math.abs(hash) % ACCEPTABLE_TEXT_COLORS.length;
    return ACCEPTABLE_TEXT_COLORS[idx];
};
