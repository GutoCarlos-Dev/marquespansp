// js/setup.js

/**
 * Função para criar o primeiro usuário administrador no Supabase.
 * Esta função é temporária e deve ser removida após a configuração inicial.
 */
async function cadastrarAdminInicial() {
    alert("Esta função é para criar o PRIMEIRO usuário administrador do sistema. Use apenas uma vez.");

    const adminName = prompt("Digite o nome do administrador:");
    if (!adminName) {
        alert("Cadastro cancelado.");
        return;
    }

    const adminEmail = prompt("Digite o e-mail do administrador:");
    if (!adminEmail) {
        alert("Cadastro cancelado.");
        return;
    }

    const adminPassword = prompt("Digite a senha para o administrador (mínimo 6 caracteres):");
    if (!adminPassword || adminPassword.length < 6) {
        alert("Senha inválida ou muito curta. Cadastro cancelado.");
        return;
    }

    console.log("Iniciando a criação do administrador...");
    
    // 1. Cria o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
    });

    if (authError) {
        console.error("Erro ao criar o usuário na autenticação:", authError.message);
        // Fornece uma mensagem mais amigável para o erro de RLS
        if (authError.message.includes("violates row-level security policy")) {
            alert("Erro de permissão no banco de dados. Verifique se as políticas de segurança (RLS) da tabela 'profiles' estão configuradas corretamente para permitir a inserção de novos usuários.");
        } else {
            alert("Erro ao criar usuário: " + authError.message);
        }
        return;
    }

    if (authData.user) {
        console.log("Usuário criado na autenticação. Inserindo perfil...");
        // 2. INSERE o perfil manualmente, já que o gatilho foi removido
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
                id: authData.user.id, 
                nome: adminName, 
                nivel: 'administrador' 
            });

        if (profileError) {
            console.error("Erro ao inserir o perfil:", profileError.message);
            alert("Usuário criado, mas falha ao salvar o perfil. Contate o suporte. Detalhes no console.");
        } else {
            console.log("Administrador criado e configurado com sucesso!");
            alert("Conta de administrador criada com sucesso! Você já pode fazer o login.");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const linkCadastro = document.getElementById('link-cadastrar-admin');
    if (linkCadastro) {
        linkCadastro.addEventListener('click', (e) => {
            e.preventDefault(); // Impede que o link navegue
            cadastrarAdminInicial();
        });
    }
});