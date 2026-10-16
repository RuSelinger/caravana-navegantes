// Lógica Principal da Página de Confirmação da Caravana
document.addEventListener('DOMContentLoaded', () => {
  // Carrega configurações (do config.js ou localStorage)
  const savedConfig = localStorage.getItem('caravana_custom_config');
  const config = savedConfig ? { ...CARAVANA_CONFIG, ...JSON.parse(savedConfig) } : CARAVANA_CONFIG;

  // Elementos do DOM
  const form = document.getElementById('registrationForm');
  const submitBtn = document.getElementById('submitBtn');
  const whatsappInput = document.getElementById('whatsapp');
  const categoryInputs = document.querySelectorAll('input[name="categoria"]');
  const musicoField = document.getElementById('musicoField');
  const vagasInput = document.getElementById('vagas');
  const totalAmountEl = document.getElementById('totalAmount');
  const pixKeyInput = document.getElementById('pixKeyDisplay');
  const btnCopyPix = document.getElementById('btnCopyPix');
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const adminModal = document.getElementById('adminModal');
  const openAdminBtn = document.getElementById('openAdminBtn');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const btnRefreshList = document.getElementById('btnRefreshList');
  const toast = document.getElementById('toastNotice');

  // Inicializa textos da página com base na configuração
  if (pixKeyInput) pixKeyInput.value = config.chavePix;
  const pixTitularEl = document.getElementById('pixTitular');
  if (pixTitularEl) pixTitularEl.textContent = config.titularPix;

  // Atualiza contagem inicial de vagas e sincroniza em tempo real com o Google Sheets
  updateSeatsCounter();
  syncWithGoogleSheets();

  // 1. Formatação de Telefone / WhatsApp com Máscara
  if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.substring(0, 11);
      
      if (val.length > 6) {
        val = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
      } else if (val.length > 2) {
        val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
      } else if (val.length > 0) {
        val = `(${val}`;
      }
      e.target.value = val;
    });
  }

  // 2. Troca de Categoria e Exibição de Campos Condicionais
  categoryInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      // Remove estilo de todos os cards
      document.querySelectorAll('.category-card').forEach(card => card.classList.remove('selected'));
      
      // Adiciona estilo no card selecionado
      const parentCard = radio.closest('.category-card');
      if (parentCard) parentCard.classList.add('selected');

      const selectedValue = radio.value;
      
      // Músico: exibe campo de instrumento
      if (selectedValue === 'Músico') {
        musicoField.classList.add('active');
        document.getElementById('instrumento').setAttribute('required', 'required');
      } else {
        musicoField.classList.remove('active');
        document.getElementById('instrumento').removeAttribute('required');
      }
    });
  });

  // 3. Copiar Chave PIX
  if (btnCopyPix) {
    btnCopyPix.addEventListener('click', () => {
      const keyToCopy = config.chavePix;
      navigator.clipboard.writeText(keyToCopy).then(() => {
        btnCopyPix.classList.add('copied');
        btnCopyPix.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Chave Copiada!
        `;
        showToast('Chave PIX copiada para a área de transferência!');

        setTimeout(() => {
          btnCopyPix.classList.remove('copied');
          btnCopyPix.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copiar Chave
          `;
        }, 3000);
      }).catch(err => {
        alert('Não foi possível copiar automaticamente. A chave é: ' + keyToCopy);
      });
    });
  }

  // 4. Envio do Formulário de Inscrição (1 vaga por pessoa)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validação básica
      const nome = document.getElementById('nome').value.trim();
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const comum = document.getElementById('comum').value.trim();
      const categoriaRadio = document.querySelector('input[name="categoria"]:checked');
      const categoria = categoriaRadio ? categoriaRadio.value : '';
      const instrumento = document.getElementById('instrumento')?.value.trim() || '';
      const obs = document.getElementById('observacoes')?.value.trim() || '';

      if (!nome || !whatsapp || !comum || !categoria) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Validação: Impede que a mesma pessoa cadastre mais de uma vaga pelo mesmo número
      const cleanPhone = whatsapp.replace(/\D/g, '');
      const existingList = getLocalRegistrations();
      const alreadyRegistered = existingList.find(item => {
        const itemCleanPhone = item.whatsapp.replace(/\D/g, '');
        return itemCleanPhone === cleanPhone && cleanPhone.length >= 10;
      });

      if (alreadyRegistered) {
        alert(`Atenção: Já existe uma vaga confirmada para este número de WhatsApp em nome de ${alreadyRegistered.nome}.\n\nCada participante deve confirmar sua própria vaga individualmente.`);
        return;
      }

      // Cada inscrição é estritamente 1 pessoa / 1 vaga
      const vagas = 1;
      const valorTotalStr = `R$ ${config.valorPorPessoa.toFixed(2).replace('.', ',')}`;

      // Monta objeto da inscrição
      const inscricao = {
        id: 'INS_' + Date.now(),
        dataHora: new Date().toLocaleString('pt-BR'),
        nome: nome,
        whatsapp: whatsapp,
        categoria: categoria,
        instrumento: categoria === 'Músico' ? instrumento : '-',
        responsavel: '-',
        comum: comum,
        vagas: 1,
        observacoes: obs,
        valorTotal: valorTotalStr,
        statusPagamento: 'Pendente' // Pendente | Confirmado
      };

      // Desabilita botão durante salvamento
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Registrando confirmação...</span>`;

      try {
        // 1. Salva localmente no navegador (garantia 100% que não perde os dados)
        saveLocalRegistration(inscricao);

        // 2. Se houver Google Sheets URL configurada, envia para a planilha do Google
        if (config.googleSheetsUrl && config.googleSheetsUrl.startsWith('http')) {
          try {
            await fetch(config.googleSheetsUrl, {
              method: 'POST',
              mode: 'no-cors', // Evita bloqueio de CORS no Google Apps Script
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(inscricao)
            });
          } catch (sheetsErr) {
            console.warn('Aviso: envio para Google Sheets pendente ou offline.', sheetsErr);
          }
        }

        // Abre modal de sucesso
        showSuccessModal(inscricao);
        form.reset();
        
        // Reseta categorias visuais
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
        musicoField.classList.remove('active');

        // Atualiza contadores e sincroniza novamente com a nuvem
        updateSeatsCounter();
        setTimeout(syncWithGoogleSheets, 2000);

      } catch (err) {
        alert('Ocorreu um erro ao salvar sua inscrição. Por favor tente novamente.');
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Confirmar Minha Presença</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
    });
  }

  // Exibe o modal de sucesso com link de WhatsApp formatado
  function showSuccessModal(item) {
    document.getElementById('modalSummaryNome').textContent = item.nome;
    document.getElementById('modalSummaryCategoria').textContent = item.categoria + (item.instrumento !== '-' ? ` (${item.instrumento})` : '');
    document.getElementById('modalSummaryComum').textContent = item.comum;
    document.getElementById('modalSummaryVagas').textContent = '1 Vaga Individual';
    document.getElementById('modalSummaryValor').textContent = 'R$ 90,00';

    // Link do WhatsApp com mensagem pronta
    const msg = encodeURIComponent(
      `Olá! Confirmei minha presença na Caravana para Navegantes! 🚌✨\n\n` +
      `👤 Nome: ${item.nome}\n` +
      `⛪ Comum: ${item.comum}\n` +
      `👥 Categoria: ${item.categoria}${item.instrumento !== '-' ? ' (' + item.instrumento + ')' : ''}\n` +
      `🎫 Vaga: 1 Pessoa (Individual)\n` +
      `💰 Valor: R$ 90,00\n\n` +
      `Estou enviando o comprovante do PIX em anexo para confirmar minha vaga.`
    );

    const zapUrl = `https://wa.me/${config.whatsappOrganizador}?text=${msg}`;
    const btnZap = document.getElementById('btnWhatsappComprovante');
    if (btnZap) {
      btnZap.setAttribute('href', zapUrl);
      btnZap.setAttribute('target', '_blank');
    }

    if (successModal) successModal.classList.add('active');
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });
  }

  // 6. Painel do Organizador (Admin)
  if (openAdminBtn) {
    openAdminBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const pass = prompt('Digite a senha de organizador para ver a lista:');
      if (pass === null) return;
      if (pass === config.senhaAdmin) {
        renderAdminDashboard();
        if (adminModal) adminModal.classList.add('active');
        // Sincroniza com a planilha do Google em tempo real ao abrir
        await syncWithGoogleSheets();
      } else {
        alert('Senha incorreta!');
      }
    });
  }

  if (closeAdminBtn) {
    closeAdminBtn.addEventListener('click', () => {
      adminModal.classList.remove('active');
    });
  }

  if (btnRefreshList) {
    btnRefreshList.addEventListener('click', async () => {
      btnRefreshList.disabled = true;
      btnRefreshList.innerHTML = `<span>Sincronizando...</span>`;
      await syncWithGoogleSheets();
      renderAdminDashboard();
      btnRefreshList.disabled = false;
      btnRefreshList.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Atualizar
      `;
      showToast('Lista sincronizada com a Planilha do Google!');
    });
  }

  // Sincroniza dados com o Google Sheets em tempo real
  async function syncWithGoogleSheets() {
    if (!config.googleSheetsUrl || !config.googleSheetsUrl.startsWith('http')) {
      updateSeatsCounter();
      return;
    }

    try {
      const response = await fetch(config.googleSheetsUrl, { method: 'GET' });
      if (!response.ok) throw new Error('Falha na resposta da planilha');
      const json = await response.json();

      if (json && json.status === 'success' && Array.isArray(json.data)) {
        const remoteList = json.data
          .map((row, idx) => ({
            id: 'GS_' + idx + '_' + (row['Data / Hora'] || Date.now()),
            dataHora: row['Data / Hora'] ? new Date(row['Data / Hora']).toLocaleString('pt-BR') : '',
            nome: row['Nome Completo'] || '',
            whatsapp: row['WhatsApp'] || '',
            categoria: row['Categoria'] || '',
            instrumento: row['Instrumento'] || '-',
            responsavel: row['Responsável'] || '-',
            comum: row['Comum Congregação'] || '',
            vagas: parseInt(row['Qtd Vagas'], 10) || 1,
            valorTotal: row['Valor Total (R$)'] || 'R$ 90,00',
            statusPagamento: row['Status Pagamento'] || 'Pendente'
          }))
          .filter(item => item.nome && item.nome.trim() !== '');

        // Atualiza armazenamento local com a lista oficial da nuvem
        localStorage.setItem('caravana_registrations', JSON.stringify(remoteList));
        updateSeatsCounter();

        // Se o painel estiver aberto, atualiza a tabela
        if (adminModal && adminModal.classList.contains('active')) {
          renderAdminDashboard();
        }
      }
    } catch (err) {
      console.warn('Sincronização com Google Sheets pendente:', err);
      updateSeatsCounter();
    }
  }

  // Salvar inscrição localmente
  function saveLocalRegistration(item) {
    const list = getLocalRegistrations();
    list.unshift(item);
    localStorage.setItem('caravana_registrations', JSON.stringify(list));
  }

  function getLocalRegistrations() {
    try {
      const data = localStorage.getItem('caravana_registrations');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Atualiza contador de vagas
  function updateSeatsCounter() {
    const list = getLocalRegistrations();
    const ocupadas = list.reduce((acc, curr) => acc + (parseInt(curr.vagas, 10) || 1), 0);
    const vagasEl = document.getElementById('vagasCounterText');
    if (vagasEl) {
      vagasEl.textContent = `${ocupadas} de ${config.vagasTotais} vagas preenchidas`;
    }
  }

  // Renderiza a lista no Painel Administrativo
  function renderAdminDashboard() {
    const list = getLocalRegistrations();
    const tbody = document.getElementById('adminTableBody');
    const totalCountEl = document.getElementById('adminTotalInscritos');
    const totalValueEl = document.getElementById('adminTotalValor');
    const totalMusicosEl = document.getElementById('adminTotalMusicos');
    const searchInput = document.getElementById('adminSearchInput');
    const filterSelect = document.getElementById('adminFilterSelect');

    function displayList(items) {
      if (!tbody) return;
      tbody.innerHTML = '';

      if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: #888;">Nenhuma confirmação registrada ainda.</td></tr>`;
        return;
      }

      items.forEach((item, index) => {
        const tr = document.createElement('tr');
        const zapClean = item.whatsapp.replace(/\D/g, '');
        const zapLink = `https://wa.me/55${zapClean}?text=${encodeURIComponent('A Paz de Deus, ' + item.nome + '! Tudo bem? Estou entrando em contato sobre a Caravana para Navegantes.')}`;
        
        const isPago = item.statusPagamento === 'Confirmado' || item.statusPagamento === 'Pago';

        tr.innerHTML = `
          <td><strong>${item.nome}</strong></td>
          <td>
            <a href="${zapLink}" target="_blank" style="color: #128C7E; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              <span>${item.whatsapp}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </td>
          <td>
            <span class="badge-cat">${item.categoria}</span>
            ${item.instrumento !== '-' ? `<br><small style="color:#666;">🎻 ${item.instrumento}</small>` : ''}
            ${item.responsavel !== '-' ? `<br><small style="color:#666;">Resp: ${item.responsavel}</small>` : ''}
          </td>
          <td>${item.comum}</td>
          <td style="text-align:center;"><strong>${item.vagas}</strong></td>
          <td style="text-align:center;">
            <button class="status-btn ${isPago ? 'btn-paid' : 'btn-pending'}" data-id="${item.id}">
              ${isPago ? '✓ Pago' : '⏳ Pendente'}
            </button>
          </td>
          <td style="text-align:center;">
            <button class="btn-delete" data-id="${item.id}" title="Excluir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Eventos dos botões de status
      document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          togglePaymentStatus(id);
        });
      });

      // Eventos de exclusão
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
            deleteRegistration(id);
          }
        });
      });
    }

    // Totais e Métricas
    const totalVagas = list.reduce((sum, item) => sum + (parseInt(item.vagas, 10) || 1), 0);
    const musicosCount = list.filter(item => item.categoria === 'Músico').length;
    const totalEstimado = totalVagas * config.valorPorPessoa;

    if (totalCountEl) totalCountEl.textContent = `${totalVagas} confirmados`;
    if (totalValueEl) totalValueEl.textContent = `R$ ${totalEstimado.toFixed(2).replace('.', ',')}`;
    if (totalMusicosEl) totalMusicosEl.textContent = `${musicosCount} músicos`;

    displayList(list);

    // Filtros e busca
    if (searchInput) {
      searchInput.oninput = () => applyFilters();
    }
    if (filterSelect) {
      filterSelect.onchange = () => applyFilters();
    }

    function applyFilters() {
      const q = searchInput.value.toLowerCase().trim();
      const cat = filterSelect.value;
      const filtered = list.filter(item => {
        const matchesQuery = item.nome.toLowerCase().includes(q) || item.comum.toLowerCase().includes(q) || item.whatsapp.includes(q);
        const matchesCat = !cat || item.categoria === cat;
        return matchesQuery && matchesCat;
      });
      displayList(filtered);
    }
  }

  function togglePaymentStatus(id) {
    const list = getLocalRegistrations();
    const item = list.find(i => i.id === id);
    if (item) {
      item.statusPagamento = (item.statusPagamento === 'Confirmado' || item.statusPagamento === 'Pago') ? 'Pendente' : 'Confirmado';
      localStorage.setItem('caravana_registrations', JSON.stringify(list));
      renderAdminDashboard();
      showToast(`Status de ${item.nome} atualizado para ${item.statusPagamento}!`);
    }
  }

  function deleteRegistration(id) {
    let list = getLocalRegistrations();
    list = list.filter(i => i.id !== id);
    localStorage.setItem('caravana_registrations', JSON.stringify(list));
    renderAdminDashboard();
    updateSeatsCounter();
    showToast('Inscrição removida!');
  }

  // 7. Exportar para CSV / Excel
  const btnExportCsv = document.getElementById('btnExportCsv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const list = getLocalRegistrations();
      if (list.length === 0) {
        alert('Não há inscrições para exportar.');
        return;
      }

      // Cabeçalhos CSV
      const headers = ['Data Inscrição', 'Nome Completo', 'WhatsApp', 'Categoria', 'Instrumento', 'Responsável', 'Comum', 'Qtd Vagas', 'Valor Total', 'Status'];
      const rows = list.map(i => [
        `"${i.dataHora}"`,
        `"${i.nome}"`,
        `"${i.whatsapp}"`,
        `"${i.categoria}"`,
        `"${i.instrumento}"`,
        `"${i.responsavel}"`,
        `"${i.comum}"`,
        i.vagas,
        `"${i.valorTotal}"`,
        `"${i.statusPagamento}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `caravana-navegantes-inscritos-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Planilha Excel (.csv) exportada com sucesso!');
    });
  }

  // 8. Imprimir Lista de Embarque
  const btnPrintList = document.getElementById('btnPrintList');
  if (btnPrintList) {
    btnPrintList.addEventListener('click', () => {
      window.print();
    });
  }

  // Toast Helper
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
});
