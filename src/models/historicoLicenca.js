const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');
const Licenca = require('./licencas'); // Importe o modelo Licenca

const HistoricoLicenca = db.define('historico_licenca', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  valor: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  data: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  licencaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'licencas', // Nome da tabela referenciada
      key: 'id', // Nome da coluna chave primária referenciada
    },
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

HistoricoLicenca.sync({ force: false }).then(() => {
  console.log('Tabela de histórico de licenças criada com sucesso');
});

module.exports = HistoricoLicenca;
