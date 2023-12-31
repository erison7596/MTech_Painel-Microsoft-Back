const { Op, Sequelize, DataTypes } = require("sequelize");
const Valor = require("../models/valor");
const HistoricoLicenca = require("../models/historicoLicenca");
const Licencas = require("../models/licencas");
const db = require("../utils/database");
const HistoricoMesLicenca = require("../models/historicoMesLicenca");
const HistoricoDist = require("../models/historicoMesDistLicenca");
const Func = require("./relatoriosController");
const { ca } = require("date-fns/locale");
const licenseMapping = {
  exchangeOnlinePlan1: "Exchange Online (Plan 1)",
  office365E3: "Office 365 E3",
  powerBIFree: "Power BI (free)",
  enterpriseMobility: "Enterprise Mobility",
  securityE3: "Security E3",
  microsoftTeamsExploratory: "Microsoft Teams Exploratory",
  microsoftPowerAutomateFree: "Microsoft Power Automate Free",
  azureActiveDirectoryPremiumP1: "Azure Active Directory Premium P1",
  dynamics365CustomerInsightsSelfServiceTrial:
    "Dynamics 365 Customer Insights Self-Service Trial",
  dynamics365CustomerInsightsVTrial: "Dynamics 365 Customer Insights vTrial",
  dynamics365CustomerServiceEnterpriseVTrial:
    "Dynamics 365 Customer Service Enterprise vTrial",
  dynamics365CustomerVoiceTrial: "Dynamics 365 Customer Voice Trial",
  dynamics365FieldServiceVTrial: "Dynamics 365 Field Service vTrial",
  dynamics365Finance: "Dynamics 365 Finance",
  dynamics365OperationsActivity: "Dynamics 365 Operations – Activity",
  dynamics365P1TrialforInformationWorkers:
    "Dynamics 365 P1 Trial for Information Workers",
  dynamics365SalesEnterpriseEdition: "Dynamics 365 Sales Enterprise Edition",
  dynamics365SalesPremiumViralTrial: "Dynamics 365 Sales Premium Viral Trial",
  dynamics365SupplyChainManagement: "Dynamics 365 Supply Chain Management",
  d365SupplyChainAttach:
    "Dynamics 365 Supply Chain Management Attach to Qualifying Dynamics 365 Base Offer",
  dynamics365TeamMembers: "Dynamics 365 Team Members",
  enterpriseMobilitySecurityE3: "Enterprise Mobility + Security E3",
  enterpriseMobilitySecurityE5: "Enterprise Mobility + Security E5",
  exchangeOnlinePlan1: "Exchange Online (Plan 1)",
  microsoftBusinessCenter: "Microsoft Business Center",
  microsoftDynamicsAX7UserTrial: "Microsoft Dynamics AX7 User Trial",
  microsoftFabricFree: "Microsoft Fabric (Free)",
  microsoftPowerAppsforDeveloper: "Microsoft Power Apps for Developer",
  microsoftPowerAppsPlan2Trial: "Microsoft Power Apps Plan 2 Trial",
  microsoftPowerAutomateFree: "Microsoft Power Automate Free",
  microsoftStreamTrial: "Microsoft Stream Trial",
  microsoftTeamsExploratory: "Microsoft Teams Exploratory",
  microsoftTeamsRoomsBasic: "Microsoft Teams Rooms Basic",
  microsoftTeamsRoomsPro: "Microsoft Teams Rooms Pro",
  office365E3: "Office 365 E3",
  powerBIPro: "Power BI Pro",
  powerPagesVTrialforMakers: "Power Pages vTrial for Makers",
  powerVirtualAgentsViralTrial: "Power Virtual Agents Viral Trial",
  projectOnlineEssentials: "Project Online Essentials",
  projectPlan1: "Project Plan 1",
  projectPlan3: "Project Plan 3",
  projectPlan5: "Project Plan 5",
  rightsManagementAdhoc: "Rights Management Adhoc",
  visioPlan2: "Visio Plan 2",
};

async function QuantLicencaDistribuidoras() {
  try {
    const licenses = await Valor.findAll();

    const distribuidoras = {};

    licenses.forEach((license) => {
      const { distribuidora, slug, idDistribuidora, ...otherLicenseData } =
        license.toJSON();

      if (!distribuidoras[idDistribuidora]) {
        distribuidoras[idDistribuidora] = {
          distribuidora,
          slug,
          licenses: {},
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
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function ValLicencaDist() {
  try {
    const teste = await Func.ValoresAtuaisLicencas();
    return teste;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function Distribuidoras() {
  try {
    const valLicenca = await ValLicencaDist();
    const QuantLicencaDistribuidorasResult = await QuantLicencaDistribuidoras();
    const result = [];

    for (const distribuidora in QuantLicencaDistribuidorasResult) {
      const {
        distribuidora: nomeDist,
        idDistribuidora,
        slug,
        licenses,
      } = QuantLicencaDistribuidorasResult[distribuidora];
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
        valorTotal: valorTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      });
    }

    return result;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return [];
  }
}

async function QuantidadeDeUserDistMesAtual() {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Os meses em JavaScript são baseados em zero

    const distribuidoras = await HistoricoDist.findAll({
      attributes: [
        "distribuidora",
        [Sequelize.fn("sum", Sequelize.col("usuarios")), "total_usuarios"],
      ],
      where: {
        mes: currentMonth,
      },
      group: ["distribuidora"],
    });

    const result = {};
    distribuidoras.forEach((dist) => {
      result[dist.distribuidora] = dist.dataValues.total_usuarios;
    });

    return result;
  } catch (error) {
    console.error(
      "Erro ao obter a quantidade de usuários por distribuidora:",
      error
    );
    throw error;
  }
}

async function QuantidadeDeUserDistMesPassado() {
  try {
    const today = new Date();
    const lastMonth = today.getMonth(); // Subtrai 1 para obter o mês passado

    const quantUsuariosPorMes = await QuantUsuarioPorMes();

    if (
      quantUsuariosPorMes.hasOwnProperty(today.getFullYear()) &&
      quantUsuariosPorMes[today.getFullYear()].hasOwnProperty(lastMonth)
    ) {
      return quantUsuariosPorMes[today.getFullYear()][lastMonth];
    } else {
      return {};
    }
  } catch (error) {
    console.error(
      "Erro ao obter a quantidade de usuários por distribuidora do mês passado:",
      error
    );
    throw error;
  }
}

async function LicencasDistAtual() {
  try {
    const distribuidoras = await QuantLicencaDistribuidoras();
    const result = {};

    Object.entries(distribuidoras).forEach(([distribuidora, data]) => {
      const orderedLicenses = Object.entries(data.licenses)
        .sort(([, countA], [, countB]) => countB - countA)
        .reduce((obj, [license, count]) => {
          obj[license] = count;
          return obj;
        }, {});

      result[distribuidora] = {
        licenses: orderedLicenses,
      };
    });

    return result;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function LicencasAgrupadasPorAnoMesDist() {
  try {
    const allData = await HistoricoDist.findAll();
    const result = {};

    allData.forEach((data) => {
      const {
        id,
        createdAt,
        updatedAt,
        ano,
        mes,
        distribuidora,
        ...licensesData
      } = data.toJSON();

      if (!result[ano]) {
        result[ano] = {};
      }

      if (!result[ano][mes]) {
        result[ano][mes] = {};
      }

      result[ano][mes][distribuidora] = licensesData;
    });

    return result;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function HistValLicencas() {
  try {
    const historico = await Func.HistoricoValLicencas();

    const valoresAtuais = await Func.ValoresAtuaisLicencas();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Janeiro é 0

    if (!historico[currentYear]) {
      historico[currentYear] = {};
    }

    if (!historico[currentYear][currentMonth]) {
      historico[currentYear][currentMonth] = {};
    }

    historico[currentYear][currentMonth] = valoresAtuais || 0;

    return historico;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function QuantUsuarioPorMes() {
  try {
    const dados = await LicencasAgrupadasPorAnoMesDist();
    const quantidadesUsuarios = {};

    for (const ano in dados) {
      for (const mes in dados[ano]) {
        if (!quantidadesUsuarios[ano]) {
          quantidadesUsuarios[ano] = {};
        }

        if (!quantidadesUsuarios[ano][mes]) {
          quantidadesUsuarios[ano][mes] = {};
        }

        for (const distrito in dados[ano][mes]) {
          const usuarios = dados[ano][mes][distrito].usuarios;
          quantidadesUsuarios[ano][mes][distrito] = usuarios;
        }
      }
    }

    return quantidadesUsuarios;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function DiferencaPercentualUsuarios() {
  try {
    const quantLicencasMesAtual = await QuantidadeDeUserDistMesAtual();
    const quantLicencasMesPassado = await QuantidadeDeUserDistMesPassado();
    const diffPercentage = {};

    Object.keys(quantLicencasMesAtual).forEach((distribuidora) => {
      const licencasAtual = parseFloat(quantLicencasMesAtual[distribuidora]);
      const licencasPassado = quantLicencasMesPassado[distribuidora];

      if (licencasPassado !== undefined) {
        const percentageDiff =
          ((licencasAtual - licencasPassado) / licencasPassado) * 100;
        if (isNaN(percentageDiff)) {
          percentageDiff = 0;
        }
        // Formata o resultado para ter duas casas decimais
        const formattedPercentageDiff = parseFloat(percentageDiff.toFixed(2));
        diffPercentage[distribuidora] = formattedPercentageDiff;
      } else {
        diffPercentage[distribuidora] = 0;
      }
    });

    return diffPercentage;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function SomaLicencasPorMes() {
  try {
    const quantLicencasPorMes = await LicencasAgrupadasPorAnoMesDist();
    const somaPorMes = {};

    for (const ano in quantLicencasPorMes) {
      for (const mes in quantLicencasPorMes[ano]) {
        if (!somaPorMes[ano]) {
          somaPorMes[ano] = {};
        }

        if (!somaPorMes[ano][mes]) {
          somaPorMes[ano][mes] = {};
        }

        const distribuidoras = quantLicencasPorMes[ano][mes];
        for (const distribuidora in distribuidoras) {
          if (distribuidoras.hasOwnProperty(distribuidora)) {
            if (!somaPorMes[ano][mes][distribuidora]) {
              somaPorMes[ano][mes][distribuidora] = 0;
            }

            for (const licenca in distribuidoras[distribuidora]) {
              if (licenca !== "usuarios") {
                somaPorMes[ano][mes][distribuidora] +=
                  distribuidoras[distribuidora][licenca];
              }
            }
          }
        }
      }
    }
    return somaPorMes;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}
async function DiferencaLicecasAtuaisEAnteriores() {
  try {
    const quantLicencasPorMes = await SomaLicencasPorMes();
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    const mesAnterior = mesAtual - 1;

    if (
      quantLicencasPorMes[anoAtual] &&
      quantLicencasPorMes[anoAtual][mesAtual.toString()]
    ) {
      const usuariosMesAtual =
        quantLicencasPorMes[anoAtual][mesAtual.toString()];
      const usuariosMesAnterior =
        quantLicencasPorMes[anoAtual][mesAnterior.toString()] || {}; // Use um objeto vazio como padrão se não houver valores para o mês anterior

      const diferencaPorDistribuidora = {};

      for (const distribuidora in usuariosMesAtual) {
        const usuariosAnterior = usuariosMesAnterior[distribuidora] || 0;
        const usuariosAtual = usuariosMesAtual[distribuidora];

        if (usuariosAnterior !== 0) {
          const diferenca =
            ((usuariosAtual - usuariosAnterior) / usuariosAnterior) * 100;
          if (isNaN(diferenca)) {
            diferencaPorDistribuidora[distribuidora] = 0;
          } else {
            diferencaPorDistribuidora[distribuidora] = parseFloat(
              diferenca.toFixed(2)
            );
          }
        } else {
          diferencaPorDistribuidora[distribuidora] = 0;
        }
      }
      return diferencaPorDistribuidora;
    } else {
      return {}; // Retorna um objeto vazio para as distribuidoras sem valores
    }
  } catch (error) {
    throw new Error(
      "Erro ao calcular a diferença do valor médio atual com o passado: " +
        error.message
    );
  }
}


async function ExtrairDadosMeses() {
  try {
    const licencasAgrupadas = await LicencasAgrupadasPorAnoMesDist();
    const mesAtual = new Date().getMonth() + 1;
    const mesAnterior = mesAtual - 1;
    const anoAtual = new Date().getFullYear();

    const dadosMesAtual = licencasAgrupadas[anoAtual]?.[mesAtual.toString()] || {};
    const dadosMesAnterior = licencasAgrupadas[anoAtual]?.[mesAnterior.toString()] || {};

    const resultado = {
      [mesAtual.toString()]: {},
      [mesAnterior.toString()]: {},
    };

    const ordenarPorQuantidade = (dados) => {
      if(!dados) return {};
      const planosOrdenados = Object.entries(dados).sort((a, b) => b[1] - a[1]);
      const planosOrdenadosObj = {};
      for (const [plano, quantidade] of planosOrdenados) {
        if (isNaN(quantidade)) { 
          planosOrdenadosObj[plano] = 0;
        } else {
          planosOrdenadosObj[plano] = quantidade;
        }
      }
      return planosOrdenadosObj;
    };

    const distribuidoras = Object.keys(dadosMesAtual);

    for (const distribuidora of distribuidoras) {
      resultado[mesAtual.toString()][distribuidora] = ordenarPorQuantidade(
        dadosMesAtual[distribuidora]
      );
      resultado[mesAnterior.toString()][distribuidora] = ordenarPorQuantidade(
        dadosMesAnterior[distribuidora]
      );
      // Remove o campo "usuarios"
      delete resultado[mesAtual.toString()][distribuidora]["usuarios"];
      delete resultado[mesAnterior.toString()][distribuidora]["usuarios"];
    }

    return resultado;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}


async function QuantidadeLicencaAtualDist() {
  try {
    const mesAtual = new Date().getMonth() + 1;
    const data = await ExtrairDadosMeses();
    return data[mesAtual.toString()];
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function QuantlicencasAtualMapping() {
  try {
    const mesAtual = new Date().getMonth() + 1;
    const data = await ExtrairDadosMeses();
    const valores = data[mesAtual.toString()];

    const dadosComNomesAlterados = {};

    for (const local in valores) {
      const licencasOriginais = valores[local];
      const licencasAlteradas = {};

      for (const licenca in licencasOriginais) {
        if (licenseMapping[licenca]) {
          licencasAlteradas[licenseMapping[licenca]] =
            licencasOriginais[licenca];
        } else {
          licencasAlteradas[licenca] = licencasOriginais[licenca];
        }
      }

      dadosComNomesAlterados[local] = licencasAlteradas;
    }

    return dadosComNomesAlterados;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function QuantidadeLicencaMesPassadolDist() {
  try {
    const mesAtual = new Date().getMonth();
    const data = await ExtrairDadosMeses();
    return data[mesAtual.toString()];
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function sumLicenseValues() {
  try {
    const licenses = await QuantidadeLicencaAtualDist();
    const values = await ValLicencaDist();
    const summedLicenses = {};

    for (const location in licenses) {
      const locationSum = {};
      for (const licenseKey in licenses[location]) {
        const mappedLicense = licenseMapping[licenseKey];
        const licenseValue = licenses[location][licenseKey];

        if (mappedLicense && values[mappedLicense]) {
          locationSum[licenseKey] = licenseValue * values[mappedLicense];
        }
      }
      summedLicenses[location] = locationSum;
    }

    // Ordenar cada localização por quantidade
    for (const location in summedLicenses) {
      const sortedLicenses = Object.entries(summedLicenses[location])
        .sort((a, b) => b[1] - a[1]) // Ordenar por quantidade descendente
        .reduce((acc, [license, totalValue]) => {
          acc[license] = totalValue;
          return acc;
        }, {});
      summedLicenses[location] = sortedLicenses;
    }

    return summedLicenses;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function sumLicenseValuesmapping() {
  try {
    const licenses = await QuantidadeLicencaAtualDist();
    const values = await ValLicencaDist();
    const summedLicenses = {};

    for (const location in licenses) {
      const locationSum = {};
      for (const licenseKey in licenses[location]) {
        const mappedLicense = licenseMapping[licenseKey];
        const licenseValue = licenses[location][licenseKey];

        if (mappedLicense && values[mappedLicense]) {
          locationSum[mappedLicense] = licenseValue * values[mappedLicense];
        }
      }
      summedLicenses[location] = locationSum;
    }

    // Ordenar cada localização por quantidade
    for (const location in summedLicenses) {
      const sortedLicenses = Object.entries(summedLicenses[location])
        .sort((a, b) => b[1] - a[1]) // Ordenar por quantidade descendente
        .reduce((acc, [license, totalValue]) => {
          acc[license] = totalValue;
          return acc;
        }, {});
      summedLicenses[location] = sortedLicenses;
    }

    return summedLicenses;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function CustoTotalMesAtual() {
  try {
    const licenses = await sumLicenseValues();
    const totalValues = {};

    for (const location in licenses) {
      const locationValues = Object.values(licenses[location]);
      const totalValue = locationValues.reduce((sum, value) => sum + value, 0);
      totalValues[location] = totalValue;
    }

    return totalValues;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function ValorMesPassado() {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; // Janeiro é 0
    const anoAtual = hoje.getFullYear();

    const histValLicencas = await HistValLicencas();

    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;

    const valoresMesAnterior = histValLicencas[anoAnterior]?.[mesAnterior];

    return valoresMesAnterior || {};
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function SomaLicencasMesPassado() {
  try {
    const quantidadeLicenca = await QuantidadeLicencaMesPassadolDist();
    const valorMes = await ValorMesPassado();
    const soma = {};

    for (const dist in quantidadeLicenca) {
      soma[dist] = {};

      for (const licenca in quantidadeLicenca[dist]) {
        const licencaCompleta = licenseMapping[licenca];
        soma[dist][licencaCompleta] =
          (valorMes[licencaCompleta] || 0) * quantidadeLicenca[dist][licenca];
      }
    }

    return soma;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}
async function CustoTotalMesAtualMesPassado() {
  try {
    const licenses = await SomaLicencasMesPassado();
    const totalValues = {};
    for (const location in licenses) {
      const locationValues = Object.values(licenses[location]);
      const totalValue = locationValues.reduce((sum, value) => sum + value, 0);
      totalValues[location] = totalValue;
    }

    return totalValues;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function DiferencaPercentuaValorTotal() {
  try {
    const quantLicencasMesAtual = await CustoTotalMesAtual();
    const quantLicencasMesPassado = await CustoTotalMesAtualMesPassado();
    const diffPercentage = {};

    Object.keys(quantLicencasMesAtual).forEach((distribuidora) => {
      const licencasAtual = parseFloat(quantLicencasMesAtual[distribuidora]);
      const licencasPassado = quantLicencasMesPassado[distribuidora];

      if (licencasPassado !== undefined) {
        const percentageDiff =
          ((licencasAtual - licencasPassado) / licencasPassado) * 100;
        // Formata o resultado para ter duas casas decimais
        const formattedPercentageDiff = parseFloat(percentageDiff.toFixed(2));
        if (!isNaN(formattedPercentageDiff)) {
          diffPercentage[distribuidora] = formattedPercentageDiff;
        } else {
          diffPercentage[distribuidora] = 0;
        }
      } else {
        diffPercentage[distribuidora] = 0;
      }
    });

    return diffPercentage;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function valorMedioPorUsuarioAtual() {
  try {
    const custoTotalPorDistribuidora = await CustoTotalMesAtual();
    const quantidadeUsuariosPorDistribuidora =
      await QuantidadeDeUserDistMesAtual();
    const mediaCustoPorUsuario = {};

    Object.keys(custoTotalPorDistribuidora).forEach((distribuidora) => {
      const custoTotal = custoTotalPorDistribuidora[distribuidora];
      const quantidadeUsuarios = parseFloat(
        quantidadeUsuariosPorDistribuidora[distribuidora]
      );

      if (!isNaN(quantidadeUsuarios) && quantidadeUsuarios > 0) {
        const media = custoTotal / quantidadeUsuarios;
        // Formata o resultado para ter duas casas decimais
        const formattedMedia = parseFloat(media.toFixed(2));
        mediaCustoPorUsuario[distribuidora] = formattedMedia;
      } else {
        mediaCustoPorUsuario[distribuidora] = null;
      }
    });

    return mediaCustoPorUsuario;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function valorMedioPorUsuarioPassado() {
  try {
    const custoTotalPorDistribuidora = await CustoTotalMesAtualMesPassado();
    const quantidadeUsuariosPorDistribuidora =
      await QuantidadeDeUserDistMesPassado();
    const mediaCustoPorUsuario = {};

    Object.keys(custoTotalPorDistribuidora).forEach((distribuidora) => {
      const custoTotal = custoTotalPorDistribuidora[distribuidora];
      const quantidadeUsuarios = parseFloat(
        quantidadeUsuariosPorDistribuidora[distribuidora]
      );

      if (!isNaN(quantidadeUsuarios) && quantidadeUsuarios > 0) {
        const media = custoTotal / quantidadeUsuarios;
        if (isNaN(media)) {
          media = 0;
        }
        // Formata o resultado para ter duas casas decimais
        const formattedMedia = parseFloat(media.toFixed(2));
        mediaCustoPorUsuario[distribuidora] = formattedMedia;
      } else {
        mediaCustoPorUsuario[distribuidora] = 0;
      }
    });

    return mediaCustoPorUsuario;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function DiferencaPercentuaMediaTotal() {
  try {
    const quantLicencasMesAtual = await valorMedioPorUsuarioAtual();
    const quantLicencasMesPassado = await valorMedioPorUsuarioPassado();
    const diffPercentage = {};

    Object.keys(quantLicencasMesAtual).forEach((distribuidora) => {
      const licencasAtual = parseFloat(quantLicencasMesAtual[distribuidora]);
      const licencasPassado = quantLicencasMesPassado[distribuidora];

      if (licencasPassado !== undefined && licencasPassado !== 0) {
        const percentageDiff =
          ((licencasAtual - licencasPassado) / licencasPassado) * 100;

        // Verifica se o resultado é um número válido
        if (!isNaN(percentageDiff)) {
          // Formata o resultado para ter duas casas decimais
          const formattedPercentageDiff = parseFloat(percentageDiff.toFixed(2));
          diffPercentage[distribuidora] = formattedPercentageDiff;
        } else {
          diffPercentage[distribuidora] = 0;
        }
      } else {
        diffPercentage[distribuidora] = 0;
      }
    });

    return diffPercentage;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function calcularValoresPorMes() {
  try {
    const resultado = {};
    const licencasAgrupadas = await LicencasAgrupadasPorAnoMesDist();
    const valoresTotaisMensal = await HistValLicencas();

    for (const ano in licencasAgrupadas) {
      if (!resultado[ano]) {
        resultado[ano] = {};
      }

      for (const mes in licencasAgrupadas[ano]) {
        if (!resultado[ano][mes]) {
          resultado[ano][mes] = {};
        }

        for (const distribuidora in licencasAgrupadas[ano][mes]) {
          if (!resultado[ano][mes][distribuidora]) {
            resultado[ano][mes][distribuidora] = {};
          }

          for (const licenca in licencasAgrupadas[ano][mes][distribuidora]) {
            const licencaNome = licenseMapping[licenca];
            if (
              licencaNome &&
              valoresTotaisMensal[ano] &&
              valoresTotaisMensal[ano][mes] &&
              valoresTotaisMensal[ano][mes][licencaNome]
            ) {
              const quantidade =
                licencasAgrupadas[ano][mes][distribuidora][licenca];
              const valorLicenca = valoresTotaisMensal[ano][mes][licencaNome];
              const valorCalculado = quantidade * valorLicenca;

              if (licencaNome !== "usuarios") {
                resultado[ano][mes][distribuidora][licencaNome] =
                  valorCalculado;
              }
            }
          }
        }
      }
    }

    return resultado;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function calcularValoresTotaisPorMes() {
  try {
    const dados = await calcularValoresPorMes(); // Chame sua função para obter os valores
    const resultado = {};

    for (const ano in dados) {
      resultado[ano] = {};

      for (const mes in dados[ano]) {
        resultado[ano][mes] = {};

        for (const distribuidora in dados[ano][mes]) {
          let total = 0;
          const distribuidoraValores = dados[ano][mes][distribuidora];

          for (const produto in distribuidoraValores) {
            total += distribuidoraValores[produto];
          }

          resultado[ano][mes][distribuidora] = total;
        }
      }
    }

    return resultado;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

async function reformatData() {
  try {
    const data = await calcularValoresTotaisPorMes();
    const reformattedData = {};

    for (const year in data) {
      for (const month in data[year]) {
        for (const distributor in data[year][month]) {
          const amount = data[year][month][distributor];

          if (!reformattedData[distributor]) {
            reformattedData[distributor] = {};
          }

          if (!reformattedData[distributor][year]) {
            reformattedData[distributor][year] = [];
          }

          reformattedData[distributor][year].push({
            mes: parseInt(month),
            Total: amount,
          });
        }
      }
    }

    return reformattedData;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}
async function getIdDistribuidoraFromSlug(slug) {
  const distribuidoraa = await Distribuidoras();
  const distribuidora = distribuidoraa.find(
    (distribuidora) => distribuidora.slug === slug
  );
  return distribuidora ? distribuidora.idDistribuidora : null;
}

async function QuantlicencasAtual() {
  try {
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    const quantLicencasMesAtual = (await SomaLicencasPorMes())[anoAtual][
      mesAtual
    ];
    return quantLicencasMesAtual;
  } catch (error) {
    console.error("Erro ao obter dados das licenças:", error);
    return {};
  }
}

module.exports = {
  QuantLicencaDistribuidoras,
  ValLicencaDist,
  Distribuidoras,
  QuantidadeDeUserDistMesAtual,
  LicencasDistAtual,
  LicencasAgrupadasPorAnoMesDist,
  HistValLicencas,
  QuantUsuarioPorMes,
  QuantidadeDeUserDistMesPassado,
  DiferencaPercentualUsuarios,
  SomaLicencasPorMes,
  DiferencaLicecasAtuaisEAnteriores,
  ExtrairDadosMeses,
  QuantidadeLicencaAtualDist,
  QuantidadeLicencaMesPassadolDist,
  sumLicenseValues,
  CustoTotalMesAtual,
  ValorMesPassado,
  SomaLicencasMesPassado,
  CustoTotalMesAtualMesPassado,
  DiferencaPercentuaValorTotal,
  valorMedioPorUsuarioAtual,
  valorMedioPorUsuarioPassado,
  DiferencaPercentuaMediaTotal,
  calcularValoresPorMes,
  calcularValoresTotaisPorMes,
  reformatData,
  getIdDistribuidoraFromSlug,
  QuantlicencasAtual,
  QuantlicencasAtualMapping,
  sumLicenseValuesmapping,
};
