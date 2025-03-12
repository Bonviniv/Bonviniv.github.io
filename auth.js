class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoginMode = false;
        this.setupFormListeners();
        this.checkAuth();
    }

    setupFormListeners() {
        const toggleBtn = document.getElementById('toggle-mode');
        const formTitle = document.getElementById('form-title');
        const confirmarSenhaGroup = document.getElementById('confirmar-senha-group');
        const submitBtn = document.getElementById('submit-btn');
        const toggleText = document.getElementById('toggle-text');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.isLoginMode = !this.isLoginMode;

                // Atualiza a UI
                if (this.isLoginMode) {
                    formTitle.textContent = 'Entrar';
                    confirmarSenhaGroup.style.display = 'none';
                    submitBtn.textContent = 'Entrar';
                    toggleBtn.textContent = 'Criar Conta';
                    toggleText.textContent = 'Não tem uma conta?';
                } else {
                    formTitle.textContent = 'Criar Conta';
                    confirmarSenhaGroup.style.display = 'block';
                    submitBtn.textContent = 'Criar Perfil';
                    toggleBtn.textContent = 'Entrar';
                    toggleText.textContent = 'Já tem uma conta?';
                }
            });
        }

        // Botão de submit (serve tanto para login quanto para criar conta)
        const submitButton = document.getElementById('submit-btn');
        if (submitButton) {
            submitButton.addEventListener('click', async () => {
                const username = document.getElementById('username').value;
                const senha = document.getElementById('senha').value;

                if (this.isLoginMode) {
                    await this.fazerLogin(username, senha);
                } else {
                    const confirmarSenha = document.getElementById('confirmar-senha').value;
                    await this.criarConta(username, senha, confirmarSenha);
                }
            });
        }
    }

    async fazerLogin(username, senha) {
        try {
            const usuarios = await this.carregarUsuarios();
            const usuario = usuarios.find(u => u.user === username && u.senha === senha);

            if (usuario) {
                localStorage.setItem('currentUser', JSON.stringify({
                    username: usuario.user,
                    vitoriasTotal: usuario.vitoriasTotal,
                    maiorStrik: usuario.maiorStrik,
                    batalhas: usuario.batalhas,
                    vitoriasBatalhas: usuario.vitoriasBatalhas
                }));
                window.location.href = 'perfil.html';
            } else {
                alert('Usuário ou senha incorretos.');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        }
    }

    async criarConta(username, senha, confirmarSenha) {
        if (!username || !senha || !confirmarSenha) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem.');
            return;
        }

        try {
            const usuarios = await this.carregarUsuarios();
            
            // Verifica se o usuário já existe
            if (usuarios.some(u => u.user === username)) {
                alert('Nome de usuário já existe.');
                return;
            }

            // Cria novo usuário com estatísticas iniciais
            const novoUsuario = {
                user: username,
                senha: senha,
                vitoriasTotal: 0,
                maiorStrik: 0,
                batalhas: 0,
                vitoriasBatalhas: 0
            };

            usuarios.push(novoUsuario);
            await this.salvarUsuarios(usuarios);

            // Salva usuário atual no localStorage
            localStorage.setItem('currentUser', JSON.stringify({
                username: username,
                vitoriasTotal: 0,
                maiorStrik: 0,
                batalhas: 0,
                vitoriasBatalhas: 0
            }));

            alert('Conta criada com sucesso!');
            window.location.href = 'perfil.html';
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            alert('Erro ao criar conta. Tente novamente.');
        }
    }

    async carregarUsuarios() {
        try {
            const response = await fetch('users.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar usuários');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return [];
        }
    }

    async salvarUsuarios(usuarios) {
        try {
            const response = await fetch('salvar_usuarios.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(usuarios)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar usuários');
            }
        } catch (error) {
            console.error('Erro ao salvar usuários:', error);
            throw error;
        }
    }

    async checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            if (window.location.pathname.includes('criarPerfil.html')) {
                window.location.href = 'perfil.html';
            }
        } else if (window.location.pathname.includes('perfil.html')) {
            window.location.href = 'criarPerfil.html';
        }
        this.updateUI();
    }

    async loadUsers() {
        try {
            const response = await fetch(this.usuariosFile);
            const text = await response.text();
            return text.split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const [username, password] = line.split(':');
                    return { username, password };
                });
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return [];
        }
    }

    async saveUser(username, password) {
        try {
            const users = await this.loadUsers();
            if (users.some(u => u.username === username)) {
                throw new Error('Nome de usuário já existe');
            }

            // Em um ambiente real, você usaria uma API para salvar
            // Por hora, vamos apenas simular salvando no localStorage
            const usersStr = localStorage.getItem('users') || '[]';
            const usersList = JSON.parse(usersStr);
            usersList.push({ username, password });
            localStorage.setItem('users', JSON.stringify(usersList));

            return true;
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            throw error;
        }
    }

    async login(username, password) {
        const usersStr = localStorage.getItem('users') || '[]';
        const users = JSON.parse(usersStr);
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = { username: user.username };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        throw new Error('Usuário ou senha inválidos');
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = 'criarPerfil.html';
    }

    updateUI() {
        if (window.location.pathname.includes('perfil.html')) {
            const nomeUsuario = document.getElementById('nome-usuario');
            const vitoriasTotais = document.getElementById('vitorias-totais');
            const maiorStrik = document.getElementById('maior-strik');
            
            if (this.currentUser) {
                // Atualiza o nome do usuário
                if (nomeUsuario) {
                    nomeUsuario.textContent = this.currentUser.username;
                }

                // Carrega e mostra as estatísticas
                const statsString = localStorage.getItem('estatisticas');
                console.log('Estatísticas carregadas:', statsString); // Debug

                let stats = { vitoriasTotal: 0, maiorStrik: 0 };
                if (statsString) {
                    try {
                        stats = JSON.parse(statsString);
                    } catch (e) {
                        console.error('Erro ao parsear estatísticas:', e);
                    }
                }

                // Atualiza os elementos com as estatísticas
                if (vitoriasTotais) {
                    vitoriasTotais.textContent = stats.vitoriasTotal || 0;
                }
                if (maiorStrik) {
                    maiorStrik.textContent = stats.maiorStrik || 0;
                }
            }

            // Configura o botão de logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        }
    }

    async handleGoogleLogin(response) {
        try {
            const credential = response.credential;
            const decodedToken = this.decodeJwtResponse(credential);
            
            // Cria ou atualiza o usuário
            const googleUser = {
                user: decodedToken.email,
                senha: 'google-auth', // marca especial para contas Google
                vitoriasTotal: 0,
                maiorStrik: 0,
                batalhas: 0,
                vitoriasBatalhas: 0,
                googleId: decodedToken.sub,
                nome: decodedToken.name,
                picture: decodedToken.picture
            };

            const usuarios = await this.carregarUsuarios();
            const usuarioExistente = usuarios.find(u => u.googleId === googleUser.googleId);

            if (!usuarioExistente) {
                usuarios.push(googleUser);
                await this.salvarUsuarios(usuarios);
            }

            // Salva na sessão
            localStorage.setItem('currentUser', JSON.stringify({
                username: googleUser.user,
                nome: googleUser.nome,
                picture: googleUser.picture,
                vitoriasTotal: usuarioExistente ? usuarioExistente.vitoriasTotal : 0,
                maiorStrik: usuarioExistente ? usuarioExistente.maiorStrik : 0,
                batalhas: usuarioExistente ? usuarioExistente.batalhas : 0,
                vitoriasBatalhas: usuarioExistente ? usuarioExistente.vitoriasBatalhas : 0
            }));

            window.location.href = 'perfil.html';
        } catch (error) {
            console.error('Erro no login com Google:', error);
            alert('Erro ao fazer login com Google. Tente novamente.');
        }
    }

    decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }
}

// Função global para callback do Google
window.handleGoogleLogin = function(response) {
    const auth = new AuthManager();
    auth.handleGoogleLogin(response);
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthManager();
}); 