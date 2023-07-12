const { Sequelize } = require('sequelize');
const db = require('../utils/database');

const Valor = db.define('valor', {
  distribuidora: Sequelize.STRING,
  idDistribuidora: Sequelize.STRING,
  nomeExibicao: Sequelize.STRING,
  idCustoLicenca: Sequelize.STRING,
  licencas: Sequelize.STRING,
  dataHoraCriacao: Sequelize.DATE
});

Valor.sync({ force: false }).then(() => { 
  console.log('Tabela criada com sucesso');
});
module.exports = Valor;
