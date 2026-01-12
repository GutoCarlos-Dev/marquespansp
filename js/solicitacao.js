// Lógica para a página de Solicitação do Técnico
// Comentários em português

let todosVeiculos = []; // Cache para os dados dos veículos
let itensSelecionados = [];

// Função para gerar PDF
async function gerarPDF() {
    // Simular dados para o PDF (como não há solicitação salva, usar dados da tela)
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const solicitacao = {
        id: '00000', // Placeholder
        created_at: new Date().toISOString(),
        status: 'pendente',
        rota: '', // Não definido ainda
        itens: itensSelecionados,
        usuario: { nome: usuarioLogado?.nome || 'N/A' },
        veiculo: {
            placa: document.getElementById('placa')?.selectedOptions[0]?.text || 'N/A',
            qtd_equipe: 'N/A', // Não disponível na criação
            supervisor: { nome: document.getElementById('supervisor')?.value || 'N/A' }
        }
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- CABEÇALHO ---

    // IMPORTANTE: Para usar seu logo 'logo.png', converta-o para o formato Base64.
    // 1. Acesse um conversor online como: https://www.base64-image.de/
    // 2. Envie seu arquivo 'logo.png'.
    // 3. Copie o texto gerado e cole-o dentro das aspas da variável 'logoBase64' abaixo.
    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXQAAABKCAYAAACrZK86AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABSSURBVHhe7cExAQAAAMKg9U9tCF8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwZ08AAQAB2ds4AAAAAElFTkSuQmCC'; // Substitua este conteúdo
    const placeholderLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXQAAABKCAYAAACrZK86AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABSSURBVHhe7cExAQAAAMKg9U9tCF8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwZ08AAQAB2ds4AAAAAElFTkSuQmCC';

    // Adiciona a logo apenas se não for o placeholder, tratando possíveis erros.
    if (logoBase64 && logoBase64 !== placeholderLogo) {
        try {
            doc.addImage(logoBase64, 'PNG', 150, 8, 45, 15);
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
            tituloPDF = 'Detalhes da Solicitação';
            tituloCor = '#2196F3'; // Azul
            break;
    }
    // Título do Documento
    doc.setFontSize(20);
    doc.setTextColor(tituloCor);
    doc.setFont('helvetica', 'bold');
    doc.text(tituloPDF, 14, 20);

    // Linha divisória
    doc.setDrawColor(76, 175, 80);
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
        startY: startY + 15, // Posição inicial da tabela ajustada para depois do total
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] },
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 2 }, // Fonte e padding reduzidos para caber mais itens
        margin: { bottom: 20 } // Margem inferior para o rodapé
    });

    // --- RODAPÉ ---
    const pageCount = doc.internal.getNumberOfPages();
    const codigoSolicitacaoFormatado = String(solicitacao.id).padStart(5, '0');

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // --- INFORMAÇÕES DO DOCUMENTO ---
        doc.setFontSize(8);
        doc.setTextColor(150);

        const textoData = `Documento gerado em: ${new Date().toLocaleString('pt-BR')}`;

        // Se houver mais de uma página, adiciona o código da solicitação em negrito
        if (pageCount > 1) {
            doc.setFont('helvetica', 'normal');
            doc.text(textoData, 14, 287);

            const textoCodigo = ` (Código da Solicitação: ${codigoSolicitacaoFormatado})`;
            doc.setFont('helvetica', 'bold');
            doc.text(textoCodigo, 14 + doc.getTextWidth(textoData), 287);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.text(textoData, 14, 287);
        }

        // Restaura a fonte para normal para a paginação
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: 'right' });
    }

    // Salvar o PDF
    doc.save(`solicitacao_${String(solicitacao.id).padStart(5, '0')}.pdf`);
}

// Função para carregar grid de itens vazia com botão adicionar
function carregarGridItens() {
    const container = document.getElementById('itens-grid');
    container.innerHTML = '';

    // Cabeçalho do grid com botão e total
    const gridHeader = document.createElement('div');
    gridHeader.className = 'itens-grid-header';

    // Botão para abrir modal de seleção de peças
    const btnAdicionar = document.createElement('button');
    btnAdicionar.textContent = 'Incluir Peça';
    btnAdicionar.type = 'button'; // Ensure it does not submit form
    btnAdicionar.addEventListener('click', abrirModalAdicionar);
    gridHeader.appendChild(btnAdicionar);

    // Label para o total de peças
    if (itensSelecionados.length > 0) {
        const totalQuantidade = itensSelecionados.reduce((total, item) => total + item.quantidade, 0);
        const totalLabel = document.createElement('div');
        totalLabel.className = 'total-pecas-label';
        totalLabel.innerHTML = `Total de Peças: <strong>${totalQuantidade}</strong>`;
        gridHeader.appendChild(totalLabel);
    }
    container.appendChild(gridHeader);
    // Lista de itens selecionados
    if (itensSelecionados.length > 0) {
        const tabela = document.createElement('table');
        tabela.innerHTML = `
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nome da Peça</th>
                    <th>Quantidade</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${itensSelecionados.map((item, index) => `
                    <tr>
                        <td>${item.codigo}</td>
                        <td>${item.nome}</td>
                        <td><input type="number" min="1" value="${item.quantidade}" data-index="${index}" class="input-quantidade" style="width: 60px;"></td>
                        <td>
                            <button data-index="${index}" class="btn-remover" type="button">Remover</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        container.appendChild(tabela);

        // Adicionar evento para remover itens
        tabela.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                itensSelecionados.splice(idx, 1);
                carregarGridItens();
            });
        });

        // Adicionar evento para editar quantidade
        tabela.querySelectorAll('.input-quantidade').forEach(input => {
            input.addEventListener('change', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                const novaQtd = parseInt(this.value);
                if (novaQtd > 0) {
                    itensSelecionados[idx].quantidade = novaQtd;
                } else {
                    alert('Quantidade deve ser maior que zero.');
                    this.value = itensSelecionados[idx].quantidade;
                }
            });
        });
    }
}

// Função para abrir modal de seleção de peças
function abrirModalAdicionar() {
    // Evitar múltiplos modais
    if (document.getElementById('modal-adicionar')) return;

    let pecaSelecionada = null; // Variável para guardar a peça escolhida na busca

    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'modal-adicionar';
    modal.className = 'modal-overlay';

    // Conteúdo do modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Título
    const titulo = document.createElement('h3');
    titulo.textContent = 'Adicionar Peça';
    modalContent.appendChild(titulo);

    // --- Container para os inputs lado a lado ---
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'modal-inputs-container';

    // --- Grupo da Peça (Esquerda) ---
    const pecaGroup = document.createElement('div');
    pecaGroup.className = 'modal-input-group peca-group';
    
    const pecaLabel = document.createElement('label');
    pecaLabel.textContent = 'Peça';
    pecaGroup.appendChild(pecaLabel);

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const inputBusca = document.createElement('input');
    inputBusca.type = 'text';
    inputBusca.placeholder = 'Digite o código ou nome...';
    searchContainer.appendChild(inputBusca);

    const btnListarTudo = document.createElement('button');
    btnListarTudo.type = 'button';
    btnListarTudo.className = 'btn-listar-tudo';
    btnListarTudo.innerHTML = '&#9662;';
    searchContainer.appendChild(btnListarTudo);

    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
    
    pecaGroup.appendChild(searchContainer);
    inputsContainer.appendChild(pecaGroup);

    // --- Grupo da Quantidade (Direita) ---
    const qtdGroup = document.createElement('div');
    qtdGroup.className = 'modal-input-group qtd-group';

    const qtdLabel = document.createElement('label');
    qtdLabel.textContent = 'Quantidade';
    qtdGroup.appendChild(qtdLabel);

    const inputQtd = document.createElement('input');
    inputQtd.type = 'number';
    inputQtd.min = '1';
    inputQtd.value = '1';
    inputQtd.placeholder = 'Qtd';
    qtdGroup.appendChild(inputQtd);

    inputsContainer.appendChild(qtdGroup);
    modalContent.appendChild(inputsContainer);

    // Botões
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'modal-actions';

    const btnAdicionar = document.createElement('button');
    btnAdicionar.textContent = 'Adicionar';

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.className = 'btn-secundario';

    actionsDiv.appendChild(btnCancelar);
    actionsDiv.appendChild(btnAdicionar);
    modalContent.appendChild(actionsDiv);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    // Adiciona a classe para ativar a animação de fade-in
    setTimeout(() => modal.classList.add('ativo'), 10);
    inputBusca.focus();

    // Função para limpar seleção de peça
    function limparSelecaoPeca() {
        pecaSelecionada = null;
        searchContainer.classList.remove('selected');
    }

    // Evento de busca ao digitar
    inputBusca.addEventListener('input', async () => {
        const termo = inputBusca.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        // Se o usuário está digitando, limpa a seleção anterior
        if (termo !== (pecaSelecionada ? pecaSelecionada.nome : '')) {
            limparSelecaoPeca();
        }

        if (termo.length < 1) {
            searchResults.style.display = 'none';
            return;
        }

        // Busca peças no Supabase
        const { data: resultadosFiltrados, error } = await supabase
            .from('pecas')
            .select('id, codigo, nome')
            .or(`nome.ilike.%${termo}%,codigo.ilike.%${termo}%`) // ilike é case-insensitive
            .limit(10);

        if (error) {
            console.error('Erro ao buscar peças:', error);
            return;
        }

        if (resultadosFiltrados.length > 0) {
            searchResults.style.display = 'block';
            resultadosFiltrados.forEach(p => {
                const itemResultado = document.createElement('div');
                itemResultado.className = 'search-result-item';
                itemResultado.textContent = `${p.codigo} - ${p.nome}`;
                itemResultado.onclick = () => {
                    inputBusca.value = p.nome;
                    pecaSelecionada = p; // Guarda a peça inteira
                    searchContainer.classList.add('selected'); // Adiciona feedback visual
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';

                    // Feedback adicional para mobile
                    if (window.innerWidth <= 768) {
                        // Pequena vibração/visual feedback
                        inputBusca.style.transform = 'scale(1.02)';
                        setTimeout(() => {
                            inputBusca.style.transform = 'scale(1)';
                        }, 150);
                    }
                };
                searchResults.appendChild(itemResultado);
            });
        } else {
            searchResults.style.display = 'none';
        }
    });

    // Evento para o botão de listar tudo
    btnListarTudo.addEventListener('click', async () => {
        // Se os resultados já estiverem visíveis, esconde
        if (searchResults.style.display === 'block') {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.innerHTML = 'Carregando...';
        searchResults.style.display = 'block';
        limparSelecaoPeca(); // Limpa seleção anterior

        const { data: todasAsPecas, error } = await supabase
            .from('pecas')
            .select('id, codigo, nome')
            .order('nome');

        if (error) {
            console.error('Erro ao buscar todas as peças:', error);
            searchResults.innerHTML = 'Erro ao carregar.';
            return;
        }

        searchResults.innerHTML = ''; // Limpa o "Carregando..."

        todasAsPecas.forEach(p => {
            const itemResultado = document.createElement('div');
            itemResultado.className = 'search-result-item';
            itemResultado.textContent = `${p.codigo} - ${p.nome}`;
            itemResultado.onclick = () => {
                inputBusca.value = p.nome;
                pecaSelecionada = p;
                searchContainer.classList.add('selected'); // Adiciona feedback visual
                searchResults.style.display = 'none';

                // Feedback adicional para mobile
                if (window.innerWidth <= 768) {
                    // Pequena vibração/visual feedback
                    inputBusca.style.transform = 'scale(1.02)';
                    setTimeout(() => {
                        inputBusca.style.transform = 'scale(1)';
                    }, 150);
                }
            };
            searchResults.appendChild(itemResultado);
        });
    });

    // Eventos dos botões
    btnAdicionar.addEventListener('click', () => {
        const quantidade = parseInt(inputQtd.value);

        if (!pecaSelecionada) {
            alert('Busque e selecione uma peça da lista.');
            inputBusca.focus();
            return;
        }
        if (!quantidade || quantidade < 1) {
            alert('Informe uma quantidade válida.');
            return;
        }

        // Adicionar ou atualizar item na lista
        const itemExistenteIndex = itensSelecionados.findIndex(i => i.codigo === pecaSelecionada.codigo);
        if (itemExistenteIndex !== -1) {
            // Se o item já existe, apenas soma a quantidade
            itensSelecionados[itemExistenteIndex].quantidade += quantidade;
        } else {
            itensSelecionados.push({
                codigo: pecaSelecionada.codigo,
                nome: pecaSelecionada.nome,
                quantidade: quantidade
            });
        }

        carregarGridItens();

        // Limpar campos para adicionar outra peça
        inputBusca.value = '';
        inputQtd.value = '1';
        limparSelecaoPeca();
        inputBusca.focus();

        // Feedback visual de sucesso
        btnAdicionar.style.backgroundColor = '#4CAF50';
        btnAdicionar.textContent = '✓ Adicionada!';
        setTimeout(() => {
            btnAdicionar.textContent = 'Adicionar';
        }, 1000);
    });

    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('ativo');
        // Remove o modal do DOM após a animação de fade-out
        setTimeout(() => document.body.removeChild(modal), 300);
    });

    // Evento para fechar modal ao clicar no overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('ativo');
            setTimeout(() => document.body.removeChild(modal), 300);
        }
    });
}

// Função para carregar os veículos no dropdown
async function carregarVeiculos(usuario) { // Passa o objeto do usuário logado
    const selectPlaca = document.getElementById('placa');
    const supervisorInput = document.getElementById('supervisor');
    if (!selectPlaca || !supervisorInput || !supabase) return;

    let query = supabase
        .from('veiculos')
        .select('id, placa, supervisor:supervisor_id(nome)');

    // Filtra os veículos de acordo com o nível do usuário
    if (usuario.nivel === 'tecnico') {
        query = query.eq('tecnico_id', usuario.id);
    } else if (usuario.nivel === 'supervisor') {
        // Um supervisor pode solicitar para qualquer veículo que ele supervisiona
        query = query.eq('supervisor_id', usuario.id);
    }
    // Para 'administrador' e 'matriz', não aplica filtro, buscando todos os veículos.

    const { data, error } = await query.order('placa');

    if (error) {
        console.error('Erro ao carregar veículos:', error);
        selectPlaca.innerHTML = '<option value="">Erro ao carregar</option>';
        return;
    }

    todosVeiculos = data || []; // Salva no cache
    selectPlaca.innerHTML = '<option value="">Selecione um veículo</option>';
    todosVeiculos.forEach(veiculo => {
        const option = document.createElement('option');
        option.value = veiculo.id;
        option.textContent = veiculo.placa;
        selectPlaca.appendChild(option);
    });

    // Lógica de pré-seleção para técnico e supervisor
    if (usuario.nivel === 'tecnico' || usuario.nivel === 'supervisor') {
        if (todosVeiculos.length > 0) {
            // Se o usuário tem veículos associados, seleciona o primeiro da lista
            const veiculoPadrao = todosVeiculos[0];
            selectPlaca.value = veiculoPadrao.id;
            supervisorInput.value = veiculoPadrao.supervisor?.nome || 'Sem supervisor';

            // Desabilita o campo para que não possa ser alterado
            selectPlaca.disabled = true;
            selectPlaca.classList.add('readonly-field'); // Adiciona classe para estilo visual
        } else {
            // Se não houver veículos associados, informa o usuário
            selectPlaca.innerHTML = '<option value="">Nenhum veículo associado</option>';
            selectPlaca.disabled = true;
            supervisorInput.value = '';
        }
    } else {
        // Lógica para admin/matriz: permitir seleção
        selectPlaca.disabled = false;
        selectPlaca.classList.remove('readonly-field');
        selectPlaca.addEventListener('change', (e) => {
            const veiculoId = e.target.value;
            if (veiculoId) {
                const veiculoSelecionado = todosVeiculos.find(v => v.id == veiculoId);
                supervisorInput.value = veiculoSelecionado?.supervisor?.nome || 'Sem supervisor';
            } else {
                supervisorInput.value = '';
            }
        });
    }
}

// Função para preencher o campo de código da solicitação com um texto padrão
function preencherCodigoSolicitacao() {
    const codigoInput = document.getElementById('codigo-solicitacao');
    if (codigoInput) {
        codigoInput.value = 'Será gerado ao salvar! Anote-o e Informe ao Supervisor para aprovação.';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!supabase) {
        alert('Erro: A conexão com o Supabase não foi inicializada.');
        return;
    }
    // Carregar dados do usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        alert('Usuário não logado. Redirecionando para login.');
        window.location.href = '../index.html';
        return;
    }

    // Definir data e hora atual
    const agora = new Date();
    const dataHoraFormatada = agora.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM
    document.getElementById('data-hora-solicitacao').value = dataHoraFormatada;

    // Preencher nome do técnico
    document.getElementById('nome-tecnico').value = usuarioLogado.nome;

    // Configurar botão Modo APP
    setupBotaoApp();

    // Carregar dados dinâmicos do Supabase
    preencherCodigoSolicitacao(); // Apenas preenche o campo com texto padrão
    await carregarVeiculos(usuarioLogado); // Passa o objeto do usuário logado
    carregarGridItens();

    // Lógica para salvar a solicitação
    document.getElementById('form-solicitacao').addEventListener('submit', async function(e) {
        e.preventDefault();
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        // Verificar se modal está aberto, impedir salvar enquanto modal aberto
        if (document.getElementById('modal-adicionar')) {
            alert('Finalize a adição de peças antes de salvar a solicitação.');
            return;
        }

        if (itensSelecionados.length === 0) {
            alert('Adicione pelo menos uma peça à solicitação.');
            abrirModalAdicionar();
            return;
        }

        const veiculo_id = document.getElementById('placa').value;
        if (!veiculo_id) {
            alert('Selecione um veículo.');
            return;
        }

        const novaSolicitacao = {
            usuario_id: usuarioLogado.id,
            veiculo_id: parseInt(veiculo_id),
            itens: itensSelecionados,
            rota: '' // Adiciona o campo rota como uma string vazia
        };

        const { data, error } = await supabase
            .from('solicitacoes')
            .insert([novaSolicitacao])
            .select('id') // Pede ao Supabase para retornar o ID da solicitação criada
            .single();

        if (error) {
            console.error('Erro ao salvar solicitação:', error);
            alert('Ocorreu um erro ao salvar a solicitação. Tente novamente.');
        } else {
            alert(`Solicitação #${String(data.id).padStart(5, '0')} salva com sucesso!`);
            // Redirecionar para dashboard após salvar
            window.location.href = 'dashboard.html';
        }
    });

    // Evento para botão cancelar
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
});

function setupBotaoApp() {
    const tituloPagina = document.querySelector('main h2');
    if (tituloPagina && !document.getElementById('btn-modo-app')) {
        const btnApp = document.createElement('button');
        btnApp.id = 'btn-modo-app';
        btnApp.innerHTML = '📱 Modo APP';
        btnApp.style.marginLeft = '15px';
        btnApp.style.padding = '6px 12px';
        btnApp.style.backgroundColor = '#4CAF50';
        btnApp.style.color = 'white';
        btnApp.style.border = 'none';
        btnApp.style.borderRadius = '20px';
        btnApp.style.cursor = 'pointer';
        btnApp.style.fontSize = '0.9rem';
        btnApp.style.verticalAlign = 'middle';
        
        btnApp.onclick = () => window.location.href = 'solicitacao_app.html';
        
        tituloPagina.appendChild(btnApp);
    }
}
