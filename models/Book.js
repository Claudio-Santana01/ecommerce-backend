const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  publishedYear: { type: Number },
  genre: { type: String },
  user: { type: String },
  imageUrl: { type: String },
  publisher: { type: String, required: true }, // Campo "Editora"
  views: { type: Number, default: 0 }, // Campo para contagem de visualizações
  favorites: [String], // Lista de usuários que favoritaram o livro
  price: { type: Number, required: true, min: 0, validate: {
    validator: Number.isFinite,
    message: 'Preço deve ser um número válido',
  }}, // Campo para preço
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;




