'use strict';

class SQLModel {
  constructor(client) {
    this.client = client;
  }

  get(id) {
    console.log('Using mongo')
    if (id) {
      return getBook(this.client, id);
    } else {
      return getBooks(this.client);
    }
  }

  post(body) {
    return createShelf(body.bookshelf, this.client).then(id => {
      let { title, author, isbn, image_url, description } = body;
      let SQL =
        'INSERT INTO books(title, author, isbn, image_url, description, bookshelf_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;';
      let values = [title, author, isbn, image_url, description, id];
      return this.client.query(SQL, values);
    });
  }

  put(body, id) {
    let { title, author, isbn, image_url, description, bookshelf_id } = body;
    let SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf_id=$6 WHERE id=$7;`;
    let values = [title, author, isbn, image_url, description, bookshelf_id, id];

    return this.client.query(SQL, values);
  }

  delete(id) {
    let SQL = 'DELETE FROM books WHERE id=$1;';
    let values = [id];
    return this.client.query(SQL, values);
  }
}

function createShelf(shelf, client) {
  let normalizedShelf = shelf.toLowerCase();
  let SQL1 = `SELECT id from bookshelves where name=$1;`;
  let values1 = [normalizedShelf];

  return client.query(SQL1, values1).then(shelves => {
    if (shelves.rowCount) {
      return shelves.rows[0].id;
    } else {
      let INSERT = `INSERT INTO bookshelves(name) VALUES($1) RETURNING id;`;
      let insertValues = [shelf];

      return client.query(INSERT, insertValues).then(shelves => {
        return shelves.rows[0].id;
      });
    }
  });
}

function getBookshelves(client){
  let SQL = 'SELECT DISTINCT id, name FROM bookshelves ORDER BY name;';
  return client.query(SQL);
}

function getBook(client, id) {
  let shelves = getBookshelves(client);
  let SQL =
    'SELECT books.*, bookshelves.name FROM books INNER JOIN bookshelves on books.bookshelf_id=bookshelves.id WHERE books.id=$1;';
  let values = [id];
  let bookResults = client.query(SQL, values);
  return Promise.all([bookResults, shelves]);
}

function getBooks(client) {
  let SQL = 'SELECT * FROM books;';
  return Promise.all([client.query(SQL)]);
}

module.exports = SQLModel;
