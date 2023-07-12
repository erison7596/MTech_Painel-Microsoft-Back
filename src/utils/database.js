const { Sequelize } = require('sequelize');

const db = new Sequelize('pcm', 'root', '91188982', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

// Função para criar o banco de dados
async function criarBancoDeDados() {
  try {
    await db.query('CREATE DATABASE IF NOT EXISTS pcm');
    console.log('Banco de dados criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar o banco de dados:', error);
  }
}

criarBancoDeDados();

module.exports = db;
