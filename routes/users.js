const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('./auth'); // Importando middleware de autenticação

const router = express.Router();

// Favoritar um livro
router.post('/favorite', authMiddleware, async (req, res) => {
  const { bookId } = req.body; // Recebendo apenas o bookId
  const userId = req.user; // Obtendo o userId do middleware
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Adicionar ou remover dos favoritos
    if (user?.favorites?.includes(bookId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== bookId);
      await user.save();
      return res.json({ message: 'Livro removido dos favoritos', favorites: user.favorites });
    }

    user?.favorites?.push(bookId);
    await user.save();
    res.json({ message: 'Livro adicionado aos favoritos', favorites: user.favorites });
  } catch (error) {
    console.error('Erro ao favoritar livro:', error);
    res.status(500).json({ error: 'Erro ao favoritar livro' });
  }
});

//Buscar livros por título ou autor
router.get('/books/search', async (req, res) => {
  const { query } = req.query;
  const books = await Book.find({
    $or: [
      { title: new RegExp(query, 'i') },
      { author: new RegExp(query, 'i') }
    ]
  });
  res.json(books);
});

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Editar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { name, email }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error });
  }
});

// Deletar usuário
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error });
  }
});

module.exports = router;




