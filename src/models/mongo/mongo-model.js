'use strict';

class MongoModel {
  constructor(schema) {
    this.schema = schema;
  }

  get(id) {
    console.log('Using mongo GET')
    return this.schema.find().then(result => {
      let data = { rows: result, rowCount: result.length };
      return new Promise(resolve => resolve([data]));
    });
  }


  post(body) {
    console.log('Using mongo POST');
    let {title, author, isbn, image_url, description} = body;
    let record = { title, author, isbn, image_url, description};
    let newBook = new this.schema(record);
    return newBook.save().then(book => {
      let data = { rows: [book], rowCount: [book].length };
      return new Promise(resolve => resolve(data));
    });
  }

  put(body, id) {
    console.log('Using mongo PUT');
    let { title, author, isbn, image_url, description, bookshelf_id } = body;
    return this.schema
      .findByIdAndUpdate(id, { title, author, isbn, image_url, description, bookshelf_id })
      .then(book => {
        let data = { rows: [book], rowCount: [book].length };
        return new Promise(resolve => resolve(data));
      });
  }

  delete(id) {
    console.log('Using mongo DELETE');
    return this.schema.findByIdAndDelete(id).then(book => {
      let data = { rows: [book], rowCount: [book].length };
      return new Promise(resolve => resolve(data));
    });
  }
}

module.exports = MongoModel;
