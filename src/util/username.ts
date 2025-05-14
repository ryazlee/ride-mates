const ANIMALS = [
    "cat", "dog", "lion", "tiger", "elephant", "giraffe", "zebra", "horse", "cow", "sheep",
    "goat", "pig", "rabbit", "deer", "bear", "wolf", "fox", "monkey", "gorilla", "chimpanzee",
    "kangaroo", "koala", "panda", "leopard", "cheetah", "jaguar", "buffalo", "bison", "camel", "donkey",
    "mule", "otter", "beaver", "badger", "hedgehog", "squirrel", "rat", "mouse", "hamster", "guinea pig",
    "ferret", "bat", "raccoon", "skunk", "moose", "elk", "antelope", "reindeer", "walrus", "seal",
    "dolphin", "whale", "shark", "octopus", "squid", "crab", "lobster", "shrimp", "starfish", "jellyfish",
    "penguin", "ostrich", "emu", "eagle", "hawk", "falcon", "owl", "parrot", "canary", "sparrow",
    "robin", "crow", "raven", "magpie", "peacock", "flamingo", "swan", "goose", "duck", "chicken",
    "turkey", "pigeon", "dove", "woodpecker", "kingfisher", "heron", "stork", "pelican", "toucan",
    "lizard", "snake", "crocodile", "alligator", "turtle", "tortoise", "frog", "toad", "salamander",
    "newt", "chameleon", "iguana"
];

const colors = [
    "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "black", "white",
    "gray", "cyan", "magenta", "lime", "teal", "indigo", "violet", "maroon", "navy", "olive",
    "gold", "silver", "beige", "coral", "crimson", "salmon", "turquoise", "aqua", "azure", "lavender",
    "peach", "plum", "mint", "apricot", "amber", "emerald", "jade", "ruby", "sapphire", "topaz",
    "bronze", "charcoal", "ivory", "khaki", "mustard", "ochre", "periwinkle", "rose", "sand", "tan",
    "chocolate", "copper", "eggplant", "fuchsia", "honey", "lemon", "mauve", "mulberry", "orchid", "papaya",
    "raspberry", "scarlet", "sepia", "slate", "smoke", "steel", "sunflower", "thistle", "tomato", "wheat",
    "alabaster", "amethyst", "ash", "basil", "blush", "bubblegum", "carmine", "celadon", "cerulean", "claret",
    "denim", "ebony", "flax", "garnet", "glaucous", "heliotrope", "iris", "jasper", "leek", "malachite",
    "ochre", "onyx", "opal", "pearl", "pine", "quartz", "rust", "saffron", "taupe", "vermilion"
];

export const createUsername = () => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `${randomColor}-${randomAnimal}`;
}
