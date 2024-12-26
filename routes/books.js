const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const { authMiddleware } = require('./auth'); // Ajuste o caminho para o arquivo auth.js

console.log('authMiddleware:', typeof authMiddleware); // Deve retornar 'function'

// Configuração do armazenamento para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nome do arquivo com timestamp
  },
});

const upload = multer({ storage });

// Rota para listar todos os livros
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    res.status(500).json({ message: 'Erro ao listar livros', error });
  }
});

// Rota para adicionar um novo livro com ou sem imagem
router.post('/add', authMiddleware, upload.single('image'), async (req, res) => {
  const { title, author, description, publishedYear, genre, publisher, price } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // O ID do usuário autenticado será adicionado automaticamente pelo authMiddleware
    const userId = req.user;

    const newBook = new Book({
      title,
      author,
      description,
      publishedYear,
      genre,
      user: userId, // Adiciona o ID do usuário autenticado ao registro do livro
      publisher,
      price,
      imageUrl,
    });

    await newBook.save();
    res.status(201).json({ message: 'Livro adicionado com sucesso!', data: newBook });
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ message: 'Erro ao adicionar livro', error });
  }
});



// Rota para buscar um livro e incrementar visualizações
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado' });

    book.views += 1;
    await book.save();
    res.status(200).json(book);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ message: 'Erro ao buscar livro', error });
  }
});

// Rota para listar os livros mais visualizados
router.get('/most-searched', async (req, res) => {
  try {
    const mostSearchedBooks = await Book.find()
      .sort({ views: -1 })
      .limit(5); // Limita a 5 livros mais visualizados

    if (!mostSearchedBooks || mostSearchedBooks.length === 0) {
      return res.status(404).json({ message: 'Nenhum livro encontrado' });
    }

    res.status(200).json(mostSearchedBooks);
  } catch (error) {
    console.error('Erro ao buscar livros mais visualizados:', error);
    res.status(500).json({ message: 'Erro ao buscar livros mais visualizados', error });
  }
});

// Rota para atualizar informações de um livro
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, description, publishedYear, genre, user, publisher, price, imageUrl } = req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author, description, publishedYear, genre, user, publisher, price, imageUrl },
      { new: true, runValidators: true } // Retorna o documento atualizado e valida os campos
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.status(200).json({ message: 'Livro atualizado com sucesso', data: updatedBook });
  } catch (error) {
    console.error('Erro ao atualizar o livro:', error);
    res.status(500).json({ message: 'Erro ao atualizar o livro', error });
  }
});

// Rota para marcar um livro como favorito
router.post('/favorite', async (req, res) => {
  const { bookId, userId } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    book.favorites.push(userId);
    await book.save();
    res.status(200).json({ message: 'Livro favoritado com sucesso!', data: book });
  } catch (error) {
    console.error('Erro ao favoritar livro:', error);
    res.status(500).json({ message: 'Erro ao favoritar livro', error });
  }
});

module.exports = router;
