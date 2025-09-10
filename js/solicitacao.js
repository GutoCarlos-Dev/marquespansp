// Lógica para a página de Solicitação do Técnico
// Comentários em português

let todosVeiculos = []; // Cache para os dados dos veículos
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

    // Evento de busca ao digitar
    inputBusca.addEventListener('input', async () => {
        const termo = inputBusca.value.toLowerCase().trim();
        searchResults.innerHTML = '';
        pecaSelecionada = null; // Limpa seleção anterior

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
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                }; // Correção: O fechamento de uma atribuição de função é com '};' e não '});'
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
        pecaSelecionada = null;

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
                searchResults.style.display = 'none';
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
        pecaSelecionada = null;
        inputBusca.focus();
    });

    btnCancelar.addEventListener('click', () => {
        modal.classList.remove('ativo');
        // Remove o modal do DOM após a animação de fade-out
        setTimeout(() => document.body.removeChild(modal), 300);
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

// Função para gerar o próximo código de solicitação
async function gerarCodigoSolicitacao() {
    const codigoInput = document.getElementById('codigo-solicitacao');
    if (!codigoInput || !supabase) return;

    // Pega a contagem total de solicitações para gerar o próximo número
    const { count, error } = await supabase
        .from('solicitacoes')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Erro ao gerar código da solicitação:', error);
        codigoInput.value = 'ERRO';
        return;
    }

    const proximoNumero = (count || 0) + 1;
    codigoInput.value = proximoNumero.toString().padStart(1, '');
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

    // Carregar dados dinâmicos do Supabase
    await gerarCodigoSolicitacao();
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

        const { error } = await supabase
            .from('solicitacoes')
            .insert([novaSolicitacao]);

        if (error) {
            console.error('Erro ao salvar solicitação:', error);
            alert('Ocorreu um erro ao salvar a solicitação. Tente novamente.');
        } else {
            alert('Solicitação salva com sucesso!');
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
