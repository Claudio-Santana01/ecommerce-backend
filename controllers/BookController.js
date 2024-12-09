const Book = require('../models/Book');

// Adicionar livro
exports.createBook = async (req, res) => {
  const { title, author, price, imageUrl, description, createdBy } = req.body;
  try {
    const newBook = new Book({ title, author, price, imageUrl, description, createdBy });
    await newBook.save();
    res.status(201).json({ message: 'Livro adicionado com sucesso', book: newBook });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar livro', error });
  }
};
