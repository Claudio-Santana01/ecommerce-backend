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

// Rota para remover um livro dos favoritos
router.post('/unfavorite', authMiddleware, async (req, res) => {
  const { bookId } = req.body;

  try {
    const user = await User.findById(req.user); // `req.user` é adicionado pelo `authMiddleware`

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Remove o livro dos favoritos
    user.favorites = user.favorites.filter((id) => id.toString() !== bookId);

    await user.save();

    res.status(200).json({
      message: 'Livro removido dos favoritos com sucesso!',
      favorites: user.favorites,
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ message: 'Erro ao remover livro dos favoritos' });
  }
});

// Rota para buscar dados de contato do anunciante e informações do livro
router.get('/contact/:id', authMiddleware, async (req, res) => {
  const { id } = req.params; // Certifique-se de que o parâmetro está correto

  console.log('ID recebido na rota:', id); // Log para identificar o ID recebido

  try {
    // Buscar o livro pelo ID
    const book = await Book.findById(id);
    if (!book) {
      console.log('Livro não encontrado:', id);
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    console.log('Livro encontrado:', book); // Log do livro encontrado

    // Buscar o usuário pelo campo relacionado ao livro
    const user = await User.findById(book.user); // Verifique se o campo `book.user` contém o ID correto
    if (!user) {
      console.log('Usuário anunciante não encontrado para o livro:', id);
      return res.status(404).json({ message: 'Usuário anunciante não encontrado' });
    }

    console.log('Usuário encontrado:', user); // Log do usuário encontrado

    // Retornar os detalhes do livro e do anunciante
    res.status(200).json({
      book: {
        title: book.title,
        author: book.author,
        genre: book.genre,
        publisher: book.publisher,
        price: book.price,
        description: book.description,
        imageUrl: book.imageUrl, // Inclui a imagem, se disponível
      },
      contact: {
        nickname: user.name, // Considerando o nome como apelido
        fullName: user.name, // Ajuste o campo conforme necessário
        email: user.email,
        phone: user.phone || 'Telefone não informado', // Caso o telefone não esteja disponível
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados de contato do anunciante:', error);
    res.status(500).json({ message: 'Erro ao buscar dados de contato', error });
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
