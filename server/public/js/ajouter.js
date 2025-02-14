$(document).ready(function () {
  // formData
  const formData = {
    nom_recette: "",
    quantite_recette: null,
    unite_recette: "",
    type_recette: "",
    ingredients_recette: [],
    instructions_recette: [],
    variantes_recette: [],
    mots_cles_recette: [],
    mere_recette: null,
  };

  // check variante
  $checkVariante = $("#check_variante");
  $checkVariante.on("change", function () {
    $("#dropdown_recette_variante").toggle($checkVariante.prop("checked"));

    if (!$checkVariante.prop("checked")) {
      formData.mere_recette = null;
      $("#search_recette").val("");
      /* console.log("formData.mere_recette cleared:", formData.mere_recette); */
    }
  });

  // Recherche et ajout de la liste des types
  async function searchTypes() {
    try {
      const response = await fetch("/api/types", {
        method: "GET",
        headers: { "Content-type": "application/json" },
      });
      const results = await response.json();
      populateTypeOptions(results.valeurs_champ);
    } catch (error) {
      console.error("Error fetching recipe types:", error);
    }
  }
  searchTypes();

  function populateTypeOptions(options) {
    options.forEach((option) => {
      $("#type_recette").append(new Option(option, option));
    });
  }

  // recherche et selection recette liée

  const $searchInput = $("#search_recette");
  const $searchResults = $("#search_results");

  $searchInput.on("keyup", async function (e) {
    if (["Enter", "ArrowUp", "ArrowDown"].includes(e.key)) {
      return;
    }

    const searchTerm = $searchInput.val().trim();

    if (!searchTerm) {
      $searchResults.hide();
      return;
    }

    try {
      const response = await fetch("/api/listRecettes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ search: searchTerm }),
      });
      if (!response.ok) {
        console.error("Failed to fetch data");
        $searchResults.hide();
        return;
      }
      const data = await response.json();
      $searchResults.empty();

      if (data.length === 0) {
        const noResultItem = $("<li>")
          .addClass("list-group-item text-muted")
          .text("Aucune recette.");
        $searchResults.append(noResultItem);
      } else {
        data.forEach(function (recipe) {
          const listItem = $("<li>")
            .addClass("list-group-item list-group-item-action p-1 rounded")
            .text(recipe.nom_recette)
            .data("recipeId", recipe._id)
            .css("cursor", "pointer")
            .hover(
              function () {
                $(this).addClass("bg-secondary-subtle");
              },
              function () {
                $(this).removeClass("bg-secondary-subtle");
              }
            )
            .on("click", function () {
              $searchInput.val(recipe.nom_recette);
              formData.mere_recette = recipe._id;
              $searchResults.hide();
              console.log("Selected Recipe:", recipe);
            });

          $searchResults.append(listItem);
        });
      }

      $searchResults.show();
    } catch (error) {
      console.error("Error fetching search results:", error);
      $searchResults.hide();
    }
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".searchable-select").length) {
      $searchResults.hide();
    }
  });

  // Nom recette
  $("#nom_recette").on("input", function () {
    formData.nom_recette = $(this).val().trim();
    console.log("Updated formData:", formData);
  });

  // Quantité recette
  $("#quantite_recette").on("input", function () {
    let value = $(this).val().replace(",", ".");
    $(this).val(value);
    formData.quantite_recette = parseFloat(value) || null;
    console.log("Updated formData:", formData);
  });

  // Unité recette

  $(".dropdown-item").on("click", function () {
    formData.unite_recette = $(this).data("value");
    $("#unite_recette").text($(this).text());
    console.log("Updated formData:", formData);
  });

  // Type recette
  $("#type_recette").on("change", function () {
    formData.type_recette = $(this).val();
    console.log("Updated formData:", formData);
  });

  $(document).ready(function () {
    $("#ingredients").sortable({
      placeholder: "sortable-placeholder",
      update: function (event, ui) {
        updateIngredientOrder();
      },
    });

    // Add ingredient
    $("#ingredientForm").on("submit", function (event) {
      event.preventDefault();

      const ingredient = {
        nom_ingredient: $("#ingredientName").val().trim(),
        quantite_ingredient: parseFloat($("#ingredientQuantity").val()),
        unite_ingredient: $("#ingredientUnit").val(),
      };

      if (!ingredient.nom_ingredient || isNaN(ingredient.quantite_ingredient)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
      }

      formData.ingredients_recette.push(ingredient);
      console.log("Updated formData:", formData);

      // Create ingredient card
      const col = $("<div>")
        .addClass("col ingredient-item")
        .attr("data-name", ingredient.nom_ingredient);
      const card = $("<div>").addClass("card");
      const cardBody = $("<div>").addClass("card-body");
      cardBody.append(
        $("<p>")
          .addClass("fw-semibold card-title")
          .text(ingredient.nom_ingredient)
      );
      cardBody.append(
        $("<p>")
          .addClass("card-text")
          .text(
            `${ingredient.quantite_ingredient} ${ingredient.unite_ingredient}`
          )
      );

      const removeButton = $("<button>")
        .addClass("btn btn-sm btn-remove")
        .attr("aria-label", `Remove ingredient: ${ingredient.nom_ingredient}`)
        .append(
          $("<img>")
            .attr("src", "/assets/images/trash-red.svg")
            .css({ width: "20px", height: "20px" })
            .attr("alt", "Retirer")
        )
        .on("click", function () {
          formData.ingredients_recette = formData.ingredients_recette.filter(
            (ing) => ing.nom_ingredient !== ingredient.nom_ingredient
          );
          col.remove();
          console.log("Updated formData:", formData);
        });

      card.append(cardBody.append(removeButton));
      col.append(card);
      $("#ingredients").append(col);

      // Refresh sortable
      $("#ingredients").sortable("refresh");

      // Reset form and close modal
      $("#ingredientForm").trigger("reset");
      $("#ingredientModal").modal("hide");
    });

    function updateIngredientOrder() {
      const newOrder = [];
      $("#ingredients .ingredient-item").each(function () {
        const name = $(this).attr("data-name");
        const ingredient = formData.ingredients_recette.find(
          (ing) => ing.nom_ingredient === name
        );
        if (ingredient) {
          newOrder.push(ingredient);
        }
      });
      formData.ingredients_recette = newOrder;
      console.log("Updated order:", formData);
    }
  });

  // ajout des étapes
  $(document).ready(function () {
    //modification du style
    $("<style>")
      .prop("type", "text/css")
      .html(
        `
        @media (max-width: 768px) {
            .drag-handle {
                display: none !important;
            }
        }
    `
      )
      .appendTo("head");

    $("#etapes")
      .sortable({
        handle: ".drag-handle", // Drag handle
        placeholder: "sortable-placeholder",
        update: function () {
          formData.instructions_recette = $("#etapes textarea")
            .map(function () {
              return $(this).val();
            })
            .get();
          console.log("Reordered formData:", formData);
        },
      })
      .disableSelection();

    $("#addEtapeButton").on("click", function () {
      const etapeContainer = $("<div>").addClass("input-group mb-3");

      const dragHandle = $("<button>")
        .addClass("btn btn-outline-secondary drag-handle px-2 cursor-grab")
        .css({
          display: "flex",
          "align-items": "center",
          cursor: "grab",
        })
        .append(
          $("<img>")
            .attr("src", "/assets/images/drag-handle.svg")
            .attr("width", "20")
            .attr("height", "20")
            .attr("alt", "Déplacer")
        );

      const newEtapeArea = $("<textarea>")
        .addClass("form-control")
        .attr("rows", 4)
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
          const index = etapeContainer.index();
          formData.instructions_recette.splice(index, 1);
          etapeContainer.remove();
          console.log("Updated formData:", formData);
        });

      newEtapeArea.on("input", function () {
        const index = etapeContainer.index();
        formData.instructions_recette[index] = $(this).val();
        console.log("Updated formData:", formData);
      });

      etapeContainer.append(dragHandle, newEtapeArea, removeButton);
      $("#etapes").append(etapeContainer);
      formData.instructions_recette.push("");
      console.log("Updated formData:", formData);
    });
  });

  // Variants
  $("#addVarianteButton").on("click", function () {
    const varianteContainer = $("<div>").addClass("input-group mb-3");

    const newVarianteArea = $("<textarea>")
      .addClass("form-control")
      .attr("rows", 4)
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
        const index = varianteContainer.index();
        formData.variantes_recette.splice(index, 1);
        varianteContainer.remove();
        console.log("Updated formData:", formData);
      });

    newVarianteArea.on("input", function () {
      const index = varianteContainer.index();
      formData.variantes_recette[index] = $(this).val();
      console.log("Updated formData:", formData);
    });

    varianteContainer.append(newVarianteArea, removeButton);
    $("#variantes").append(varianteContainer);
    formData.variantes_recette.push("");
    console.log("Updated formData:", formData);
  });

  // Keywords
  $("#mots_cles_recette").on("input", function () {
    formData.mots_cles_recette = $(this)
      .val()
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");
    console.log("Updated formData:", formData);
  });

  // validation du formulaire

  function validateFormData(formData) {
    const missingFields = [];
    if (!formData.nom_recette || typeof formData.nom_recette !== "string") {
      missingFields.push("Nom de la recette");
    }
    if (
      !formData.instructions_recette ||
      !Array.isArray(formData.instructions_recette) ||
      formData.instructions_recette.length === 0
    ) {
      missingFields.push("Instructions de la recette");
    }
    if (
      !formData.ingredients_recette ||
      !Array.isArray(formData.ingredients_recette) ||
      formData.ingredients_recette.length === 0
    ) {
      missingFields.push("Ingrédients de la recette");
    }
    if (!formData.type_recette || typeof formData.type_recette !== "string") {
      missingFields.push("Type de la recette");
    }
    if (!formData.unite_recette || typeof formData.unite_recette !== "string") {
      missingFields.push("Unité de la recette");
    }
    if (
      !formData.quantite_recette ||
      typeof formData.quantite_recette !== "number" ||
      formData.quantite_recette <= 0
    ) {
      missingFields.push("Quantité de la recette");
    }
    if (missingFields.length > 0) {
      alert(`Il manque des informations : ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  }

  // Envoi du formulaire

  $("#addDataForm").on("submit", async function (event) {
    event.preventDefault();
    console.log("Final FormData before submission:", formData);
    if (validateFormData(formData)) {
      console.log("Form data is valid", formData);
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
          formData.ingredients_recette = [];
          formData.instructions_recette = [];
          formData.variantes_recette = [];
          formData.mots_cles_recette = [];
          console.log("FormData reset:", formData);
        } else {
          alert("Failed to add data.");
        }
      } catch (error) {
        console.error("Error during form submission:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      return;
    }
  });
});
