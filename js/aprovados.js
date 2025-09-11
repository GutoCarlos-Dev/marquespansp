// Solicitações Aprovadas - Lógica
// Para Matriz

let todosVeiculos = [];
let todosUsuariosEnvio = [];
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

    // Carregar usuários de envio (matriz/admin)
    const { data: usuariosEnvioData, error: usuariosEnvioError } = await supabase
        .from('usuarios')
        .select('id, nome')
        .in('nivel', ['matriz', 'administrador'])
        .order('nome');

    if (usuariosEnvioError) {
        console.error('Erro ao carregar usuários de envio:', usuariosEnvioError);
    } else {
        todosUsuariosEnvio = usuariosEnvioData;
        const selectEnviadoPor = document.getElementById('enviado-por');
        todosUsuariosEnvio.forEach(usr => {
            const option = document.createElement('option');
            option.value = usr.nome;
            option.textContent = usr.nome;
            selectEnviadoPor.appendChild(option);
        });
    }
}

async function buscarSolicitacoes() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const status = document.getElementById('status').value;
    const placa = document.getElementById('placa').value;
    const supervisor = document.getElementById('supervisor').value;
    const enviadoPorNome = document.getElementById('enviado-por').value;
    const codigo = document.getElementById('codigo').value;
    const tbody = document.querySelector('#tabela-aprovados tbody');
    tbody.innerHTML = '<tr><td colspan="9">Buscando...</td></tr>';

    let query = supabase
        .from('solicitacoes')
        .select(`
            id, data_aprovacao, status, data_envio, enviado_por_id,
            usuario:usuario_id ( nome ),
            veiculo:veiculo_id ( placa, supervisor:supervisor_id ( nome ) ),
            enviado_por:enviado_por_id ( nome )
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
    if (enviadoPorNome) {
        const usuarioEnvioFiltrado = todosUsuariosEnvio.find(u => u.nome === enviadoPorNome);
        if (usuarioEnvioFiltrado) {
            query = query.eq('enviado_por_id', usuarioEnvioFiltrado.id);
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
        tbody.innerHTML = '<tr><td colspan="9">Nenhuma solicitação encontrada.</td></tr>';
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
            <td>${solicitacao.enviado_por?.nome || ''}</td>
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

// Função para gerar um único PDF com múltiplas solicitações
async function gerarPdfEmMassa(solicitacoes) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    let isFirstPage = true;

    // Placeholder do logo (substitua pelo seu logo em Base64)
    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABSSURBVHhe7cExAQAAAMKg9U9tCF8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwZ08AAQAB2ds4AAAAAElFTkSuQmCC';
    const placeholderLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABSSURBVHhe7cExAQAAAMKg9U9tCF8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwZ08AAQAB2ds4AAAAAElFTkSuQmCC';

    for (const solicitacao of solicitacoes) {
        if (!isFirstPage) {
            doc.addPage();
        }
        isFirstPage = false;

        // --- CABEÇALHO ---
        if (logoBase64 && logoBase64 !== placeholderLogo) {
            try {
                doc.addImage(logoBase64, 'PNG', 150, 8, 45, 15);
            } catch (e) {
                console.warn('Não foi possível adicionar o logo ao PDF.', e);
            }
        }

        doc.setFontSize(20);
        doc.setTextColor('#4CAF50');
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo de Envio de Peças', 14, 20);

        doc.setDrawColor(76, 175, 80);
        doc.setLineWidth(0.5);
        doc.line(14, 25, 196, 25);

        // --- INFORMAÇÕES GERAIS ---
        doc.setFontSize(12);
        doc.setTextColor(40);
        let startY = 40;

        const drawField = (label, value, y, isSecondColumn = false) => {
            const labelX = isSecondColumn ? 143 : 58;
            const valueX = isSecondColumn ? 145 : 60;
            doc.setFont('helvetica', 'bold');
            doc.text(label, labelX, y, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.text(String(value), valueX, y);
        };

        drawField('Código:', String(solicitacao.id).padStart(5, '0'), startY);
        drawField('Data Solicitação:', new Date(solicitacao.created_at).toLocaleString('pt-BR'), startY, true);
        startY += 8;
        drawField('Técnico:', solicitacao.usuario?.nome || 'N/A', startY);
        startY += 8;
        drawField('Placa:', solicitacao.veiculo?.placa || 'N/A', startY);
        drawField('Supervisor:', solicitacao.veiculo?.supervisor?.nome || 'N/A', startY, true);
        startY += 8;
        drawField('Rota de Entrega:', solicitacao.rota || 'Não definida', startY);

        // --- TABELA DE ITENS ---
        const totalQuantidadePDF = solicitacao.itens.reduce((total, item) => total + item.quantidade, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total de Peças: ${totalQuantidadePDF}`, 196, startY + 10, { align: 'right' });

        const tableColumn = ["Código", "Nome da Peça", "Quantidade"];
        const tableRows = solicitacao.itens.map(item => [item.codigo, item.nome, item.quantidade]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: startY + 15,
            theme: 'grid',
            headStyles: { fillColor: [76, 175, 80] },
            styles: { font: 'helvetica', fontSize: 10 }
        });
    }

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
    doc.save(`envio_em_massa_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Função para enviar solicitações em massa
async function enviarSolicitacoesEmMassa() {
    const tbody = document.querySelector('#tabela-aprovados tbody');
    const linhas = Array.from(tbody.querySelectorAll('tr'));
    const idsAprovados = [];

    linhas.forEach(linha => {
        const statusCell = linha.querySelector('td:nth-child(6)');
        if (statusCell && statusCell.textContent.toLowerCase() === 'aprovado') {
            const codigoSolicitacao = linha.querySelector('td:first-child').textContent;
            const idSolicitacao = parseInt(codigoSolicitacao, 10);
            if (!isNaN(idSolicitacao)) {
                idsAprovados.push(idSolicitacao);
            }
        }
    });

    if (idsAprovados.length === 0) {
        alert('Nenhuma solicitação com status "Aprovado" foi encontrada na tabela.');
        return;
    }

    if (!confirm(`Deseja marcar ${idsAprovados.length} solicitações como "Enviado" e gerar um PDF único?`)) {
        return;
    }

    try {
        // 1. Primeiro, atualizar o status e data_envio no banco de dados
        console.log('Iniciando atualização em massa para IDs:', idsAprovados);
        const dataEnvioAtual = new Date().toISOString();
        console.log('Data de envio a ser definida:', dataEnvioAtual);

        const { data: updateData, error: updateError } = await supabase
            .from('solicitacoes')
            .update({
                status: 'enviado',
                data_envio: dataEnvioAtual,
                updated_at: new Date().toISOString()
            })
            .in('id', idsAprovados)
            .select('id, status, data_envio'); // Retornar os campos atualizados para verificação

        if (updateError) {
            console.error('Erro ao atualizar solicitações em massa:', updateError);
            alert('Erro ao atualizar o status das solicitações. Verifique o console para mais detalhes.');
            return;
        }

        console.log('Solicitações atualizadas com sucesso:', updateData);

        // Verificar se a atualização foi realmente aplicada
        if (updateData && updateData.length > 0) {
            updateData.forEach(item => {
                console.log(`ID ${item.id}: Status=${item.status}, DataEnvio=${item.data_envio}`);
            });
        }

        // 2. Buscar detalhes completos das solicitações atualizadas para o PDF
        const { data: solicitacoesDetalhadas, error: fetchError } = await supabase
            .from('solicitacoes')
            .select(`
                id, created_at, status, itens, rota, data_envio,
                usuario:usuario_id(nome),
                veiculo:veiculo_id(placa, supervisor:supervisor_id(nome))
            `)
            .in('id', idsAprovados);

        if (fetchError || !solicitacoesDetalhadas) {
            console.error('Erro ao buscar detalhes para o PDF:', fetchError);
            alert('Não foi possível carregar os dados para gerar o PDF.');
            return;
        }

        console.log('Dados para PDF carregados:', solicitacoesDetalhadas.map(s => ({
            id: s.id,
            status: s.status,
            data_envio: s.data_envio
        })));

        // 3. Gerar o PDF consolidado
        await gerarPdfEmMassa(solicitacoesDetalhadas);

        // 4. Recarregar a tabela para refletir as mudanças
        alert('Processamento em massa concluído! O PDF foi gerado e as solicitações foram atualizadas.');
        buscarSolicitacoes();

    } catch (error) {
        console.error('Erro inesperado no processamento em massa:', error);
        alert('Erro inesperado durante o processamento. Verifique o console para mais detalhes.');
    }
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
});
