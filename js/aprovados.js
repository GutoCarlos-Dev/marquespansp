// Solicitações Aprovadas - Lógica
// Para Matriz

let todosVeiculos = [];
let todosSupervisores = [];

// Carregar opções de filtros
async function carregarOpcoesFiltros() {
    // Carregar placas
    const { data: veiculosData, error: veiculosError } = await supabase
        .from('veiculos')
        .select('id, placa')
        .order('placa');

    if (veiculosError) {
        console.error('Erro ao carregar veículos:', veiculosError);
    } else {
        todosVeiculos = veiculosData;
        const selectPlaca = document.getElementById('placa');
        todosVeiculos.forEach(veiculo => {
            const option = document.createElement('option');
            option.value = veiculo.placa;
            option.textContent = veiculo.placa;
            selectPlaca.appendChild(option);
        });
    }

    // Carregar supervisores
    const { data: supervisoresData, error: supervisoresError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('nivel', 'supervisor')
        .order('nome');

    if (supervisoresError) {
        console.error('Erro ao carregar supervisores:', supervisoresError);
    } else {
        todosSupervisores = supervisoresData;
        const selectSupervisor = document.getElementById('supervisor');
        todosSupervisores.forEach(sup => {
            const option = document.createElement('option');
            option.value = sup.nome;
            option.textContent = sup.nome;
            selectSupervisor.appendChild(option);
        });
    }
}

async function buscarSolicitacoes() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const status = document.getElementById('status').value;
    const placa = document.getElementById('placa').value;
    const supervisor = document.getElementById('supervisor').value;
    const codigo = document.getElementById('codigo').value;
    const tbody = document.querySelector('#tabela-aprovados tbody');
    tbody.innerHTML = '<tr><td colspan="8">Buscando...</td></tr>';

    let query = supabase
        .from('solicitacoes')
        .select(`
            id, data_aprovacao, status, data_envio,
            usuario:usuario_id ( nome ),
            veiculo:veiculo_id ( placa, supervisor:supervisor_id ( nome ) )
        `)
        .in('status', ['aprovado', 'rejeitado', 'enviado']);

    // Aplicar filtros dinamicamente
    if (dataInicio) {
        query = query.gte('data_aprovacao', dataInicio);
    }
    if (dataFim) {
        // Adiciona 1 dia para incluir o dia final na busca
        const dataFimObj = new Date(dataFim);
        dataFimObj.setDate(dataFimObj.getDate() + 1);
        query = query.lte('data_aprovacao', dataFimObj.toISOString().split('T')[0]);
    }
    if (status) {
        query = query.eq('status', status.toLowerCase());
    }
    if (placa) {
        const veiculoFiltrado = todosVeiculos.find(v => v.placa === placa);
        if (veiculoFiltrado) {
            query = query.eq('veiculo_id', veiculoFiltrado.id);
        }
    }
    if (supervisor) {
        const supervisorFiltrado = todosSupervisores.find(s => s.nome === supervisor);
        if (supervisorFiltrado) {
            // Busca veículos daquele supervisor
            const { data: veiculosDoSupervisor } = await supabase.from('veiculos').select('id').eq('supervisor_id', supervisorFiltrado.id);
            const veiculoIds = veiculosDoSupervisor.map(v => v.id);
            if (veiculoIds.length > 0) {
                query = query.in('veiculo_id', veiculoIds);
            } else {
                // Se o supervisor não tem veículos, nenhuma solicitação será encontrada
                exibirSolicitacoes([]);
                return;
            }
        }
    }
    if (codigo) {
        query = query.eq('id', codigo);
    }

    const { data: solicitacoes, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao buscar solicitações:", error);
        tbody.innerHTML = '<tr><td colspan="8">Erro ao carregar dados.</td></tr>';
        return;
    }

    exibirSolicitacoes(solicitacoes);
}

// Exibir solicitações na tabela
function exibirSolicitacoes(solicitacoes) {
    const tbody = document.querySelector('#tabela-aprovados tbody');
    tbody.innerHTML = '';

    if (solicitacoes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Nenhuma solicitação encontrada.</td></tr>';
        return;
    }

    // Pega o usuário logado para verificar o nível de acesso
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    solicitacoes.forEach(solicitacao => {
        const tr = document.createElement('tr');
        if (solicitacao.status === 'rejeitado') {
            tr.classList.add('status-rejeitado');
        }

        const dataFormatada = solicitacao.data_aprovacao ? new Date(solicitacao.data_aprovacao).toLocaleDateString('pt-BR') : '';
        const dataEnvioFormatada = solicitacao.data_envio ? new Date(solicitacao.data_envio).toLocaleString('pt-BR') : '';

        let acaoBotao = '';
        if (solicitacao.status === 'enviado') {
            acaoBotao = `<button onclick="enviarSolicitacao('${solicitacao.id}')" class="btn-pdf">Baixar PDF</button>`;
        } else if (solicitacao.status === 'rejeitado') {
            acaoBotao = `<button onclick="verDetalhes('${solicitacao.id}')" class="btn-detalhes-rejeitado">Detalhes</button>`;
        } else { // 'aprovado'
            acaoBotao = `<button onclick="enviarSolicitacao('${solicitacao.id}')" class="btn-enviar">Enviar Solicitação</button>`;
        }

        // Adiciona o botão de excluir apenas para o administrador
        if (usuarioLogado && usuarioLogado.nivel === 'administrador') {
            acaoBotao += ` <button onclick="excluirSolicitacao(${solicitacao.id})" class="btn-excluir-grid">Excluir</button>`;
        }

        tr.innerHTML = `
            <td>${String(solicitacao.id).padStart(5, '0')}</td>
            <td>${dataFormatada}</td>
            <td>${solicitacao.usuario?.nome || 'N/A'}</td>
            <td>${solicitacao.veiculo?.placa || 'N/A'}</td>
            <td>${solicitacao.veiculo?.supervisor?.nome || 'N/A'}</td>
            <td>${solicitacao.status}</td>
            <td>${dataEnvioFormatada}</td>
            <td>${acaoBotao}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Enviar solicitação - abre nova página
function enviarSolicitacao(id) {
    window.open(`envio_solicitacao.html?id=${id}`, '_blank');
}

// Ver detalhes da solicitação - abre nova página
function verDetalhes(id) {
    window.open(`detalhes_solicitacao.html?id=${id}`, '_blank');
}

// Função para excluir uma solicitação (apenas para admin)
async function excluirSolicitacao(id) {
    if (confirm('Deseja realmente excluir este lançamento?')) {
        const { error } = await supabase
            .from('solicitacoes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir solicitação:', error);
            alert('Erro ao excluir a solicitação.');
        } else {
            alert('Solicitação excluída com sucesso!');
            buscarSolicitacoes(); // Recarrega o grid para refletir a exclusão
        }
    }
}

// Função para enviar solicitações em massa
async function enviarSolicitacoesEmMassa() {
    // 1. Pega todas as solicitações exibidas na tabela que têm status 'aprovado'
    const tbody = document.querySelector('#tabela-aprovados tbody');
    const linhas = Array.from(tbody.querySelectorAll('tr'));
    const solicitacoesAprovadas = [];

    linhas.forEach(linha => {
        const statusCell = linha.querySelector('td:nth-child(6)'); // A 6ª célula contém o status
        if (statusCell && statusCell.textContent.toLowerCase() === 'aprovado') {
            const codigoSolicitacao = linha.querySelector('td:first-child').textContent;
            // Remove preenchimento com zeros a esquerda
            const idSolicitacao = parseInt(codigoSolicitacao, 10);
            if (!isNaN(idSolicitacao)) {
                solicitacoesAprovadas.push(idSolicitacao);
            }
        }
    });

    if (solicitacoesAprovadas.length === 0) {
        alert('Nenhuma solicitação com status "Aprovado" foi encontrada na tabela.');
        return;
    }

    if (!confirm(`Deseja marcar ${solicitacoesAprovadas.length} solicitações como "Enviado" e gerar os PDFs?`)) {
        return;
    }

    // 2. Para cada solicitação, atualizar o status para 'enviado' e gerar o PDF
    for (const id of solicitacoesAprovadas) {
        try {
            // a) Atualiza o status no banco de dados
            const { error } = await supabase
                .from('solicitacoes')
                .update({
                    status: 'enviado',
                    data_envio: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) {
                console.error(`Erro ao atualizar solicitação ${id}:`, error);
                alert(`Erro ao atualizar solicitação ${id}. Veja o console para detalhes.`);
                continue; // Vai para a próxima solicitação em caso de falha
            }

            // b) Simula clique no botão de "Baixar PDF" (substitua pela lógica real de geração do PDF se necessário)
            // NOTE: A geração do PDF aqui é síncrona, o que pode ser problemático para grandes volumes.
            //       Idealmente, mover isso para um background worker ou fila.
            window.open(`envio_solicitacao.html?id=${id}`, '_blank');

        } catch (generalError) {
            console.error(`Erro geral ao processar solicitação ${id}:`, generalError);
            alert(`Erro geral ao processar solicitação ${id}. Veja o console para detalhes.`);
        }
    }

    // 3. Recarrega a tabela para refletir as mudanças
    alert('Processamento em massa concluído. Verifique os logs para detalhes de erros.');
    buscarSolicitacoes();
}



// Função para exportar os dados da tabela para um arquivo .xlsx
function exportarParaPlanilha() {
    // Pega a tabela visível na página
    const tabela = document.getElementById('tabela-aprovados');
    
    // Clona a tabela para poder remover a coluna de ações sem afetar a exibição
    const tabelaClone = tabela.cloneNode(true);

    // Remove a última coluna (Ações) do cabeçalho e de cada linha do corpo da tabela clonada
    tabelaClone.querySelector('thead tr').deleteCell(-1);
    tabelaClone.querySelectorAll('tbody tr').forEach(row => {
        row.deleteCell(-1);
    });

    // Converte o elemento da tabela clonada em uma planilha do Excel
    const workbook = XLSX.utils.table_to_book(tabelaClone, { sheet: "Solicitações" });

    // Gera o arquivo .xlsx e inicia o download
    XLSX.writeFile(workbook, "Relatorio_Solicitacoes.xlsx");
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    carregarOpcoesFiltros();  
    document.getElementById('btn-buscar').addEventListener('click', buscarSolicitacoes);
    document.getElementById('btn-exportar').addEventListener('click', exportarParaPlanilha);
    document.getElementById('btn-enviar-massa').addEventListener('click', enviarSolicitacoesEmMassa);
    buscarSolicitacoes(); // Carregar todas inicialmente
});
