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
  },
  // Colunas booleanas para cada licença
  exchangeOnlinePlan1: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  office365E3: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  powerBIFree: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enterpriseMobility: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  securityE3: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsExploratory: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAutomateFree: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
  // Adicione mais colunas conforme a necessidade para outras licenças
});

Valor.sync({ force: false }).then(() => { 
  console.log('Tabela criada com sucesso');
});

module.exports = Valor;

