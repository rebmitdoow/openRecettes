const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

const app = express();
const PORT = process.env.PORT;

app.use(cors());
/* app.use(apiLimiter); */

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
    mere_recette: mongoose.ObjectId,
    fille_recette: mongoose.ObjectId,
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

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/recette", (req, res) => {
  if (!req.query.id) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public", "recette.html"));
});

app.get("/ajouter", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ajouter.html"));
});

const diacriticRegex = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split("")
    .map((char) => {
      const diacriticMap = {
        a: "[aàáâãäå]",
        e: "[eèéêë]",
        i: "[iìíîï]",
        o: "[oòóôõö]",
        u: "[uùúûü]",
        c: "[cç]",
        n: "[nñ]",
      };
      return diacriticMap[char.toLowerCase()] || char;
    })
    .join("");
};

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
  const andConditions = [];
  const orConditions = [];

  if (search) {
    const normalizedSearch = search.toLowerCase().trim();
    const words = normalizedSearch
      .split(/\s+/)
      .filter((word) => !stopWords.includes(word) && word.length > 0);

    if (words.length > 0) {
      const searchConditions = words.map((word) => ({
        nom_recette: { $regex: new RegExp(diacriticRegex(word), "i") },
      }));
      orConditions.push(...searchConditions);
    }
  }

  if (keywords && Array.isArray(keywords) && keywords.length > 0) {
    const normalizedKeywords = keywords.map((keyword) =>
      keyword.toLowerCase().trim()
    );
    const keywordConditions = normalizedKeywords.map((keyword) => ({
      mots_cles_recette: { $regex: new RegExp(diacriticRegex(keyword), "i") },
    }));
    andConditions.push({ $and: keywordConditions });
  }

  if (type_recette) {
    andConditions.push({
      type_recette: type_recette.toLowerCase(),
    });
  }

  if (orConditions.length > 0) {
    query.$or = orConditions;
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  try {
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
