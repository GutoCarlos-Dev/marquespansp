// Sistema de Solicitação de Peças - Página de Detalhes da Solicitação

document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está logado antes de carregar
    if (!JSON.parse(localStorage.getItem('usuarioLogado'))) {
        window.location.href = '../index.html';
        return;
    }
    carregarDetalhesSolicitacao();

    document.getElementById('btn-aprovar').addEventListener('click', function() {
        salvarAprovacao('aprovado');
    });

    document.getElementById('btn-rejeitar').addEventListener('click', function() {
        salvarAprovacao('rejeitado');
    });

    document.getElementById('btn-imprimir-pdf').addEventListener('click', function() {
        gerarPDF();
    });

    // Adiciona o evento de clique para o novo botão Fechar
    document.getElementById('btn-fechar').addEventListener('click', function() {
        window.close();
    });
});

// Função para carregar os detalhes da solicitação
async function carregarDetalhesSolicitacao() {
    let idParam = getQueryParam('id');
    if (!idParam) {
        alert('ID da solicitação não fornecido.');
        return; // Remove window.close() to prevent closing the tab immediately
    }
    idParam = idParam.trim();
    let id = parseInt(idParam, 10);
    if (isNaN(id)) {
        id = idParam;
    }
    console.log('ID usado na consulta:', id);

    if (!supabase) {
        alert('Erro de conexão com o banco de dados.');
        return;
    }

    const { data: solicitacao, error } = await supabase
        .from('solicitacoes')
        .select(`
            id, created_at, status, itens, rota,
            usuario:usuario_id ( nome ),
            veiculo:veiculo_id ( placa, qtd_equipe, supervisor:supervisor_id ( nome ) )
        `)
        .eq('id', id)
        .single();

    if (error || !solicitacao) {
        console.error('Erro ao buscar solicitação:', error);
        alert(`Solicitação com ID ${id} não encontrada. Verifique o console para mais detalhes.`);
        // Remove window.close() to allow debugging
        return;
    }

    // Preencher campos do formulário
    document.getElementById('codigo-solicitacao').value = String(solicitacao.id).padStart(5, '0');
    document.getElementById('nome-tecnico').value = solicitacao.usuario ? solicitacao.usuario.nome : 'N/A';
    // O nome do supervisor não é exibido nesta tela, mas a consulta agora está correta para futuras utilizações.
    document.getElementById('qtd-equipe').value = solicitacao.veiculo?.qtd_equipe || 'N/A';
    document.getElementById('placa').value = solicitacao.veiculo ? solicitacao.veiculo.placa : 'N/A';
    document.getElementById('status-select').value = solicitacao.status.toLowerCase();

    // Preencher data e hora (usando data atual se não existir)
    const dataHoraObj = new Date(solicitacao.created_at);
    const dataHoraFormatada = dataHoraObj.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    document.getElementById('data-hora').value = dataHoraFormatada.replace(',', '');

    // Preencher rota (inicia vazio)
    document.getElementById('rota').value = solicitacao.rota || '';

    // Preencher grid de itens
    const itensGrid = document.getElementById('itens-grid');
    itensGrid.innerHTML = '';
    
    // Limpa o totalizador antigo para evitar duplicatas em recarregamentos
    const sectionHeader = itensGrid.parentElement.querySelector('.section-header');
    const oldTotal = sectionHeader.querySelector('.total-pecas-label');
    if(oldTotal) oldTotal.remove();

    if (solicitacao.itens && solicitacao.itens.length > 0) {
        // Calcular total de peças
        const totalQuantidade = solicitacao.itens.reduce((total, item) => total + item.quantidade, 0);

        // Criar e inserir o totalizador no cabeçalho da seção
        const totalLabel = document.createElement('div');
        totalLabel.className = 'total-pecas-label';
        totalLabel.innerHTML = `Total de Peças: <strong>${totalQuantidade}</strong>`;
        sectionHeader.appendChild(totalLabel);

        // Criar e preencher a tabela de itens
        const tabela = document.createElement('table');
        tabela.innerHTML = `
            <thead>
                <tr><th>Código</th><th>Nome da Peça</th><th>QTD Pedida</th></tr>
            </thead>
            <tbody>
                ${solicitacao.itens.map(item => `<tr><td>${item.codigo}</td><td>${item.nome}</td><td>${item.quantidade}</td></tr>`).join('')}
            </tbody>
        `;
        itensGrid.appendChild(tabela);
    }

    // Salvar ID da solicitação no formulário para uso posterior
    const form = document.getElementById('form-aprovacao');
    form.dataset.solicitacaoId = id;

    // Desabilitar o campo de status para todos, aplicando o estilo de campo de leitura
    const statusSelect = document.getElementById('status-select');
    statusSelect.disabled = true;
    statusSelect.classList.add('readonly-field');

    // Pega o usuário logado para verificar o nível de acesso
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Desabilita edição e botões de ação, a menos que seja admin/matriz
    const podeEditar = usuarioLogado && (usuarioLogado.nivel === 'administrador' || usuarioLogado.nivel === 'matriz');

    const btnAprovar = document.getElementById('btn-aprovar');
    const btnRejeitar = document.getElementById('btn-rejeitar');
    const btnFechar = document.getElementById('btn-fechar');

    if (solicitacao.status !== 'pendente' && !podeEditar) {
        btnAprovar.style.display = 'none';
        btnRejeitar.style.display = 'none';
        btnFechar.style.display = 'inline-block'; // Mostra o botão fechar

        const rotaInput = document.getElementById('rota');
        rotaInput.readOnly = true;
        rotaInput.classList.add('readonly-field');
    }
}

async function salvarAprovacao(novoStatus) {
    const form = document.getElementById('form-aprovacao');
    const idParam = form.dataset.solicitacaoId;

    if (!idParam) {
        alert('Nenhuma solicitação selecionada.');
        return;
    }
    let id = parseInt(idParam, 10);
    if (isNaN(id)) {
        id = idParam;
    }

    const rotaValue = document.getElementById('rota').value;
    // Pega o status do select, mas permite que o parâmetro da função (dos botões) o substitua.
    let statusFinal = document.getElementById('status-select').value;
    if (novoStatus === 'aprovado' || novoStatus === 'rejeitado') {
        statusFinal = novoStatus;
    }

    // Validar se a rota foi preenchida ao aprovar
    if (statusFinal === 'aprovado' && !rotaValue.trim()) {
        alert('Por favor, preencha a ROTA de entrega das peças antes de aprovar.');
        document.getElementById('rota').focus();
        return;
    }

    const dadosAtualizacao = {
        status: statusFinal,
        rota: rotaValue, // Salva a rota mesmo se o status for alterado para rejeitado
        data_aprovacao: statusFinal === 'aprovado' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString() // Garante que a data de atualização seja sempre enviada
    };

    const { error } = await supabase
        .from('solicitacoes')
        .update(dadosAtualizacao)
        .eq('id', id);

    if (error) {
        console.error('Erro ao atualizar solicitação:', error);
        alert(`Erro ao atualizar a solicitação.`);
        return;
    }

    // Mostrar mensagem de sucesso
    alert(`Solicitação atualizada com sucesso!`);

    // Tenta recarregar a página que abriu esta (aprovacao.html)
    if (window.opener) {
        window.opener.location.reload();
    }

    // Se aprovado, recarrega os detalhes na tela. Se rejeitado, fecha a aba.
    if (novoStatus === 'aprovado') {
        // Recarrega os dados na mesma tela para refletir a mudança de status
        await carregarDetalhesSolicitacao();
    } else {
        window.close(); // Fecha a aba para outros status (ex: rejeitado)
    }
}

// Função para gerar PDF
async function gerarPDF() {
    const form = document.getElementById('form-aprovacao');
    const idParam = form.dataset.solicitacaoId;

    if (!idParam) {
        alert('Nenhuma solicitação selecionada para gerar PDF.');
        return;
    }
    let id = parseInt(idParam, 10);
    if (isNaN(id)) {
        id = idParam;
    }

    const { data: solicitacao, error: fetchError } = await supabase
        .from('solicitacoes')
        .select(`
            id, created_at, status, itens, rota,
            usuario:usuario_id(nome),
            veiculo:veiculo_id(placa, qtd_equipe, supervisor:supervisor_id(nome))
        `)
        .eq('id', id)
        .single();

    if (fetchError || !solicitacao) {
        console.error('Erro ao buscar dados para o PDF:', fetchError);
        alert('Solicitação não encontrada.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- CABEÇALHO ---

    // IMPORTANTE: Para usar seu logo 'logo.png', converta-o para o formato Base64.
    // 1. Acesse um conversor online como: https://www.base64-image.de/
    // 2. Envie seu arquivo 'logo.png'.
    // 3. Copie o texto gerado e cole-o dentro das aspas da variável 'logoBase64' abaixo.
    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABSSURBVHhe7cExAQAAAMKg9U9tCF8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwZ08AAQAB2ds4AAAAAElFTkSuQmCC'; // Substitua este conteúdo
    const placeholderLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABSSURBVHhe7cExAQAAAMKg9U9tCF8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwZ08AAQAB2ds4AAAAAElFTkSuQmCC';

    // Adiciona a logo apenas se não for o placeholder, tratando possíveis erros.
    if (logoBase64 && logoBase64 !== placeholderLogo) {
        try {
            doc.addImage(logoBase64, 'PNG', 150, 8, 45, 20);
        } catch (e) {
            console.warn('Não foi possível adicionar o logo ao PDF. Verifique se o código Base64 está correto.', e);
            alert('Aviso: O logo não pôde ser carregado, mas o PDF foi gerado mesmo assim.');
        }
    } else {
        console.log('Logo placeholder detectado. Pulando a adição do logo no PDF. Substitua o conteúdo da variável "logoBase64" para exibir o logo da sua empresa.');
    }

    // Título do Documento dinâmico com base no status
    let tituloPDF = 'Relatório de Solicitação de Peças'; // Título padrão
    let tituloCor = '#000000'; // Preto (padrão)

    switch (solicitacao.status) {
        case 'enviado':
            tituloPDF = 'Resumo de Envio de Peças';
            tituloCor = '#4CAF50'; // Verde
            break;
        case 'rejeitado':
            tituloPDF = 'Rejeitado o Envio de Peças';
            tituloCor = '#f44336'; // Vermelho
            break;
        case 'aprovado':
            tituloPDF = 'Pendente Envio de Peças';
            tituloCor = '#2196F3'; // Azul
            break;
    }
    // Título do Documento
    doc.setFontSize(20);
    doc.setTextColor(tituloCor);
    doc.setFont('helvetica', 'bold');
    doc.text(tituloPDF, 14, 20);

    // Linha divisória
    doc.setDrawColor(76, 175, 80); // Cor verde
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);

    // --- INFORMAÇÕES GERAIS ---

    const labelCol1 = 58;
    const valueCol1 = 60;
    const labelCol2 = 143;
    const valueCol2 = 145;

    doc.setFontSize(12);
    doc.setTextColor(40); // Cor de texto padrão (cinza escuro)

    let startY = 40;

    // Helper para desenhar campos alinhados
    const drawField = (label, value, y, isSecondColumn = false) => {
        const labelX = isSecondColumn ? labelCol2 : labelCol1;
        const valueX = isSecondColumn ? valueCol2 : valueCol1;
        doc.setFont('helvetica', 'bold');
        doc.text(label, labelX, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), valueX, y);
    };

    const dataHora = new Date(solicitacao.created_at).toLocaleString('pt-BR');
    drawField('Código da Solicitação:', String(solicitacao.id).padStart(5, '0'), startY);
    drawField('Data da Solicitação:', dataHora, startY, true);

    startY += 8;
    drawField('Técnico:', solicitacao.usuario ? solicitacao.usuario.nome : 'N/A', startY);

    startY += 8;
    drawField('Placa do Veículo:', solicitacao.veiculo ? solicitacao.veiculo.placa : 'N/A', startY);
    drawField('Supervisor:', solicitacao.veiculo?.supervisor?.nome || 'N/A', startY, true);

    startY += 8;
    drawField('Rota de Entrega:', solicitacao.rota || 'Não definida', startY);

    startY += 8;
    // Adicionar QTD Equipe em vermelho
    doc.setTextColor('#f44336'); // Cor vermelha
    drawField('QTD Equipe:', solicitacao.veiculo?.qtd_equipe || 'N/A', startY);
    doc.setTextColor(40); // Restaurar cor padrão (cinza escuro)
    
    // --- TABELA DE ITENS ---

    // Adicionar total de peças antes da tabela
    const totalQuantidadePDF = solicitacao.itens.reduce((total, item) => total + item.quantidade, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de Peças: ${totalQuantidadePDF}`, 196, startY + 10, { align: 'right' });

    const tableColumn = ["Código", "Nome da Peça", "Quantidade"];
    const tableRows = [];

    solicitacao.itens.forEach(item => {
        tableRows.push([item.codigo, item.nome, item.quantidade]);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startY + 15, // Ajustado para dar espaço ao total
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] },
        styles: { font: 'helvetica', fontSize: 10 }
    });

    // --- RODAPÉ ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Documento gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 287);
        doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: 'right' });
    }

    // Salvar o PDF
    doc.save(`solicitacao_${String(solicitacao.id).padStart(5, '0')}.pdf`);
}
