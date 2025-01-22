const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // Relacionamento com o modelo Book
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relacionamento com o modelo User
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // Valores permitidos para a nota
  },
  comment: {
    type: String,
    maxlength: 100, // Limite de 100 caracteres para o comentário
    required: true,
  },
}, { timestamps: true }); // Adiciona campos de `createdAt` e `updatedAt`

module.exports = mongoose.model('Review', reviewSchema);
