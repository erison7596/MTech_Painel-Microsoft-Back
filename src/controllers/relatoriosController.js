const moment = require('moment');
const { Op, Sequelize,DataTypes } = require('sequelize');
const Valor = require('../models/valor');
const HistoricoLicenca = require('../models/historicoLicenca');
const Licencas = require('../models/licencas');
const { tr } = require('date-fns/locale');
const db = require('../utils/database');

async function listarLicencas() {
  try {
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
    const licencasComValorUm = {};

    // Obtem todas as colunas do modelo Valor
    const colunasValor = Object.keys(Valor.rawAttributes);

    // Para cada coluna do modelo Valor, verificamos se o valor é igual a 1 para cada linha
    for (const colunaValor of colunasValor) {
      if (colunaValor === 'id' || colunaValor === 'distribuidora' || colunaValor === 'idDistribuidora' || colunaValor === 'slug' || colunaValor === 'nomeExibicao' || colunaValor === 'idCustoLicenca' || colunaValor === 'licencas' || colunaValor === 'dataHoraCriacao' || colunaValor === 'createdAt' || colunaValor === 'updatedAt') {
        continue; // Ignora colunas que não representam licenças
      }

      const quantidadeLicencasUm = await Valor.count({
        where: {
          [colunaValor]: true,
        },
      });

      // Obter o nome correspondente ao código da licença no mapa `licenseMapping`
      const nomeLicenca = licenseMapping[colunaValor];

      licencasComValorUm[nomeLicenca] = quantidadeLicencasUm;
    }

    return licencasComValorUm;
  } catch (error) {
    throw new Error('Erro ao calcular o custo total:', error);
  }
}

async function calcularCustoTotal() { 
  try {
    const valoresLicencas = await listarLicencas();
    const licencas = await Licencas.findAll();

    const custoTotal = licencas.reduce((total, licenca) => {
      const nome = licenca.dataValues.nome;
      const valor = licenca.dataValues.valor;

      if (nome && valor) {
        const valorLicenca = valoresLicencas[nome] * valor;
        return total + valorLicenca;
      } else {
        console.error('Valor ausente ou inconsistente para calcular o custo total:', licenca.dataValues);
        return total;
      }
    }, 0);

    return custoTotal.toFixed(2);
  } catch (error) {
    throw new Error('Erro ao calcular o custo total:', error);
  }
}



async function calcularCustoTotalMesAnterior() {
  try {
    const dataAtual = new Date();
    const primeiroDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
    const primeiroDiaMesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);

    // Convertendo as datas para formato UTC
    const primeiroDiaMesAtualUTC = primeiroDiaMesAtual.toISOString();
    const primeiroDiaMesAnteriorUTC = primeiroDiaMesAnterior.toISOString();

    console.log('Data atual:', dataAtual.toISOString());
    console.log('Primeiro dia do mês atual:', primeiroDiaMesAtualUTC);
    console.log('Primeiro dia do mês anterior:', primeiroDiaMesAnteriorUTC);

    const historicoCustoTotal = await HistoricoLicenca.sum('valor', {
      where: {
        data: {
          [Op.between]: [primeiroDiaMesAnteriorUTC, primeiroDiaMesAtualUTC],
        },
      },
    });
    if (historicoCustoTotal === null) {
      return 0; // Retorna zero se o histórico estiver vazio
    }
    console.log('Custo total mês anterior2:', historicoCustoTotal.toFixed(2));
    return historicoCustoTotal.toFixed(2);
  } catch (error) {
    console.error('Erro ao calcular o custo total do mês anterior:', error);
    return null;
  }
}

async function calcularHistoricoCustoTotalAno() {
  try {
    const dataAtual = new Date();
    const historicoCustoTotalAno = {};

    for (let mes = 0; mes < 12; mes++) {
      const primeiroDiaMes = new Date(dataAtual.getFullYear(), mes, 1);
      const ultimoDiaMes = new Date(dataAtual.getFullYear(), mes + 1, 0);

      // Convertendo as datas para formato UTC
      const primeiroDiaMesUTC = primeiroDiaMes.toISOString();
      const ultimoDiaMesUTC = ultimoDiaMes.toISOString();

      // console.log('Mês:', mes + 1);
      // console.log('Primeiro dia do mês:', primeiroDiaMesUTC);
      // console.log('Último dia do mês:', ultimoDiaMesUTC);

      const historicoCustoTotalMes = await HistoricoLicenca.sum('valor', {
        where: {
          data: {
            [Op.between]: [primeiroDiaMesUTC, ultimoDiaMesUTC],
          },
        },
      });

      if (historicoCustoTotalMes === null) {
        historicoCustoTotalAno[mes + 1] = 0;
      } else {
        historicoCustoTotalAno[mes + 1] = historicoCustoTotalMes.toFixed(2);
      }

      // console.log('Custo total do mês:', historicoCustoTotalAno[mes + 1]);
    }

    return historicoCustoTotalAno;
  } catch (error) {
    console.error('Erro ao calcular o histórico do custo total do ano:', error);
    return null;
  }
}



async function calcularQuantidadeLicencasAtivas() {
  try {
    // Recupere todos os registros do modelo 'Valor'
    const registros = await Valor.findAll();

    // Inicialize a quantidade total de licenças ativas como 0
    let quantidadeAtivas = 0;

    // Percorra cada registro do modelo
    registros.forEach(registro => {
      // Percorra as colunas de licenças do registro atual
      for (const coluna in registro.dataValues) {
        // Verifique se a coluna é uma licença (ou seja, possui o tipo 'Sequelize.BOOLEAN')
        if (typeof registro.dataValues[coluna] === 'boolean') {
          // Se o valor da coluna for igual a 1 (ativo), some 1 à quantidade total de licenças ativas
          if (registro.dataValues[coluna] === true) {
            quantidadeAtivas++;
          }
        }
      }
    });

    // Retorne a quantidade total de licenças ativas
    return quantidadeAtivas;
  } catch (error) {
    // console.error('Erro ao calcular a quantidade de licenças ativas:', error);
    throw error;
  }
}



async function calcularQuantidadeUsuarios() {
  try {
    // Consulta para agrupar e contar os registros por nomeExibicao e idDistribuidora
    const usuariosPorDistribuidora = await Valor.findAll({
      attributes: ['nomeExibicao', 'idDistribuidora', [Sequelize.fn('COUNT', Sequelize.col('nomeExibicao')), 'quantidade']],
      group: ['nomeExibicao', 'idDistribuidora'],
    });

    // Filtrar e contar quantas vezes o mesmo nomeExibicao aparece em cada idDistribuidora
    const quantidadeUsuarios = usuariosPorDistribuidora.reduce((total, registro) => {
      // Verifica se o nomeExibicao já foi contado para essa idDistribuidora
      if (!total[registro.idDistribuidora]) {
        total[registro.idDistribuidora] = 1;
      } else {
        total[registro.idDistribuidora] += 1;
      }
      return total;
    }, {});

    // Somar todas as quantidades para obter o total de nomeExibicao em todas as idDistribuidora
    const totalUsuarios = Object.values(quantidadeUsuarios).reduce((total, quantidade) => total + quantidade, 0);

    return totalUsuarios;
  } catch (error) {
    throw new Error('Erro ao calcular a quantidade de usuários:', error);
  }
}


async function calcularValorMedioPorUsuario() {
  try {
    const quantidadeUsuarios = await calcularQuantidadeUsuarios();
    const custoTotal = await calcularCustoTotal();
    const valorMedioPorUsuario = custoTotal / quantidadeUsuarios;
    return valorMedioPorUsuario.toFixed(2);
  } catch (error) {
    throw new Error('Erro ao calcular o valor médio por usuário:', error);
  }
}

async function calcularValorTotalDeCadaLicenca() {
  try {
    const valoresLicencas = await listarLicencas();
    const licencas = await Licencas.findAll();

    const valorTotalPorLicenca = {};

    for (const licenca of licencas) {
      const nome = licenca.dataValues.nome;
      const valor = licenca.dataValues.valor;

      if (nome && valor) {
        const quantidade = valoresLicencas[nome] || 0; // Se a licença não estiver no objeto valoresLicencas, assume quantidade 0
        const valorTotal = quantidade * valor;
        valorTotalPorLicenca[nome] = valorTotal;
      } else {
        console.error('Valor ausente ou inconsistente para calcular o valor total:', licenca.dataValues);
      }
    }

    return valorTotalPorLicenca;
  } catch (error) {
    throw new Error('Erro ao calcular o valor total de cada licença:', error);
  }
}

function ordenarPorQuantidade(objeto) {
  // Convertendo o objeto em uma matriz de pares chave-valor
  const matrizChaveValor = Object.entries(objeto);

  // Ordenando a matriz com base nos valores (quantidades) em ordem decrescente
  matrizChaveValor.sort((a, b) => b[1] - a[1]);

  // Reconstruindo o objeto a partir da matriz classificada
  const objetoOrdenado = {};
  matrizChaveValor.forEach(([chave, valor]) => {
    objetoOrdenado[chave] = valor;
  });

  return objetoOrdenado;
}

async function calcularValorTotalDeCadaLicencaAno() {
  try {
    const query = `
      SELECT l.nome, YEAR(h.data) AS ano, h.valor
      FROM historico_licencas h
      JOIN (
          SELECT licencaId, YEAR(data) AS ano, MAX(data) AS max_data
          FROM historico_licencas
          GROUP BY licencaId, YEAR(data)
      ) ultima_data
      ON h.licencaId = ultima_data.licencaId AND YEAR(h.data) = ultima_data.ano AND h.data = ultima_data.max_data
      RIGHT JOIN licencas l
      ON l.id = h.licencaId
      WHERE YEAR(h.data) < YEAR(NOW())
      
      UNION

      SELECT l.nome, 2023 AS ano, l.valor
      FROM licencas l;
    `;

    const results = await db.query(query, { type: db.QueryTypes.SELECT });
    return results;
  } catch (error) {
    throw new Error('Erro ao calcular o histórico do valor total de cada licença por ano: ' + error.message);
  }
}



module.exports = {
  calcularCustoTotal,
  calcularHistoricoCustoTotalAno,
  ordenarPorQuantidade,
  listarLicencas,
  calcularCustoTotalMesAnterior,
  calcularQuantidadeLicencasAtivas,
  calcularQuantidadeUsuarios,
  calcularValorMedioPorUsuario,
  calcularValorTotalDeCadaLicenca,
  calcularValorTotalDeCadaLicencaAno
};
