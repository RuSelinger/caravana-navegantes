# 🚌 Landing Page da Caravana para Navegantes

Página moderna, responsiva e elegante criada para a **Confirmação de Presença na Reunião de Jovens e Menores com Ensaio em Navegantes** (01/11), reproduzindo com fidelidade a identidade visual, cores (azul marinho e dourado), ornamentos e tipografia do convite oficial.

---

## ✨ Recursos da Página

1. **Estética Fiel ao Convite:**
   - Tipografia clássica serifada e manuscrita (*Caravana*).
   - Molduras douradas e arabescos delicados em vetor SVG.
   - Ilustração estilizada do ônibus de turismo.
   - Destaques do dia (`01/11`), horário de saída (`05h30`) e valor (`R$ 90,00`).

2. **Formulário Inteligente de Confirmação:**
   - Nome completo e Comum Congregação.
   - Máscara automática de WhatsApp no padrão brasileiro `(00) 00000-0000`.
   - Seleção de categoria: **Mocidade**, **Músico** e **Irmandade**.
   - Campo condicional para **Instrumento musical** (caso seja músico) para planejar o bagageiro.
   - **Inscrição Estritamente Individual:** 1 vaga por pessoa (R$ 90,00), impedindo cadastros duplicados com o mesmo número.

3. **Pagamento PIX Simplificado:**
   - Caixa informativa com o valor calculado.
   - Botão **"Copiar Chave PIX"** com feedback instantâneo.
   - Ao finalizar a confirmação, o participante recebe uma janela de parabéns com um botão direto para **enviar o comprovante pelo WhatsApp** para o organizador com mensagem formatada já pronta!

4. **Visualização Gratuita dos Confirmados (Painel do Organizador):**
   - Acesse pelo link discreto no rodapé **"Área do Organizador"** com senha (padrão: `1234`).
   - Resumo em tempo real de: total de passageiros, quantidade de músicos e valor previsto.
   - Tabela de participantes com busca em tempo real por nome/comum e filtros por categoria.
   - Alternar status de pagamento com 1 clique (**Pendente** / **✓ Pago**).
   - Botão para **Exportar para Excel (.csv)**.
   - Botão para **Imprimir Lista do Ônibus** (layout formatado para prancheta de chamada no dia da viagem).

5. **Integração Gratuita com Google Planilhas (Google Sheets):**
   - As confirmações podem cair automaticamente e em tempo real em uma planilha do Google Drive acessível por todos os organizadores no celular!

---

## 🚀 Como Testar Localmente no seu Computador

Você já pode abrir o arquivo `index.html` diretamente no seu navegador:
1. Abra a pasta do projeto: `C:\Users\ruans\.gemini\antigravity\scratch\caravana-navegantes`
2. Dê dois cliques no arquivo `index.html`.
3. Ou, pelo terminal / PowerShell:
   ```powershell
   cd C:\Users\ruans\.gemini\antigravity\scratch\caravana-navegantes
   python -m http.server 8080
   ```
   E abra no navegador: `http://localhost:8080`

---

## 🌐 Como Publicar 100% Grátis na Internet

Para que as pessoas possam acessar do celular através de um link no WhatsApp, você pode hospedar a página gratuitamente em menos de 3 minutos em qualquer um destes serviços:

### Opção 1: Netlify Drop (Mais Fácil - Não precisa de conta de programador)
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `caravana-navegantes` inteira para dentro da tela.
3. Pronto! Em 10 segundos ele gerará um link gratuito (ex: `caravana-navegantes.netlify.app`).

### Opção 2: Vercel (Super Rápido)
1. Acesse [vercel.com](https://vercel.com)
2. Crie uma conta gratuita e importe a pasta ou repositório.
3. Seu link ficará disponível imediatamente com certificado SSL (HTTPS).

### Opção 3: GitHub Pages
1. Crie um repositório no GitHub.
2. Suba os arquivos da pasta `caravana-navegantes`.
3. Vá em **Settings > Pages** e ative o GitHub Pages na branch `main`.

---

## 📊 Como Ativar a Planilha do Google (100% Gratuito)

Se você quiser que todas as pessoas confirmadas caiam diretamente em uma planilha do Google Sheets que você e outros irmãos possam abrir no celular:

1. Acesse o [Google Planilhas](https://sheets.google.com) e crie uma nova planilha vazia.
2. Na primeira linha, você pode nomear a planilha como: `Caravana Navegantes 01/11`.
3. No menu superior da planilha, clique em: **Extensões** > **Apps Script**.
4. Apague qualquer código existente no editor e cole o conteúdo do arquivo [`google-sheets-script.js`](file:///C:/Users/ruans/.gemini/antigravity/scratch/caravana-navegantes/google-sheets-script.js).
5. No canto superior direito, clique no botão azul **Implantar** > **Nova implantação**.
6. Clique no ícone de engrenagem ⚙️ (ao lado de Selecionar tipo) e escolha **App da Web**.
7. Preencha:
   - **Descrição**: `Caravana Navegantes`
   - **Executar como**: `Eu (seu e-mail)`
   - **Quem pode acessar**: `Qualquer pessoa` *(Importantíssimo para que a página consiga enviar os dados!)*
8. Clique em **Implantar**, autorize o acesso com sua conta Google e **copie a URL do App da Web**.
9. Abra o arquivo [`js/config.js`](file:///C:/Users/ruans/.gemini/antigravity/scratch/caravana-navegantes/js/config.js) e cole a URL no campo `googleSheetsUrl`:
   ```javascript
   googleSheetsUrl: "https://script.google.com/macros/s/SEU_CODIGO_AQUI/exec"
   ```

Pronto! A partir desse momento, cada confirmação enviada no formulário criará uma nova linha automaticamente na sua planilha do Google.

---

## ⚙️ Como Personalizar seus Dados (`js/config.js`)

Abra o arquivo [`js/config.js`](file:///C:/Users/ruans/.gemini/antigravity/scratch/caravana-navegantes/js/config.js) para alterar:
- Sua Chave Pix real (`chavePix`)
- O Nome do Titular do Pix (`titularPix`)
- O WhatsApp dos Organizadores (`whatsappOrganizador`) com DDD (ex: `5547999998888`)
- A Senha do Painel do Organizador (`senhaAdmin`)
- A quantidade limite de vagas do ônibus (`vagasTotais`)
