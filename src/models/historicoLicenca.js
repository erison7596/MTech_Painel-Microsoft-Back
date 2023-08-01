const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const HistoricoLicenca = db.define('historico_licenca', {
  valor: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  data: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

HistoricoLicenca.sync({ force: false }).then(() => { 
  console.log('Tabela de histórico de licenças criada com sucesso');
});

module.exports = HistoricoLicenca;
