// app state
const appState = {
  shows: [],        // list of shows from /shows
  allEpisodes: [],  // episodes for the selected show
  searchTerm: "",
};

// DOM refs (assigned in setup after DOM loaded)
let template;
let messageElem;
let rootElem;
let searchInput;
let searchCount;
let showSelect;
let episodeSelect;

const endpoint = "https://api.tvmaze.com/shows";

// Helper to show a loading/error/info message in the DOM
function showMessage(text = "", isError = false) {
  if (!messageElem) return;
  messageElem.textContent = text;
  messageElem.style.color = isError ? "crimson" : "";
}

// Fetch list of shows and populate the show select
async function fetchShows() {
  showMessage("Loading shows...");
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const shows = await res.json();
    appState.shows = Array.isArray(shows) ? shows : [];
    populateShowSelector();
    showMessage(""); // clear
  } catch (err) {
    console.error("Failed to fetch shows:", err);
    showMessage("Error loading shows. Please try again later.", true);
  }
}

// Fetch episodes for a show id, store them and render
async function fetchEpisodesForShow(showId) {
  if (!showId) return;
  showMessage("Loading episodes...");
  try {
    const res = await fetch(`${endpoint}/${encodeURIComponent(showId)}/episodes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const episodes = await res.json();
    appState.allEpisodes = Array.isArray(episodes) ? episodes : [];
    appState.searchTerm = ""; // reset search
    if (searchInput) searchInput.value = "";
    render();
    populateEpisodeSelector();
    showMessage("");
  } catch (err) {
    console.error("Failed to fetch episodes:", err);
    appState.allEpisodes = [];
    render();
    populateEpisodeSelector();
    showMessage("Error loading episodes. Please try again later.", true);
  }
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

  // Put a short label for each show. change what to display
  appState.shows.forEach((show) => {
    const opt = document.createElement("option");
    opt.value = show.id; // later used for /shows/:id/episodes
    opt.textContent = show.name;
    showSelect.appendChild(opt);
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
    const code = `S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}`;
    option.textContent = `${code} - ${ep.name}`;
    episodeSelect.appendChild(option);
  });
}

// Template-based card creator (template must be assigned in setup)
function createFilmCard(film) {
  const episodeElem = template.content.cloneNode(true);

  const titleElem = episodeElem.querySelector(".title");
  const episodeCode = `S${String(film.season).padStart(2, "0")}E${String(film.number).padStart(2, "0")}`;
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
  if (summaryElem) summaryElem.innerHTML = film.summary || "No summary available.";

  return episodeElem;
}

// Renders episode list based on appState and searchTerm
function render() {
  if (!rootElem) return;
  rootElem.innerHTML = "";

  const episodes = Array.isArray(appState.allEpisodes) ? appState.allEpisodes : [];

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
    empty.textContent = episodes.length === 0 ? "No episodes to show." : "No episodes match your search.";
    rootElem.appendChild(empty);
    return;
  }

  filtered.map(createFilmCard).forEach((elem) => rootElem.appendChild(elem));
}

// Input handlers will be attached in setup (DOM-ready)
function handleSearchInput(event) {
  appState.searchTerm = event.target.value;
  render();
}

// Called after DOM loaded
function setup() {
  // assign DOM elements safely after DOMContentLoaded
  template = document.getElementById("episode-template");
  messageElem = document.getElementById("message");
  rootElem = document.getElementById("episode-container");
  searchInput = document.getElementById("mySearch");
  searchCount = document.getElementById("search-count");
  showSelect = document.getElementById("show-select");
  episodeSelect = document.getElementById("episode-select");

  // handlers
  if (searchInput) searchInput.addEventListener("input", handleSearchInput);

  if (showSelect) {
    showSelect.addEventListener("change", function () {
      const showId = this.value;
      if (!showId) {
        // reset UI if user selects the default empty option
        appState.allEpisodes = [];
        populateEpisodeSelector();
        render();
        return;
      }
      fetchEpisodesForShow(showId);
    });
  }

  if (episodeSelect) {
    episodeSelect.addEventListener("change", function () {
      const selectedIndex = this.value;
      if (selectedIndex === "") return;
      const selectedEpisode = appState.allEpisodes[selectedIndex];
      if (!selectedEpisode) return;

      // Clear container and show only the selected episode; add back button
      rootElem.innerHTML = "";
      document.querySelectorAll('[data-button="scroll-back"]').forEach((b) => b.remove());

      const scrollBack = document.createElement("button");
      scrollBack.setAttribute("data-button", "scroll-back");
      scrollBack.textContent = "Back to All Episodes";
      scrollBack.addEventListener("click", () => render());

      const footer = document.querySelector("footer");
      if (footer) document.body.insertBefore(scrollBack, footer);
      rootElem.appendChild(createFilmCard(selectedEpisode));
    });
  }

  // initial render & fetch shows
  render();
  fetchShows();
}

window.onload = setup;
