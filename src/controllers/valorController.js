const xlsx = require('xlsx');
const moment = require('moment');
const db = require('../utils/database');
const Valor = require('../models/valor');
const ExcelJS = require('exceljs');
const slugify = require('slugify');

function getCellValue(column, row, worksheet) {
  const cellAddress = `${column}${row}`;
  const cell = worksheet[cellAddress];
  return cell ? cell.v : undefined;
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
    //console.log('Nome da coluna:', columnName);

    if (columnNames.hasOwnProperty(columnName)) {
      columnNames[columnName] = col;
    }
  }

  //console.log('Colunas encontradas:', columnNames);

  // Verificar se todas as colunas foram encontradas
  const missingColumns = Object.keys(columnNames).filter((columnName) => columnNames[columnName] === -1);

  if (missingColumns.length > 0) {
    throw new Error(`Colunas faltando: ${missingColumns.join(', ')}`);
  }

  // Importar os dados apenas das colunas desejadas
  for (let row = range.s.r + 2; row <= range.e.r; row++) {
    const distribuidora = getCellValue(xlsx.utils.encode_col(columnNames['DISTRIBUIDORA']), row, worksheet);
    const idDistribuidora = getCellValue(xlsx.utils.encode_col(columnNames['ID DISTRIBUIDORA']), row, worksheet);
    const slug = slugify(idDistribuidora, { lower: true, strict: true });
    const nomeExibicao = getCellValue(xlsx.utils.encode_col(columnNames['Nome para exibição']), row, worksheet);
    const idLicenca = getCellValue(xlsx.utils.encode_col(columnNames['ID LICENÇA']), row, worksheet);
    const idCustoLicenca = getCellValue(xlsx.utils.encode_col(columnNames['ID CUSTO LICENÇA']), row, worksheet);

    // Obter o valor bruto da coluna J (Data/hora de criação)
    const dataHoraCriacaoValue = worksheet[xlsx.utils.encode_cell({ c: columnNames['Data/hora de criação'], r: row -1 })]?.w;
    //console.log('Data/hora de criação (antes da formatação):', dataHoraCriacaoValue);

    let dataHoraCriacao;

    if (dataHoraCriacaoValue !== undefined && dataHoraCriacaoValue !== 'Data/hora de criação') {
      // Converter o valor para um objeto Moment.js e verificar se é válido
      const momentDate = moment(dataHoraCriacaoValue, ['MM/DD/YY HH:mm', 'DD/MM/YY HH:mm']);
      if (momentDate.isValid()) {
        dataHoraCriacao = momentDate.format('YYYY-MM-DD HH:mm:ss');
      } else {
        //console.log('Formato de data/hora inválido:', dataHoraCriacaoValue);
        continue;
      }
    } else {
     // console.log('Valor de data/hora inválido:', dataHoraCriacaoValue);
      continue;
    }

    //console.log('Data/hora de criação (após a formatação):', dataHoraCriacao);

    // Licenças (extraído do Office365)
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
      microsoftPowerAutomateFree: licencasArray.includes('Microsoft Power Automate Free')
      // Atualize com mais colunas conforme a necessidade para outras licenças
    };

    await Valor.create({
      distribuidora,
      idDistribuidora,
      slug,
      nomeExibicao,
      idLicenca,
      idCustoLicenca,
      dataHoraCriacao,
      ...userLicenses // Spread operator para adicionar as colunas de licenças ao objeto
    });
  }

  //console.log('Dados importados com sucesso!');
  process.exit(0);
}





module.exports = {
  importData
};
