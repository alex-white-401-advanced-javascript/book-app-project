'use strict';

const notFound = (request, response) => response.status(404).send('This route does not exist');

module.exports = notFound;
