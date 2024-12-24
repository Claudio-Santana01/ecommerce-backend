const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const { authMiddleware } = require('./auth'); // Importando middleware de autenticação

const router = express.Router();

// Favoritar um livro
router.post('/favorite', authMiddleware, async (req, res) => {
  const { bookId } = req.body; // Recebendo apenas o bookId
  const userId = req.user; // Obtendo o userId do middleware
  
  try {
    const user = await User.findById(userId).populate('favorites'); // Certifique-se de que `favorites` está configurado como uma referência no modelo de usuário
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    // Buscando detalhes completos dos livros favoritos
    const favoriteBooks = await Book.find({ _id: { $in: user.favorites } });

    res.json(favoriteBooks); // Retorna os livros favoritos completos
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos', error });
  }
});

//Para exibir livros favoritos
router.get('/favorite', authMiddleware, async (req, res) => {
  const userId = req.user;

  try {
    const user = await User.findById(userId).populate('favorites'); // Certifique-se de que favorites é uma referência
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const favoriteBooks = await Book.find({ _id: { $in: user.favorites } }); // Busca detalhes completos
    res.json(favoriteBooks); // Retorna os livros favoritos
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos', error });
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




