const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  publishedYear: { type: Number },
  genre: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Referência para o modelo User
  imageUrl: { type: String },
  publisher: { type: String, required: true },
  views: { type: Number, default: 0 },
  favorites: [String], // Lista de IDs de usuários que favoritaram o livro
  price: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('Book', bookSchema);
