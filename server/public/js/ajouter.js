$(document).ready(function () {
  $(".dropdown-item").on("click", function () {
    const selectedText = $(this).text();
    const selectedValue = $(this).data("value");
    $("#unite_recette").text(selectedText);
    console.log("Selected Data-Value:", selectedValue);
  });

  const $typeOptions = $("#type_recette");
  const ingredientsData = [];

  $("#addingredientButton").on("click", function () {
    $("#ingredientModal").show();
  });

  $("#closeModalButton").on("click", function () {
    $("#ingredientModal").hide();
  });

  $("#ingredientForm").on("submit", function (event) {
    event.preventDefault();
    const ingredientName = $("#ingredientName").val().trim();
    const ingredientQuantity = parseFloat($("#ingredientQuantity").val());
    const ingredientUnit = $("#ingredientUnit").val();

    if (!ingredientName || isNaN(ingredientQuantity)) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }

    const ingredient = {
      nom_ingredient: ingredientName,
      quantite_ingredient: ingredientQuantity,
      unite_ingredient: ingredientUnit,
    };
    ingredientsData.push(ingredient);
    console.log(ingredientsData);
    const col = $("<div>").addClass("col");
    const card = $("<div>").addClass("card");
    const cardBody = $("<div>").addClass("card-body");
    cardBody.append(
      $("<p>").addClass("fw-semibold card-title").text(`${ingredientName}`)
    );
    cardBody.append(
      $("<p>")
        .addClass("card-text")
        .text(`${ingredientQuantity} ${ingredientUnit}`)
    );
    const cardFooter = $("<div>").addClass("text-end");
    const removeButton = $("<button>")
      .addClass("btn btn-sm")
      .attr("aria-label", `Remove ingredient: ${ingredientName}`)
      .append(
        $("<img>")
          .attr("src", "/assets/images/trash-red.svg")
          .css({ width: "20", height: "20" })
          .attr("alt", "Retirer")
      )
      .on("click", function () {
        const index = ingredientsData.findIndex(
          (ing) =>
            ing.nom_ingredient === ingredientName &&
            ing.quantite_ingredient === ingredientQuantity &&
            ing.unite_ingredient === ingredientUnit
        );
        if (index !== -1) ingredientsData.splice(index, 1);
        card.remove();
      });
    cardFooter.append(removeButton);
    cardBody.append(cardFooter);
    card.append(cardBody);
    col.append(card);
    $("#ingredients").append(col);
    $("#ingredientForm").trigger("reset");
    $("#ingredientModal").modal("hide");

    console.log(ingredientsData);
  });

  $("#addEtapeButton").on("click", function () {
    const dynamicTextAreas = $("#etapes");
    const container = $("<div>").addClass("input-group mb-3");

    const newTextArea = $("<textarea>")
      .addClass("form-control")
      .attr("rows", 4)
      .attr("cols", 50)
      .attr("placeholder", "Description de l'étape");

    const removeButton = $("<button>")
      .addClass("btn btn-outline-danger")
      .attr("aria-label", "Remove step")
      .append(
        $("<img>")
          .attr("src", "/assets/images/trash-red.svg")
          .attr("width", "20")
          .attr("height", "20")
          .attr("alt", "Retirer")
      )
      .on("click", function () {
        container.remove();
      });

    container.append(newTextArea, removeButton);
    dynamicTextAreas.append(container);
  });

  $("#addVarianteButton").on("click", function () {
    const dynamicTextAreas = $("#variantes");
    const container = $("<div>").addClass("input-group mb-3");

    const newTextArea = $("<textarea>")
      .addClass("form-control")
      .attr("rows", 4)
      .attr("cols", 50)
      .attr("placeholder", "Description");

    const removeButton = $("<button>")
      .addClass("btn btn-outline-danger")
      .attr("aria-label", "Remove step")
      .append(
        $("<img>")
          .attr("src", "/assets/images/trash-red.svg")
          .attr("width", "20")
          .attr("height", "20")
          .attr("alt", "Retirer")
      )
      .on("click", function () {
        container.remove();
      });

    container.append(newTextArea, removeButton);
    dynamicTextAreas.append(container);
  });

  $("#quantite_recette").on("input", function () {
    let value = $(this).val();
    if (value.includes(",")) {
      value = value.replace(",", ".");
    }
    $(this).val(value);
  });

  $(document).ready(function () {
    $(".dropdown-item").on("click", function () {
      const selectedText = $(this).text();
      const selectedValue = $(this).data("value");
      $("#unite_recette").text(selectedText);
      $("#unite_recette").data("value", selectedValue);
    });

    $("#addDataForm").on("submit", async function (event) {
      event.preventDefault();

      console.log("Ingredients Data before form submission:", ingredientsData);
      const nom_recette = $("#nom_recette").val();
      const quantite_recette = parseFloat($("#quantite_recette").val());
      const unite_recette = $("#unite_recette").data("value");
      const type_recette = $("#type_recette").val();

      const instructions_recette = $(".etape-textarea")
        .map(function () {
          return $(this).val().trim();
        })
        .get()
        .filter((note) => note !== "");

      const variantes_recette = $(".variante-textarea")
        .map(function () {
          return $(this).val().trim();
        })
        .get()
        .filter((note) => note !== "");

      const mots_cles_recette = $("#mots_cles_recette")
        .val()
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const formData = {
        nom_recette,
        quantite_recette,
        unite_recette,
        variantes_recette,
        instructions_recette,
        mots_cles_recette,
        ingredients_recette: [...ingredientsData],
        type_recette,
      };
      console.log("FormData before submission:", formData);
      try {
        const response = await $.ajax({
          url: `/api/ajouterRecette`,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(formData),
        });
        if (response) {
          alert("Data added successfully!");
          $("#addDataForm").trigger("reset");
          $("#ingredients").empty();
          ingredientsData.length = 0;
        } else {
          alert("Failed to add data.");
        }
      } catch (error) {
        console.error("Error during form submission:", error);
        alert("An error occurred. Please try again.");
      }
    });
  });

  function populateTypeOptions(options) {
    options.forEach((option) => {
      $typeOptions.append(new Option(option, option));
    });
  }

  async function searchTypes() {
    const response = await fetch("/api/types", {
      method: "GET",
      headers: { "Content-type": "application/json" },
    });
    const results = await response.json();
    populateTypeOptions(results.valeurs_champ);
  }
  searchTypes();
});

$(document).ready(function () {
  const $searchInput = $("#search_recette");
  const $searchResults = $("#search_results");
  let selectedRecipe = null;
  let highlightedIndex = -1;
  $searchInput.on("input", async function () {
    const searchValue = $searchInput.val().trim();
    if (searchValue.length < 2) {
      $searchResults.hide();
      return;
    }

    try {
      const response = await $.ajax({
        url: "/api/listRecettes",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ search: searchValue }),
      });

      $searchResults.empty();

      if (response && Array.isArray(response) && response.length > 0) {
        response.forEach((recipe, index) => {
          const listItem = $("<li>")
            .addClass("dropdown-item")
            .text(recipe.nom_recette)
            .data("recipe-id", recipe._id)
            .on("click", function () {
              selectedRecipe = {
                _id: $(this).data("recipe-id"),
                nom_recette: $(this).text(),
              };
              $searchInput.val(selectedRecipe.nom_recette);
              $searchResults.hide();
              console.log("Selected Recipe:", selectedRecipe);
            });

          $searchResults.append(listItem);
        });
      } else {
        const noResultsItem = $("<li>")
          .addClass("dropdown-item text-muted")
          .text("Pas de recette")
          .css("pointer-events", "none");
        $searchResults.append(noResultsItem);
      }

      $searchResults.show();
      highlightedIndex = -1;
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  $searchInput.on("keydown", function (e) {
    const items = $searchResults.find("li");
    if (items.length === 0) return;

    if (e.key === "ArrowDown") {
      highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === "ArrowUp") {
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selectedItem = items.eq(highlightedIndex);
      selectedRecipe = {
        _id: selectedItem.data("recipe-id"),
        nom_recette: selectedItem.text(),
      };
      $searchInput.val(selectedRecipe.nom_recette);
      $searchResults.hide();
      console.log("Selected Recipe:", selectedRecipe);
    }
  });
  function updateHighlight(items) {
    items.removeClass("bg-primary text-white");
    if (highlightedIndex >= 0) {
      items.eq(highlightedIndex).addClass("bg-primary text-white");
    }
  }
  $(document).on("click", function (e) {
    if (!$(e.target).closest("#search_recette, #search_results").length) {
      $searchResults.hide();
    }
  });
  $("#addDataForm").on("submit", function (event) {
    event.preventDefault();
    const formData = {
      linked_recipe: selectedRecipe,
    };
    console.log("FormData with linked recipe:", formData);
  });
});
