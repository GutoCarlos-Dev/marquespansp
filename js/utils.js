// js/utils.js

/**
 * Obtém um parâmetro da query string da URL.
 * @param {string} param O nome do parâmetro a ser obtido.
 * @returns {string|null} O valor do parâmetro ou null se não for encontrado.
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Busca todas as solicitações do localStorage.
 * @returns {Array} Uma lista de solicitações.
 */
function getSolicitacoes() {
    return JSON.parse(localStorage.getItem('solicitacoes')) || [];
}

/**
 * Salva a lista de solicitações no localStorage.
 * @param {Array} solicitacoes A lista de solicitações a ser salva.
 */
function saveSolicitacoes(solicitacoes) {
    localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes));
}