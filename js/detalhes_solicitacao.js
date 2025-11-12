// Sistema de Solicitação de Peças - Página de Detalhes da Solicitação

let isEditing = false;
let itensEmEdicao = [];
let itensOriginais = [];

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
        window.close(); // Fecha a aba atual
    });

    // Adiciona o evento de clique para o botão Editar Itens
    document.getElementById('btn-editar-itens').addEventListener('click', function() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (!usuarioLogado || (usuarioLogado.nivel !== 'administrador' && usuarioLogado.nivel !== 'matriz')) {
            alert('Acesso negado. Apenas administradores ou matriz podem editar itens.');
            return;
        }

        if (!isEditing) {
            entrarModoEdicao();
        } else {
            salvarAlteracoes(); // O botão agora é "Salvar"
        }
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
        // Salvar itens originais para edição
        itensOriginais = JSON.parse(JSON.stringify(solicitacao.itens));
        itensEmEdicao = JSON.parse(JSON.stringify(solicitacao.itens)); // Cria cópia para edição

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
    const btnEditar = document.getElementById('btn-editar-itens');

    if (solicitacao.status !== 'pendente' && !podeEditar) {
        btnAprovar.style.display = 'none';
        btnRejeitar.style.display = 'none';

        const rotaInput = document.getElementById('rota');
        rotaInput.readOnly = true;
        rotaInput.classList.add('readonly-field');
    }

    // Esconde o botão de editar se o status não for 'pendente' ou 'aprovado'
    if (solicitacao.status === 'rejeitado' || solicitacao.status === 'enviado') {
        btnEditar.style.display = 'none';
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
            *,
            usuario:usuario_id(nome),
            veiculo:veiculo_id(placa, qtd_equipe, supervisor:supervisor_id(nome)),
            enviado_por:enviado_por_id(nome)
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
            tituloPDF = 'Aprovado para Envio';
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

    // --- INFORMAÇÕES GERAIS E ASSINATURAS (NOVO LAYOUT) ---
    doc.setFontSize(10);
    doc.setTextColor(40);
    let startY = 40;
    const lineHeight = 7; // Espaçamento entre linhas
    const leftMargin = 14;
    const rightMargin = 120;

    // Função auxiliar para desenhar texto com rótulo em negrito
    const drawLabeledText = (label, value, x, y) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), x + doc.getTextWidth(label), y);
    };

    // Coluna da Esquerda (Dados da Solicitação)
    const dataHora = new Date(solicitacao.created_at).toLocaleString('pt-BR');

    // ROTA DE ENTREGA primeiro
    doc.setFontSize(15); // Aumentar fonte para destacar
    doc.setTextColor('#f44336'); // Cor vermelha para destacar
    drawLabeledText('ROTA DE ENTREGA:  ', solicitacao.rota || 'Não definida', leftMargin, startY);
    doc.setTextColor(40); // Restaurar cor padrão
    doc.setFontSize(10); // Restaurar fonte padrão
    startY += lineHeight;

    drawLabeledText('Código da Solicitação:    ', String(solicitacao.id).padStart(5, '0'), leftMargin, startY);
    startY += lineHeight;
    drawLabeledText('Data da Solicitação:   ', dataHora, leftMargin, startY);
    startY += lineHeight;
    drawLabeledText('Técnico:  ', solicitacao.usuario?.nome || 'N/A', leftMargin, startY);
    startY += lineHeight;

    // Lógica para negritar "Placa do Veículo" e "Supervisor" na mesma linha
    let currentXPlaca = leftMargin;
    // 1. "Placa do Veículo:" (Negrito)
    doc.setFont('helvetica', 'bold');
    const labelPlaca = 'Placa do Veículo:   ';
    doc.text(labelPlaca, currentXPlaca, startY);
    currentXPlaca += doc.getTextWidth(labelPlaca);

    // 2. Valor da placa (Normal)
    doc.setFont('helvetica', 'normal');
    const valorPlaca = `${solicitacao.veiculo?.placa || 'N/A'}    `; // Adiciona espaço para separar
    doc.text(valorPlaca, currentXPlaca, startY);
    currentXPlaca += doc.getTextWidth(valorPlaca);

    // 3. "Supervisor:" (Negrito)
    doc.setFont('helvetica', 'bold');
    const labelSupervisor = 'Supervisor: ';
    doc.text(labelSupervisor, currentXPlaca, startY);
    currentXPlaca += doc.getTextWidth(labelSupervisor);

    // 4. Valor do "Supervisor" (Normal)
    doc.setFont('helvetica', 'normal');
    doc.text(solicitacao.veiculo?.supervisor?.nome || 'N/A', currentXPlaca, startY);
    startY += lineHeight;

    const dataEnvio = solicitacao.data_envio ? new Date(solicitacao.data_envio).toLocaleString('pt-BR') : 'Aguardando envio';
    const enviadoPor = solicitacao.enviado_por?.nome || (solicitacao.status === 'enviado' ? 'Não registrado' : '');

    // Lógica para negritar múltiplos rótulos na mesma linha
    let currentX = leftMargin;
    // 1. "Data de Envio:" (Negrito)
    doc.setFont('helvetica', 'bold');
    const labelData = 'Data de Envio:  ';
    doc.text(labelData, currentX, startY);
    currentX += doc.getTextWidth(labelData);

    // 2. Valor da data (Normal)
    doc.setFont('helvetica', 'normal');
    const valorData = `${dataEnvio}    `; // Adiciona espaço para separar
    doc.text(valorData, currentX, startY);
    currentX += doc.getTextWidth(valorData);

    // 3. "Enviado por:" (Negrito)
    doc.setFont('helvetica', 'bold');
    const labelEnviado = 'Enviado por: ';
    doc.text(labelEnviado, currentX, startY);
    currentX += doc.getTextWidth(labelEnviado);

    // 4. Valor do "Enviado por" (Normal)
    doc.setFont('helvetica', 'normal');
    doc.text(enviadoPor, currentX, startY);

    // Pula para a próxima linha antes de adicionar o campo QTD Equipe
    startY += lineHeight;

    // Adicionar QTD Equipe em vermelho
    doc.setTextColor('#f44336'); // Cor vermelha
    drawLabeledText('QTD Equipe: ', solicitacao.veiculo?.qtd_equipe || 'N/A', leftMargin, startY);
    doc.setTextColor(40); // Restaurar cor padrão (cinza escuro)
    startY += lineHeight;

    // Coluna da Direita (Assinaturas)
    let signatureY = 40;
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', rightMargin, signatureY);
    doc.setFont('helvetica', 'normal');
    doc.text(' _____________________________', rightMargin + doc.getTextWidth('Status:'), signatureY);

    signatureY += lineHeight * 2; // Espaço maior entre as assinaturas

    doc.setFont('helvetica', 'bold');
    doc.text('Separado Por:', rightMargin, signatureY);
    doc.setFont('helvetica', 'normal');
    doc.text(' ___________________________', rightMargin + doc.getTextWidth('Separado Por:'), signatureY);
    
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

// Função para entrar no modo de edição
function entrarModoEdicao() {
    const itensGrid = document.getElementById('itens-grid');
    itensGrid.innerHTML = ''; // Limpa o grid

    const tabela = document.createElement('table');
    tabela.innerHTML = `
        <thead>
            <tr>
                <th>Código</th>
                <th>Nome da Peça</th>
                <th>QTD</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${itensEmEdicao.map((item, index) => `
                <tr data-index="${index}">
                    <td>${item.codigo}</td>
                    <td>${item.nome}</td>
                    <td><input type="number" value="${item.quantidade}" min="0" class="input-qtd-edicao" style="width: 70px;"></td>
                    <td><button type="button" class="btn-excluir-item" data-index="${index}">Excluir</button></td>
                </tr>
            `).join('')}
        </tbody>
    `;
    itensGrid.appendChild(tabela);

    // Adiciona eventos para os botões de excluir
    tabela.querySelectorAll('.btn-excluir-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index, 10);
            // Remove o item da lista de edição
            itensEmEdicao.splice(index, 1);
            // Re-renderiza a tabela de edição
            entrarModoEdicao();
        });
    });

    isEditing = true;
    const btnEditar = document.getElementById('btn-editar-itens');
    btnEditar.textContent = '💾 Salvar Alterações';

    // Adiciona um botão de cancelar
    const btnCancelar = document.createElement('button');
    btnCancelar.type = 'button';
    btnCancelar.id = 'btn-cancelar-edicao';
    btnCancelar.textContent = 'Cancelar Edição';
    btnCancelar.className = 'btn-secundario';
    btnEditar.insertAdjacentElement('afterend', btnCancelar);

    btnCancelar.addEventListener('click', () => {
        window.location.reload(); // Simplesmente recarrega a página para cancelar
    });
}

// Função para salvar as alterações
async function salvarAlteracoes() {
    const inputs = document.querySelectorAll('.input-qtd-edicao');
    const itensAtualizados = [];

    // Itera sobre os itens que ainda estão na lista de edição
    itensEmEdicao.forEach((item, index) => {
        // Encontra o input correspondente na tabela
        const row = document.querySelector(`tr[data-index="${index}"]`);
        const input = row ? row.querySelector('.input-qtd-edicao') : null;

        if (input) {
            const novaQtd = parseInt(input.value, 10);
            if (!isNaN(novaQtd) && novaQtd > 0) {
                item.quantidade = novaQtd;
                itensAtualizados.push(item);
            }
            // Se a quantidade for 0 ou inválida, o item simplesmente não é adicionado à lista final,
            // efetivamente o removendo.
        }
    });

    // Atualizar no banco de dados
    const form = document.getElementById('form-aprovacao');
    const id = form.dataset.solicitacaoId;
    
    const { error } = await supabase
        .from('solicitacoes')
        .update({ itens: itensAtualizados, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error("Erro ao salvar alterações:", error);
        alert('Erro ao salvar as alterações. Verifique o console.');
        return;
    }

    alert('Alterações salvas com sucesso!');
    isEditing = false;
    document.getElementById('btn-editar-itens').textContent = '✏️Editar Itens';

    // Remove o botão de cancelar e recarrega os detalhes
    const btnCancelar = document.getElementById('btn-cancelar-edicao');
    if (btnCancelar) btnCancelar.remove();
    await carregarDetalhesSolicitacao();
}
