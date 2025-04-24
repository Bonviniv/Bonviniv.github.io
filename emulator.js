// Função para alterar o mapeamento de botões durante a execução
function remapearBotao(botao, novaTecla) {
    // Verifica se o emulador já foi inicializado
    if (window.EJS_emulator) {
        // Verifica se a função setButtonMapping existe
        if (typeof window.EJS_emulator.setButtonMapping === 'function') {
            // Atualiza a configuração se a função existir
            window.EJS_emulator.setButtonMapping(botao, novaTecla);
            console.log(`Botão ${botao} remapeado para ${novaTecla}`);
            return true;
        } else {
            console.warn(`Função setButtonMapping não disponível neste emulador. Os controles foram configurados nas opções padrão.`);
            return false;
        }
    } else {
        console.warn("Emulador ainda não inicializado. Os controles serão configurados pelas opções padrão.");
        return false;
    }
}

// Função para lidar com erros comuns do emulador
function lidarComErroEmulador(erro) {
    // Verifica se existe a função de diagnóstico
    if (typeof adicionarDiagnostico === 'function') {
        if (erro.message && erro.message.includes('memory access out of bounds')) {
            adicionarDiagnostico("ERRO CRÍTICO: Acesso à memória fora dos limites. Tente alternar para outro núcleo ou recarregar.", "erro");
            console.error("Erro crítico detectado:", erro.message);
            
            // Mostra o painel de diagnóstico se existir
            const diagnosePanel = document.getElementById('diagnose-messages');
            if (diagnosePanel) {
                diagnosePanel.style.display = 'block';
            }
            
            return true; // Erro tratado
        }
    }
    
    return false; // Erro não tratado
}

// Adiciona um listener global para capturar erros
window.addEventListener('error', function(event) {
    // Tenta lidar com o erro
    if (!lidarComErroEmulador(event)) {
        // Se não conseguiu tratar, registra no console
        console.error("Erro não tratado:", event.message);
    }
});
// Módulo para autenticação e interação com Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuração do Firebase (importado de firebase-config.js)
import { database } from "./firebase-config.js";

// Obtém a instância de autenticação
const auth = getAuth();

// Verifica em qual página estamos
const isAuthPage = window.location.pathname.includes('gameflixautentification.html');
const isGameflixPage = window.location.pathname.includes('gameflix.html');

// Função para registrar um novo usuário
// Import das funções de autenticação
import { registrarUsuario, fazerLogin, fazerLogout, verificarAutenticacao, obterDadosUsuario } from './auth.js';

// Exportar as funções para uso em outros arquivos
export { registrarUsuario, fazerLogin, fazerLogout, verificarAutenticacao, obterDadosUsuario };

// Função para inicializar o emulador
function inicializarEmulador() {
    console.log("Emulador inicializado");
    
    // Código de inicialização do emulador
    // (outras funções do emulador podem ser adicionadas aqui)
}

// Inicialização automática
inicializarEmulador();

// Função para fazer login
function fazerLogin(email, senha) {
    return signInWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Atualizar último acesso
            update(ref(database, 'usuarios/' + user.uid), {
                ultimoAcesso: new Date().toISOString()
            });
            
            return user;
        });
}

// Função para fazer logout
function fazerLogout() {
    return signOut(auth);
}

// Função para verificar se o usuário está autenticado
function verificarAutenticacao() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
}

// Verifica se o usuário está logado ao carregar a página gameflix.html
if (isGameflixPage) {
    verificarAutenticacao().then(user => {
        if (!user) {
            // Redirecionar para a página de autenticação se não estiver logado
            window.location.href = 'gameflixautentification.html';
        } else {
            console.log('Usuário autenticado:', user.email);
            // Aqui você pode personalizar a experiência para o usuário logado
            // Por exemplo, mostrar o nome de usuário no canto superior
            
            // Pegando informações adicionais do usuário no Database
            get(ref(database, 'usuarios/' + user.uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    // Você pode usar os dados do usuário aqui
                    console.log('Dados do usuário:', userData);
                }
            }).catch((error) => {
                console.error('Erro ao buscar dados do usuário:', error);
            });
        }
    });
}

// Configura os eventos dos formulários na página de autenticação
if (isAuthPage) {
    verificarAutenticacao().then(user => {
        if (user) {
            // Se já estiver logado, redirecionar para a página principal
            window.location.href = 'gameflix.html';
        }
    });
    
    document.addEventListener('DOMContentLoaded', () => {
        // Formulário de Login
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const senha = document.getElementById('login-password').value;
                
                loginError.style.display = 'none';
                
                fazerLogin(email, senha)
                    .then(() => {
                        window.location.href = 'gameflix.html';
                    })
                    .catch((error) => {
                        let mensagemErro = 'Ocorreu um erro ao fazer login. Tente novamente.';
                        
                        switch (error.code) {
                            case 'auth/user-not-found':
                                mensagemErro = 'Usuário não encontrado.';
                                break;
                            case 'auth/wrong-password':
                                mensagemErro = 'Senha incorreta.';
                                break;
                            case 'auth/invalid-email':
                                mensagemErro = 'E-mail inválido.';
                                break;
                        }
                        
                        loginError.textContent = mensagemErro;
                        loginError.style.display = 'block';
                    });
            });
        }
        
        // Formulário de Cadastro
        const registerForm = document.getElementById('register-form');
        const registerError = document.getElementById('register-error');
        const registerSuccess = document.getElementById('register-success');
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const nome = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const senha = document.getElementById('register-password').value;
                const confirmarSenha = document.getElementById('register-confirm-password').value;
                
                registerError.style.display = 'none';
                registerSuccess.style.display = 'none';
                
                // Validar senha
                if (senha !== confirmarSenha) {
                    registerError.textContent = 'As senhas não coincidem.';
                    registerError.style.display = 'block';
                    return;
                }
                
                if (senha.length < 6) {
                    registerError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
                    registerError.style.display = 'block';
                    return;
                }
                
                registrarUsuario(nome, email, senha)
                    .then(() => {
                        registerSuccess.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
                        registerSuccess.style.display = 'block';
                        
                        // Limpar formulário
                        registerForm.reset();
                        
                        // Redirecionar após 2 segundos
                        setTimeout(() => {
                            window.location.href = 'gameflix.html';
                        }, 2000);
                    })
                    .catch((error) => {
                        let mensagemErro = 'Ocorreu um erro ao criar a conta. Tente novamente.';
                        
                        switch (error.code) {
                            case 'auth/email-already-in-use':
                                mensagemErro = 'Este e-mail já está em uso.';
                                break;
                            case 'auth/invalid-email':
                                mensagemErro = 'E-mail inválido.';
                                break;
                            case 'auth/weak-password':
                                mensagemErro = 'A senha é muito fraca.';
                                break;
                        }
                        
                        registerError.textContent = mensagemErro;
                        registerError.style.display = 'block';
                    });
            });
        }
    });
}

// Exporta as funções para uso em outros arquivos
export {
    registrarUsuario,
    fazerLogin,
    fazerLogout,
    verificarAutenticacao
};
// Adiciona um listener para quando o emulador estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("Página carregada. Os controles foram configurados nas opções padrão (EJS_defaultOptions).");
    
    // Verifica se o painel de diagnóstico está aberto e ajusta o layout se necessário
    if (document.getElementById('diagnose-messages') && 
        document.getElementById('diagnose-messages').style.display !== 'none') {
        // Tenta chamar a função de ajuste se ela existir
        if (typeof ajustarLayoutDiagnostico === 'function') {
            ajustarLayoutDiagnostico();
        }
    }
    
    // Adicionando informações de debug para os valores das variáveis do emulador
    if (typeof EJS_biosUrl !== 'undefined') {
        console.log("BIOS configurado:", EJS_biosUrl);
    }
    
    if (typeof EJS_gameUrl !== 'undefined') {
        console.log("Jogo configurado:", EJS_gameUrl);
    }
    
    // Verifica periodicamente se o emulador está pronto, apenas para informação
    const checkEmulatorReady = setInterval(function() {
        if (window.EJS_emulator) {
            console.log("Emulador inicializado!");
            clearInterval(checkEmulatorReady);
            
            // Adiciona botão de controles à interface do emulador se não existir
            adicionarBotaoControles();
        }
    }, 1000);
});

// Função para verificar problemas com o contêiner do jogo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada. Os controles foram configurados nas opções padrão (EJS_defaultOptions).');
    
    // Verificar se estamos em uma página de emulador
    const isEmulatorPage = document.querySelector('.game-container') !== null;
    
    if (isEmulatorPage) {
        verificarContainerJogo();
        // Tentar corrigir novamente após um curto período
        setTimeout(verificarContainerJogo, 1000);
        // E novamente após um período mais longo (após recursos carregarem)
        setTimeout(verificarContainerJogo, 3000);
    }
});

function verificarContainerJogo() {
    const container = document.querySelector('.game-container');
    const gameElement = document.getElementById('game');
    
    if (!container) {
        console.error('Erro: Container do jogo não encontrado!');
        return false;
    }
    
    if (!gameElement) {
        console.error('Erro: Elemento #game não encontrado!');
        
        // Criar o elemento se ele não existir
        const novoGame = document.createElement('div');
        novoGame.id = 'game';
        novoGame.style.width = '100%';
        novoGame.style.height = '100%';
        novoGame.style.display = 'block';
        container.appendChild(novoGame);
        
        console.log('Elemento #game criado dinamicamente');
        return false;
    }
    
    // Verificar se o contêiner está visível
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        console.error('Erro: Contêiner do jogo tem dimensões zero!');
        
        // Corrigir as dimensões
        container.style.width = '640px';
        container.style.height = '480px';
        container.style.display = 'block';
        
        console.log('Dimensões do contêiner corrigidas');
        return false;
    }
    
    // Verificar se o elemento game ocupa o espaço do contêiner
    const gameRect = gameElement.getBoundingClientRect();
    if (gameRect.width === 0 || gameRect.height === 0) {
        console.error('Erro: Elemento #game tem dimensões zero!');
        
        // Corrigir as dimensões
        gameElement.style.width = '100%';
        gameElement.style.height = '100%';
        gameElement.style.display = 'block';
        
        console.log('Dimensões do elemento game corrigidas');
        return false;
    }
    
    console.log('Contêiner do jogo verificado e OK');
    return true;
}

// Função para adicionar um botão de controles à interface
function adicionarBotaoControles() {
    // Primeiro verificar o contêiner
    verificarContainerJogo();
    
    // Verifica se o botão já existe
    if (!document.querySelector('.controls-button')) {
        const container = document.querySelector('.game-container');
        
        if (container) {
            // Cria botão flutuante para mostrar controles
            const botaoControles = document.createElement('button');
            botaoControles.className = 'controls-button';
            botaoControles.innerText = 'Mostrar Controles';
            botaoControles.style.position = 'absolute';
            botaoControles.style.bottom = '10px';
            botaoControles.style.right = '10px';
            botaoControles.style.zIndex = '1000';
            botaoControles.style.background = 'rgba(0,0,0,0.7)';
            botaoControles.style.color = 'white';
            botaoControles.style.border = 'none';
            botaoControles.style.padding = '5px 10px';
            botaoControles.style.borderRadius = '4px';
            botaoControles.style.cursor = 'pointer';
            
            // Adiciona evento para mostrar controles
            botaoControles.addEventListener('click', function() {
                const controlsInfo = document.querySelector('.controls-info');
                if (controlsInfo) {
                    controlsInfo.style.display = controlsInfo.style.display === 'none' ? 'block' : 'none';
                }
            });
            
            container.style.position = 'relative';
            container.appendChild(botaoControles);
        }
    }
}

// Executar a verificação periodicamente para garantir que o contêiner esteja visível
setInterval(verificarContainerJogo, 5000);

// Executar a verificação imediatamente
document.addEventListener('DOMContentLoaded', verificarContainerJogo);
