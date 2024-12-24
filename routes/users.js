const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const { authMiddleware } = require('./auth'); // Importando middleware de autenticação

const router = express.Router();

// Rota para favoritar ou desfavoritar um livro
router.post('/favorite', authMiddleware, async (req, res) => {
  const { bookId } = req.body; // Recebendo o ID do livro
  const userId = req.user; // Obtendo o ID do usuário autenticado pelo middleware

  try {
    const user = await User.findById(userId); // Busca o usuário no banco de dados
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verifica se o livro já está nos favoritos
    const isFavorited = user.favorites.includes(bookId);
    if (isFavorited) {
      // Remove o livro dos favoritos
      user.favorites = user.favorites.filter((id) => id.toString() !== bookId);
      await user.save();
      return res.status(200).json({
        message: 'Livro removido dos favoritos',
        favorites: user.favorites,
      });
    }

    // Adiciona o livro aos favoritos
    user.favorites.push(bookId);
    await user.save();
    res.status(200).json({
      message: 'Livro adicionado aos favoritos',
      favorites: user.favorites,
    });
  } catch (error) {
    console.error('Erro ao favoritar ou desfavoritar o livro:', error);
    res.status(500).json({ error: 'Erro ao favoritar ou desfavoritar o livro' });
  }
});

// Rota para listar os livros favoritos com detalhes
router.get('/favorites', authMiddleware, async (req, res) => {
  const userId = req.user; // Obtém o ID do usuário autenticado

  try {
    const user = await User.findById(userId); // Busca o usuário no banco de dados
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Busca os detalhes dos livros favoritos no modelo Book
    const favoriteBooks = await Book.find({ _id: { $in: user.favorites } });

    res.status(200).json(favoriteBooks); // Retorna os livros favoritos
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: 'Erro ao buscar favoritos', error });
  }
});

// Buscar livros por título ou autor
router.get('/books/search', async (req, res) => {
  const { query } = req.query;

  try {
    const books = await Book.find({
      $or: [
        { title: new RegExp(query, 'i') },
        { author: new RegExp(query, 'i') },
      ],
    });
    res.status(200).json(books);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ message: 'Erro ao buscar livros', error });
  }
});

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários', error });
  }
});

// Editar usuário
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error });
  }
});

// Deletar usuário
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário', error });
  }
});

module.exports = router;
