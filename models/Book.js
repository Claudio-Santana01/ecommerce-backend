const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  publishedYear: { type: Number },
  genre: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Garante que o `user` é obrigatório
  imageUrl: { type: String },
  publisher: { type: String, required: true },
  views: { type: Number, default: 0, index: true }, // Adiciona um índice para `views`
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Usa ObjectId como referência para os favoritos
  price: { type: Number, required: true, min: 0 },
});


module.exports = mongoose.model('Book', bookSchema);
