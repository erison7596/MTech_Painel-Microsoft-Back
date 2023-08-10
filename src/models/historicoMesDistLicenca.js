const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const HistoricoMesDistLicenca = db.define('historico_mes_dist_licenca', {
  distribuidora: {
    type: Sequelize.STRING,
    allowNull: false
  },
  mes: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  ano: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  usuarios: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  exchangeOnlinePlan1: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  office365E3: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  powerBIFree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  enterpriseMobility: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  securityE3: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsExploratory: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAutomateFree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  // Licenças adicionais
  azureActiveDirectoryPremiumP1: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerInsightsSelfServiceTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerInsightsVTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerServiceEnterpriseVTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365CustomerVoiceTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365FieldServiceVTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365Finance: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365OperationsActivity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365P1TrialforInformationWorkers: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365SalesEnterpriseEdition: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365SalesPremiumViralTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365SupplyChainManagement: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  d365SupplyChainAttach: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  dynamics365TeamMembers: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  enterpriseMobilitySecurityE3: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  enterpriseMobilitySecurityE5: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  exchangeOnlinePlan1: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftBusinessCenter: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftDynamicsAX7UserTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftFabricFree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAppsforDeveloper: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAppsPlan2Trial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftPowerAutomateFree: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftStreamTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsExploratory: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsRoomsBasic: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  microsoftTeamsRoomsPro: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  office365E3: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  powerBIPro: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  powerPagesVTrialforMakers: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  powerVirtualAgentsViralTrial: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  projectOnlineEssentials: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  projectPlan1: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  projectPlan3: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  projectPlan5: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  rightsManagementAdhoc: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  },
  visioPlan2: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: false
  }
});

HistoricoMesDistLicenca.sync({ force: false }).then(() => { 
  // console.log('Tabela HistoricoMesLicenca criada com sucesso');
});

module.exports = HistoricoMesDistLicenca;
