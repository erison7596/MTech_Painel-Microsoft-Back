const express = require('express');
const path = require('path');
const xlsx = require('xlsx');
const valorController = require('./src/controllers/valorController');
const db = require('./src/utils/database');
const Valor = require('./src/models/valor');
const router = express.Router();
const cors = require('cors');
const licencaController = require('./src/controllers/licencasController');
const Licenca = require('./src/models/licencas');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');

const app = express();
const port = 4000;
const corsOptions = {
  origin: 'http://localhost:3000', // ou a URL do seu front-end Next.js
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração para servir arquivos estáticos
app.use(express.static(__dirname + '/src'));


//verificar se o banco de dados está conectado
db.authenticate().then(() => { 
  console.log('Conectado ao banco de dados');
}).catch((error) => { 
  console.error('Erro ao conectar ao banco de dados:', error);
}) // Rota para listar os dados


app.use(cors(corsOptions));

app.get('/',async (req, res) => {
   try {
    const mediaIdCustoLicenca = await Valor.findAll({
      attributes: [[Valor.sequelize.fn('AVG', Valor.sequelize.col('idCustoLicenca')), 'mediaIdCustoLicenca']],
    });
     //deixar a medica com duas casas decimais
    mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca = mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca.toFixed(2);
    const quantidadeNomeExibicao = await Valor.count('nomeExibicao');
    
    const quantidadeLicencas = await Valor.count('licencas');

    const resultado = {
      mediaIdCustoLicenca: mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca,
      quantidadeNomeExibicao,
      quantidadeLicencas,
      divisaoLicencasPorMedia:mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca/quantidadeLicencas,
    };

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao obter os valores calculados:', error);
    res.status(500).json({ error: 'Erro ao obter os valores calculados' });
  }
});

app.get('/listar', async (req, res) => {
  try {
    const dados = await Valor.findAll();
    res.json(dados);
  } catch (error) {
    console.error('Erro ao listar os dados:', error);
    res.status(500).send('Erro ao listar os dados');
  }
});
  
  
// Rota para importar a planilha
app.get('/importar', (req, res) => {
  const filePath = path.join(__dirname, 'src', 'public', 'planilhas', 'meuarquivo2.xlsx');
  const workbook = xlsx.readFile(filePath);
  const worksheet = workbook.Sheets['ESPECÍFICO'];
  valorController.importData(worksheet)
    .then(() => {
      res.send('Dados importados com sucesso!');
    })
    .catch((error) => {
      console.error('Erro ao importar dados:', error);
      res.status(500).send('Erro ao importar dados');
    });
});

app.get('/deletar', async (req, res) => {
  try {
    // Apagar todos os registros da tabela 'valors'
    await Valor.destroy({
      truncate: true // Opção para apagar todos os registros
    });

    res.status(200).json({ message: 'Todos os dados foram apagados com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar os dados:', error);
    res.status(500).json({ message: 'Ocorreu um erro ao apagar os dados.' });
  }
});
// Rota para obter os valores de licença
app.get('/valoreslicenca', licencaController.obterValoresLicencas);

// Rota para criar um novo valor de licença
app.post('/valoreslicenca', licencaController.criarValorLicenca);

app.get('/distribuidoras', async (req, res) => {
  try {
    const distribuidoras = await Valor.findAll({
      attributes: [
        'distribuidora',
        'idDistribuidora',
        'slug', 
        [Sequelize.fn('FORMAT', Sequelize.literal('SUM(idCustoLicenca)'), 2), 'valorTotal']
      ],
      group: ['distribuidora', 'idDistribuidora', 'slug'],
      order: [['distribuidora', 'ASC']] // Ordenando por distribuidora de forma ascendente (ASC)
    });

    res.json(distribuidoras);
  } catch (error) {
    console.error('Erro ao buscar as distribuidoras:', error);
    res.status(500).json({ error: 'Erro ao buscar as distribuidoras' });
  }
});

app.get('/distribuidora/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const mediaIdCustoLicenca = await Valor.findAll({
      where: { slug: slug },
      attributes: [
        [Valor.sequelize.fn('AVG', Valor.sequelize.col('idCustoLicenca')), 'mediaIdCustoLicenca']
      ],
    });

    // deixar a medica com duas casas decimais
    mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca = mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca.toFixed(2);

    const quantidadeNomeExibicao = await Valor.count({
      where: { slug: slug },
      distinct: 'nomeExibicao'
    });

    const quantidadeLicencas = await Valor.count({ where: { slug: slug }, distinct: 'licencas' });

    const resultado = {
      mediaIdCustoLicenca: mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca,
      quantidadeNomeExibicao,
      quantidadeLicencas,
      divisaoLicencasPorMedia: mediaIdCustoLicenca[0].dataValues.mediaIdCustoLicenca / quantidadeLicencas,
    };

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao obter os valores calculados:', error);
    res.status(500).json({ error: 'Erro ao obter os valores calculados' });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});