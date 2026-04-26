const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const movieModel = require('./movie-model.js');

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json()); 

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, 'files')));

/* Task 1.2: Add a GET /genres endpoint:
   This endpoint returns a sorted array of all the genres of the movies
   that are currently in the movie model.
*/
app.get('/genres', function (req, res) {
  const movies = Object.values(movieModel);

  const genresSet = new Set();

  movies.forEach(movie => {
    movie.Genres.forEach(g => genresSet.add(g));
  });

  res.json(Array.from(genresSet).sort());
});

/* Task 1.4: Extend the GET /movies endpoint:
   When a query parameter for a specific genre is given, 
   return only movies that have the given genre
 */

//  GET all movies -> EXTENDED
app.get('/movies', function (req, res) {
  const movies = Object.values(movieModel);
  const genre = req.query.genre;

  // if no genre -> return all movies
  if (!genre) {
    return res.json(movies);
  }

  // filter by genre
  const filteredMovies = movies.filter(movie =>
    movie.Genres.includes(genre)
  );

  res.json(filteredMovies);
});

//  GET one movie -> from the URL
app.get('/movies/:imdbID', function (req, res) {
  const imdbID = req.params.imdbID;
  const movie = movieModel[imdbID];

  if (movie) {
    res.json(movie);
  } else {
    res.sendStatus(404);
  }
});

//  validation function 
function isValidMovie(movie) {
  return (
    movie &&
    typeof movie.Title === "string" &&
    movie.Title.trim() !== "" &&

    typeof movie.Released === "string" &&

    typeof movie.Runtime === "number" && !isNaN(movie.Runtime) &&

    Array.isArray(movie.Genres) &&
    movie.Genres.every(g => typeof g === "string") &&

    Array.isArray(movie.Directors) &&
    movie.Directors.every(d => typeof d === "string") &&

    Array.isArray(movie.Writers) &&
    movie.Writers.every(w => typeof w === "string") &&

    Array.isArray(movie.Actors) &&
    movie.Actors.every(a => typeof a === "string") &&

    typeof movie.Plot === "string" &&

    typeof movie.Poster === "string" &&

    typeof movie.Metascore === "number" && !isNaN(movie.Metascore) &&

    typeof movie.imdbRating === "number" && !isNaN(movie.imdbRating)
  );
}

app.put('/movies/:imdbID', function (req, res) {
  const imdbID = req.params.imdbID;
  const movie = req.body;

  // validation check
  if (!isValidMovie(movie)) {
    return res.status(400).send("Invalid movie data");
  }

  // ensure consistency
  movie.imdbID = imdbID;

  if (movieModel[imdbID]) {
    // update
    movieModel[imdbID] = movie;
    res.sendStatus(200);
  } else {
    // create
    movieModel[imdbID] = movie;
    res.status(201).json(movie);
  }
});


app.listen(3000)

console.log("Server now listening on http://localhost:3000/")
