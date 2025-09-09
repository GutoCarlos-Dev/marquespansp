// Lógica para a página de Solicitação do Técnico
// Comentários em português

let itensSelecionados = [];

// Função para carregar grid de itens vazia com botão adicionar
function carregarGridItens() {
    const container = document.getElementById('itens-grid');
    container.innerHTML = '';

    // Cabeçalho do grid com botão e total
    const gridHeader = document.createElement('div');
    gridHeader.className = 'itens-grid-header';

    // Botão para abrir modal de seleção de peças
    const btnAdicionar = document.createElement('button');
    btnAdicionar.textContent = 'Adicionar Peça';
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

    // --- NOVO CAMPO DE BUSCA ---
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const inputBusca = document.createElement('input');
    inputBusca.type = 'text';
    inputBusca.placeholder = 'Digite o código ou nome da peça...';
    searchContainer.appendChild(inputBusca);

    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchContainer.appendChild(searchResults);
    
    modalContent.appendChild(searchContainer);
    // --- FIM DO CAMPO DE BUSCA ---

    // Input quantidade
    const inputQtd = document.createElement('input');
    inputQtd.type = 'number';
    inputQtd.min = '1';
    inputQtd.value = '1';
    inputQtd.placeholder = 'Quantidade';
    modalContent.appendChild(inputQtd);

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

    // Evento de busca ao digitar
    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        pecaSelecionada = null; // Limpa seleção anterior

        if (termo.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const pecas = JSON.parse(localStorage.getItem('pecas')) || [];
        const resultadosFiltrados = pecas.filter(p => 
            p.nome.toLowerCase().includes(termo) || 
            p.codigo.toLowerCase().includes(termo)
        );

        if (resultadosFiltrados.length > 0) {
            searchResults.style.display = 'block';
            resultadosFiltrados.forEach(p => {
                const itemResultado = document.createElement('div');
                itemResultado.className = 'search-result-item';
                itemResultado.textContent = `${p.codigo} - ${p.nome}`;
                itemResultado.addEventListener('click', () => {
                    inputBusca.value = p.nome;
                    pecaSelecionada = p; // Guarda a peça inteira
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                });
                searchResults.appendChild(itemResultado);
            });
        } else {
            searchResults.style.display = 'none';
        }
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
        pecaSelecionada = null;
        inputBusca.focus();
    });

    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('ativo');
        // Remove o modal do DOM após a animação de fade-out
        setTimeout(() => document.body.removeChild(modal), 300);
    });
}

document.addEventListener('DOMContentLoaded', () => {
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

    // Gerar código incremental da solicitação
    const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
    const numeroSolicitacao = solicitacoes.length + 1;
    const codigoSolicitacao = `${numeroSolicitacao.toString().padStart(3, '0')}`;
    document.getElementById('codigo-solicitacao').value = codigoSolicitacao;

    // Preencher nome do técnico
    document.getElementById('nome-tecnico').value = usuarioLogado.nome;

    // Preencher placa (se for técnico)
    if (usuarioLogado.placa) {
        document.getElementById('placa').value = usuarioLogado.placa;
    }

    // Preencher supervisor (buscar supervisor no localStorage)
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const supervisor = usuarios.find(u => u.nivel === 'supervisor');
    if (supervisor) {
        document.getElementById('supervisor').value = supervisor.nome;
    }

    carregarGridItens();

    // Aqui você pode adicionar lógica para salvar a solicitação com os itens selecionados
    document.getElementById('form-solicitacao').addEventListener('submit', function(e) {
        e.preventDefault();

        // Verificar se modal está aberto, impedir salvar enquanto modal aberto
        if (document.getElementById('modal-adicionar')) {
            alert('Finalize a adição de peças antes de salvar a solicitação.');
            return;
        }

        // Exemplo simples de salvar no localStorage
        const codigo = document.getElementById('codigo-solicitacao').value;
        const dataHoraSolicitacao = document.getElementById('data-hora-solicitacao').value;
        const nomeTecnico = document.getElementById('nome-tecnico').value;
        const status = document.getElementById('status').value;
        const placa = document.getElementById('placa').value;
        const supervisor = document.getElementById('supervisor').value;

        if (itensSelecionados.length === 0) {
            abrirModalAdicionar();
            return;
        }

        const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes')) || [];
        const novaSolicitacao = {
            id: Date.now(),
            codigo,
            dataHoraSolicitacao,
            nomeTecnico,
            status,
            placa,
            supervisor,
            itens: itensSelecionados
        };

        solicitacoes.push(novaSolicitacao);
        localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes));
        alert('Solicitação salva com sucesso!');
        // Redirecionar para dashboard após salvar
        window.location.href = 'dashboard.html';
    });

    // Adicionar evento para botão cancelar
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
});
