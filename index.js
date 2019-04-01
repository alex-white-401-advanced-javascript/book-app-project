'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const pg = require('pg');

// Database Setup
let client;
if (process.env.DB === 'SQL') {
  let client = new pg.Client(process.env.DATABASE_URL);
  client.connect(err =>
    err
      ? console.log(`Error: ${err}`)
      : console.log(`Connected to PGSQL DB`)
  );
  client.on('error', err => console.error(err));
} else if (process.env.DB === 'mongo') {
  const mongooseOptions = {
    useNewUrlParser:true,
    useCreateIndex: true,
  };
  mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
  console.log('Connected to MONGODB');
}


require('./src/server.js').start(process.env.PORT);

module.exports = client;
