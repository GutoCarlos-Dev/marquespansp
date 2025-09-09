// js/seed.js

// Função para popular o localStorage com uma lista inicial de peças.
// Esta função deve ser executada apenas uma vez para configurar o sistema.
function popularPecas() {
    // Confirmação para evitar sobreescrever dados existentes acidentalmente
    if (!confirm('ATENÇÃO: Esta ação irá substituir TODA a lista de peças existente. Deseja continuar?')) {
        return;
    }

    const pecasData = [
        { codigo: '1', nome: 'ABRAÇADEIRA 12/22', descricao: '' },
        { codigo: '2', nome: 'ABRAÇADEIRA EMBORRACHADA', descricao: '' },
        { codigo: '3', nome: 'BOIA', descricao: '' },
        { codigo: '4', nome: 'BOMBA DE ÁGUA', descricao: '' },
        { codigo: '5', nome: 'BORRACHA CLIMA PRO GÁS', descricao: '' },
        { codigo: '6', nome: 'BORRACHA CLIMA VENÂNCIO', descricao: '' },
        { codigo: '7', nome: 'BORRACHA FORNO 5 ARREBITA', descricao: '' },
        { codigo: '8', nome: 'BORRACHA FORNO 5 ENCAIXE', descricao: '' },
        { codigo: '9', nome: 'BORRACHA FORNO 8 ENCAIXE', descricao: '' },
        { codigo: '10', nome: 'BORRACHA FREEZER GELOPAR (HORIZONTAL)', descricao: '' },
        { codigo: '11', nome: 'BORRACHA FREEZER FRICON (HORIZONTAL)', descricao: '' },
        { codigo: '12', nome: 'BORRACHA FREEZER FRICON (VERTICAL)', descricao: '' },
        { codigo: '13', nome: 'BORRACHA FREEZER GELOPAR (VERTICAL)', descricao: '' },
        { codigo: '14', nome: 'BOTÃO LARANJA', descricao: '' },
        { codigo: '15', nome: 'BOTÃO VERMELHO', descricao: '' },
        { codigo: '16', nome: 'BUCHA FORNO 5', descricao: '' },
        { codigo: '17', nome: 'BUCHA FORNO 8', descricao: '' },
        { codigo: '18', nome: 'CANO DE COBRE FORNO DE 8', descricao: '' },
        { codigo: '19', nome: 'CASTANHA DA PORTA CLIMA', descricao: '' },
        { codigo: '20', nome: 'COMPRESSOR 1/2 R - 404', descricao: '' },
        { codigo: '21', nome: 'COMPRESSOR 1/2 R - 134', descricao: '' },
        { codigo: '22', nome: 'COMPRESSOR 1/3 R - 134', descricao: '' },
        { codigo: '23', nome: 'CONTATORA 12/10', descricao: '' },
        { codigo: '24', nome: 'CONTATORA 32/10', descricao: '' },
        { codigo: '25', nome: 'CONTECTOR MACHO 3 PINOS', descricao: '' },
        { codigo: '26', nome: 'DISJUNTOR BIPOLAR 16 A', descricao: '' },
        { codigo: '27', nome: 'DISJUNTOR BIPOLAR 50 A', descricao: '' },
        { codigo: '28', nome: 'DISJUNTOR TRIPOLAR 50 A', descricao: '' },
        { codigo: '29', nome: 'DISJUNTOR UNIPOLAR 16A', descricao: '' },
        { codigo: '30', nome: 'DISJUNTOR UNIPOLAR 50 A', descricao: '' },
        { codigo: '31', nome: 'DOBRADIÇA CLIMA', descricao: '' },
        { codigo: '32', nome: 'DOBRADIÇA FREEZER (HORIZONTAL)', descricao: '' },
        { codigo: '33', nome: 'ESPANJOSO', descricao: '' },
        { codigo: '34', nome: 'EVAPORADORA CLIMA 40', descricao: '' },
        { codigo: '35', nome: 'EVAPORADORA CLIMA 20', descricao: '' },
        { codigo: '36', nome: 'FAISCADOR', descricao: '' },
        { codigo: '37', nome: 'FECHADURA PORTA CLIMA', descricao: '' },
        { codigo: '38', nome: 'FILTRO SECADOR MENOR', descricao: '' },
        { codigo: '39', nome: 'FILTRO CAPILAR 0,36', descricao: '' },
        { codigo: '40', nome: 'FILTRO CAPILAR 0,42', descricao: '' },
        { codigo: '41', nome: 'FILTRO CAPILAR 0,50', descricao: '' },
        { codigo: '42', nome: 'FILTRO SECADOR MAIOR', descricao: '' },
        { codigo: '43', nome: 'FLAUTA (GÁS NATURAL)', descricao: '' },
        { codigo: '44', nome: 'FLAUTA FORNO 5', descricao: '' },
        { codigo: '45', nome: 'FLAUTA FORNO 8', descricao: '' },
        { codigo: '46', nome: 'GARRAFA INOX PRO GÁS', descricao: '' },
        { codigo: '47', nome: 'GARRAFA INOX VENÂNCIO', descricao: '' },
        { codigo: '48', nome: 'GÁS R- 134', descricao: '' },
        { codigo: '49', nome: 'GÁS R- 404', descricao: '' },
        { codigo: '50', nome: 'LÂMPADA 12 v', descricao: '' },
        { codigo: '51', nome: 'LÂMPADA 220 V', descricao: '' },
        { codigo: '52', nome: 'MAÇANETA FORNO 5', descricao: '' },
        { codigo: '53', nome: 'MAÇANETA FORNO 8', descricao: '' },
        { codigo: '54', nome: 'MANGUEIRA ALTA TEMPERATURA 1/2', descricao: '' },
        { codigo: '55', nome: 'MANGUEIRA ALTA TEMPERATURA 3/8', descricao: '' },
        { codigo: '56', nome: 'MANGUEIRA DOURADA 2 MTS', descricao: '' },
        { codigo: '57', nome: 'MANGUEIRA DOURADA 3 MTS', descricao: '' },
        { codigo: '58', nome: 'MANGUEIRA PADRÃO', descricao: '' },
        { codigo: '59', nome: 'MICRO CHAVE', descricao: '' },
        { codigo: '60', nome: 'MICRO MOTOR 1/20', descricao: '' },
        { codigo: '61', nome: 'MICRO MOTOR 1/25', descricao: '' },
        { codigo: '62', nome: 'MICRO MOTOR 1/40', descricao: '' },
        { codigo: '63', nome: 'MOTOR FORNO 5', descricao: '' },
        { codigo: '64', nome: 'MOTOR FORNO 5 (HÉLICE AMARELO)', descricao: '' },
        { codigo: '65', nome: 'MOTOR FORNO 8', descricao: '' },
        { codigo: '66', nome: 'PUXADOR DE FREEZER (HORIZONTAL)', descricao: '' },
        { codigo: '67', nome: 'PUXADOR PORTA DE CLIMA', descricao: '' },
        { codigo: '68', nome: 'RALO', descricao: '' },
        { codigo: '69', nome: 'REGISTRO ALAVANCA 1/4', descricao: '' },
        { codigo: '70', nome: 'REGULADOR DE GÁS', descricao: '' },
        { codigo: '71', nome: 'RESERVATÓRIO ÁGUA CLIMA PRO GÁS', descricao: '' },
        { codigo: '72', nome: 'RESERVATÓRIO ÁGUA CLIMA VENÂNCIO', descricao: '' },
        { codigo: '73', nome: 'RESISTÊNCIA FORNO 5', descricao: '' },
        { codigo: '74', nome: 'RESISTÊNCIA SECA', descricao: '' },
        { codigo: '75', nome: 'RESISTÊNCIA U', descricao: '' },
        { codigo: '76', nome: 'RESISTÊNCIA W', descricao: '' },
        { codigo: '77', nome: 'RESISTÊNICA FORNO 8', descricao: '' },
        { codigo: '78', nome: 'ROLDANA PORTA FORNO', descricao: '' },
        { codigo: '79', nome: 'SENSOR NTC', descricao: '' },
        { codigo: '80', nome: 'SILICONE ALTA TEMPERATURA (BISNAGA )', descricao: '' },
        { codigo: '81', nome: 'SOLENÓIDE (GÁS NATURAL)', descricao: '' },
        { codigo: '82', nome: 'SOLENÓIDE DE GÁS', descricao: '' },
        { codigo: '83', nome: 'SPRAY DESENGRIPANTE', descricao: '' },
        { codigo: '84', nome: 'SPRAY LIMPA CONTATO', descricao: '' },
        { codigo: '85', nome: 'TERMOPAR PRO GÁS', descricao: '' },
        { codigo: '86', nome: 'TUBO COBRE 1/4', descricao: '' },
        { codigo: '87', nome: 'TUBO COBRE 3/8', descricao: '' },
        { codigo: '88', nome: 'TUBO COBRE 5/16', descricao: '' },
        { codigo: '89', nome: 'TUBO DE COBRE (GÁS NATURAL)', descricao: '' },
        { codigo: '90', nome: 'USINA', descricao: '' },
        { codigo: '91', nome: 'VÁLVULA SCHRADER', descricao: '' },
        { codigo: '92', nome: 'VARETA DE SOLDA FOSCOPER', descricao: '' },
        { codigo: '93', nome: 'VARETA DE SOLDA PRATA', descricao: '' },
        { codigo: '94', nome: 'RODAS FREEZER', descricao: '' },
        { codigo: '95', nome: 'SENSOR CAMARA FRIA', descricao: '' },
        { codigo: '96', nome: 'TERMOTATO BULHA', descricao: '' },
        { codigo: '97', nome: 'MOTOR FORNO 5 ( GPANIS )', descricao: '' },
        { codigo: '98', nome: 'MOTOR FORNO 5 ( TEDESCO )', descricao: '' }
    ];

    // Adiciona um ID único para cada peça
    const pecasComId = pecasData.map((peca, index) => ({
        ...peca,
        id: Date.now() + index // Garante um ID único para cada item
    }));

    // Substitui completamente os dados existentes para evitar duplicatas
    localStorage.setItem('pecas', JSON.stringify(pecasComId));

    console.log(`${pecasComId.length} peças foram carregadas no sistema.`);
    alert(`${pecasComId.length} peças foram carregadas com sucesso! Você pode remover o botão e o script 'seed.js' do arquivo index.html agora.`);
}

// Adiciona o evento ao botão na página de login
document.addEventListener('DOMContentLoaded', () => {
    const btnPopular = document.getElementById('btn-popular-dados');
    if (btnPopular) {
        btnPopular.addEventListener('click', popularPecas);
    }
});