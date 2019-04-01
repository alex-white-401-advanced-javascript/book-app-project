'use strict';

const router = require('./api/v1.js');
const notFound = require('../src/middleware/404.js');
const handleError = require('../src/middleware/500.js');

// Application Dependencies
const express = require('express');

// Application Setup
const app = express();


// Set the view engine for server-side templating
app.set('view engine', 'ejs');

app.use(router);

// Catchalls
app.use(notFound);
app.use(handleError);

/**
 * Start Server on specified port
 * @param port {integer} (defaults to process.env.PORT)
 */
let start = (port = process.env.PORT) => {
  app.listen(port, () => {
    console.log(`Server Up on ${port}`);
  });
};
  
module.exports = {start};
