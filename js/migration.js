// js/migration.js

/**
 * ATENÇÃO: Este script é para ser executado UMA ÚNICA VEZ pelo administrador
 * para migrar os usuários do localStorage para o Supabase.
 */
async function migrarUsuariosParaSupabase() {
    // Pega as credenciais do administrador que está executando a migração
    const adminLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!adminLogado || adminLogado.nivel !== 'administrador') {
        alert('Apenas administradores podem executar a migração.');
        return;
    }

    // Pede a senha do admin por segurança, para poder logar de volta entre as operações
    const adminPassword = prompt('Por favor, digite sua senha de administrador para confirmar a migração:');
    if (!adminPassword) {
        alert('Migração cancelada.');
        return;
    }

    const usuariosParaMigrar = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuariosParaMigrar.length === 0) {
        alert('Nenhum usuário encontrado no localStorage para migrar.');
        return;
    }

    if (!confirm(`Você está prestes a migrar ${usuariosParaMigrar.length} usuários. Esta ação não pode ser desfeita. Deseja continuar?`)) {
        alert('Migração cancelada.');
        return;
    }

    const btnMigrar = document.getElementById('btn-migrar-usuarios');
    btnMigrar.disabled = true;
    btnMigrar.textContent = 'Migrando...';

    let sucessoCount = 0;
    let falhaCount = 0;

    // Usamos um loop for...of para que o 'await' funcione corretamente
    for (const usuario of usuariosParaMigrar) {
        console.log(`Migrando usuário: ${usuario.email}`);

        // 1. Cadastra o usuário no sistema de autenticação do Supabase
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: usuario.email,
            password: usuario.senha, // Usa a senha do localStorage
        });

        if (signUpError) {
            // Verifica se o erro é porque o usuário já existe
            if (signUpError.message.includes("User already registered")) {
                console.warn(`Usuário ${usuario.email} já existe no Supabase. Pulando.`);
            } else {
                console.error(`Erro ao criar usuário ${usuario.email}:`, signUpError.message);
            }
            falhaCount++;
            continue; // Pula para o próximo usuário
        }

        if (signUpData.user) {
            // 2. INSERE o perfil manualmente
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ 
                    id: signUpData.user.id, 
                    nome: usuario.nome, 
                    nivel: usuario.nivel 
                });

            if (insertError) {
                console.error(`Erro ao inserir perfil para ${usuario.email}:`, insertError.message);
                falhaCount++;
            } else {
                console.log(`Usuário ${usuario.email} migrado com sucesso!`);
                sucessoCount++;
            }
        }

        // 3. Loga o administrador de volta para continuar o processo
        await supabase.auth.signInWithPassword({
            email: adminLogado.email,
            password: adminPassword,
        });
    }

    alert(`Migração concluída!\n\nSucesso: ${sucessoCount}\nFalhas: ${falhaCount}\n\nVerifique o console para mais detalhes.`);
    btnMigrar.textContent = 'Migração Concluída';
}

async function migrarPecasParaSupabase() {
    if (!confirm('ATENÇÃO: Esta ação irá adicionar as peças do localStorage ao Supabase. Deseja continuar?')) {
        return;
    }

    const pecasLS = JSON.parse(localStorage.getItem('pecas')) || [];
    if (pecasLS.length === 0) {
        alert('Nenhuma peça encontrada no localStorage para migrar.');
        return;
    }

    const btnMigrar = document.getElementById('btn-migrar-pecas');
    btnMigrar.disabled = true;
    btnMigrar.textContent = 'Migrando...';

    // Mapeia os dados para o formato da tabela do Supabase
    const pecasParaInserir = pecasLS.map(p => ({
        codigo: p.codigo,
        nome: p.nome,
        descricao: p.descricao
    }));

    // O { onConflict: 'codigo' } evita erros se uma peça com o mesmo código já existir.
    const { error } = await supabase.from('pecas').insert(pecasParaInserir, { onConflict: 'codigo' });

    if (error) {
        alert('Erro ao migrar peças: ' + error.message);
    } else {
        alert(`${pecasLS.length} peças foram migradas/verificadas com sucesso!`);
    }

    btnMigrar.textContent = 'Migração de Peças Concluída';
}

async function migrarVeiculosParaSupabase() {
    if (!confirm('ATENÇÃO: Esta ação irá adicionar os veículos do localStorage ao Supabase. Certifique-se de que os usuários já foram migrados. Deseja continuar?')) {
        return;
    }

    const veiculosLS = JSON.parse(localStorage.getItem('veiculos')) || [];
    if (veiculosLS.length === 0) {
        alert('Nenhum veículo encontrado no localStorage para migrar.');
        return;
    }

    const btnMigrar = document.getElementById('btn-migrar-veiculos');
    btnMigrar.disabled = true;
    btnMigrar.textContent = 'Migrando...';

    // 1. Buscar todos os usuários do localStorage e perfis do Supabase para mapeamento
    const usuariosLS = JSON.parse(localStorage.getItem('usuarios')) || [];
    const { data: profilesSupabase, error: profilesError } = await supabase.from('profiles').select('id, nome');

    if (profilesError) {
        alert('Erro ao buscar perfis do Supabase. Não é possível migrar veículos.');
        btnMigrar.disabled = false;
        btnMigrar.textContent = 'Migrar Veículos do localStorage';
        return;
    }

    // Cria um mapa para encontrar o UUID do Supabase a partir do nome do usuário
    const profileMap = profilesSupabase.reduce((map, profile) => {
        map[profile.nome] = profile.id;
        return map;
    }, {});

    // 2. Mapeia os veículos, substituindo os IDs antigos pelos UUIDs novos
    const veiculosParaInserir = veiculosLS.map(veiculo => {
        const supervisorLS = usuariosLS.find(u => u.id === veiculo.supervisorId);
        const tecnicoLS = usuariosLS.find(u => u.id === veiculo.tecnicoId);

        const supervisorUUID = supervisorLS ? profileMap[supervisorLS.nome] : null;
        const tecnicoUUID = tecnicoLS ? profileMap[tecnicoLS.nome] : null;

        if (!supervisorUUID) console.warn(`Supervisor "${supervisorLS?.nome}" não encontrado no Supabase para o veículo ${veiculo.placa}`);
        if (!tecnicoUUID) console.warn(`Técnico "${tecnicoLS?.nome}" não encontrado no Supabase para o veículo ${veiculo.placa}`);

        return {
            placa: veiculo.placa,
            qtd_equipe: veiculo.qtdEquipe,
            supervisor_id: supervisorUUID,
            tecnico_id: tecnicoUUID
        };
    });

    // 3. Insere os veículos no Supabase
    // O { onConflict: 'placa' } evita erros se um veículo com a mesma placa já existir.
    const { error } = await supabase.from('veiculos').insert(veiculosParaInserir, { onConflict: 'placa' });

    if (error) {
        alert('Erro ao migrar veículos: ' + error.message);
    } else {
        alert(`${veiculosParaInserir.length} veículos foram migrados/verificados com sucesso!`);
    }

    btnMigrar.textContent = 'Migração de Veículos Concluída';
}