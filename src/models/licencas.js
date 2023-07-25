const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const Licenca = db.define('licenca', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  valor: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

// Inicialização do banco de dados e sincronização da tabela
Licenca.sync({ force: false }).then(() => { 
  console.log('Tabela de licenças criada com sucesso');
});

module.exports = Licenca;
