const DB_NAME = "myntra";
const cookieAccessOptions = {
  httpOnly: true,
  secure: true,
};

const subCategory = {
  men: [
    "Shirts",
    "T-Shirts",
    "Jeans",
    "Shorts",
    "Blazers",
    "Sweaters",
    "Sweatshirts",
    "Shoes",
  ],
  women: [
    "Tops",
    "T-Shirts",
    "Dresses",
    "Skirts",
    "Jeans",
    "Shorts",
    "Jackets",
    "Sweaters",
    "Heels",
    "Shoes",
  ],
  kids: {
    boys: [
      "Shirts",
      "T-Shirts",
      "Jeans",
      "Shorts",
      "Blazers",
      "Sweaters",
      "Sweatshirts",
      "Shoes",
      "Bags",
    ],
    girls: [
      "Tops",
      "T-Shirts",
      "Dresses",
      "Skirts",
      "Jeans",
      "Shorts",
      "Jackets",
      "Sweaters",
      "Heels",
      "Shoes",
    ],
  },
};

const category = ["men", "women", "kids"];
const size = ["S", "M", "L", "XL", "XXL", 20, 22, 24, 26, 28, 30, 32, 34, 36];

const color = [
  "black",
  "white",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "brown",
  "navy",
  "lightPink",
  "golden",
  "skin",
];

export { cookieAccessOptions, subCategory, category, size, color };
export default DB_NAME;
