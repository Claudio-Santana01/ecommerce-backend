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

const updateBookPrices = async (req, res) => {
  try {
    // Atualiza todos os documentos da coleção, convertendo price para número
    const result = await Book.updateMany(
      {},
      [
        { $set: { price: { $convert: { input: "$price", to: "double" } } } }
      ]
    );

    // Retorna uma resposta com informações do resultado
    res.status(200).json({
      message: "Preços atualizados com sucesso!",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    // Tratamento de erros
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar os preços.", error });
  }
};

