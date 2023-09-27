const { Sequelize } = require("sequelize");

const db = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite', // Nome do arquivo de banco de dados SQLite
});

// Função para criar o banco de dados
(async () => {
  try {
    await db.sync(); // Isso criará a tabela 'Usuarios' no banco de dados SQLite
    console.log('Tabela criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar a tabela:', error);
  }
})();

module.exports = db;
