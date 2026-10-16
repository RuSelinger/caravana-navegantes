/**
 * CÓDIGO DO GOOGLE APPS SCRIPT (100% GRATUITO)
 * 
 * Como usar:
 * 1. Abra uma nova planilha no Google Planilhas (https://sheets.google.com)
 * 2. Na primeira linha da planilha, crie os cabeçalhos das colunas:
 *    Data/Hora | Nome Completo | WhatsApp | Categoria | Instrumento | Responsável | Comum | Qtd Vagas | Valor Total | Status Pagamento
 * 3. No menu superior da planilha, clique em: Extensões > Apps Script
 * 4. Apague todo o código que estiver lá e cole este código completo abaixo.
 * 5. Clique em "Implantar" (botão azul no canto superior direito) > "Nova implantação".
 * 6. Em "Selecione o tipo", escolha "App da Web" (ícone de engrenagem).
 * 7. Configure:
 *    - Descrição: Caravana Navegantes
 *    - Executar como: Eu (seu e-mail)
 *    - Quem pode acessar: Qualquer pessoa (Anyone) -> IMPORTANTE para o formulário conseguir enviar!
 * 8. Clique em "Implantar", autorize as permissões da sua conta Google e COPIE A URL DO APP DA WEB.
 * 9. Cole essa URL no arquivo `js/config.js` no campo `googleSheetsUrl`.
 * 
 * Pronto! Todas as confirmações da página cairão diretamente na sua planilha em tempo real!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Se a primeira linha estiver vazia, cria os cabeçalhos automaticamente
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Data / Hora",
        "Nome Completo",
        "WhatsApp",
        "Categoria",
        "Instrumento",
        "Responsável",
        "Comum Congregação",
        "Qtd Vagas",
        "Valor Total (R$)",
        "Status Pagamento"
      ]);
    }

    // Adiciona a nova linha com os dados da inscrição
    sheet.appendRow([
      data.dataHora || new Date().toLocaleString("pt-BR"),
      data.nome || "",
      data.whatsapp || "",
      data.categoria || "",
      data.instrumento || "-",
      data.responsavel || "-",
      data.comum || "",
      data.vagas || 1,
      data.valorTotal || "R$ 90,00",
      data.statusPagamento || "Pendente"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Inscrição registrada com sucesso!" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // Retorna os dados em JSON se o organizador quiser visualizar remotamente
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var data = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var record = {};
    for (var j = 0; j < headers.length; j++) {
      record[headers[j]] = row[j];
    }
    data.push(record);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}
