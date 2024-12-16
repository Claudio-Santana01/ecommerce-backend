const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { updateBookPrices } = require('../controllers/bookController');

router.get('/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
  });
  /*Crie um componente BookList que faz uma requisição para a 
  rota /books e exibe os livros na tela.*/

 // Adicionar um novo livro
router.post('/add', async (req, res) => {
  const { title, author, description, publishedYear, genre, user } = req.body;

  try {
    const newBook = new Book({ title, author, description, publishedYear, genre, user });
    await newBook.save();
    res.json({ message: 'Livro adicionado com sucesso!', data: newBook });
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ error: 'Erro ao adicionar livro' });
  }
});
  /*Frontend (React)
Crie um formulário para o usuário preencher com o título, autor, descrição, preço 
e imagem do livro.
Quando o formulário for enviado, faça uma requisição POST para a rota /add com os 
dados do livro. */

//Suporte para upload de arquivos
const multer = require('multer');

// Configuração do armazenamento para o upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo
  },
});

const upload = multer({ storage });

// Rota para listar todos os livros
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar livros', error });
  }
});

// Rota para adicionar um novo livro com imagem
router.post('/add', upload.single('image'), async (req, res) => {
  const { title, author, description, publishedYear, genre, user, publisher, price } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const newBook = new Book({ title, author, description, publishedYear, genre, user, image, publisher, price });
    await newBook.save();
    res.json({ message: 'Livro adicionado com sucesso!', data: newBook });
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ error: 'Erro ao adicionar livro' });
  }
});

// Rota para atualizar os preços
router.put('/update-prices', updateBookPrices);

// Rota para atualizar informações de um livro
router.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, description, publishedYear, genre, user, image, publisher, price } = req.body;

  console.log('ID do livro:', id);
  console.log('Dados para atualização:', { title, author, description, publishedYear, genre, user, image, publisher, price });


  try {
    // Encontrar o livro pelo ID e atualizar os campos fornecidos
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author, description, publishedYear, genre, user, image, publisher, price },
      { new: true, runValidators: true } // Retorna o documento atualizado e valida os campos
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    res.json({ message: 'Livro atualizado com sucesso', book: updatedBook });
  } catch (error) {
    console.error('Erro ao atualizar o livro:', error);
    res.status(500).json({ error: 'Erro no servidor ao atualizar o livro' });
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
    res.status(200).json({ message: 'Livro favoritado com sucesso!', book });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao favoritar livro', error });
  }
});

// Rota para listar os livros mais visualizados
router.get('/most-searched', async (req, res) => {
  try {
    // Verificando se existe algum livro
    const books = await Book.find();
    if (!books || books.length === 0) {
      return res.status(404).json({ error: "Nenhum livro encontrado" });
    }

    // Ordenando os livros pelas visualizações de forma decrescente
    const mostSearchedBooks = await Book.find()
      .sort({ views: -1 })
      .limit(5); // Limita a 5 livros mais visualizados
    
    res.status(200).json(mostSearchedBooks);
  } catch (err) {
    console.error('Erro ao buscar livro mais pesquisado:', err);
    res.status(500).json({ error: "Erro ao buscar livros mais pesquisados" });
  }
});

// Rota para buscar um livro e incrementar visualizações
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ error: 'Livro não encontrado' });

    book.views += 1;
    await book.save();
    res.json(book);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ error: 'Erro ao buscar livro' });
  }
});


module.exports = router; // Exportar as rotas