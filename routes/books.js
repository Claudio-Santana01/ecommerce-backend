const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

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

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo
  },
});

const upload = multer({ storage });

// Rota para adicionar um livro com imagem
router.post('/add', upload.single('image'), async (req, res) => {
  const { title, author, description, publishedYear, genre, user } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const newBook = new Book({ title, author, description, publishedYear, genre, user, image });
    await newBook.save();
    res.json({ message: 'Livro adicionado com sucesso!', data: newBook });
  } catch (error) {
    console.error('Erro ao adicionar livro:', error);
    res.status(500).json({ error: 'Erro ao adicionar livro' });
  }
});

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


// Atualizar informações de um livro
router.put('/books/:id', async (req, res) => {
  const { id } = req.params; // ID do livro a ser atualizado
  const { title, author, genre, description, price, imageUrl } = req.body; // Novas informações

  try {
    // Encontrar o livro pelo ID e atualizar os campos fornecidos
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author, genre, description, price, imageUrl },
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

module.exports = router;


// Livros mais pesquisados
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
      .limit(5); // Pegando os 5 livros mais visualizados
    
    res.status(200).json(mostSearchedBooks);
  } catch (err) {
    console.error('Erro ao buscar livro mais pesquisado:', err);
    res.status(500).json({ error: "Erro ao buscar livros mais pesquisados" });
  }
});

// Buscar um livro e incrementar visualizações
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