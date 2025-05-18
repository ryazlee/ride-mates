const ANIMALS = [
    "cat",
    "dog",
    "lion",
    "tiger",
    "elephant",
    "giraffe",
    "zebra",
    "horse",
    "cow",
    "sheep",
    "goat",
    "pig",
    "rabbit",
    "deer",
    "bear",
    "wolf",
    "fox",
    "monkey",
    "gorilla",
    "chimpanzee",
    "kangaroo",
    "koala",
    "panda",
    "leopard",
    "cheetah",
    "jaguar",
    "buffalo",
    "bison",
    "camel",
    "donkey",
    "mule",
    "otter",
    "beaver",
    "badger",
    "hedgehog",
    "squirrel",
    "rat",
    "mouse",
    "hamster",
    "ferret",
    "bat",
    "raccoon",
    "skunk",
    "moose",
    "elk",
    "antelope",
    "reindeer",
    "walrus",
    "seal",
    "dolphin",
    "whale",
    "shark",
    "octopus",
    "squid",
    "crab",
    "lobster",
    "shrimp",
    "starfish",
    "jellyfish",
    "penguin",
    "ostrich",
    "emu",
    "eagle",
    "hawk",
    "falcon",
    "owl",
    "parrot",
    "canary",
    "sparrow",
    "robin",
    "crow",
    "raven",
    "magpie",
    "peacock",
    "flamingo",
    "swan",
    "goose",
    "duck",
    "chicken",
    "turkey",
    "pigeon",
    "dove",
    "woodpecker",
    "kingfisher",
    "heron",
    "stork",
    "pelican",
    "toucan",
    "lizard",
    "snake",
    "crocodile",
    "alligator",
    "turtle",
    "tortoise",
    "frog",
    "toad",
    "salamander",
    "newt",
    "chameleon",
    "iguana",
];

const colors = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "brown",
    "black",
    "white",
    "gray",
    "cyan",
    "magenta",
    "lime",
    "teal",
    "indigo",
    "violet",
    "maroon",
    "navy",
    "olive",
    "gold",
    "silver",
    "beige",
    "coral",
    "crimson",
    "salmon",
    "turquoise",
    "aqua",
    "azure",
    "lavender",
    "peach",
    "plum",
    "mint",
    "apricot",
    "amber",
    "emerald",
    "jade",
    "ruby",
    "sapphire",
    "topaz",
    "bronze",
    "charcoal",
    "ivory",
    "khaki",
    "mustard",
    "ochre",
    "periwinkle",
    "rose",
    "sand",
    "tan",
    "chocolate",
    "copper",
    "eggplant",
    "fuchsia",
    "honey",
    "lemon",
    "mauve",
    "mulberry",
    "orchid",
    "papaya",
    "raspberry",
    "scarlet",
    "sepia",
    "slate",
    "smoke",
    "steel",
    "sunflower",
    "thistle",
    "tomato",
    "wheat",
    "alabaster",
    "amethyst",
    "ash",
    "basil",
    "blush",
    "bubblegum",
    "carmine",
    "celadon",
    "cerulean",
    "claret",
    "denim",
    "ebony",
    "flax",
    "garnet",
    "glaucous",
    "heliotrope",
    "iris",
    "jasper",
    "leek",
    "malachite",
    "ochre",
    "onyx",
    "opal",
    "pearl",
    "pine",
    "quartz",
    "rust",
    "saffron",
    "taupe",
    "vermilion",
];

// List of accessible colors that work well on dark backgrounds
const ACCEPTABLE_COLORS = [
    "#FF6F61", // Coral
    "#6B5B95", // Purple
    "#88B04B", // Green
    "#F7CAC9", // Pink
    "#92A8D1", // Blue
    "#955251", // Brown
    "#B565A7", // Violet
    "#009B77", // Teal
    "#DD4124", // Red
    "#45B8AC", // Aqua
    "#EFC050", // Gold
    "#5B5EA6", // Indigo
    "#9B2335", // Burgundy
    "#DFCFBE", // Sand
    "#BC243C", // Crimson
    "#98B4D4", // Sky Blue
    "#C3447A", // Magenta
    "#6C4F3D", // Coffee
    "#FFA500", // Orange
    "#008080", // Dark Teal
    "#FFD700", // Yellow (deep)
    "#228B22", // Forest Green
    "#483D8B", // Dark Slate Blue
    "#20B2AA", // Light Sea Green
    "#00CED1", // Dark Turquoise
    "#DC143C", // Crimson
    "#00BFFF", // Deep Sky Blue
    "#8A2BE2", // Blue Violet
    "#00FF7F", // Spring Green
    "#FF1493", // Deep Pink
];

export const createUsername = () => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `${randomColor}-${randomAnimal}`.replace(" ", "-");
};

export const getColorFromUsername = (username: string) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = (hash << 5) - hash + username.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const idx = Math.abs(hash) % ACCEPTABLE_COLORS.length;
    return ACCEPTABLE_COLORS[idx];
};
