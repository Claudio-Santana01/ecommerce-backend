const User = require('../models/User');

// Cadastro de Usuário
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
};
