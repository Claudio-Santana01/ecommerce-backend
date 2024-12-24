const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }], // Referência para o modelo Book
});

module.exports = mongoose.model('User', UserSchema);
