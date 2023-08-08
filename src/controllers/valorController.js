const xlsx = require('xlsx');
const moment = require('moment');
const { Op, Sequelize,DataTypes } = require('sequelize');
const db = require('../utils/database');
const Valor = require('../models/valor');
const ExcelJS = require('exceljs');
const slugify = require('slugify');
const express = require('express');
const app = express();
const HistoricoMesLicenca = require('../models/historicoMesLicenca');

function getCellValue(column, row, worksheet) {
  const cellAddress = `${column}${row}`;
  const cell = worksheet[cellAddress];
  return cell ? cell.v : undefined;
}


async function atualizarHistoricoMesLicenca() {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    let historicoMesLicenca = await HistoricoMesLicenca.findOne({
      where: { mes: mesAtual, ano: anoAtual },
    });

    const registros = await Valor.findAll();
    const quantidadeUsuarios = {};

    registros.forEach((registro) => {
      for (const coluna in registro.dataValues) {
        if (typeof registro.dataValues[coluna] === 'boolean' && registro.dataValues[coluna] === true) {
          quantidadeUsuarios[coluna] = (quantidadeUsuarios[coluna] || 0) + 1;
        }
      }
    });

     const usuariosPorDistribuidora = await Valor.findAll({
        attributes: ['nomeExibicao', 'idDistribuidora', [Sequelize.fn('COUNT', Sequelize.col('nomeExibicao')), 'quantidade']],
        group: ['nomeExibicao', 'idDistribuidora'],
    });

    // Filtrar e contar quantas vezes o mesmo nomeExibicao aparece em cada idDistribuidora
    const quantidadeUsuarios2 = usuariosPorDistribuidora.reduce((total, registro) => {
      // Verifica se o nomeExibicao já foi contado para essa idDistribuidora
      if (!total[registro.idDistribuidora]) {
        total[registro.idDistribuidora] = 1;
      } else {
        total[registro.idDistribuidora] += 1;
      }
      return total;
    }, {});

    // Somar todas as quantidades para obter o total de nomeExibicao em todas as idDistribuidora
    const totalUsuarios = Object.values(quantidadeUsuarios2).reduce((total, quantidade) => total + quantidade, 0);

    if (!historicoMesLicenca) {
      historicoMesLicenca = await HistoricoMesLicenca.create({
        mes: mesAtual,
        ano: anoAtual,
        usuarios: totalUsuarios,
        ...quantidadeUsuarios,
      });
    } else {
      historicoMesLicenca.update({
        usuarios: totalUsuarios,
        ...quantidadeUsuarios,
      });
    }

    console.log('Histórico de licenças do mês atual atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar o histórico de licenças do mês:', error);
    throw error;
  }
}



async function importData(worksheet) {
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  
  // Encontrar o índice das colunas desejadas
  const columnNames = {
    'DISTRIBUIDORA': -1,
    'ID DISTRIBUIDORA': -1,
    'Nome para exibição': -1,
    'ID LICENÇA': -1,
    'ID CUSTO LICENÇA': -1,
    'Data/hora de criação': -1,
    'Licenças (extraído do Office365)': -1
  };

  for (let col = range.s.c; col <= range.e.c; col++) {
    const columnName = getCellValue(xlsx.utils.encode_col(col), range.s.r + 2, worksheet);

    if (columnNames.hasOwnProperty(columnName)) {
      columnNames[columnName] = col;
    }
  }

  // Verificar se todas as colunas foram encontradas
  const missingColumns = Object.keys(columnNames).filter((columnName) => columnNames[columnName] === -1);

  if (missingColumns.length > 0) {
    throw new Error(`Colunas faltando: ${missingColumns.join(', ')}`);
  }
let tamanho = 0;
  // Importar os dados apenas das colunas desejadas
  for (let row = range.s.r + 2; row <= range.e.r; row++) {
    const distribuidora = getCellValue(xlsx.utils.encode_col(columnNames['DISTRIBUIDORA']), row, worksheet);
    const idDistribuidora = getCellValue(xlsx.utils.encode_col(columnNames['ID DISTRIBUIDORA']), row, worksheet);

    if (idDistribuidora === undefined) {
     // console.log('Valor de ID DISTRIBUIDORA indefinido na linha', row);
      tamanho++;
      if(tamanho > 100){
        break;
      }
      continue;
    }

    if (typeof idDistribuidora !== 'string') {
     // console.log('Valor de ID DISTRIBUIDORA inválido na linha', row);
      continue;
    }

    const slug = slugify(idDistribuidora, { lower: true, strict: true });
    const nomeExibicao = getCellValue(xlsx.utils.encode_col(columnNames['Nome para exibição']), row, worksheet);
    const idLicenca = getCellValue(xlsx.utils.encode_col(columnNames['ID LICENÇA']), row, worksheet);
    const idCustoLicenca = getCellValue(xlsx.utils.encode_col(columnNames['ID CUSTO LICENÇA']), row, worksheet);

    // Obter o valor bruto da coluna J (Data/hora de criação)
    const dataHoraCriacaoValue = worksheet[xlsx.utils.encode_cell({ c: columnNames['Data/hora de criação'], r: row -1 })]?.w;

    let dataHoraCriacao;

    if (dataHoraCriacaoValue !== undefined && dataHoraCriacaoValue !== 'Data/hora de criação') {
      // Converter o valor para um objeto Moment.js e verificar se é válido
      const momentDate = moment(dataHoraCriacaoValue, ['MM/DD/YY HH:mm', 'DD/MM/YY HH:mm']);
      if (momentDate.isValid()) {
        dataHoraCriacao = momentDate.format('YYYY-MM-DD HH:mm:ss');
      } else {
       // console.log('Formato de data/hora inválido:', dataHoraCriacaoValue);
        continue;
      }
    } else {
     //console.log('Valor de data/hora inválido:', dataHoraCriacaoValue);
      continue;
    }

    // Licenças (extraído do Office365)
    const licencas = getCellValue(xlsx.utils.encode_col(columnNames['Licenças (extraído do Office365)']), row, worksheet);

    // Separar as licenças em um array
    const licencasArray = licencas.split('+').map(licenca => licenca.trim());

    // Atualizar as colunas booleanas com base nas licenças do usuário
    const userLicenses = {
    exchangeOnlinePlan1: licencasArray.includes('Exchange Online (Plan 1)'),
    office365E3: licencasArray.includes('Office 365 E3'),
    powerBIFree: licencasArray.includes('Power BI (free)'),
    enterpriseMobility: licencasArray.includes('Enterprise Mobility'),
    securityE3: licencasArray.includes('Security E3'),
    microsoftTeamsExploratory: licencasArray.includes('Microsoft Teams Exploratory'),
    microsoftPowerAutomateFree: licencasArray.includes('Microsoft Power Automate Free'),
    // Licenças adicionais
    azureActiveDirectoryPremiumP1: licencasArray.includes('Azure Active Directory Premium P1'),
    dynamics365CustomerInsightsSelfServiceTrial: licencasArray.includes('Dynamics 365 Customer Insights Self-Service Trial'),
    dynamics365CustomerInsightsVTrial: licencasArray.includes('Dynamics 365 Customer Insights vTrial'),
    dynamics365CustomerServiceEnterpriseVTrial: licencasArray.includes('Dynamics 365 Customer Service Enterprise vTrial'),
    dynamics365CustomerVoiceTrial: licencasArray.includes('Dynamics 365 Customer Voice Trial'),
    dynamics365FieldServiceVTrial: licencasArray.includes('Dynamics 365 Field Service vTrial'),
    dynamics365Finance: licencasArray.includes('Dynamics 365 Finance'),
    dynamics365OperationsActivity: licencasArray.includes('Dynamics 365 Operations – Activity'),
    dynamics365P1TrialforInformationWorkers: licencasArray.includes('Dynamics 365 P1 Trial for Information Workers'),
    dynamics365SalesEnterpriseEdition: licencasArray.includes('Dynamics 365 Sales Enterprise Edition'),
    dynamics365SalesPremiumViralTrial: licencasArray.includes('Dynamics 365 Sales Premium Viral Trial'),
    dynamics365SupplyChainManagement: licencasArray.includes('Dynamics 365 Supply Chain Management'),
    d365SupplyChainAttach: licencasArray.includes('Dynamics 365 Supply Chain Management Attach to Qualifying Dynamics 365 Base Offer'),
    dynamics365TeamMembers: licencasArray.includes('Dynamics 365 Team Members'),
    enterpriseMobilitySecurityE3: licencasArray.includes('Enterprise Mobility + Security E3'),
    enterpriseMobilitySecurityE5: licencasArray.includes('Enterprise Mobility + Security E5'),
    exchangeOnlinePlan1: licencasArray.includes('Exchange Online (Plan 1)'),
    microsoftBusinessCenter: licencasArray.includes('Microsoft Business Center'),
    microsoftDynamicsAX7UserTrial: licencasArray.includes('Microsoft Dynamics AX7 User Trial'),
    microsoftFabricFree: licencasArray.includes('Microsoft Fabric (Free)'),
    microsoftPowerAppsforDeveloper: licencasArray.includes('Microsoft Power Apps for Developer'),
    microsoftPowerAppsPlan2Trial: licencasArray.includes('Microsoft Power Apps Plan 2 Trial'),
    microsoftPowerAutomateFree: licencasArray.includes('Microsoft Power Automate Free'),
    microsoftStreamTrial: licencasArray.includes('Microsoft Stream Trial'),
    microsoftTeamsExploratory: licencasArray.includes('Microsoft Teams Exploratory'),
    microsoftTeamsRoomsBasic: licencasArray.includes('Microsoft Teams Rooms Basic'),
    microsoftTeamsRoomsPro: licencasArray.includes('Microsoft Teams Rooms Pro'),
    office365E3: licencasArray.includes('Office 365 E3'),
    powerBIPro: licencasArray.includes('Power BI Pro'),
    powerPagesVTrialforMakers: licencasArray.includes('Power Pages vTrial for Makers'),
    powerVirtualAgentsViralTrial: licencasArray.includes('Power Virtual Agents Viral Trial'),
    projectOnlineEssentials: licencasArray.includes('Project Online Essentials'),
    projectPlan1: licencasArray.includes('Project Plan 1'),
    projectPlan3: licencasArray.includes('Project Plan 3'),
    projectPlan5: licencasArray.includes('Project Plan 5'),
    rightsManagementAdhoc: licencasArray.includes('Rights Management Adhoc'),
    visioPlan2: licencasArray.includes('Visio Plan 2'),
    // Adicione mais colunas conforme a necessidade para outras licenças
  };

    const existingValor = await Valor.findOne({
      where: {
        nomeExibicao,
        distribuidora,
        idDistribuidora
      }
    });

    if (existingValor) {
      // Se já existe um registro com os mesmos valores, atualize-o
      existingValor.idLicenca = idLicenca;
      existingValor.idCustoLicenca = idCustoLicenca;
      existingValor.dataHoraCriacao = dataHoraCriacao;
      existingValor.licencas = licencas;
      existingValor.exchangeOnlinePlan1 = userLicenses.exchangeOnlinePlan1;
      existingValor.office365E3 = userLicenses.office365E3;
      existingValor.powerBIFree = userLicenses.powerBIFree;
      existingValor.enterpriseMobility = userLicenses.enterpriseMobility;
      existingValor.securityE3 = userLicenses.securityE3;
      existingValor.microsoftTeamsExploratory = userLicenses.microsoftTeamsExploratory;
      existingValor.microsoftPowerAutomateFree = userLicenses.microsoftPowerAutomateFree;

      await existingValor.save();
    } else {
      // Caso contrário, crie um novo registro
      await Valor.create({
        distribuidora,
        idDistribuidora,
        slug,
        nomeExibicao,
        idLicenca,
        idCustoLicenca,
        licencas,
        dataHoraCriacao,
        ...userLicenses
      });
    }
  }
  await atualizarHistoricoMesLicenca();
  console.log('Dados importados com sucesso!');
}

module.exports = {
  importData
};
