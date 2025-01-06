const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Modelo de Usuário

const router = express.Router();

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Garante que o userId é anexado corretamente
    console.log('Usuário autenticado:', req.user); // Log do usuário autenticado
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Token inválido.' });
  }
};

// Testando o Middleware
router.get('/test-auth', authMiddleware, (req, res) => {
  res.json({ message: 'Middleware funcionando!', user: req.user });
});

// Rota de Registro
router.post(
  '/register',
  [
    check('name', 'O nome é obrigatório').not().isEmpty(),
    check('email', 'Adicione um email válido').isEmail(),
    check('password', 'A senha deve ter no mínimo 6 caracteres').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Usuário já registrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      res.json({ message: 'Usuário registrado com sucesso!', userId: newUser._id });
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }
);

// Rota de Login
router.post(
  '/login',
  [
    check('email', 'Adicione um email válido').isEmail(),
    check('password', 'A senha é obrigatória').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Lógica de autenticação (buscar no banco de dados)
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      // Verificar se a senha está correta usando bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Senha incorreta' });
      }

      // Gerar o token JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Inclua o userId na resposta
      res.json({ message: 'Login bem-sucedido!', token, userId: user._id });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
);

module.exports = { authMiddleware, router };
