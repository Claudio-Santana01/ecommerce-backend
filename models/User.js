const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  isWhatsApp: Boolean, // Adicione este campo
  address: String,
  nickname: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
