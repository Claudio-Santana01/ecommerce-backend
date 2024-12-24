const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database/database');
const userRoutes = require('./routes/users'); // Importar as rotas de usuários
const authRoutes = require('./routes/auth'); // Importar as rotas de autenticação
const booksRoutes = require('./routes/books'); // Importando rotas de livros


const app = express();

// Estrutura do Projeto apos Upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Usar as rotas
app.use('/api/users', userRoutes);  // Rota para usuários
app.use('/api/auth', authRoutes);  // Rota para autenticação (login)
app.use('/api/books', booksRoutes); // Rota para livros


// Rota inicial para teste
app.get('/', (req, res) => {
  res.send('API do e-commerce funcionando!');
});

// Configuração do servidor
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Conexão com o banco de dados (verifique se sua string de conexão está correta)
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao banco de dados'))
  .catch((error) => console.error('Erro ao conectar ao banco de dados:', error));
