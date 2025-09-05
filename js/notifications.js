// notifications.js - renderização de notificações

// Renderizar notificações
function renderNotifications() {
    const listaNotificacoes = document.getElementById('lista-notificacoes');
    if (!listaNotificacoes) return;

    listaNotificacoes.innerHTML = '';

    notifications.forEach(notif => {
        const div = document.createElement('div');
        div.className = 'notification-item';
        div.innerHTML = `<p>${notif.mensagem} - ${new Date(notif.data).toLocaleString()}</p>`;
        listaNotificacoes.appendChild(div);
    });
}
