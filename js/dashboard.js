// dashboard.js - renderização do dashboard e navegação do menu

// Renderizar resumo de estoque
function renderStockSummary() {
    const resumoEstoque = document.getElementById('resumo-estoque');
    if (!resumoEstoque) return; // Elemento não existe nesta página

    resumoEstoque.innerHTML = '';

    const totalItems = {};
    vehicles.forEach(vehicle => {
        Object.entries(vehicle.estoque).forEach(([peca, qtd]) => {
            totalItems[peca] = (totalItems[peca] || 0) + qtd;
        });
    });

    if (Object.keys(totalItems).length === 0) {
        resumoEstoque.innerHTML = '<p>Nenhum item em estoque.</p>';
    } else {
        const ul = document.createElement('ul');
        Object.entries(totalItems).forEach(([peca, qtd]) => {
            const li = document.createElement('li');
            li.textContent = `${peca}: ${qtd}`;
            ul.appendChild(li);
        });
        resumoEstoque.appendChild(ul);
    }
}

// Função para renderizar os resumos no dashboard
function renderDashboardSummary() {
    // Veículos cadastrados
    const countVeiculos = vehicles.length;

    // Itens em estoque positivos e negativos
    let estoquePositivo = 0;
    let estoqueNegativo = 0;
    vehicles.forEach(vehicle => {
        Object.values(vehicle.estoque).forEach(qtd => {
            if (qtd > 0) estoquePositivo += qtd;
            else if (qtd < 0) estoqueNegativo += qtd;
        });
    });

    // Pedidos aprovados e pendentes
    let pedidosAprovados = 0;
    let pedidosPendentes = 0;
    requests.forEach(req => {
        if (req.status && req.status.toLowerCase() === 'aprovado') pedidosAprovados++;
        else if (req.status && req.status.toLowerCase() === 'pendente') pedidosPendentes++;
    });

    // Total de baixas realizadas (notificações)
    const totalBaixas = notifications.length;

    // Atualizar o DOM
    document.getElementById('count-veiculos').textContent = countVeiculos;
    document.getElementById('count-estoque-positivo').textContent = estoquePositivo;
    document.getElementById('count-estoque-negativo').textContent = estoqueNegativo;
    document.getElementById('count-pedidos-aprovados').textContent = pedidosAprovados;
    document.getElementById('count-pedidos-pendentes').textContent = pedidosPendentes;
    document.getElementById('count-baixas').textContent = totalBaixas;
}

// Navegação do menu no dashboard

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar aplicação
    // Verificar se estamos na página do dashboard e inicializar
    if (document.getElementById('app-content')) {
        loadData();
        renderVehicles();
        renderRequests();
        renderNotifications();
        renderStockSummary();
        renderDashboardSummary();

        // Menu navigation
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                event.preventDefault();
                const target = btn.getAttribute('data-target');

                if (target.endsWith('.html')) {
                    // Navigate to the page
                    window.location.href = target;
                } else {
                    // Remove active from all
                    menuButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Hide all sections
                    const sections = document.querySelectorAll('.content-section');
                    sections.forEach(s => s.classList.add('hidden'));

                    // Show target section
                    const targetSection = document.getElementById(target);
                    if (targetSection) {
                        targetSection.classList.remove('hidden');
                    } else {
                        console.error(`Seção alvo não encontrada: ${target}`);
                    }
                }
            });
        });

        // Trigger click on the active menu button to show the initial section
        const activeBtn = document.querySelector('.menu-btn.active');
        if (activeBtn) {
            activeBtn.click();
        }

        // Código para abrir e fechar modais na seção Estoque

        // Botões para abrir modais
        const btnOpenGerenciarEstoque = document.getElementById('btn-selecione-estoque');
        const btnOpenCatalogoItens = document.getElementById('btn-abrir-catalogo');

        // Modais
        const modalGerenciarEstoque = document.getElementById('modal-gerenciar-estoque');
        const modalCatalogoItens = document.getElementById('modal-catalogo-itens');

        // Botões para fechar modais
        const btnCloseGerenciarEstoque = document.getElementById('close-modal-gerenciar-estoque');
        const btnCloseCatalogoItens = document.getElementById('close-modal-catalogo-itens');

        // Abrir modal Gerenciar Estoque
        if (btnOpenGerenciarEstoque && modalGerenciarEstoque) {
            btnOpenGerenciarEstoque.addEventListener('click', () => {
                modalGerenciarEstoque.classList.remove('hidden');
                updateModalButtonsStyle(modalGerenciarEstoque);
            });
        } else {
            console.error('Botão ou modal Gerenciar Estoque não encontrado');
        }

        // Abrir modal Catálogo de Itens
        if (btnOpenCatalogoItens && modalCatalogoItens) {
            btnOpenCatalogoItens.addEventListener('click', () => {
                modalCatalogoItens.classList.remove('hidden');
                updateModalButtonsStyle(modalCatalogoItens);
            });
        } else {
            console.error('Botão ou modal Catálogo de Itens não encontrado');
        }

        // Fechar modal Gerenciar Estoque
        if (btnCloseGerenciarEstoque && modalGerenciarEstoque) {
            btnCloseGerenciarEstoque.addEventListener('click', () => {
                modalGerenciarEstoque.classList.add('hidden');
            });
        } else {
            console.error('Botão fechar ou modal Gerenciar Estoque não encontrado');
        }

        // Fechar modal Catálogo de Itens
        if (btnCloseCatalogoItens && modalCatalogoItens) {
            btnCloseCatalogoItens.addEventListener('click', () => {
                modalCatalogoItens.classList.add('hidden');
            });
        } else {
            console.error('Botão fechar ou modal Catálogo de Itens não encontrado');
        }
    }
});

// Função para atualizar o estilo dos botões dentro dos modais
function updateModalButtonsStyle(modalElement) {
    if (!modalElement) return;
    const editButtons = modalElement.querySelectorAll('button.edit-btn, button.btn-primary');
    const deleteButtons = modalElement.querySelectorAll('button.delete-btn, button.btn-secondary');

    editButtons.forEach(btn => {
        btn.classList.remove('edit-btn', 'btn-primary');
        btn.classList.add('btn-primary');
        btn.style.padding = '';
        btn.style.fontSize = '';
        btn.style.backgroundColor = '';
    });

    deleteButtons.forEach(btn => {
        btn.classList.remove('delete-btn', 'btn-secondary');
        btn.classList.add('btn-secondary');
        btn.style.backgroundColor = '#e74c3c';
        btn.style.padding = '5px 10px';
        btn.style.fontSize = '0.85rem';
    });
}
