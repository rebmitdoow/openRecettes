const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const uri = process.env.MONGO_URI;
const namedb = process.env.DB_NAME;
mongoose
  .connect(uri, { dbName: namedb })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const recettesSchema = new mongoose.Schema(
  {
    nom_recette: String,
    ingredients_recette: [Object],
    instructions_recette: [Object],
    variantes_recette: [String],
    mots_cles_recette: [String],
    unite_recette: String,
    quantite_recette: Number,
    type_recette: String,
    source_recette: String,
  },
  { collection: "recettes" }
);

const Recettes = mongoose.model("Recettes", recettesSchema);

const champsSchema = new mongoose.Schema(
  {
    nom_champ: String,
    valeurs_champ: [String],
  },
  { collection: "champs" }
);
const Champs = mongoose.model("Champs", champsSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/recette", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "recette.html"));
});

app.get("/ajouter", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ajouter.html"));
});

app.post("/api/listRecettes", async (req, res) => {
  const { keywords, type_recette, search } = req.body;
  const query = {};
  const stopWords = [
    "de",
    "et",
    "la",
    "le",
    "les",
    "des",
    "du",
    "un",
    "une",
    "en",
    "à",
    "au",
  ];

  // Initialize arrays for AND and OR conditions
  const andConditions = [];
  const orConditions = [];

  // If search term is provided, apply $text search
  if (search) {
    // Normalize and remove stop words
    const words = search
      .split(/\s+/)
      .filter((word) => !stopWords.includes(word) && word.length > 0)
      .map((word) => word.toLowerCase()); // Normalize by converting to lowercase

    // Perform a $text search in the 'nom_recette' field
    if (words.length > 0) {
      query.$text = { $search: words.join(" ") }; // Using $text search
    }
  }

  // Handle the 'keywords' logic if provided
  if (keywords && Array.isArray(keywords) && keywords.length > 0) {
    const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
    const keywordConditions = normalizedKeywords.map((keyword) => ({
      mots_cles_recette: { $regex: new RegExp(keyword, "i") },
    }));
    andConditions.push({ $and: keywordConditions });
  }

  // Handle 'type_recette' if provided
  if (type_recette) {
    andConditions.push({ type_recette: type_recette.toLowerCase() });
  }

  // Apply AND conditions if there are any
  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  // Execute query
  try {
    console.log("Query:", JSON.stringify(query, null, 2));
    const results = await Recettes.find(query).select("nom_recette");
    res.json(results);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

app.get("/api/recette", async (req, res) => {
  const recetteId = req.query.id;

  try {
    const recette = await Recettes.findById(recetteId);

    if (!recette) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(recette);
  } catch (error) {
    console.error("Error fetching item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the item." });
  }
});

app.get("/api/types", async (req, res) => {
  try {
    const types_recette = await Champs.findOne({ nom_champ: "type_recette" });

    if (!types_recette) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(types_recette);
  } catch (error) {
    console.error("Error fetching item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the item." });
  }
});

app.post("/api/ajouterRecette", async (req, res) => {
  try {
    const recetteData = req.body;
    const recette = new Recettes(recetteData);
    const result = await recette.save();
    res
      .status(200)
      .json({ message: "Recette ajoutée avec succès", data: result });
  } catch (error) {
    console.error("Error adding recipe:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la recette" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
