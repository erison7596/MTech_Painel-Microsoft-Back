const xlsx = require('xlsx');
const db = require('../utils/database');
const Valor = require('../models/valor');

function getCellValue(column, row, worksheet) {
  const cellAddress = `${column}${row}`;
  const cell = worksheet[cellAddress];
  return cell ? cell.v : undefined;
}

async function importData(worksheet) {
  const range = xlsx.utils.decode_range(worksheet['!ref']);

  // Encontrar o índice das colunas desejadas
  const columnNames = {
    DISTRIBUIDORA: -1,
    'ID DISTRIBUIDORA': -1,
    'Nome para exibição': -1,
    'ID CUSTO LICENÇA': -1,
    'Licenças (extraído do Office365)': -1,
    'Data/hora de criação': -1
  };
  
  for (let col = range.s.c; col <= range.e.c; col++) {
    const columnName = getCellValue(xlsx.utils.encode_col(col), range.s.r + 1, worksheet);
    
    if (columnNames.hasOwnProperty(columnName)) {
      columnNames[columnName] = col;
    }
  }

  // Verificar se todas as colunas foram encontradas
  const missingColumns = Object.keys(columnNames).filter((columnName) => columnNames[columnName] === -1);
  
  if (missingColumns.length > 0) {
    throw new Error(`Colunas faltando: ${missingColumns.join(', ')}`);
  }

  // Importar os dados apenas das colunas desejadas
  for (let row = range.s.r + 2; row <= range.e.r; row++) {
    const distribuidora = getCellValue(xlsx.utils.encode_col(columnNames.DISTRIBUIDORA), row, worksheet);
    const idDistribuidora = getCellValue(xlsx.utils.encode_col(columnNames['ID DISTRIBUIDORA']), row, worksheet);
    const nomeExibicao = getCellValue(xlsx.utils.encode_col(columnNames['Nome para exibição']), row, worksheet);
    const idCustoLicenca = getCellValue(xlsx.utils.encode_col(columnNames['ID CUSTO LICENÇA']), row, worksheet);
    const licencas = getCellValue(xlsx.utils.encode_col(columnNames['Licenças (extraído do Office365)']), row, worksheet);
    const dataHoraCriacao = getCellValue(xlsx.utils.encode_col(columnNames['Data/hora de criação']), row, worksheet);

    await Valor.create({
      distribuidora,
      idDistribuidora,
      nomeExibicao,
      idCustoLicenca,
      licencas,
      dataHoraCriacao
    });
  }

  console.log('Dados importados com sucesso!');
  process.exit(0);
}


module.exports = {
  importData
};
