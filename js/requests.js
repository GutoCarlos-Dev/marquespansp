// requests.js - funções e eventos para gerenciamento de pedidos

// Renderizar pedidos pendentes
function renderRequests() {
    const listaPedidos = document.getElementById('lista-pedidos');
    if (!listaPedidos) return;

    listaPedidos.innerHTML = '';

    requests.forEach(request => {
        const div = document.createElement('div');
        div.className = 'request-item';
        div.innerHTML = `
            <p>Placa: ${request.placa}</p>
            <p>Técnico: ${request.tecnico}</p>
            <p>Peça: ${request.peca}</p>
            <p>Quantidade: ${request.quantidade}</p>
            <button onclick="approveRequest(${request.id}, true)">Aprovar</button>
            <button onclick="approveRequest(${request.id}, false)">Rejeitar</button>
        `;
        listaPedidos.appendChild(div);
    });
}

// Criar pedido de peça
function createRequest(placa) {
    const peca = prompt('Digite a peça solicitada:');
    const quantidade = parseInt(prompt('Digite a quantidade:'));
    const tecnico = prompt('Digite o nome do técnico:');

    if (peca && quantidade && tecnico) {
        const request = {
            id: Date.now(),
            placa,
            tecnico,
            peca,
            quantidade,
            status: 'pendente'
        };
        requests.push(request);
        saveData();
        renderRequests();
    }
}

// Aprovar ou rejeitar pedido
function approveRequest(id, aprovado) {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    if (aprovado) {
        const vehicle = vehicles.find(v => v.placa === request.placa);
        if (vehicle.estoque[request.peca] >= request.quantidade) {
            vehicle.estoque[request.peca] -= request.quantidade;
            notifications.push({
                mensagem: `Peça ${request.peca} retirada do estoque de ${request.placa}`,
                data: new Date()
            });
        } else {
            // Notificar supervisor e encaminhar para matriz
            notifications.push({
                mensagem: `Estoque insuficiente para ${request.peca} em ${request.placa}. Pedido encaminhado para matriz.`,
                data: new Date()
            });
            // Simular envio para matriz
        }
    } else {
        notifications.push({
            mensagem: `Pedido de ${request.peca} rejeitado para ${request.placa}`,
            data: new Date()
        });
    }

    // Remover pedido da lista
    requests = requests.filter(r => r.id !== id);
    saveData();
    renderRequests();
    renderNotifications();
    renderVehicles(); // Atualizar estoques
    renderStockSummary();
}
