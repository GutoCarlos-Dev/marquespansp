// js/utils.js - Funções utilitárias

/**
 * Busca um parâmetro na query string da URL atual.
 * @param {string} param O nome do parâmetro a ser buscado.
 * @returns {string|null} O valor do parâmetro ou null se não for encontrado.
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}