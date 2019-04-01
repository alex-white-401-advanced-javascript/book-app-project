'use strict';
/**
 * Model Finder Middleware
 * @module middleware/model-finder
 */
module.exports = (req, res, next) => {
  const db = process.env.DB === 'SQL' ? 'sql' : 'mongo';
  req.model = require(`../models/${db}/books/books-model.js`);
  next();
};
