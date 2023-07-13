const express = require('express');
const path = require('path');
const xlsx = require('xlsx');
const valorController = require('./src/controllers/valorController');
const db = require('./src/utils/database');
const Valor = require('./src/models/valor');
const router = express.Router();

const app = express();
const port = 3000;

// Configuração para servir arquivos estáticos
app.use(express.static(__dirname + '/src'));


//verificar se o banco de dados está conectado
db.authenticate().then(() => { 
  console.log('Conectado ao banco de dados');
}).catch((error) => { 
  console.error('Erro ao conectar ao banco de dados:', error);
}) // Rota para listar os dados

app.get('/', (req, res) => {
  console.log('Rota /');
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
  const filePath = path.join(__dirname, 'src', 'public', 'planilhas', 'meuarquivo.xlsx');
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

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});