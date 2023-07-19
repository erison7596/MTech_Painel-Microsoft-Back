const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const Valor = db.define('valor', {
  distribuidora: {
    type: Sequelize.STRING,
    allowNull: false
  },
  idDistribuidora: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false
  },
  nomeExibicao: {
    type: Sequelize.STRING,
    allowNull: false
  },
  idCustoLicenca: {
    type: Sequelize.STRING,
    allowNull: false
  },
  licencas: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dataHoraCriacao: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

Valor.sync({ force: false }).then(() => { 
  console.log('Tabela criada com sucesso');
});

module.exports = Valor;
