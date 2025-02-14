$(document).ready(function () {
  const $searchInput = $("#textSearch");
  const $keywordInput = $("#motCles");
  const $searchButton = $("#boutonRecherche");
  const $resultList = $("#listeResultats");
  const $typeOptions = $("#typesRecette");

  $("#toggleSearchDetails").click(function (e) {
    e.preventDefault();
    const searchDetails = $(".searchDetails");
    searchDetails.toggleClass("d-none d-flex");
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
    /* console.log(results.valeurs_champ); */
    populateTypeOptions(results.valeurs_champ);
  }

  $searchButton.on("click", async function (event) {
    event.preventDefault();
    await triggerSearch();
  });
  $searchInput.on("keydown", async function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      await triggerSearch();
    }
  });
  async function triggerSearch() {
    const type_recette = $typeOptions.val();
    const keywords = $keywordInput
      .val()
      .split(",")
      .map((keyword) => keyword.trim().toLowerCase())
      .filter((keyword) => keyword !== "");
    const search = $searchInput.val();
    try {
      const response = await fetch("/api/listRecettes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords, type_recette, search }),
      });

      if (!response.ok) {
        throw new Error("Error fetching data from server");
      }

      const results = await response.json();
      displayResults(results);
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred while performing the search. Please try again.");
    }
  }

  function displayResults(results) {
    $resultList.empty();

    if (results.length === 0) {
      $resultList.append(
        "<div class='col'><div class='card'><div class='card-body'>Aucun résultat</div></div></div>"
      );
      return;
    }

    results.forEach((item) => {
      const $button = $("<button>")
        .attr("type", "button")
        .addClass("btn btn-link text-decoration-none text-start w-100")
        .text(item.nom_recette)
        .on("click", function () {
          window.open(`/recette?id=${item._id}`, "_blank");
        });

      const $cardBody = $("<div>").addClass("card-body");
      const $card = $("<div>").addClass("card");

      $cardBody.append($button);
      $card.append($cardBody);

      const $col = $("<div>").addClass("col").append($card);

      $resultList.append($col);
    });
  }

  searchTypes();
});
