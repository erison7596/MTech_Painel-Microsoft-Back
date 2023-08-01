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
  },
  // Licenças adicionais
  azureActiveDirectoryPremiumP1: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerInsightsSelfServiceTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerInsightsVTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerServiceEnterpriseVTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerVoiceTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365FieldServiceVTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365Finance: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365OperationsActivity: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365P1TrialforInformationWorkers: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365SalesEnterpriseEdition: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365SalesPremiumViralTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365SupplyChainManagement: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  d365SupplyChainAttach: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dynamics365TeamMembers: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enterpriseMobilitySecurityE3: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  enterpriseMobilitySecurityE5: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  exchangeOnlinePlan1: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftBusinessCenter: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftDynamicsAX7UserTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftFabricFree: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAppsforDeveloper: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAppsPlan2Trial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAutomateFree: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftStreamTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsExploratory: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsRoomsBasic: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsRoomsPro: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  office365E3: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  powerBIPro: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  powerPagesVTrialforMakers: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  powerVirtualAgentsViralTrial: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  projectOnlineEssentials: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  projectPlan1: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  projectPlan3: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  projectPlan5: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  rightsManagementAdhoc: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  visioPlan2: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

Valor.sync({ force: false }).then(() => { 
  console.log('Tabela criada com sucesso');
});

module.exports = Valor;
