
function setup() {
  render();
  fetchEpisodes();
}
// Update appState to include loading and error states
const appState = {
  episodes:[],
  searchTerm: "",
  isLoading: true,
  error: null
};

async function fetchEpisodes() {
  try {
    const response = await fetch('https://api.tvmaze.com/shows/82/episodes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    appState.episodes = data;
    appState.isLoading = false;
    render();
    populateEpisodeSelector();
  } catch (error) {
    appState.error = error.message;
    appState.isLoading = false;
    renderError();
  }
}

// New function to render error state
function renderError() {
  const rootElem = document.getElementById("episode-container");
  rootElem.innerHTML = `
    <div class="error-message">
      <h3>Error loading episodes</h3>
      <p>${appState.error}</p>
      <button onclick="fetchEpisodes()">Retry</button>
    </div>
  `;
}

// New function to render loading state
function renderLoading() {
  const rootElem = document.getElementById("episode-container");
  rootElem.innerHTML = `
    <div class="loading-message">
      <div class="spinner"></div>
      <p>Loading episodes...</p>
    </div>
  `;
}

const template = document.getElementById("episode-template");

const createFilmCard = (film) => {
  // This function creates a card for each episode
  const episodeElem = template.content.cloneNode(true);

  const titleElem = episodeElem.querySelector(".title"); // line 17 to line 22 handles the title display
  const seasonElem = episodeElem.querySelector(".season-number");
  const episodeCode = `S${film.season.toString().padStart(2, "0")}E${film.number
    .toString()
    .padStart(2, "0")}`;
  titleElem.textContent = `${film.name} - ${episodeCode}`;

  const imageElem = episodeElem.querySelector(".image"); //line 23 to line 30 handles the image display
  if (film.image && film.image.medium) {
    imageElem.src = film.image.medium;
    imageElem.alt = film.name || "Episode image";
  } else {
    imageElem.src = "https://via.placeholder.com/210x118?text=No+Image";
    imageElem.alt = "No image available";
  }

  episodeElem.querySelector(".summary").innerHTML = film.summary;

  return episodeElem;
};

const searchInput = document.getElementById("mySearch");
searchInput.addEventListener("input", handleSearchInput);

function handleSearchInput(event) {
  appState.searchTerm = event.target.value;
  render();
}

function render() {
  // 1. Clear the container
  const rootElem = document.getElementById("episode-container");
    if (appState.isLoading) {
    rootElem.innerHTML = `<div class="loading">Loading episodes...</div>`;
    return;
  }

  if (appState.error) {
    rootElem.innerHTML = `
      <div class="error">
        <p>Error: ${appState.error}</p>
        <button onclick="fetchEpisodes()">Retry</button>
      </div>
    `;
    return;
  }
  rootElem.innerHTML = "";

  // 2. Filter the episodes
  const filteredEpisodes = appState.episodes.filter((episode) => {
    const nameMatch = episode.name
      .toLowerCase()
      .includes(appState.searchTerm.toLowerCase());
    const summaryMatch = episode.summary
      .toLowerCase()
      .includes(appState.searchTerm.toLowerCase());
    return nameMatch || summaryMatch;
  });

  const searchCount = document.getElementById("search-count");
  searchCount.innerHTML = `displaying:${filteredEpisodes.length}/${appState.episodes.length}`;

  // 3. Render the episodes
  const episodeElemments = filteredEpisodes.map(createFilmCard); // This line maps each episode to a card element
  episodeElemments.forEach((elem) => {
    // This line appends each card element to the root element
    rootElem.appendChild(elem); // Appending the created episode element to the root element
  });
}
const populateEpisodeSelector = () => {
  const select = document.getElementById("episode-select");
    select.innerHTML = ""; // Clear existing options
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select an Episode";
  defaultOption.selected = true; // This makes it the default selection
  select.appendChild(defaultOption);
  for (let i = 0; i < appState.episodes.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    const episode = appState.episodes[i];
    option.innerHTML = `S${episode.season
      .toString()
      .padStart(2, "0")}E${episode.number.toString().padStart(2, "0")}-${
      episode.name
    }`;

    select.appendChild(option);
  }
};
const episodeSelector = document.getElementById("episode-select");
episodeSelector.addEventListener("change", function () {
  const selectedIndex = this.value;
  selectedEpisode = appState.episodes[selectedIndex];

  const rootElem = document.getElementById("episode-container");
  rootElem.innerHTML = "";
  const existingButtons = document.querySelectorAll(
    '[data-button="scroll-back"]'
  );
  existingButtons.forEach((button) => button.remove());
  const scrollBack = document.createElement("button");
  scrollBack.setAttribute("data-button", "scroll-back");
  scrollBack.textContent = "Back to All Episodes";
  scrollBack.addEventListener("click", function () {
    render();
  });
  const footer = document.querySelector("footer");
  document.body.insertBefore(scrollBack, footer);
  rootElem.appendChild(createFilmCard(selectedEpisode));
});

window.onload = setup;