const baseUrl = "http://localhost:3005"
let portionsNb = 1;
let recetteData = {};

const $portions = $("#portionsNb");

$portions.on("change", updatePortions);

$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const recetteId = urlParams.get("id");

  try {
    const response = await fetch(
      `/api/recette?id=${recetteId}`
    );

    if (!response.ok) {
      throw new Error("Error fetching data from server");
    }

    recetteData = await response.json();

    portionsNb = recetteData.quantite_recette || 1;
    $portions.val(portionsNb);

    document.title =
      `${recetteData.nom_recette} | Open Recettes` || "Open Recettes";
    console.log("mots cles", recetteData.mots_cles_recette);

    displayItemName(recetteData);
    displayUnite(recetteData);
    displayIngredients(recetteData);
    displayInstructions(recetteData.instructions_recette);
    displayVariantes(recetteData.variantes_recette);
    displayMotsCles(recetteData.mots_cles_recette);
  } catch (error) {
    console.error("Error fetching item:", error);
    $("#itemDetails").html("<p>Error loading item details.</p>");
  }
});

function displayItemName(item) {
  $("#recetteName").html(`<h2>${item.nom_recette}</h2>`);
}

function displayUnite(item) {
  $("#uniteRecette").html(item.unite_recette);
}

function displayIngredients(recetteData) {
  const $ingredientListe = $("#ingredientsListe");
  $ingredientListe.empty();

  const ingredients = recetteData.ingredients_recette;
  const quantite_totale = recetteData.quantite_recette;

  ingredients.forEach((ingredient) => {
    const adjustedMass =
      (ingredient.quantite_ingredient / quantite_totale) * portionsNb;
    const listItem = `<li><b>${ingredient.nom_ingredient} :</b> ${adjustedMass
      .toFixed(2)
      .replace(".", ",")} ${ingredient.unite_ingredient}</li>`;
    $ingredientListe.append(listItem);
  });
}

function updateIngredients() {
  displayIngredients(recetteData);
}

function updatePortions() {
  portionsNb = parseFloat($portions.val());
  displayIngredients(recetteData);
}

function displayInstructions(instructions) {
  const $instructionListe = $("#instructionsListe");
  $instructionListe.empty();
  if (
    instructions &&
    instructions.length > 0 &&
    instructions[0].hasOwnProperty("nom_etape")
  ) {
    instructions.forEach((instruction) => {
      const stepTitle = $("<h4>").text(instruction.nom_etape);
      $instructionListe.append(stepTitle);
      if (
        instruction.instructions_etape &&
        instruction.instructions_etape.length > 0
      ) {
        instruction.instructions_etape.forEach((etape) => {
          const $substepItem = $("<li>").text(etape);
          $instructionListe.append($substepItem);
        });
      }
    });
  } else {
    instructions.forEach((instruction) => {
      const $listItem = $("<li>").text(instruction);
      $instructionListe.append($listItem);
    });
  }
}

function displayVariantes(variantes) {
  const $variantesListe = $("#variantesListe");
  const $variantesDiv = $(".variantes");
  $variantesListe.empty();

  if (variantes && variantes.length > 0) {
    $variantesDiv.show();
    variantes.forEach((variante) => {
      const listItem = `<li>${variante}</li>`;
      $variantesListe.append(listItem);
    });
  } else {
    $variantesDiv.hide();
  }
}

function displayMotsCles(motsCles) {
  const $keywordsContainer = $("#keywords");
  const $keywordsDiv = $(".motsCles");
  $keywordsContainer.empty();

  if (motsCles && motsCles.length > 0) {
    $keywordsDiv.show();
    motsCles.forEach((motCle) => {
      const keywordItem = `<span>${motCle}<span>`;
      $keywordsContainer.append(keywordItem);
    });
  } else {
    $keywordsDiv.hide();
  }
}
