const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }, // Adicionando campo phone
  address: { type: String, required: true }, // Adicionando campo address
  nickname: { type: String, required: true }, // Adicionando campo nickname
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});

module.exports = mongoose.model('User', UserSchema);
