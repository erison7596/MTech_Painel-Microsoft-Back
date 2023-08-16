const { Op, Sequelize,DataTypes } = require('sequelize');
const Valor = require('../models/valor');
const HistoricoLicenca = require('../models/historicoLicenca');
const Licencas = require('../models/licencas');
const db = require('../utils/database');
const HistoricoMesLicenca = require('../models/historicoMesLicenca');

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
  
async function listarLicencas() {
  try {
    
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
        if (valoresLicencas[nome] !== undefined) {
          const valorLicenca = valoresLicencas[nome] * valor;
          if (!isNaN(valorLicenca)) {
            return total + valorLicenca;
          } else {
            console.error('Valor de licença inválido:', valoresLicencas[nome]);
            return total;
          }
        } else {
          console.error('Nome de licença não encontrado:', nome);
          return total;
        }
      } else {
        console.error('Valor ausente ou inconsistente para calcular o custo total:', licenca.dataValues);
        return total;
      }
    }, 0);

    if (!isNaN(custoTotal)) {
      return custoTotal.toFixed(2);
    } else {
      console.error('Custo total inválido:', custoTotal);
      return 'Erro no cálculo do custo total';
    }
  } catch (error) {
    throw new Error('Erro ao calcular o custo total:', error);
  }
}











async function QuantidadePorMesEAno() {
  try {
    // Consulta ao banco de dados usando o método findAll()
    const historicos = await HistoricoMesLicenca.findAll();

    // Criação do objeto que conterá os resultados formatados
    const resultadoFormatado = {};

    // Percorre cada registro retornado e formata no formato desejado
    historicos.forEach((historico) => {
      const { id, mes, ano, ...outrasColunasLicencas } = historico.dataValues;
      if (!resultadoFormatado[ano]) {
        resultadoFormatado[ano] = {};
      }
      if (!resultadoFormatado[ano][mes]) {
        resultadoFormatado[ano][mes] = {};
      }
      Object.assign(resultadoFormatado[ano][mes], outrasColunasLicencas);
    });

    // Retorna o resultado formatado em formato JSON
    // console.log(JSON.stringify(resultadoFormatado, null, 2));
    return resultadoFormatado;




  } catch (error) {
    console.error('Erro ao calcular o histórico de custo total:', error);
    throw error;
  }
}

async function HistoricoValLicencas() {
  try {
    const historicos = await HistoricoLicenca.findAll({
      attributes: ['nome', 'valor', 'data'],
      order: [['data', 'DESC']] // Ordena os resultados por data em ordem decrescente
    });

    const resultadoFormatado = {};

    historicos.forEach((historico) => {
      const { nome, valor, data } = historico.dataValues;
      const year = data.getFullYear();
      const month = data.getMonth() + 1;

      if (!resultadoFormatado[year]) {
        resultadoFormatado[year] = {};
      }
      if (!resultadoFormatado[year][month]) {
        resultadoFormatado[year][month] = {};
      }

      resultadoFormatado[year][month][nome] = valor;
    });

    // Filtra apenas as últimas licenças de cada mês
    const ultimasLicencasPorMes = {};
    for (const year in resultadoFormatado) {
      for (const month in resultadoFormatado[year]) {
        const licencasDoMes = resultadoFormatado[year][month];
        const ultimasLicencas = {};

        for (const nome in licencasDoMes) {
          const valor = licencasDoMes[nome];
          ultimasLicencas[nome] = valor;
        }

        ultimasLicencasPorMes[year] = {
          ...ultimasLicencasPorMes[year],
          [month]: ultimasLicencas
        };
      }
    }

    // console.log(JSON.stringify(ultimasLicencasPorMes, null, 2));
    return ultimasLicencasPorMes;
  } catch (error) {
    console.error('Erro ao obter os valores calculados:', error);
    throw error;
  }
}


async function ValoresAtuaisLicencas() { 
  try {
    const licencas = await Licencas.findAll(); // Supondo que 'Licencas' seja o modelo ou objeto que acessa a base de dados
    
    const valoresAtuais = {};

    for (const licenca of licencas) {
      const nomeLicenca = licenca.nome; // Supondo que o campo 'nome' seja onde o nome da licença é armazenado
      const valorLicenca = licenca.valor; // Supondo que o campo 'valor' seja onde o valor da licença é armazenado
      
      valoresAtuais[nomeLicenca] = valorLicenca;
    }
    
    return valoresAtuais;
  } catch (error) {
    console.error('Erro ao obter os valores atuais das licenças:', error);
    throw error;
  }
}

async function QuantidadeDeLicencaMes() {
  try {
    const data = await QuantidadePorMesEAno();
    const result = {};

    for (const year in data) {
        result[year] = {};
        for (const month in data[year]) {
            if (month !== "usuarios") {
                let totalLicenses = 0;
                for (const licenseType in data[year][month]) {
                    if (licenseType !== "createdAt" && licenseType !== "updatedAt" && licenseType !== "usuarios") {
                        totalLicenses += data[year][month][licenseType];
                    }
                }
                result[year][month] = totalLicenses;
            }
        }
    }

    return result;
    
  }catch(error){
    console.error('Erro ao obter a quantidade de licenças por mês:', error);
    throw error;
  }
    
}


async function DiferencaLicecasAtuaisEAnteriores() { 
  try {
    const data = await QuantidadeDeLicencaMes();
     const mesAtual = new Date().getMonth() + 1; // Obtém o mês atual (adiciona 1 porque os meses em JavaScript começam de 0)

    const usuariosMesAtual = data["2023"][mesAtual];
    const usuariosMesAnterior = data["2023"][mesAtual - 1];

    if (usuariosMesAnterior !== undefined && usuariosMesAnterior !== 0) {
      const diferenca = ((usuariosMesAtual - usuariosMesAnterior) / usuariosMesAnterior) * 100;
      return parseFloat(diferenca.toFixed(2));
    } else {
      return 0;
    }
  }catch (error) {
    console.error('Erro ao obter a diferença entre as licenças atuais e anteriores:', error);
    throw error;
  }
}





//erro aqui nessa função
async function calcularHistoricoCustoTotalAnoEMes() {
  try {
    const quantidadePorMesEAno = await QuantidadePorMesEAno();
    const historicoValLicencas = await HistoricoValLicencas();
    const valoresAtuaisLicencas = await ValoresAtuaisLicencas();
    const data = new Date();
    const anoAtual = data.getFullYear();
    const mesAtual = data.getMonth() + 1;
    const custoTotalPorLicenca = {};

          for (const ano in quantidadePorMesEAno) {
            for (const mes in quantidadePorMesEAno[ano]) {
                if (mes !== "usuarios") {
                    if (!custoTotalPorLicenca[ano]) {
                        custoTotalPorLicenca[ano] = {};
                    }

                    if (!custoTotalPorLicenca[ano][mes]) {
                        custoTotalPorLicenca[ano][mes] = {};
                    }

                    const mesQuantidade = quantidadePorMesEAno[ano][mes];
                  const mesHistoricoValores = historicoValLicencas[ano]?.[mes];
                    const isMesAtual = ano == anoAtual && mes == mesAtual;
                    const licencasCalculadas = {}; // Para rastrear licenças já calculadas

                    for (const licenca in mesQuantidade) {
                        if (licenca !== "usuarios" && !licencasCalculadas[licenca]) {
                            const quantidade = mesQuantidade[licenca];
                            const licencaNome = licenseMapping[licenca] || licenca;
                            let valorUnitario = 0;

                            if (isMesAtual) {
                                valorUnitario = valoresAtuaisLicencas[licencaNome] || 0;
                            } else {
                                valorUnitario = mesHistoricoValores?.[licencaNome] || 0;
                            }

                            if (!custoTotalPorLicenca[ano][mes][licencaNome]) {
                                custoTotalPorLicenca[ano][mes][licencaNome] = 0;
                            }

                            custoTotalPorLicenca[ano][mes][licencaNome] += quantidade * valorUnitario;
                            licencasCalculadas[licenca] = true;
                        }
                    }
                }
            }
        }

        return custoTotalPorLicenca;
    } catch (error) {
        throw new Error("Ocorreu um erro ao calcular o custo total por licença: " + error.message);
    }
}

async function calcularCustoTotalMesAnterior() {
  try {
    const custoTotalPorLicenca = await calcularHistoricoCustoTotalAno();

    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth() + 1;
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

    const anoAnteriorData = custoTotalPorLicenca[anoAnterior.toString()];
    let valorTotalMesAnterior = 0;

    if (anoAnteriorData) {
      const mesAnteriorData = anoAnteriorData.find(item => item.mes === mesAnterior);
      if (mesAnteriorData) {
        valorTotalMesAnterior = mesAnteriorData.Total;
      }
    }

    // console.log('Custo total do mês anterior:', valorTotalMesAnterior.toFixed(2));
    return valorTotalMesAnterior.toFixed(2);
  } catch (error) {
    console.error('Erro ao calcular o custo total do mês anterior:', error);
    return "0.00"; // Retornar "0.00" caso ocorra um erro
  }
}










async function calcularHistoricoCustoTotalAno() {
  try {
   const historicoCustos = await calcularHistoricoCustoTotalAnoEMes();
        const custoTotalPorAno = {};

        for (const ano in historicoCustos) {
            const meses = Object.keys(historicoCustos[ano]);

            for (const mes of meses) {
                const custosMes = historicoCustos[ano][mes];
                const totalMes = Object.values(custosMes).reduce((acc, valor) => acc + valor, 0);

                if (!custoTotalPorAno[ano]) {
                    custoTotalPorAno[ano] = [];
                }

                custoTotalPorAno[ano].push({
                    mes: parseInt(mes),
                    Total: totalMes
                });
            }
        }

        return custoTotalPorAno;
    } catch (error) {
        throw error;
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
          SELECT nome, YEAR(data) AS ano, MAX(data) AS max_data
          FROM historico_licencas
          GROUP BY nome, YEAR(data)
      ) ultima_data
      ON h.nome = ultima_data.nome AND YEAR(h.data) = ultima_data.ano AND h.data = ultima_data.max_data
      RIGHT JOIN licencas l
      ON l.nome = h.nome
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

async function DiferencaDoMesAtualComPassado() {
  try {
    const mesAtual = await calcularCustoTotal();  // Aguardando a resolução da Promise
    const mesPassado = await calcularCustoTotalMesAnterior();  // Aguardando a resolução da Promise

    console.log("\n\n\n Mes atual: " + mesAtual + "\n\n\n");
    console.log("\n\n\n Mes passado: " + mesPassado + "\n\n\n");
    
    // Calcular a diferença em %
    const diferenca = ((mesAtual - mesPassado) / mesPassado) * 100;
    console.log("\n\n\n Diferença do mês atual com o passado: " + diferenca + "%\n\n\n");
    
    // Retornar a diferença como float com duas casas decimais
    if (mesPassado !== undefined && mesPassado !== 0) {
      const diferenca = ((mesAtual - mesPassado) / mesPassado) * 100;
      return parseFloat(diferenca.toFixed(2));
    } else {
      return 0;
    }
    
  } catch (error) {
    throw new Error('Erro ao calcular a diferença do mês atual com o passado: ' + error.message);
  }
}

async function QuantidaDeUsuariosMes() {
  try {
    const quantidadePorMesEAno = await QuantidadePorMesEAno(); // Substitua pela chamada real da função

    const usuariosPorMesEAno = {};

    for (const ano in quantidadePorMesEAno) {
      const meses = quantidadePorMesEAno[ano];
      usuariosPorMesEAno[ano] = {};

      for (const mes in meses) {
        usuariosPorMesEAno[ano][mes] = meses[mes].usuarios;
      }
    }

    return usuariosPorMesEAno;
  } catch (error) {
    throw new Error('Erro ao calcular a quantidade de usuários no mês: ' + error.message);
  }
}


async function DiferencaLicencaAtualComPassado() {
  try {
    const quantidadePorMesEAno = await QuantidaDeUsuariosMes();
    
    const mesAtual = new Date().getMonth() + 1; // Obtém o mês atual (adiciona 1 porque os meses em JavaScript começam de 0)

    const usuariosMesAtual = quantidadePorMesEAno["2023"][mesAtual];
    const usuariosMesAnterior = quantidadePorMesEAno["2023"][mesAtual - 1];

    if (usuariosMesAnterior !== undefined && usuariosMesAnterior !== 0) {
      const diferenca = ((usuariosMesAtual - usuariosMesAnterior) / usuariosMesAnterior) * 100;
      return parseFloat(diferenca.toFixed(2));
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error('Erro ao calcular a diferença da licença atual com o passado: ' + error.message);
  }
}

async function CalcularValorMedioPorPessoaMes() {
  try {
    const historicoCustoTotalAno = await calcularHistoricoCustoTotalAno();
    const quantidadeUsuariosPorMes = await QuantidaDeUsuariosMes();

    const resultado = {};

    for (const year in historicoCustoTotalAno) {
      resultado[year] = {};
      for (const item of historicoCustoTotalAno[year]) {
        const mes = item.mes;
        const total = item.Total;
        const usuarios = quantidadeUsuariosPorMes[year][mes];

        if (usuarios !== undefined && usuarios !== 0) {
          const valorMedioPorPessoa = total / usuarios;
          resultado[year][mes] = valorMedioPorPessoa;
        } else {
          resultado[year][mes] = null;
        }
      }
    }

    return resultado;
  } catch (error) {
    throw new Error('Erro ao calcular o valor médio por pessoa por mês: ' + error.message);
  }
}


async function DiferencaValorMedioAtualMesPassado() {
  try {
    const quantLicencasPorMes = await CalcularValorMedioPorPessoaMes(); 

    const mesAtual = new Date().getMonth() + 1; 

    const usuariosMesAtual = quantLicencasPorMes["2023"][mesAtual];
    const usuariosMesPassado = quantLicencasPorMes["2023"][mesAtual -1];

    if (usuariosMesPassado !== undefined && usuariosMesPassado !== 0) {
      const diferenca = ((usuariosMesAtual - usuariosMesPassado) / usuariosMesPassado) * 100;
      return parseFloat(diferenca.toFixed(2));
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error('Erro ao calcular a diferença do valor médio atual com o passado: ' + error.message);
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
  calcularValorTotalDeCadaLicencaAno,
  DiferencaDoMesAtualComPassado,
  DiferencaLicencaAtualComPassado,
  DiferencaLicecasAtuaisEAnteriores,
  DiferencaValorMedioAtualMesPassado,
  ValoresAtuaisLicencas,
  HistoricoValLicencas
};
