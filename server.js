const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database/database');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');

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
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);

// Rota Inicial para Teste
app.get('/', (req, res) => {
  res.send('API do e-commerce funcionando!');
});

// Configuração do Servidor
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao banco de dados'))
  .catch((error) => console.error('Erro ao conectar ao banco de dados:', error));
