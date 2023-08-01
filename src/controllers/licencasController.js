const Licenca = require('../models/licencas');
const HistoricoLicenca = require('../models/historicoLicenca');

async function criarValorLicenca(req, res) {
  const { licencas } = req.body;

  if (!licencas || !Array.isArray(licencas)) {
    console.log('Lista de licenças inválida:', licencas);
    return res.status(400).json({ error: 'Lista de licenças inválida' });
  }

  try {
    // Processa cada objeto de licença no array
    for (const licenca of licencas) {
      const { nome, valor } = licenca;

      // Verifica se uma licença com o mesmo nome já existe no banco de dados
      const existingLicenca = await Licenca.findOne({ where: { nome } });

      if (existingLicenca) {
        if (existingLicenca.valor !== valor) {
          // O valor da licença está sendo alterado, então adicionamos um novo registro no histórico
          await HistoricoLicenca.create({ valor: existingLicenca.valor, data: new Date(), licencaId: existingLicenca.id });
          existingLicenca.valor = valor;
          await existingLicenca.save();
        }
      } else {
        // A licença com esse nome não existe, cria uma nova entrada
        await Licenca.create({ nome, valor });
      }
    }

    return res.status(201).json({ message: 'Valores de licenças criados/atualizados com sucesso' });
  } catch (error) {
    console.error('Erro ao criar/atualizar valores de licenças:', error);
    return res.status(500).json({ error: 'Erro ao criar/atualizar valores de licenças' });
  }
}

async function obterValoresLicencas(req, res) {
  try {
    const valoresLicencas = await Licenca.findAll();

    return res.json(valoresLicencas);
  } catch (error) {
    console.error('Erro ao obter valores de licenças:', error);
    return res.status(500).json({ error: 'Erro ao obter valores de licenças' });
  }
}

// Adicione outras funções conforme necessário

module.exports = {
  criarValorLicenca,
  obterValoresLicencas,
};
