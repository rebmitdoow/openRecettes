$(document).ready(function () {
  const $searchInput = $("#textSearch");
  const $keywordInput = $("#motCles");
  const $searchButton = $("#boutonRecherche");
  const $resultList = $("#listeResultats");
  const $typeOptions = $("#typesRecette");

  $("#toggleSearchDetails").click(function () {
    const searchDetails = $(".searchDetails");
    if (searchDetails.css("display") === "none") {
      searchDetails.css("display", "flex");
    } else {
      searchDetails.css("display", "none");
    }
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

  $searchButton.on("click", async function () {
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
      /* console.log(results); */
      displayResults(results);
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred while performing the search. Please try again.");
    }
  });

  function displayResults(results) {
    $resultList.empty();

    if (results.length === 0) {
      $resultList.append("<i>Aucun résultat</i>");
      return;
    }

    results.forEach((item) => {
      const $listItem = $("<li>");
      const $link = $("<a>")
        .attr("href", `/recette?id=${item._id}`)
        .attr("target", "_blank")
        .addClass("card-link");
      const $title = $("<h3>").text(item.nom_recette);

      $link.append($title);
      $listItem.append($link);
      $resultList.append($listItem);
    });
  }

  searchTypes();
});
