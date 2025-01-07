const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const { authMiddleware } = require('./auth'); // Ajuste o caminho para o arquivo auth.js

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
    const userId = req.user; // Obtém o ID do usuário autenticado do middleware

    const newBook = new Book({
      title,
      author,
      description,
      publishedYear,
      genre,
      user: userId,
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

// Rota para buscar anúncios de um usuário específico
router.get('/my-ads', async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'ID de usuário não fornecido' });
    }

    const books = await Book.find({ user: userId });
    res.status(200).json(books);
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    res.status(500).json({ error: 'Erro ao buscar anúncios' });
  }
});

// Rota para buscar os livros mais visualizados
router.get('/most-searched', async (req, res) => {
  try {
    const mostSearchedBooks = await Book.find({ views: { $gt: 0 } }) // Filtra livros com views > 0
      .sort({ views: -1 }) // Ordena em ordem decrescente por views
      .limit(10); // Limita o resultado a 10 livros

    if (!mostSearchedBooks || mostSearchedBooks.length === 0) {
      return res.status(404).json({ message: 'Nenhum livro encontrado' });
    }

    res.status(200).json(mostSearchedBooks);
  } catch (error) {
    console.error('Erro ao buscar livros mais visualizados:', error);
    res.status(500).json({ message: 'Erro ao buscar livros mais visualizados', error });
  }
});

// Rota para buscar um livro e incrementar visualizações
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {ss
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

// Rota para atualizar informações de um livro
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, author, description, publishedYear, genre, publisher, price } = req.body;

  try {
    const updateData = {
      title,
      author,
      description,
      publishedYear,
      genre,  
      publisher,
      price,
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.status(200).json({ message: 'Livro atualizado com sucesso!', data: updatedBook });
  } catch (error) {
    console.error('Erro ao atualizar o livro:', error);
    res.status(500).json({ message: 'Erro ao atualizar o livro', error });
  }
});

// Rota para excluir um livro
router.delete('/:id', async (req, res) => {
  console.log('ID recebido para exclusão:', req.params.id);
  const { id } = req.params;

  try {
      const deletedBook = await Book.findByIdAndDelete(id);
      if (!deletedBook) {
          return res.status(404).json({ message: 'Livro não encontrado' });
      }
      res.status(200).json({ message: 'Livro excluído com sucesso' });
  } catch (error) {
      console.error('Erro ao excluir livro:', error);
      res.status(500).json({ message: 'Erro ao excluir livro', error });
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
