const { Sequelize, DataTypes } = require('sequelize');
const db = require('../utils/database');

const Licenca = db.define('licenca', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  valor: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});
// Associação entre Licenca e HistoricoLicenca
const HistoricoLicenca = require('../models/historicoLicenca');
Licenca.hasMany(HistoricoLicenca, { onDelete: 'cascade' });
HistoricoLicenca.belongsTo(Licenca);
// Função para criar as licenças iniciais com valor 0, caso ainda não existam
async function criarLicencasIniciais() {
  try {
    const licencasIniciais = [
  { nome: 'Azure Active Directory Premium P1', valor: 0 },
  { nome: 'Dynamics 365 Customer Insights Self-Service Trial', valor: 0 },
  { nome: 'Dynamics 365 Customer Insights vTrial', valor: 0 },
  { nome: 'Dynamics 365 Customer Service Enterprise vTrial', valor: 0 },
  { nome: 'Dynamics 365 Customer Voice Trial', valor: 0 },
  { nome: 'Dynamics 365 Field Service vTrial', valor: 0 },
  { nome: 'Dynamics 365 Finance', valor: 0 },
  { nome: 'Dynamics 365 Operations – Activity', valor: 0 },
  { nome: 'Dynamics 365 P1 Trial for Information Workers', valor: 0 },
  { nome: 'Dynamics 365 Sales Enterprise Edition', valor: 0 },
  { nome: 'Dynamics 365 Sales Premium Viral Trial', valor: 0 },
  { nome: 'Dynamics 365 Supply Chain Management', valor: 0 },
  { nome: 'Dynamics 365 Supply Chain Management Attach to Qualifying Dynamics 365 Base Offer', valor: 0 },
  { nome: 'Dynamics 365 Team Members', valor: 0 },
  { nome: 'Enterprise Mobility', valor: 0 },
  { nome: 'Security E3', valor: 0 },
  { nome: 'Security E5', valor: 0 },
  { nome: 'Exchange Online (Plan 1)', valor: 0 },
  { nome: 'Microsoft Business Center', valor: 0 },
  { nome: 'Microsoft Dynamics AX7 User Trial', valor: 0 },
  { nome: 'Microsoft Fabric (Free)', valor: 0 },
  { nome: 'Microsoft Power Apps for Developer', valor: 0 },
  { nome: 'Microsoft Power Apps Plan 2 Trial', valor: 0 },
  { nome: 'Microsoft Power Automate Free', valor: 0 },
  { nome: 'Microsoft Stream Trial', valor: 0 },
  { nome: 'Microsoft Teams Exploratory', valor: 0 },
  { nome: 'Microsoft Teams Rooms Basic', valor: 0 },
  { nome: 'Microsoft Teams Rooms Pro', valor: 0 },
  { nome: 'Office 365 E3', valor: 0 },
  { nome: 'Power BI Pro', valor: 0 },
  { nome: 'Power Pages vTrial for Makers', valor: 0 },
  { nome: 'Power Virtual Agents Viral Trial', valor: 0 },
  { nome: 'Project Online Essentials', valor: 0 },
  { nome: 'Project Plan 1', valor: 0 },
  { nome: 'Project Plan 3', valor: 0 },
  { nome: 'Project Plan 5', valor: 0 },
  { nome: 'Rights Management Adhoc', valor: 0 },
  { nome: 'Visio Plan 2', valor: 0 }
];


    const existingLicencas = await Licenca.findAll();
    if (existingLicencas.length === 0) {
      // Se não existirem, cria as licenças iniciais
      await Licenca.bulkCreate(licencasIniciais);
      // console.log('Licenças iniciais criadas com sucesso');
    }
  } catch (error) {
    console.error('Erro ao criar licenças iniciais:', error);
  }
}

// Sincroniza a tabela Licenca com o banco de dados
Licenca.sync({force:false}).then(() => {
  // console.log('Tabela de licenças criada com sucesso');
  // Chama a função para criar as licenças iniciais após a sincronização
  criarLicencasIniciais();
});

module.exports = Licenca;




