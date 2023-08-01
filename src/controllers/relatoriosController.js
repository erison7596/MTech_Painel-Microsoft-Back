const moment = require('moment');
const { Op, Sequelize } = require('sequelize');
const Valor = require('../models/valor');
const HistoricoLicenca = require('../models/historicoLicenca');
const Licencas = require('../models/licencas');

async function calcularCustoTotal() {
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

      licencasComValorUm[colunaValor] = quantidadeLicencasUm;
    }

    return licencasComValorUm;
  } catch (error) {
    throw new Error('Erro ao calcular o custo total:', error);
  }
}



async function calcularCustoTotalMesAnterior() {
  try {
    const dataAtual = moment();
    const dataMesAnterior = dataAtual.clone().subtract(1, 'months');

    const custoTotalMesAtual = await calcularCustoTotal();

    const custoTotalMesAnterior = await Valor.sum('idCustoLicenca', {
      where: {
        dataHoraCriacao: {
          [Op.between]: [dataMesAnterior.startOf('month').toDate(), dataAtual.startOf('month').toDate()],
        },
      },
    });
    const diferencaCustoMesAnterior = custoTotalMesAtual - (custoTotalMesAnterior || 0); // Adiciona verificação para evitar erro de null
    return diferencaCustoMesAnterior.toFixed(2);
  } catch (error) {
    throw new Error('Erro ao calcular a diferença do custo do mês anterior:', error);
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
    console.error('Erro ao calcular a quantidade de licenças ativas:', error);
    throw error;
  }
}



async function calcularQuantidadeUsuarios() {
  try {
    const quantidadeUsuarios = await Valor.count('idDistribuidora');
    return quantidadeUsuarios;
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

async function calcularValorTotalLicencas() {
  try {
    const licencasPorNome = await Valor.findAll({
      attributes: ['nomeExibicao', [Valor.sequelize.fn('count', Valor.sequelize.col('nomeExibicao')), 'quantidade']],
      group: ['nomeExibicao'],
    });

    const valorTotalLicencas = licencasPorNome.reduce((total, licenca) => {
      const quantidade = licenca.dataValues.quantidade;
      const valorLicenca = licenca.dataValues.nomeExibicao.valor;

      if (quantidade && valorLicenca) {
        const valorLicencas = quantidade * valorLicenca;
        return total + valorLicencas;
      } else {
        console.error('Valor ausente ou inconsistente para calcular o valor das licenças:', licenca.dataValues);
        return total;
      }
    }, 0);

    return valorTotalLicencas.toFixed(2);
  } catch (error) {
    throw new Error('Erro ao calcular o valor total das licenças: ' + error.message);
  }
}


async function calcularHistoricoCustoTotal() {
  try {
    const dataAtual = new Date();
    const dataMesAnterior = new Date(dataAtual);
    dataMesAnterior.setMonth(dataMesAnterior.getMonth() - 1);

    console.log('Data atual:', dataAtual);
    console.log('Data mês anterior:', dataMesAnterior);

    const historicoCustoTotal = await HistoricoLicenca.sum('valor', {
      where: {
        data: {
          [Op.between]: [dataMesAnterior, dataAtual],
        },
      },
    });

    console.log('Custo total mês anterior:', historicoCustoTotal);

    if (historicoCustoTotal === null) {
      return 0; // Retorna zero se o histórico estiver vazio
    }

    return historicoCustoTotal.toFixed(2);
  } catch (error) {
    console.error('Erro ao calcular o histórico de custo total:', error);
    return null;
  }
}



module.exports = {
  calcularCustoTotal,
  calcularCustoTotalMesAnterior,
  calcularQuantidadeLicencasAtivas,
  calcularQuantidadeUsuarios,
  calcularValorMedioPorUsuario,
  calcularValorTotalLicencas,
  calcularHistoricoCustoTotal,
};
