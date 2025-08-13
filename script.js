// app state
const appState = {
  shows: [], // list of shows from /shows
  allEpisodes: [], // episodes for the selected show
  episodesByShow: {}, // key: show.id, value: array of episodes
  searchTerm: "",
  showSearchTerm: "",
};

// DOM refs (assigned in setup after DOM loaded)
let template;
let messageElem;
let rootElem;
let episodeView;
let searchInput;
let searchCount;
let showSelect;
let episodeSelect;
let showTemplate;
let showRootElem;
let galleryView;
let showSearchInput;
let showSearchCount;
let filteredShowSelect;

function showEpisodesView() {
  episodeView.style.display = "block";
  galleryView.style.display = "none";
}

function showShowsView() {
  episodeView.style.display = "none";
  galleryView.style.display = "block";
}
function getFilteredShows() {
  const shows = Array.isArray(appState.shows) ? appState.shows : [];
  const q = (appState.showSearchTerm || "").toLowerCase().trim();
  const filteredShows = shows.filter((show) => {
    const name = (show.name || "").toLowerCase();
    const genres = (show.genres.join(" ") || "").toLowerCase();
    const summary = (show.summary || "").toLowerCase();
    return name.includes(q) || genres.includes(q) || summary.includes(q);
  });
  return filteredShows;
}
function renderShow() {
  if (!showRootElem) return;
  const filteredShows = getFilteredShows();
  showRootElem.innerHTML = "";

  if (showSearchCount) {
    showSearchCount.textContent = `displaying: ${filteredShows.length}/${appState.shows.length}`;
  }

  if (filteredShows.length === 0) {
    const empty = document.createElement("div");
    empty.textContent =
      appState.shows.length === 0
        ? "No shows to show."
        : "No shows match your search.";
    showRootElem.appendChild(empty);
    return;
  }

  filteredShows
    .map(createShowCard)
    .forEach((showElm) => showRootElem.appendChild(showElm));
}
function populateFilteredShowSelector() {
  if (!filteredShowSelect) return;
  filteredShowSelect.innerHTML = "";
  const filteredShows = getFilteredShows();


  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "choose a show ";
  defaultOption.selected = true;
  filteredShowSelect.appendChild(defaultOption);

  // Sort and add each show
  const sortedShows = appState.shows
    .slice()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  // Put a short label for each show. change what to display
  filteredShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id; // use show.id for fetching episodes later
    option.textContent = show.name;
    filteredShowSelect.appendChild(option);
  });
}

function createShowCard(show) {
  const showElement = showTemplate.content.cloneNode(true);
  const showName = showElement.querySelector(".name");
  showName.textContent = show.name;
  showName.addEventListener("click", function () {
    showEpisodesView();
    let showId = show.id;
    fetchEpisodesForShow(showId);
  });
  const showImage = showElement.querySelector(".image");
  if (showImage) {
    if (show.image && show.image.medium) {
      showImage.src = show.image.medium;
      showImage.alt = show.name || "Show image";
    } else {
      showImage.src = "https://via.placeholder.com/210x118?text=No+Image";
      showImage.alt = "No image available";
    }
  }
  const showSummary = showElement.querySelector(".summary");
  showSummary.innerHTML = show.summary;
  const showRating = showElement.querySelector(".rating");
  showRating.textContent = show.rating.average;
  const showGenres = showElement.querySelector(".genres");
  showGenres.textContent = show.genres;
  const showStatus = showElement.querySelector(".status");
  showStatus.textContent = show.status;
  const showRunTime = showElement.querySelector(".runTime");
  showRunTime.textContent = show.runtime;

  return showElement;
}

function createFilmCard(film) {
  const episodeElem = template.content.cloneNode(true);

  const titleElem = episodeElem.querySelector(".title");
  const episodeCode = `S${String(film.season).padStart(2, "0")}E${String(
    film.number
  ).padStart(2, "0")}`;
  if (titleElem) titleElem.textContent = `${film.name} - ${episodeCode}`;

  const imageElem = episodeElem.querySelector(".image");
  if (imageElem) {
    if (film.image && film.image.medium) {
      imageElem.src = film.image.medium;
      imageElem.alt = film.name || "Episode image";
    } else {
      imageElem.src = "https://via.placeholder.com/210x118?text=No+Image";
      imageElem.alt = "No image available";
    }
  }

  const summaryElem = episodeElem.querySelector(".summary");
  if (summaryElem)
    summaryElem.innerHTML = film.summary || "No summary available.";

  return episodeElem;
}

// Helper to show a loading/error/info message in the DOM
function showMessage(text = "", isError = false) {
  if (!messageElem) return;
  messageElem.textContent = text;
  messageElem.style.color = isError ? "crimson" : "";
}

// Fetch list of shows and populate the show select
async function fetchShows() {
  if (appState.shows.length > 0) {
    // Already fetched — use cached data
    return appState.shows;
  }

  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const shows = await response.json();
  appState.shows = shows;
  renderShow();
}

// Fetch episodes for a show id, store them and render
async function fetchEpisodesForShow(showId) {
  if (appState.episodesByShow[showId]) {
    appState.allEpisodes = appState.episodesByShow[showId];
    showEpisodesView();
    populateEpisodeSelector();
    renderEpisode();
    return;
  }

  console.log("Fetching new episodes from API");
  const endpoint = `https://api.tvmaze.com/shows/${showId}/episodes`;
  console.log("API endpoint:", endpoint);

  const response = await fetch(endpoint);

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const episodes = await response.json();

  // Save in cache
  appState.episodesByShow[showId] = episodes;
  appState.allEpisodes = episodes;
  showEpisodesView();
  populateEpisodeSelector();
  renderEpisode();
}

// Populate the show dropdown
function populateShowSelector() {
  if (!showSelect) return;
  showSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a Show";
  defaultOption.selected = true;
  showSelect.appendChild(defaultOption);

  // Sort and add each show
  const sortedShows = appState.shows
    .slice()
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  // Put a short label for each show. change what to display
  sortedShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id; // use show.id for fetching episodes later
    option.textContent = show.name;
    showSelect.appendChild(option);
  });
}

// Populate the episode dropdown (for current appState.allEpisodes)
function populateEpisodeSelector() {
  if (!episodeSelect) return;
  episodeSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select an Episode";
  defaultOption.selected = true;
  episodeSelect.appendChild(defaultOption);

  appState.allEpisodes.forEach((ep, i) => {
    const option = document.createElement("option");
    option.value = i;
    const code = `S${String(ep.season).padStart(2, "0")}E${String(
      ep.number
    ).padStart(2, "0")}`;
    option.textContent = `${code} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });
}

// Template-based card creator (template must be assigned in setup)

// Renders episode list based on appState and searchTerm
function renderEpisode() {
  if (!rootElem) return;
  rootElem.innerHTML = "";

  const episodes = Array.isArray(appState.allEpisodes)
    ? appState.allEpisodes
    : [];

  const q = (appState.searchTerm || "").toLowerCase().trim();
  const filtered = episodes.filter((episode) => {
    const name = (episode.name || "").toLowerCase();
    const summary = (episode.summary || "").toLowerCase();
    return name.includes(q) || summary.includes(q);
  });

  if (searchCount) {
    searchCount.textContent = `displaying: ${filtered.length}/${episodes.length}`;
  }

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.textContent =
      episodes.length === 0
        ? "No episodes to show."
        : "No episodes match your search.";
    rootElem.appendChild(empty);
    return;
  }

  filtered.map(createFilmCard).forEach((elem) => rootElem.appendChild(elem));
}

// Input handlers will be attached in setup (DOM-ready)
function handleSearchInput(event) {
  appState.searchTerm = event.target.value;
  renderEpisode();
}
function handleShowSearchInput(event) {
  appState.showSearchTerm = event.target.value;
  populateFilteredShowSelector();
  renderShow();
}

// Called after DOM loaded
function setup() {
  // assign DOM elements safely after DOMContentLoaded
  episodeView = document.getElementById("episode-view");
  galleryView = document.getElementById("gallery-show-view");
  template = document.getElementById("episode-template");
  showTemplate = document.getElementById("show-template");
  messageElem = document.getElementById("message");
  rootElem = document.getElementById("episode-container");
  showRootElem = document.getElementById("show-container");
  searchInput = document.getElementById("mySearch");
  showSearchInput = document.getElementById("showSearch");
  searchCount = document.getElementById("search-count");
  showSelect = document.getElementById("show-select");
  episodeSelect = document.getElementById("episode-select");
  showSearchCount = document.getElementById("show-search-count");
  filteredShowSelect = document.getElementById("filtered-show-select");

  // handlers
  const backToShowsBTN = document.getElementById("backToShowsBTN");
  if (backToShowsBTN) {
    backToShowsBTN.addEventListener("click", showShowsView);
  }

  if (searchInput) searchInput.addEventListener("input", handleSearchInput);
  if (showSearchInput)
    showSearchInput.addEventListener("input", handleShowSearchInput);
  if (showSelect) {
    showSelect.addEventListener("change", function () {
      const showId = this.value;
      if (!showId) {
        // reset UI if user selects the default empty option
        appState.allEpisodes = [];
        populateEpisodeSelector();
        renderEpisode();
        return;
      }
      fetchEpisodesForShow(showId);
    });
  }
  if (filteredShowSelect) {
    filteredShowSelect.addEventListener("change", function () {
      const showId = this.value;
      if (!showId) {
        appState.allEpisodes= [];
        populateFilteredShowSelector();
        renderShow()
        return;
      }
      fetchEpisodesForShow(showId)
    })
  }

  if (episodeSelect) {
    episodeSelect.addEventListener("change", function () {
      const selectedIndex = this.value;
      if (selectedIndex === "") return;
      const selectedEpisode = appState.allEpisodes[selectedIndex];
      if (!selectedEpisode) return;

      // Clear container and show only the selected episode; add back button
      rootElem.innerHTML = "";
      document
        .querySelectorAll('[data-button="scroll-back"]')
        .forEach((b) => b.remove());

      const scrollBack = document.createElement("button");
      console.log("Created scroll back button:", scrollBack);
      scrollBack.setAttribute("data-button", "scroll-back");
      scrollBack.textContent = "Back to All Episodes";
      scrollBack.addEventListener("click", () => renderEpisode());

      const footer = document.querySelector("footer");
      console.log("Footer found:", footer);
      if (footer) document.body.insertBefore(scrollBack, footer);
      rootElem.appendChild(createFilmCard(selectedEpisode));
    });
  }

  // initial render & fetch shows

  fetchShows()
    .then(() => {
      populateShowSelector();
      populateFilteredShowSelector();
    })
    .catch((err) => {
      showMessage("Failed to load shows", true);
      console.error(err);
    });
  renderShow();
  showShowsView();
  
}

window.onload = setup;
