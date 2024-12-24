const express = require('express');
const router = express.Router();
const multer = require('multer'); // Importar o multer
const path = require('path');
const Book = require('../models/Book');


// const { updateBookPrices } = require('../controllers/BookController');

// Rota para listar todos os livros
router.get('/', (req, res) => {
  // Usando o modelo Book para buscar todos os livros no banco de dados
  Book.find() 
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Erro ao listar livros', error });
    });
});

router.post('/favorite', (req, res) => {
  const { bookId, userId } = req.body;
  // Verificar se o livro existe
  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livro não encontrado' });
      }
      // Adicionar o usuário aos favoritos do livro
      book.favorites.push(userId);
      return book.save();
    })
    .then((updatedBook) => {
      res.status(200).json({ message: 'Livro favoritado com sucesso!', book: updatedBook });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Erro ao favoritar livro', error });
    });
});  


// Configuração do armazenamento para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Rota para adicionar um novo livro com upload de imagem
router.post('/add', upload.single('image'), async (req, res) => {
  const { title, author, publisher, publishedYear, genre, price, description } = req.body;

  try {
    console.log('Body recebido:', req.body);
    console.log('Arquivo recebido:', req.file);

    const newBook = new Book({
      title,
      author,
      publisher,
      publishedYear,
      genre,
      price,
      description,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '', // Salva o caminho da imagem
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ message: 'Erro ao adicionar livro', error });
  }
});


// Rota para atualizar os preços
// router.put('/update-prices', updateBookPrices);

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