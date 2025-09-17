// js/cadastro_veiculos.js
// Lógica do cadastro de veículos, agora com SupaBase

let veiculos = []; // Cache local dos veículos para edição e preenchimento de formulário
let editandoId = null;

// Função para carregar supervisores no select
async function carregarSupervisores() {
    if (!supabase) return;
    const select = document.getElementById('supervisor');
    select.innerHTML = '<option value="">Selecione um supervisor</option>';

    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('nivel', 'supervisor')
        .order('nome');

    if (error) {
        console.error('Erro ao carregar supervisores:', error);
        return;
    }

    data.forEach(sup => {
        const option = document.createElement('option');
        option.value = sup.id;
        option.textContent = sup.nome;
        select.appendChild(option);
    });
}

// Função para carregar técnicos no select
async function carregarTecnicos() {
    if (!supabase) return;
    const select = document.getElementById('tecnico');
    select.innerHTML = '<option value="">Selecione um técnico</option>';

    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('nivel', 'tecnico')
        .order('nome');

    if (error) {
        console.error('Erro ao carregar técnicos:', error);
        return;
    }

    data.forEach(tec => {
        const option = document.createElement('option');
        option.value = tec.id;
        option.textContent = tec.nome;
        select.appendChild(option);
    });
}

// Função para salvar veículo (adicionar ou editar)
document.getElementById('form-veiculo').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!supabase) {
        alert('Erro: A conexão com o Supabase não foi inicializada.');
        return;
    }

    const placa = document.getElementById('placa').value;
    const qtd_equipe = document.getElementById('qtd_equipe').value;
    const supervisor_id = document.getElementById('supervisor').value;
    const tecnico_id = document.getElementById('tecnico').value;

    const veiculoData = {
        placa,
        qtd_equipe: parseInt(qtd_equipe) || null,
        supervisor_id: parseInt(supervisor_id) || null,
        tecnico_id: parseInt(tecnico_id) || null,
    };

    let error;

    if (editandoId) {
        // Editando
        const { error: updateError } = await supabase
            .from('veiculos')
            .update(veiculoData)
            .eq('id', editandoId);
        error = updateError;
        editandoId = null;
        document.querySelector('form button[type="submit"]').textContent = '💾 Salvar Veículo';
    } else {
        // Adicionando
        const { error: insertError } = await supabase
            .from('veiculos')
            // O ID não é mais enviado, o banco de dados irá gerá-lo automaticamente.
            .insert([veiculoData]) 
            .select(); 
        error = insertError;
    }

    if (error) {
        console.error('Erro ao salvar veículo:', error);
        alert('Erro ao salvar veículo. Verifique se a placa já existe.');
    } else {
        alert('Veículo salvo com sucesso!');
        this.reset();
        await atualizarTabela();
    }
});

// Função para atualizar tabela
async function atualizarTabela() {
    const tbody = document.querySelector('#tabela-veiculos tbody');
    if (!tbody || !supabase) {
        tbody.innerHTML = '<tr><td colspan="5">Erro: Conexão com o Supabase não inicializada.</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';

    const { data, error } = await supabase
        .from('veiculos')
        .select(`
            id,
            placa,
            qtd_equipe,
            supervisor_id,
            tecnico_id,
            supervisor:supervisor_id ( nome ),
            tecnico:tecnico_id ( nome )
        `)
        .order('placa');

    if (error) {
        console.error('Erro ao buscar veículos:', error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar veículos.</td></tr>';
        return;
    }

    veiculos = data; // Atualiza o cache local
    tbody.innerHTML = '';

    if (veiculos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Nenhum veículo cadastrado.</td></tr>';
        return;
    }

    veiculos.forEach(veiculo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${veiculo.placa}</td>
            <td>${veiculo.qtd_equipe || 0}</td>
            <td>${veiculo.supervisor ? veiculo.supervisor.nome : '-'}</td>
            <td>${veiculo.tecnico ? veiculo.tecnico.nome : '-'}</td>
            <td>
                <button onclick="editarVeiculo(${veiculo.id})" class="btn-editar">✏️Editar</button>
                <button onclick="excluirVeiculo(${veiculo.id})" class="btn-excluir">🗑️Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para preencher formulário para edição
function editarVeiculo(id) {
    const veiculo = veiculos.find(v => v.id === id);
    if (veiculo) {
        document.getElementById('placa').value = veiculo.placa;
        document.getElementById('qtd_equipe').value = veiculo.qtd_equipe;
        document.getElementById('supervisor').value = veiculo.supervisor_id;
        document.getElementById('tecnico').value = veiculo.tecnico_id;

        editandoId = id;
        document.querySelector('form button[type="submit"]').textContent = '🔄 Atualizar Veículo';
        window.scrollTo(0, 0); // Rola a página para o topo para ver o formulário
    }
}

// Função para excluir veículo
async function excluirVeiculo(id) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        if (!supabase) {
            alert('Erro: A conexão com o Supabase não foi inicializada.');
            return;
        }

        const { error } = await supabase
            .from('veiculos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir veículo:', error);
            alert('Erro ao excluir veículo.');
        } else {
            alert('Veículo excluído com sucesso!');
            await atualizarTabela();
        }
    }
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se usuário está logado antes de carregar a página
    if (!JSON.parse(localStorage.getItem('usuarioLogado'))) {
        window.location.href = '../index.html';
        return;
    }
    carregarSupervisores();
    carregarTecnicos();
    atualizarTabela();
});
