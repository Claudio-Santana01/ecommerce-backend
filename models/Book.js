const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  publishedYear: Number,
  genre: String,
  user: String,
  image: String,
  views: { type: Number, default: 0 }, // Campo para contagem de visualizações
  favorites: [String], // Lista de usuários que favoritaram o livro
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;



