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

app.post("/api/search", async (req, res) => {
  const normalizeString = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const { keywords, type_recette } = req.body;

  const query = {};

  if (keywords && Array.isArray(keywords) && keywords.length > 0) {
    const normalizedKeywords = keywords.map((keyword) =>
      normalizeString(keyword)
    );
    const regexConditions = normalizedKeywords.map((keyword) => {
      const regexPattern = `\\b${keyword.replace(/\s+/g, "\\s*")}(s?)\\b`;
      const regex = new RegExp(regexPattern, "i");
      return { mots_cles_recette: { $regex: regex } };
    });
    if (regexConditions.length > 0) {
      query.$or = regexConditions;
    }
  }

  if (type_recette) {
    query.type_recette = normalizeString(type_recette);
  }

  try {
    console.log("Query:", query);
    const results = await Recettes.find(query);
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
