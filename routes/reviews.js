const express = require('express');
const Review = require('../models/Review');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Adicionar uma nova avaliação
router.post('/', authMiddleware, async (req, res) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user; // ID do usuário autenticado

  try {
    const review = new Review({ bookId, userId, rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    res.status(500).json({ message: 'Erro ao adicionar avaliação', error });
  }
});

// Obter todas as avaliações de um livro
router.get('/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    const reviews = await Review.find({ bookId }).populate('userId', 'nickname');
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ message: 'Erro ao buscar avaliações', error });
  }
});

module.exports = router;
