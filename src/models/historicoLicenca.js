const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');
const Licenca = require('./licencas');

const HistoricoLicenca = db.define('historico_licenca', {
  

  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  valor: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  data: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Definindo valor padrão para a data atual
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Definindo valor padrão para a data atual
  },
});

// Defina a associação após a definição do modelo

HistoricoLicenca.sync({ force: false }).then(() => {
  // console.log('Tabela de histórico de licenças criada com sucesso');
});

module.exports = HistoricoLicenca;
