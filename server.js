const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env
const connectDB = require('./database/database');
const userRoutes = require('./routes/users');
const { router: authRoutes } = require('./routes/auth'); // Importando o router de auth.js
const booksRoutes = require('./routes/books');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Estrutura do Projeto após Upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
}));

// Middleware para parsing de JSON
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Usar as Rotas
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // Certifique-se de que auth.js exporta o router corretamente
app.use('/api/books', booksRoutes);
app.use('/api/reviews', reviewRoutes);

// Rota Inicial para Teste
app.get('/', (req, res) => {
  res.send('API do e-commerce funcionando!');
});

// Configuração do Servidor
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Conectar ao Banco de Dados MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao banco de dados'))
  .catch((error) => console.error('Erro ao conectar ao banco de dados:', error));
