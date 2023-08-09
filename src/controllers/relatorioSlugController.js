const { Op, Sequelize,DataTypes } = require('sequelize');
const Valor = require('../models/valor');
const HistoricoLicenca = require('../models/historicoLicenca');
const Licencas = require('../models/licencas');
const db = require('../utils/database');
const HistoricoMesLicenca = require('../models/historicoMesLicenca');
const Func = require('./relatoriosController');
const licenseMapping = {
    exchangeOnlinePlan1: 'Exchange Online (Plan 1)',
    office365E3: 'Office 365 E3',
    powerBIFree: 'Power BI (free)',
    enterpriseMobility: 'Enterprise Mobility',
    securityE3: 'Security E3',
    microsoftTeamsExploratory: 'Microsoft Teams Exploratory',
    microsoftPowerAutomateFree: 'Microsoft Power Automate Free',
    azureActiveDirectoryPremiumP1: 'Azure Active Directory Premium P1',
    dynamics365CustomerInsightsSelfServiceTrial: 'Dynamics 365 Customer Insights Self-Service Trial',
    dynamics365CustomerInsightsVTrial: 'Dynamics 365 Customer Insights vTrial',
    dynamics365CustomerServiceEnterpriseVTrial: 'Dynamics 365 Customer Service Enterprise vTrial',
    dynamics365CustomerVoiceTrial: 'Dynamics 365 Customer Voice Trial',
    dynamics365FieldServiceVTrial: 'Dynamics 365 Field Service vTrial',
    dynamics365Finance: 'Dynamics 365 Finance',
    dynamics365OperationsActivity: 'Dynamics 365 Operations – Activity',
    dynamics365P1TrialforInformationWorkers: 'Dynamics 365 P1 Trial for Information Workers',
    dynamics365SalesEnterpriseEdition: 'Dynamics 365 Sales Enterprise Edition',
    dynamics365SalesPremiumViralTrial: 'Dynamics 365 Sales Premium Viral Trial',
    dynamics365SupplyChainManagement: 'Dynamics 365 Supply Chain Management',
    d365SupplyChainAttach: 'Dynamics 365 Supply Chain Management Attach to Qualifying Dynamics 365 Base Offer',
    dynamics365TeamMembers: 'Dynamics 365 Team Members',
    enterpriseMobilitySecurityE3: 'Enterprise Mobility + Security E3',
    enterpriseMobilitySecurityE5: 'Enterprise Mobility + Security E5',
    exchangeOnlinePlan1: 'Exchange Online (Plan 1)',
    microsoftBusinessCenter: 'Microsoft Business Center',
    microsoftDynamicsAX7UserTrial: 'Microsoft Dynamics AX7 User Trial',
    microsoftFabricFree: 'Microsoft Fabric (Free)',
    microsoftPowerAppsforDeveloper: 'Microsoft Power Apps for Developer',
    microsoftPowerAppsPlan2Trial: 'Microsoft Power Apps Plan 2 Trial',
    microsoftPowerAutomateFree: 'Microsoft Power Automate Free',
    microsoftStreamTrial: 'Microsoft Stream Trial',
    microsoftTeamsExploratory: 'Microsoft Teams Exploratory',
    microsoftTeamsRoomsBasic: 'Microsoft Teams Rooms Basic',
    microsoftTeamsRoomsPro: 'Microsoft Teams Rooms Pro',
    office365E3: 'Office 365 E3',
    powerBIPro: 'Power BI Pro',
    powerPagesVTrialforMakers: 'Power Pages vTrial for Makers',
    powerVirtualAgentsViralTrial: 'Power Virtual Agents Viral Trial',
    projectOnlineEssentials: 'Project Online Essentials',
    projectPlan1: 'Project Plan 1',
    projectPlan3: 'Project Plan 3',
    projectPlan5: 'Project Plan 5',
    rightsManagementAdhoc: 'Rights Management Adhoc',
    visioPlan2: 'Visio Plan 2',
};

async function QuantLicencaDistribuidoras() {
    try {
        const licenses = await Valor.findAll();

        const distribuidoras = {};

        licenses.forEach(license => {
            const { distribuidora, slug, idDistribuidora, ...otherLicenseData } = license.toJSON();

            if (!distribuidoras[idDistribuidora]) {
                distribuidoras[idDistribuidora] = {
                    distribuidora,
                    slug,
                    licenses: {}
                };
            }

            Object.entries(otherLicenseData).forEach(([licenseKey, value]) => {
                if (licenseMapping[licenseKey] && value === true) {
                    const licenseName = licenseMapping[licenseKey];
                    if (!distribuidoras[idDistribuidora].licenses[licenseName]) {
                        distribuidoras[idDistribuidora].licenses[licenseName] = 0;
                    }
                    distribuidoras[idDistribuidora].licenses[licenseName]++;
                }
            });
        });

        return distribuidoras;
    } catch (error) {
        console.error('Erro ao obter dados das licenças:', error);
        return {};
    }
}

async function ValLicencaDist() {
  try {
    const teste = await Func.ValoresAtuaisLicencas();
    return teste;
  }catch(error) {
    console.error('Erro ao obter dados das licenças:', error);
    return {};
  }
}

async function Distribuidoras() {
  try {
    const valLicenca = await ValLicencaDist();
    const QuantLicencaDistribuidorasResult = await QuantLicencaDistribuidoras();
    const result = [];

    for (const distribuidora in QuantLicencaDistribuidorasResult) {
      const { distribuidora: nomeDist, idDistribuidora, slug, licenses } = QuantLicencaDistribuidorasResult[distribuidora];
      let valorTotal = 0;
      for (const license in licenses) {
        if (valLicenca[license]) {
          valorTotal += valLicenca[license] * licenses[license];
        }
      }

      result.push({
        distribuidora: nomeDist,
        idDistribuidora: distribuidora, // Incluído o campo idDistribuidora
        slug,
        valorTotal: valorTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      });
    }

    return result;
  } catch (error) {
    console.error('Erro ao obter dados das licenças:', error);
    return [];
  }
}

async function QuantidadeDeLicencaDist() {
  
}





module.exports = {
  QuantLicencaDistribuidoras,
  ValLicencaDist,
  Distribuidoras,
}