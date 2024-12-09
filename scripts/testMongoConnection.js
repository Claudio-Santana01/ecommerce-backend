const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/teste';

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexão bem-sucedida ao MongoDB');
    mongoose.disconnect();
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error.message);
  });
