const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Modelo de Usuário

const router = express.Router();

// Middleware de autenticação
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'Token não encontrado, autorização negada' });
  }

  try {
    const decoded = jwt.verify(token, 'secreta');
    req.user = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

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

      res.json({ message: 'Usuário registrado com sucesso!', data: newUser });
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
      const token = jwt.sign({ userId: user._id }, 'secreta', { expiresIn: '1h' });

      res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  }
);


module.exports = router;
module.exports.authMiddleware = auth;

