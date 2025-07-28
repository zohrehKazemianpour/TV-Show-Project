//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  const container = document.getElementById("container");
  allEpisodes.forEach((episode) => {
    const card = createEpisodeCard(episode);
    container.appendChild(card);
  });
}

const template = document.getElementById("episode-template");

const createEpisodeCard = (episode) => {
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
