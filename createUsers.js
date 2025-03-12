import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyCU9Qg49gLZTjwkdKXCuDGNFfHT-r3TNbw",
    authDomain: "forca-a842a.firebaseapp.com",
    databaseURL: "https://forca-a842a-default-rtdb.firebaseio.com",
    projectId: "forca-a842a",
    storageBucket: "forca-a842a.firebasestorage.app",
    messagingSenderId: "193655210620",
    appId: "1:193655210620:web:d9e031a1bf40c757927ff9",
    measurementId: "G-G9WJMEKCFH"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class CreateUsers {
    constructor() {
        this.database = database;
        this.isLoginMode = false;
        this.currentUser = null;
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
                // Salva o usuário logado
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
                vitoriasBatalhas: 0,
                strik: 0
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
            const userRef = ref(this.database, 'usuarios');
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return [];
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            return [];
        }
    }

    async salvarUsuarios(usuarios) {
        try {
            const userRef = ref(this.database, 'usuarios');
            await set(userRef, usuarios);
            console.log('Usuários salvos com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar usuários:', error);
            alert('Erro ao salvar dados. Verifique o console para mais detalhes.');
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
            window.location.href = 'user.html';
        }
        this.updateUI();
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

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = 'user.html';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const createUser = new CreateUsers();
});
