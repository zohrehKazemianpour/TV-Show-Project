function setup() {
  const allEpisodes = getAllEpisodes();
  const container = document.getElementById("container");
  const selector = document.getElementById("selector");
  const searchInput = document.getElementById("searchInput");
  const matchCount = document.getElementById("matchCount");

  // Add default "All episodes" option
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = "All episodes";
  selector.appendChild(defaultOption);

  // Display all episodes and populate the selector
  allEpisodes.forEach((episode) => {
    const card = createEpisodeCard(episode);
    container.appendChild(card);

    const option = document.createElement("option");
    option.value = episode.id; // 🔥 This is key
    option.textContent = `S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')} - ${episode.name}`;
    selector.appendChild(option);
  });

  // Selector filter functionality
  selector.addEventListener("change", () => {
    const selectedId = selector.value;
    container.innerHTML = ""; // clear current cards

    if (selectedId === "all") {
      allEpisodes.forEach((episode) => {
        const card = createEpisodeCard(episode);
        container.appendChild(card);
      });
      matchCount.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episodes`;
    } else {
      const selectedEpisode = allEpisodes.find(
        (ep) => ep.id.toString() === selectedId
      );
      if (selectedEpisode) {
        const card = createEpisodeCard(selectedEpisode);
        container.appendChild(card);
        matchCount.textContent = `Displaying 1/${allEpisodes.length} episodes`;
      } else {
        matchCount.textContent = `No match found.`;
      }
    }
  });

  // Search filter functionality
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredEpisodes = allEpisodes.filter((episode) => {
      const title = episode.name.toLowerCase();
      const summary = (episode.summary || "").toLowerCase();
      return title.includes(searchTerm) || summary.includes(searchTerm);
    });

    container.innerHTML = "";
    filteredEpisodes.forEach((episode) => {
      const card = createEpisodeCard(episode);
      container.appendChild(card);
    });

    matchCount.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episodes`;
  });
}


const template = document.getElementById("episode-template");

const createEpisodeCard = (episode) => { // Create a new card for each episode
  const card = template.content.cloneNode(true);
  const episodeName = (card.querySelector(".title").textContent = episode.name);
  const episodeSeason = episode.season.toString().padStart(2, "0");
  const episodeNumber = episode.number.toString().padStart(2, "0");

  const episodeCode = (card.querySelector(
    ".episode-code"
  ).innerHTML = `S${episodeSeason}E${episodeNumber}`);
  const episodeImageSrc = (card.querySelector(".episode-image").src =
    episode.image.medium);
  const episodeImageAlt = (card.querySelector(
    ".episode-image"
  ).alt = `Image for ${episodeName}`);
  const episodeSummary = (card.querySelector(".summary").textContent =
    episode.summary.replace(/<\/?p>/g, "").trim());

  return card;
  
};

window.onload = setup;
