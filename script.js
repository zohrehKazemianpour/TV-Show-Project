//You can edit ALL of the code here
function setup() { // This function runs when the page is loaded
  const allEpisodes = getAllEpisodes();
  const container = document.getElementById("container");
  allEpisodes.forEach((episode) => {
    const card = createEpisodeCard(episode);
    container.appendChild(card);
  });

  const searchInput = document.getElementById("searchInput");
  const matchCount = document.getElementById("matchCount");

  searchInput.addEventListener("input", () => { // Add an event listener for input changes in the search box
    const searchTerm = searchInput.value; // Keep original casing

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const title = episode.name;
      const summary = episode.summary || "";
      return title.includes(searchTerm) || summary.includes(searchTerm); // case-sensitive match
    });
  
  
    container.innerHTML = ""; // Clear previous results
    filteredEpisodes.forEach((episode) => {
      const card = createEpisodeCard(episode);
      container.appendChild(card);
    });

    const totalEpisodes = allEpisodes.length; // Total number of episodes
    matchCount.textContent = `Displaying ${filteredEpisodes.length}/${totalEpisodes} episodes`; // Display the count of matched episodes
   
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
