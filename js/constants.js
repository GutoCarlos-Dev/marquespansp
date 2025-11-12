// js/constants.js - Constantes globais do sistema

/**
 * Constantes do Sistema de Solicitação de Peças
 * Centraliza todas as constantes para facilitar manutenção
 */

// Níveis de usuário
const USER_LEVELS = {
    TECNICO: 'tecnico',
    SUPERVISOR: 'supervisor',
    MATRIZ: 'matriz',
    ADMINISTRADOR: 'administrador'
};

// Status das solicitações
const SOLICITACAO_STATUS = {
    PENDENTE: 'pendente',
    APROVADO: 'aprovado',
    REJEITADO: 'rejeitado',
    ENVIADO: 'enviado'
};

// Cores do sistema (para consistência visual)
const SYSTEM_COLORS = {
    PRIMARY: '#4CAF50',
    SECONDARY: '#f44336',
    SUCCESS: '#4CAF50',
    WARNING: '#ff9800',
    ERROR: '#f44336',
    INFO: '#2196F3',
    BACKGROUND: '#f9f9f9',
    TEXT: '#333',
    TEXT_LIGHT: '#666'
};

// Limites e validações
const LIMITS = {
    MAX_ITENS_SOLICITACAO: 50,
    MAX_QUANTIDADE_ITEM: 999,
    MIN_SENHA_LENGTH: 6,
    SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 horas em ms
    MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

// URLs e endpoints
const URLS = {
    LOGIN: 'index.html',
    DASHBOARD: 'pages/dashboard.html',
    SOLICITACAO: 'pages/solicitacao.html',
    APROVACAO: 'pages/aprovacao.html',
    APROVADOS: 'pages/aprovados.html',
    DETALHES_SOLICITACAO: 'pages/detalhes_solicitacao.html'
};

// Configurações de API
const API_CONFIG = {
    TIMEOUT: 30000, // 30 segundos
    RETRIES: 3,
    RETRY_DELAY: 1000 // 1 segundo
};

// Configurações de gráficos
const CHART_CONFIG = {
    DEFAULT_HEIGHT: 300,
    COLORS: [
        '#4CAF50', // Verde
        '#f44336', // Vermelho
        '#ff9800', // Laranja
        '#2196F3', // Azul
        '#9c27b0', // Roxo
        '#607d8b'  // Cinza
    ],
    FONT_FAMILY: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

// Configurações de PDF
const PDF_CONFIG = {
    FORMAT: 'a4',
    ORIENTATION: 'portrait',
    UNIT: 'mm',
    TITLE_FONT_SIZE: 20,
    NORMAL_FONT_SIZE: 12,
    SMALL_FONT_SIZE: 8
};

// Mensagens do sistema
const MESSAGES = {
    // Login
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    LOGIN_ERROR: 'Usuário ou senha inválidos.',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso.',

    // Solicitações
    SOLICITACAO_CRIADA: 'Solicitação criada com sucesso!',
    SOLICITACAO_APROVADA: 'Solicitação aprovada com sucesso!',
    SOLICITACAO_REJEITADA: 'Solicitação rejeitada.',
    SOLICITACAO_ENVIADA: 'Solicitação marcada como enviada!',
    SOLICITACAO_EDITADA: 'Solicitação editada com sucesso!',

    // Erros
    ERRO_CONEXAO: 'Erro de conexão. Verifique sua internet.',
    ERRO_PERMISSAO: 'Você não tem permissão para esta ação.',
    ERRO_DADOS_INVALIDOS: 'Dados inválidos. Verifique as informações.',
    ERRO_SERVIDOR: 'Erro interno do servidor. Tente novamente.',

    // Validações
    CAMPO_OBRIGATORIO: 'Este campo é obrigatório.',
    SENHA_FRACA: 'A senha deve ter pelo menos 6 caracteres.',
    EMAIL_INVALIDO: 'Email inválido.',
    QUANTIDADE_INVALIDA: 'Quantidade deve ser maior que zero.'
};

// Configurações de responsividade
const RESPONSIVE_BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1200
};

// Configurações de animações
const ANIMATION_CONFIG = {
    DURATION: 300, // ms
    EASING: 'ease-in-out',
    DELAY: 100 // ms
};

// Configurações de cache
const CACHE_CONFIG = {
    DASHBOARD_DATA: 5 * 60 * 1000, // 5 minutos
    USER_DATA: 30 * 60 * 1000, // 30 minutos
    STATIC_DATA: 24 * 60 * 60 * 1000 // 24 horas
};

// Regex patterns
const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PLACA: /^[A-Z]{3}-\d{4}$/,
    CODIGO_PECA: /^[A-Z0-9]{3,10}$/,
    NUMERO_POSITIVO: /^[1-9]\d*$/
};

// Configurações de log
const LOG_CONFIG = {
    LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    MAX_ENTRIES: 1000,
    PERSIST_LOGS: true
};

// Configurações de export
const EXPORT_CONFIG = {
    PDF_MARGIN: 10,
    PDF_FILENAME_PREFIX: 'solicitacao_',
    CSV_DELIMITER: ';',
    EXCEL_SHEET_NAME: 'Solicitacoes'
};

// Configurações de notificações
const NOTIFICATION_CONFIG = {
    POSITION: 'top-right',
    DURATION: 5000, // 5 segundos
    MAX_NOTIFICATIONS: 5
};

// Idiomas suportados
const SUPPORTED_LANGUAGES = {
    'pt-BR': {
        name: 'Português (Brasil)',
        flag: '🇧🇷'
    }
    // Futuramente: 'en-US', 'es-ES', etc.
};

// Configurações de tema
const THEME_CONFIG = {
    DEFAULT: 'light',
    AVAILABLE: ['light', 'dark'],
    AUTO_SWITCH: false
};

// Configurações de backup
const BACKUP_CONFIG = {
    AUTO_BACKUP: true,
    FREQUENCY: 24 * 60 * 60 * 1000, // 24 horas
    RETENTION_DAYS: 30,
    MAX_BACKUPS: 10
};

// Exportar constantes para uso global
// Nota: Em um módulo ES6, usaríamos export, mas aqui mantemos compatibilidade
if (typeof window !== 'undefined') {
    window.CONSTANTS = {
        USER_LEVELS,
        SOLICITACAO_STATUS,
        SYSTEM_COLORS,
        LIMITS,
        URLS,
        API_CONFIG,
        CHART_CONFIG,
        PDF_CONFIG,
        MESSAGES,
        RESPONSIVE_BREAKPOINTS,
        ANIMATION_CONFIG,
        CACHE_CONFIG,
        REGEX_PATTERNS,
        LOG_CONFIG,
        EXPORT_CONFIG,
        NOTIFICATION_CONFIG,
        SUPPORTED_LANGUAGES,
        THEME_CONFIG,
        BACKUP_CONFIG
    };
}
