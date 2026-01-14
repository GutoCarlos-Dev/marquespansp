// js/solicitacao_app.js

let todosVeiculos = [];
let itensSelecionados = [];
let pecaSelecionadaAtual = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Login
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuarioLogado) {
        window.location.href = '../index.html';
        return;
    }

    // 2. Inicializar UI
    document.getElementById('nome-tecnico').textContent = usuarioLogado.nome;
    document.getElementById('data-hoje').textContent = new Date().toLocaleDateString('pt-BR');

    // 3. Carregar Veículos
    await carregarVeiculos(usuarioLogado);

    // 4. Configurar Eventos
    setupEventos();
});

async function carregarVeiculos(usuario) {
    if (!supabase) {
        alert('Erro de conexão com o banco de dados.');
        return;
    }

    const selectPlaca = document.getElementById('placa');
    const supervisorInput = document.getElementById('supervisor');

    let query = supabase
        .from('veiculos')
        .select('id, placa, supervisor:supervisor_id(nome)');

    // Filtros por nível
    if (usuario.nivel === 'tecnico') {
        query = query.eq('tecnico_id', usuario.id);
    } else if (usuario.nivel === 'supervisor') {
        query = query.eq('supervisor_id', usuario.id);
    }

    const { data, error } = await query.order('placa');

    if (error) {
        console.error('Erro ao carregar veículos:', error);
        selectPlaca.innerHTML = '<option value="">Erro ao carregar</option>';
        return;
    }

    todosVeiculos = data || [];
    selectPlaca.innerHTML = '<option value="">Selecione...</option>';
    
    todosVeiculos.forEach(veiculo => {
        const option = document.createElement('option');
        option.value = veiculo.id;
        option.textContent = veiculo.placa;
        selectPlaca.appendChild(option);
    });

    // Auto-seleção se houver apenas um
    if (todosVeiculos.length === 1) {
        selectPlaca.value = todosVeiculos[0].id;
        supervisorInput.value = todosVeiculos[0].supervisor?.nome || 'Sem supervisor';
    } else if (todosVeiculos.length > 0 && usuario.nivel === 'tecnico') {
        // Se técnico tem mais de um, seleciona o primeiro por padrão
        selectPlaca.value = todosVeiculos[0].id;
        supervisorInput.value = todosVeiculos[0].supervisor?.nome || 'Sem supervisor';
    }

    // Evento de mudança
    selectPlaca.addEventListener('change', (e) => {
        const veiculoId = e.target.value;
        const veiculo = todosVeiculos.find(v => v.id == veiculoId);
        if (veiculo) {
            supervisorInput.value = veiculo.supervisor?.nome || 'Sem supervisor';
        } else {
            supervisorInput.value = '';
        }
    });
}

function setupEventos() {
    // Busca de peças
    const inputBusca = document.getElementById('busca-peca');
    inputBusca.addEventListener('input', debounce(buscarPecas, 500));

    // Adicionar botão de "Listar Tudo" (setinha) ao lado do campo de busca
    if (inputBusca && inputBusca.parentNode) {
        // Criar wrapper para alinhar input e botão
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '8px';
        
        inputBusca.parentNode.insertBefore(wrapper, inputBusca);
        wrapper.appendChild(inputBusca);
        inputBusca.style.flex = '1'; // Input ocupa o espaço restante

        const btnListar = document.createElement('button');
        btnListar.type = 'button';
        btnListar.innerHTML = '&#9662;'; // Seta para baixo
        btnListar.className = 'btn-outline'; // Reutiliza classe existente
        btnListar.style.padding = '0 15px';
        btnListar.style.height = '42px'; // Altura aproximada para alinhar
        btnListar.title = 'Listar todas as peças';
        btnListar.addEventListener('click', listarTodasPecas);
        wrapper.appendChild(btnListar);
    }

    // Botão Salvar
    document.getElementById('btn-salvar').addEventListener('click', salvarSolicitacao);
    
    // Botão Confirmar Item no Modal
    document.getElementById('btn-confirmar-item').addEventListener('click', adicionarItemNaLista);
}

// --- Lógica do Modal e Itens ---

function abrirModalAdicionar() {
    const modal = document.getElementById('modal-adicionar');
    modal.classList.add('active');
    
    // Resetar estado do modal
    document.getElementById('busca-peca').value = '';
    document.getElementById('resultados-busca').innerHTML = '';
    document.getElementById('resultados-busca').style.display = 'none';
    document.getElementById('container-selecao').style.display = 'none';
    document.getElementById('qtd-item').value = 1;
    pecaSelecionadaAtual = null;
    
    // Focar no input
    setTimeout(() => document.getElementById('busca-peca').focus(), 300);
}

function fecharModalAdicionar() {
    document.getElementById('modal-adicionar').classList.remove('active');
}

async function buscarPecas() {
    const termo = document.getElementById('busca-peca').value.trim();
    const resultadosDiv = document.getElementById('resultados-busca');
    
    if (termo.length < 2) {
        resultadosDiv.style.display = 'none';
        return;
    }

    const { data, error } = await supabase
        .from('pecas')
        .select('id, codigo, nome')
        .or(`nome.ilike.%${termo}%,codigo.ilike.%${termo}%`)
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    resultadosDiv.innerHTML = '';
    if (data && data.length > 0) {
        resultadosDiv.style.display = 'block';
        data.forEach(peca => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<strong>${peca.codigo}</strong> - ${peca.nome}`;
            div.onclick = () => selecionarPeca(peca);
            resultadosDiv.appendChild(div);
        });
    } else {
        resultadosDiv.style.display = 'none';
    }
}

async function listarTodasPecas() {
    const resultadosDiv = document.getElementById('resultados-busca');
    resultadosDiv.style.display = 'block';
    resultadosDiv.innerHTML = '<div style="padding:10px; text-align:center; color:#666;">Carregando...</div>';

    const { data, error } = await supabase
        .from('pecas')
        .select('id, codigo, nome')
        .order('nome');

    if (error) {
        console.error(error);
        resultadosDiv.innerHTML = '<div style="padding:10px; text-align:center; color:red;">Erro ao carregar peças.</div>';
        return;
    }

    resultadosDiv.innerHTML = '';
    if (data && data.length > 0) {
        data.forEach(peca => {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<strong>${peca.codigo}</strong> - ${peca.nome}`;
            div.onclick = () => selecionarPeca(peca);
            resultadosDiv.appendChild(div);
        });
    } else {
        resultadosDiv.innerHTML = '<div style="padding:10px; text-align:center;">Nenhuma peça encontrada.</div>';
    }
}

function selecionarPeca(peca) {
    pecaSelecionadaAtual = peca;
    
    // UI Update
    document.getElementById('resultados-busca').style.display = 'none';
    document.getElementById('busca-peca').value = ''; 
    
    document.getElementById('nome-peca-selecionada').textContent = peca.nome;
    document.getElementById('codigo-peca-selecionada').textContent = peca.codigo;
    
    document.getElementById('container-selecao').style.display = 'block';
}

function alterarQtd(delta) {
    const input = document.getElementById('qtd-item');
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    input.value = val;
}

function adicionarItemNaLista() {
    if (!pecaSelecionadaAtual) return;
    
    const qtd = parseInt(document.getElementById('qtd-item').value) || 1;
    
    // Verificar se já existe
    const indexExistente = itensSelecionados.findIndex(i => i.codigo === pecaSelecionadaAtual.codigo);
    
    if (indexExistente >= 0) {
        itensSelecionados[indexExistente].quantidade += qtd;
    } else {
        itensSelecionados.push({
            codigo: pecaSelecionadaAtual.codigo,
            nome: pecaSelecionadaAtual.nome,
            quantidade: qtd
        });
    }
    
    renderizarLista();
    fecharModalAdicionar();
}

function renderizarLista() {
    const container = document.getElementById('lista-itens');
    const contador = document.getElementById('contador-itens');
    
    contador.textContent = itensSelecionados.length;
    container.innerHTML = '';
    
    if (itensSelecionados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Nenhum item adicionado</p>
                <button type="button" class="btn-outline" onclick="abrirModalAdicionar()">+ Adicionar Peça</button>
            </div>`;
        return;
    }
    
    itensSelecionados.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <div class="item-code">${item.codigo}</div>
                <div class="item-name">${item.nome}</div>
            </div>
            <div class="item-actions">
                <div class="item-qtd">${item.quantidade} un</div>
                <button class="btn-delete" onclick="removerItem(${index})">&#128465;</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function removerItem(index) {
    if(confirm('Remover este item?')) {
        itensSelecionados.splice(index, 1);
        renderizarLista();
    }
}

async function salvarSolicitacao() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const veiculoId = document.getElementById('placa').value;
    
    if (!veiculoId) {
        alert('Selecione um veículo!');
        return;
    }
    
    if (itensSelecionados.length === 0) {
        alert('Adicione pelo menos um item!');
        return;
    }
    
    const btnSalvar = document.getElementById('btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Enviando...';
    
    const novaSolicitacao = {
        usuario_id: usuarioLogado.id,
        veiculo_id: parseInt(veiculoId),
        itens: itensSelecionados,
        rota: '',
        status: 'pendente'
    };
    
    const { data, error } = await supabase
        .from('solicitacoes')
        .insert([novaSolicitacao])
        .select('id')
        .single();
        
    if (error) {
        console.error(error);
        alert('Erro ao salvar solicitação.');
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'ENVIAR SOLICITAÇÃO';
    } else {
        alert(`Solicitação #${String(data.id).padStart(5, '0')} enviada com sucesso!`);
        // Limpar tudo
        itensSelecionados = [];
        renderizarLista();
        document.getElementById('placa').value = '';
        document.getElementById('supervisor').value = '';
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'ENVIAR SOLICITAÇÃO';
    }
}

// Util
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}