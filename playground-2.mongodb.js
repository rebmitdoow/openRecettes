// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

use("openRecettes");

db.getCollection("recettes").find({ $text: { $search: "truc noisettes" } });

/* db.getCollection("recettes").createIndex({ nom_recette: "text" }); */
