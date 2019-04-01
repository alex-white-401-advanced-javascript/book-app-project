'use strict';

// Application dependencies
const express = require('express');
const superagent = require('superagent');
const methodOverride = require('method-override');

const handleError = require('../middleware/500.js');

const router = express.Router();
const modelFinder = require('../middleware/model-finder.js');

// Application middleware
router.use(express.urlencoded({ extended: true }));
router.use(express.static('public'));

// Evaluate the model, dynamically
router.use(modelFinder);

// Method-Override
router.use(
  methodOverride((request, response) => {
    if (request.body && typeof request.body === 'object' && '_method' in request.body) {
      // look in urlencoded POST bodies and delete it
      let method = request.body._method;
      delete request.body._method;
      return method;
    }
  })
);

// ********************************
//        API Routes
// ********************************
router.get('/', getBooks);
router.get('/books/:id', getBook);
router.get('/searches/new', newSearch);

router.post('/books', createBook);
router.post('/searches', createSearch);

router.put('/books/:id', updateBook);

router.delete('/books/:id', deleteBook);

// ********************************
//        Book Constructor
// ********************************
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.title = info.title ? info.title : 'No title available';
  this.author = info.authors ? info.authors[0] : 'No author available';
  this.isbn = info.industryIdentifiers
    ? `ISBN_13 ${info.industryIdentifiers[0].identifier}`
    : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
  this.description = info.description ? info.description : 'No description available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}

// ********************************
//        Route Handlers
// ********************************

function getBooks(request, response) {
  request.model.get()
    .then(results => {
      if (results[0].rows.rowCount === 0) {
        response.render('pages/searches/new');
      } else {
        response.render('pages/index', { books: results[0].rows });
      }
    })
    .catch(err => handleError(err, response));
}

function getBook(request, response) {
  request.model.get(request.params.id)
    .then( results => {
      response.render('pages/books/show', {
        book: results[0].rows[0],
        bookshelves: results[1].rows,
      });
    })
    .catch(err => handleError(err, response));
}

function createBook(request, response) {
  request.model.post(request.body)
    .then(result => response.redirect(`/books/${result.rows[0].id}`))
    .catch(err => handleError(err, response));
}

function updateBook(request, response) {
  let id = request.params.id;
  request.model.put(request.body, id)
    .then(result => response.redirect(`/books/${id}`))
    .catch(err => handleError(err, response));
}

function deleteBook(request, response) {
  request.model.delete(request.params.id)
    .then(result => response.redirect('/'))
    .catch(err => handleError(err, response));
}

// ********************************
//       Other Route Handlers
// ********************************

// API Call Handler
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') {
    url += `+intitle:${request.body.search[0]}`;
  }
  if (request.body.search[1] === 'author') {
    url += `+inauthor:${request.body.search[0]}`;
  }

  superagent
    .get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { results: results }))
    .catch(err => handleError(err, response));
}

// New Search Handler
function newSearch(request, response) {
  response.render('pages/searches/new');
}

module.exports = router;
