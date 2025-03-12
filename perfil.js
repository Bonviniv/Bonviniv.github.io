document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o usuário está autenticado
    const currentUser = localStorage.getItem('currentUser');
    
    // Se não houver usuário logado, redireciona para a página de criar perfil
    if (!currentUser) {
        window.location.href = 'user.html'; // Redireciona para a página de criar perfil
    } else {
        const user = JSON.parse(currentUser);
        
        // Exibe as informações do usuário
        const nomeUsuario = document.getElementById('nome-usuario');
        const vitoriasTotais = document.getElementById('vitorias-totais');
        const maiorStrik = document.getElementById('maior-strik');
        
        if (nomeUsuario) {
            nomeUsuario.textContent = user.username;
        }
        
        if (vitoriasTotais) {
            vitoriasTotais.textContent = user.vitoriasTotal || 0;
        }
        
        if (maiorStrik) {
            maiorStrik.textContent = user.maiorStrik || 0;
        }
        
        // Configura o botão de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Limpa o usuário logado do localStorage e redireciona para a página de criação de perfil
                localStorage.removeItem('currentUser');
                window.location.href = 'criarPerfil.html';
            });
        }
    }
});
