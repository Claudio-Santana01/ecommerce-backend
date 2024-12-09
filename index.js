require('dotenv').config(); // Para carregar as variáveis de ambiente
const express = require('express');
const connectDB = require('./db'); // Importando a conexão ao banco de dados

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware para JSON
app.use(express.json());

// Conectar ao MongoDB
connectDB();

// Rotas (importar suas rotas aqui)
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));

// Inicializar o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

