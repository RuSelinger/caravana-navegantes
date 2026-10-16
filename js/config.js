// Configurações da Caravana - Edite conforme suas informações reais!
const CARAVANA_CONFIG = {
  // Informações do Evento
  titulo: "Reunião de Jovens e Menores com Ensaio em Navegantes",
  dataEvento: "01/11",
  horarioSaida: "05h30 da manhã",
  localSaida: "Em frente à Congregação Central (confirmar)",
  valorPorPessoa: 90.00,
  vagasTotais: 46,

  // Informações de Pagamento (PIX)
  chavePix: "09839341936",
  tipoChavePix: "CPF",
  titularPix: "Comissão de Mocidade / Organizador",

  // WhatsApp do Organizador para receber os comprovantes
  whatsappOrganizador: "5548998125422",

  // Senha padrão para abrir a Área do Organizador na página
  senhaAdmin: "1234",

  // Integração com Banco de Dados Supabase (100% Gratuito e Ultra-Rápido)
  // Obtenha em https://supabase.com > Seu Projeto > Project Settings > API
  supabaseUrl: "", // Ex: "https://xyzabcdefghijk.supabase.co"
  supabaseAnonKey: "", // Cole aqui sua chave 'anon public'

  // Integração com Google Planilhas (Mantida para atualizar a planilha)
  googleSheetsUrl: "https://script.google.com/macros/s/AKfycbxaRo9zHOI19HnuUQSkel8_fQN_q5OJ7-IV79zG46tVo9KVmJyugEvm3JOoS-paZWICAg/exec" 
};

// Exporta para uso global
window.CARAVANA_CONFIG = CARAVANA_CONFIG;
