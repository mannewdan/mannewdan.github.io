// api key 853020e1
// https://www.omdbapi.com/?i=tt3896198&apikey=853020e1

const emptyContentEl = document.getElementById("empty-content");
const errorMessageEl = document.getElementById("error-message");
const movieListEl = document.getElementById("movie-list");
const searchBtn = document.getElementById("btn-search");
const searchField = document.getElementById("search-field");

const State = { Empty: "Empty", Error: "Error", List: "List" }
let currentMovies = [];
let savedMovies = [];

//Controls
if (searchBtn) searchBtn.addEventListener("click", e => {
  executeSearch();
});
if (searchField) searchField.addEventListener("keypress", e => {
  if (e.key === "Enter") executeSearch();
});
function addWatchlistListeners() {
  for (let i = 0; i < currentMovies.length; i++) {
    const el = document.getElementById("list-index-" + i);
    if (el) el.addEventListener("click", e => {
      if (arrayContainsMovie(savedMovies, currentMovies[i])) {
        savedMovies.splice(savedMovies.indexOf(currentMovies[i]), 1);
      } else {
        savedMovies.push(currentMovies[i]);
      }

      saveData();
      renderMovies();
    });
  }
}

//Functionality
async function executeSearch() {
  const search = document.getElementById("search-field").value;
  const res = await fetch(`https://www.omdbapi.com/?apikey=853020e1&s=${search.replace(" ", "+")}`);
  const data = await res.json();

  currentMovies.length = 0;
  if (!data.Search) {
    setState(State.Error)
    console.log("ERROR: " + data.Error);
    return;
  }

  for (let i = 0; i < data.Search.length; i++) {
    const movie = data.Search[i];
    const r = await fetch(`https://www.omdbapi.com/?apikey=853020e1&i=${movie.imdbID}`);
    const d = await r.json();

    currentMovies.push(d);
    renderMovies(currentMovies);
  }
}
function saveData() {
  localStorage.setItem("movies", JSON.stringify(savedMovies));
}
function loadData() {
  const loadedData = JSON.parse(localStorage.getItem("movies"));
  if (Array.isArray(loadedData)) savedMovies = loadedData;
}
function arrayContainsMovie(array, movie) {
  for (let i = 0; i < array.length; i++) {
    if (moviesAreEqual(array[i], movie)) return true;
  }

  return false;
}
function moviesAreEqual(movie1, movie2) {
  if (movie1.imdbID !== movie2.imdbID) return false;
  return true;
}

//Rendering
function renderMovies() {
  let html = "";
  for (let i = 0; i < currentMovies.length; i++) {
    html += getMovieHtml(currentMovies[i], i);
  };
  movieListEl.innerHTML = html;

  addWatchlistListeners();

  if (currentMovies.length === 0) {
    setState(State.Empty);
  } else {
    setState(State.List);
  }

}
function getMovieHtml(movie, id) {
  const ratings = movie.Ratings;

  let watchlistButton = "";
  if (arrayContainsMovie(savedMovies, movie)) {
    watchlistButton = `
    <div id="list-index-${id}" class="add-to-watchlist">
      <img src="images/icon-minus.png">
      <p>Remove</p>
    </div>
    `
  } else {
    watchlistButton = `
    <div id="list-index-${id}" class="add-to-watchlist">
      <img src="images/icon-plus.png">
      <p>Watchlist</p>
    </div>
    `
  }

  return `
    <div class="movie-container">
      <div class="movie-content">
        <div class="movie-title-container">
          <h3 class="movie-title">${movie.Title}</h3>
          <img src="images/icon-star.png">
          <p class="movie-rating">${ratings.length > 0 ? ratings[0].Value : "No Ratings"}</p>
        </div>
        <div class="movie-info-container">
          <p class="movie-runtime">${movie.Runtime}</p>
          <p class="movie-genre">${movie.Genre}</p>          
          ${watchlistButton}
        </div>
        <p class="movie-description">${movie.Plot}</p>
      </div>
      <img class="movie-poster" src=${movie.Poster}>
    </div>
  `;
}

//State Handling
function setState(state) {
  emptyContentEl.style.display = "none";
  errorMessageEl.style.display = "none";
  movieListEl.style.display = "none";
  switch (state) {
    case State.List:
      movieListEl.style.display = "flex";
      break;
    case State.Error:
      errorMessageEl.style.display = "flex";
      break;
    default:
      emptyContentEl.style.display = "flex";
      break;
  }
}

setState(State.Empty);
loadData();

if (window.location.pathname === "/watchlist.html") {
  currentMovies = savedMovies;
  renderMovies();
}