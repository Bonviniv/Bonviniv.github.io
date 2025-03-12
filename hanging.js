const desenhoForca = document.getElementById('desenho-forca');
const strikCount = document.getElementById('strik-count');
// Lista de palavras em português (você pode expandir esta lista)
const palavras = [
    "abacaxi", "elefante", "bicicleta", "chocolate", "borboleta",
    "cachorro", "dinossauro", "escorpião", "flamingo", "girassol",
    "hipopótamo", "jabuticaba", "laranjeira", "margarida", "orquídea",
    "papagaio", "quadrado", "rinoceronte", "serpente", "tartaruga"
];

// Filtra palavras com mais de 5 letras
const palavrasFiltradas = palavras.filter(palavra => palavra.length > 5);

// Função para selecionar uma palavra aleatória
function selecionarPalavraAleatoria() {
    const indiceAleatorio = Math.floor(Math.random() * palavrasFiltradas.length);
    return palavrasFiltradas[indiceAleatorio];
}

// Função para atualizar a palavra na tela
function atualizarPalavra() {
    const palavraAtual = selecionarPalavraAleatoria();
    document.getElementById('palavra-atual').textContent = palavraAtual;
}

// Adiciona evento ao botão quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const botaoNovaPalavra = document.getElementById('nova-palavra');
    botaoNovaPalavra.addEventListener('click', atualizarPalavra);
    
    // Mostra primeira palavra ao carregar a página
    atualizarPalavra();
});

function copiarCodigo() {
    const codigoElemento = document.getElementById('codigo-batalha');
    const codigo = codigoElemento.textContent.trim(); // Remove espaços extras

    if (!codigo) { // Verifica se o código está vazio
        alert('Nenhum código disponível para copiar.');
        return;
    }

    navigator.clipboard.writeText(codigo)
        .then(() => {
            alert('Código copiado: ' + codigo);
        })
        .catch(err => {
            console.error('Erro ao copiar código: ', err);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    const codigoElemento = document.getElementById("codigo-batalha");

    codigoElemento.addEventListener("click", function() {
        const codigo = codigoElemento.textContent.trim();

        if (!codigo) { // Verifica se o código não está vazio
            alert("Nenhum código disponível para copiar.");
            return;
        }

        navigator.clipboard.writeText(codigo)
            .then(() => {
                alert("Código copiado: " + codigo);
            })
            .catch(err => {
                console.error("Erro ao copiar código: ", err);
            });
    });
});


// Configuração da base de dados (usando GitHub Gist)
const GIST_ID = 'SEU_GIST_ID_AQUI'; // Você precisará criar um Gist e colocar o ID aqui
const GIST_TOKEN = 'SEU_TOKEN_AQUI'; // Token de acesso ao GitHub (opcional)

// Funções de autenticação e perfil
class UserManager {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }

    loadUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI(true);
        } else {
            this.updateUI(false);
        }
    }

    async login(username, password) {
        // Busca usuários do localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);

        if (user) {
            // Verifica se a senha está correta
            if (user.password === this.hashPassword(password)) {
                this.currentUser = {
                    username: user.username,
                    // Não armazene a senha no currentUser
                };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateUI(true);
                return true;
            }
            throw new Error('Senha incorreta');
        } else {
            // Criar novo usuário
            const newUser = {
                username,
                password: this.hashPassword(password),
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            this.currentUser = {
                username: newUser.username,
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUI(true);
            return true;
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateUI(false);
    }

    hashPassword(password) {
        // Em produção, use uma função hash mais segura
        return btoa(password); // Exemplo simples usando base64
    }

    updateUI(isLoggedIn) {
        const loginForm = document.getElementById('login-form');
        const profileInfo = document.getElementById('profile-info');
        
        if (isLoggedIn) {
            loginForm.style.display = 'none';
            profileInfo.style.display = 'block';
            document.getElementById('user-name').textContent = this.currentUser.username;
        } else {
            loginForm.style.display = 'block';
            profileInfo.style.display = 'none';
        }
    }
}

class JogoDaForca {
    constructor() {
        // Configurações do jogo
        this.palavras = [];
        this.palavraAtual = '';
        this.letrasReveladas = new Set();
        this.erros = 0;
        this.maxErros = 6;
        this.vitorias = 0;
        this.vitoriasTotal = 0;
        this.maiorStrik = 0;
        this.strik = 0;
        this.carregarEstatisticas();
        this.desenhoForca = document.getElementById('desenho-forca');
      



        // Tempos das animações (em milissegundos)
        this.tempos = {
            entreLetras: 100,
            subidaLetra: 300,
            descidaLetra: 300,
            fadeOut: 1000,
            esperaAntesReiniciar: 2000
        };

        // Adiciona os estilos de animação
        this.adicionarEstilosAnimacao();

        this.configurarBotoes();

        this.erros = 0;
        this.desenhosForca = {
            0: `  +---+
  |   |
      |
      |
      |
      |
=========`,
            1: `  +---+
  |   |
  O   |
      |
      |
      |
=========`,
            2: `  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
            3: `  +---+
  |   |
  O   |
 -|   |
      |
      |
=========`,
            4: `  +---+
  |   |
  O   |
 -|-  |
      |
      |
=========`,
            5: `  +---+
  |   |
  O   |
 -|-  |
 -    |
      |
=========`,
            6: `  +---+
  |   |
  O   |
 -|-  |
 - -  |
      |
=========`,
            7: `  +---+
  |   |
      |
      |
      |
      |
=========`
        };
        this.atualizarDesenhoForca();
        this.jogoTerminado = false;
        this.iniciarAtualizacaoForca();
        this.atualizarStrik();
    }

    carregarEstatisticas() {
        const statsString = localStorage.getItem('estatisticas');
        if (statsString) {
            try {
                const stats = JSON.parse(statsString);
                this.vitoriasTotal = stats.vitoriasTotal || 0;
                this.maiorStrik = stats.maiorStrik || 0;
            } catch (e) {
                console.error('Erro ao carregar estatísticas:', e);
            }
        }
    }

    salvarEstatisticas() {
        const stats = {
            vitoriasTotal: this.vitoriasTotal,
            maiorStrik: Math.max(this.maiorStrik, this.vitorias)
        };
        localStorage.setItem('estatisticas', JSON.stringify(stats));
        console.log('Estatísticas salvas:', stats); // Debug
    }



    async inicializarTestes() {
        // Palavras de exemplo para teste
        this.palavras = ["aaaaabbbbb", "cccccddddd", "dddddeeee", "ffffffgggg"];
        this.iniciarNovoJogo();
        this.configurarTeclado();
    }


    async inicializar() {
        try {
            // Caminho do arquivo palavras.txt
            const response = await fetch("palavras.txt");
    
            // Verifica se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao carregar palavras: ${response.statusText}`);
            }
    
            // Lê o conteúdo do arquivo como texto
            const texto = await response.text();
    
            // Divide o texto em uma lista de palavras (cada linha do arquivo é uma palavra)
            this.palavras = texto.split("\n").map(palavra => palavra.trim()).filter(palavra => palavra.length > 0);
    
            // Inicia o jogo com as palavras carregadas
        this.iniciarNovoJogo();
        this.configurarTeclado();
        } catch (error) {
            console.error("Erro ao carregar palavras:", error);
        }
    }
    

    configurarTeclado() {
        const teclas = document.querySelectorAll('.tecla');
        teclas.forEach(tecla => {
            tecla.addEventListener('click', () => {
                // Se o botão já foi usado (tem opacidade reduzida), não faz nada
                if (tecla.style.opacity === '0.5') return;
                
                const letra = tecla.textContent.toLowerCase();
                this.verificarLetra(letra, tecla);
            });
        });
    }

    verificarLetra(letra, tecla) {
        if (letra==='') return;
        if (this.letrasReveladas.has(letra)) return;
        
        this.letrasReveladas.add(letra);
        const temLetra = this.palavraAtual.toLowerCase().includes(letra);
        
        if (temLetra) {
            tecla.style.backgroundColor = '#4CAF50';
            tecla.style.opacity = '0.5';
            
            const espacos = document.querySelectorAll('.letra-espaco');
            let todasLetrasReveladas = true;
            
            [...this.palavraAtual].forEach((letraPalavra, index) => {
                if (letraPalavra.toLowerCase() === letra) {
                    espacos[index].textContent = letraPalavra;
                }
                // Verifica se todas as letras foram reveladas
                if (!this.letrasReveladas.has(letraPalavra.toLowerCase())) {
                    todasLetrasReveladas = false;
                }
            });

            if (todasLetrasReveladas) {
                this.animarVitoria();
            }
        } else {
            tecla.style.backgroundColor = '#ff4444';
            tecla.style.opacity = '0.5';
            this.erros++;
            this.atualizarContadorErros();
            
            if (this.erros >= this.maxErros) {
                this.mostrarTelaEnforcado();
            }
        }
    }

    async animarVitoria() {
        const espacos = document.querySelectorAll('.letra-espaco');
        
        // Desabilita o teclado durante a animação
        const teclado = document.querySelector('.teclado-virtual');
        if (teclado) teclado.style.pointerEvents = 'none';

        // Anima cada letra sequencialmente
        for (let i = 0; i < espacos.length; i++) {
            await this.delay(this.tempos.entreLetras);
            espacos[i].classList.add('letra-vitoria');
        }

        // Atualiza estatísticas
        this.vitorias++;
        this.vitoriasTotal++;
        this.maiorStrik = Math.max(this.maiorStrik, this.vitorias);
        this.salvarEstatisticas();
        this.atualizarContadorVitorias();

        // Espera a animação terminar antes de continuar o jogo
        await this.delay(this.tempos.esperaAntesReiniciar);
        
        // Inicia nova rodada mantendo as vitórias
        this.iniciarNovaRodada();
        
        // Reabilita o teclado
        if (teclado) teclado.style.pointerEvents = 'auto';
    }

    adicionarEstilosAnimacao() {
        if (!document.getElementById('animacao-styles')) {
            const style = document.createElement('style');
            style.id = 'animacao-styles';
            style.textContent = `
                .letra-vitoria {
                    color: #4CAF50;
                    animation: puloLetra ${this.tempos.subidaLetra + this.tempos.descidaLetra}ms ease-in-out,
                             fadeOutLetra ${this.tempos.fadeOut}ms ease-in-out ${this.tempos.subidaLetra + this.tempos.descidaLetra}ms;
                }

                @keyframes puloLetra {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0); }
                }

                @keyframes fadeOutLetra {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    atualizarContadorErros() {
        const contador = document.getElementById('contador-erros');
        if (contador) {
            contador.textContent = this.erros;
        }
    }

    atualizarContadorVitorias() {
        const contadorElement = document.getElementById('numero-vitorias');
        if (contadorElement) {
            contadorElement.textContent = this.vitorias;
        }
    }

    selecionarNovaPalavra() {
        const indiceAleatorio = Math.floor(Math.random() * this.palavras.length);
        this.palavraAtual = this.palavras[indiceAleatorio];
        this.atualizarPalavraCorreta();
        this.criarEspacosLetras();
    }

    criarEspacosLetras() {
        const container = document.getElementById('palavra-escondida');
        container.innerHTML = '';
        
        [...this.palavraAtual].forEach(() => {
            const espaco = document.createElement('div');
            espaco.className = 'letra-espaco';
            espaco.textContent = '_';
            container.appendChild(espaco);
        });
    }

    atualizarPalavraCorreta() {
        const elementoPalavraCorreta = document.getElementById('palavra-correta');
        if (elementoPalavraCorreta) {
            elementoPalavraCorreta.textContent = this.palavraAtual;
        }
    }

    resetarTeclado() {
        const teclas = document.querySelectorAll('.tecla');
        teclas.forEach(tecla => {
            tecla.style.backgroundColor = ''; // volta para a cor original
            tecla.style.opacity = '1';
            tecla.disabled = false;
        });
    }

    mostrarTelaEnforcado() {
        this.jogoTerminado = true;
        this.strik=0;
        this.atualizarStrik();
        this.pararAtualizacaoForca();
        //verificarVitoria();
        const telaEnforcado = document.querySelector('.tela-enforcado');
        if (telaEnforcado) {
            // Atualiza o conteúdo para incluir a palavra correta
            telaEnforcado.innerHTML = `
                <div class="enforcado-content">
                    <h2>Enforcado!</h2>
                    <p class="palavra-correta">A palavra era: ${this.palavraAtual}</p>
                    <button id="jogar-novamente">Jogar Novamente</button>
                </div>
            `;
            telaEnforcado.style.display = 'flex';
            
            // Reconecta o evento do botão jogar novamente
            const botaoJogarNovamente = document.getElementById('jogar-novamente');
            if (botaoJogarNovamente) {
                botaoJogarNovamente.addEventListener('click', () => this.iniciarNovoJogo());
            }
        }
    }

    esconderTelaEnforcado() {
        const telaEnforcado = document.getElementById('tela-enforcado');
        if (telaEnforcado) {
            telaEnforcado.style.display = 'none';
        }
    }

    iniciarNovoJogo() {
        this.jogoTerminado = false;
        this.erros = 0;
        this.iniciarAtualizacaoForca();
        this.letrasReveladas.clear();
        this.atualizarContadorErros();
        this.selecionarNovaPalavra();
        this.resetarTeclado();
        this.esconderTelaEnforcado();
        this.atualizarDesenhoForca();
        this.atualizarStrik();
    }

    iniciarNovaRodada() {
        // Continua o jogo mantendo as vitórias
        this.strik++;
        this.atualizarStrik();
        this.letrasReveladas.clear();
        this.erros = 0;
        this.atualizarContadorErros();
        this.selecionarNovaPalavra();
        this.resetarTeclado();

        document.querySelectorAll('.letra-vitoria').forEach(elemento => {
            elemento.classList.remove('letra-vitoria');
        });
    }

    configurarBotoes() {
        // Configura o botão de recomeçar
        const botaoRecomecar = document.getElementById('recomecar-jogo');
        if (botaoRecomecar) {
            botaoRecomecar.addEventListener('click', () => {
                this.iniciarNovoJogo();
            });
        }
    }

    atualizarDesenhoForca() {
        const desenhoForca = document.getElementById('desenho-forca');
        if (desenhoForca) {
            let desenho;
            
            if (this.erros === 0) {
                desenho = `  +---+
  |   |
      |
      |
      |
      |
=========`;
            } else if (this.erros === 1) {
                desenho = `  +---+
  |   |
  O   |
      |
      |
      |
=========`;
            } else if (this.erros === 2) {
                desenho = `  +---+
  |   |
  O   |
  |   |
      |
      |
=========`;
            } else if (this.erros === 3) {
                desenho = `  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`;
            } else if (this.erros === 4) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`;
            } else if (this.erros === 5) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`;
            } else if (this.erros === 6) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`;
            }
            
            desenhoForca.textContent = desenho;
        }
    }

    atualizarErros() {
        const errorCount = document.getElementById('error-count');
        if (errorCount) {
            errorCount.textContent = this.erros;
        }
        console.log('Atualizando forca. Erros:', this.erros); // Debug
        this.atualizarDesenhoForca();

        if (this.erros >= 6) {
            this.mostrarTelaEnforcado();
        }
    }

    iniciarAtualizacaoForca() {
        // Limpa qualquer intervalo existente
        if (this.intervaloForca) {
            clearInterval(this.intervaloForca);
        }
        
        // Cria novo intervalo que atualiza a forca a cada 1 segundo
        this.intervaloForca = setInterval(() => {
            this.atualizarDesenhoForca();
            this.atualizarStrik();
        }, 1000);
    }

    pararAtualizacaoForca() {
        if (this.intervaloForca) {
            clearInterval(this.intervaloForca);
            this.intervaloForca = null;
        }
    }

    verificarVitoria() {
        if (this.palavraCompleta()) {
            this.strik=strik+1;
            user.strik=this.strik;
            user.strik.update();
            console.log('strik atualizado:', this.strik);

            this.atualizarStrik();
            this.pararAtualizacaoForca();
            // ... resto do código de vitória ...
        }
    }

    atualizarStrik() {
        
        if (strikCount) {
            strikCount.textContent = this.strik;
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const jogo = new JogoDaForca();
    jogo.inicializar();
   
});

function gerarCodigoBatalha() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

function inicializarBatalha() {
    const batalhaBtn = document.getElementById('batalha-btn');
    const batalhaPanel = document.getElementById('batalha-panel');
    const cancelarBtn = document.getElementById('cancelar-batalha');
    const iniciarBtn = document.getElementById('iniciar-batalha');
    const codigoDiv = document.getElementById('codigo-batalha');
    const aceitarContainer = document.getElementById('aceitar-codigo-container');
    const aceitarBtn = document.getElementById('aceitar-codigo');

    // Elementos do "Entrar em Batalha"
    const entrarBatalhaBtn = document.getElementById('entrar-batalha-btn');
    const inputCodigoContainer = document.getElementById('input-codigo-container');
    const inputCodigo = document.getElementById('input-codigo');
    const voltarBtn = document.getElementById('voltar-batalha');
    const confirmarBtn = document.getElementById('confirmar-codigo');
    const erroMensagem = document.getElementById('erro-codigo');
    const criarBatalhaContainer = document.getElementById('criar-batalha-container');

    // Evento do botão principal de batalha
    batalhaBtn.addEventListener('click', () => {
        batalhaPanel.style.display = 'block';
        codigoDiv.style.display = 'none';
        aceitarContainer.style.display = 'none';
        inputCodigoContainer.style.display = 'none';
        criarBatalhaContainer.style.display = 'block';
        entrarBatalhaBtn.style.display = 'block';
        iniciarBtn.textContent = 'Iniciar Batalha';
    });

    // Evento do botão Entrar em Batalha
    entrarBatalhaBtn.addEventListener('click', () => {
        criarBatalhaContainer.style.display = 'none';
        inputCodigoContainer.style.display = 'block';
        entrarBatalhaBtn.style.display = 'none';
        erroMensagem.style.display = 'none';
    });

    // Evento do botão Voltar
    voltarBtn.addEventListener('click', () => {
        criarBatalhaContainer.style.display = 'block';
        inputCodigoContainer.style.display = 'none';
        entrarBatalhaBtn.style.display = 'block';
        erroMensagem.style.display = 'none';
        inputCodigo.value = '';
    });

    // Evento do botão Confirmar
    confirmarBtn.addEventListener('click', async () => {
        const codigo = inputCodigo.value.toUpperCase();
       // const userData = localStorage.getItem('currentUser');
        const username = localStorage.getItem('nomeUsuario');
        
        if (username) {
            
            if (codigo.length === 4) {
                window.location.href = `batalha.html?codigo=${codigo}&username=${encodeURIComponent(username)}`;
            } else {
                erroMensagem.style.display = 'block';
            }
        }else{
           ;
            if (codigo.length === 4) {
                window.location.href = `batalha.html?codigo=${codigo}&username=*__*`;
            } else {
                erroMensagem.style.display = 'block';
            }
        }
    });

    // Evento do input para aceitar apenas letras e números
    inputCodigo.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (e.target.value.length > 4) {
            e.target.value = e.target.value.slice(0, 4);
        }
    });

    // Eventos existentes
    cancelarBtn.addEventListener('click', () => {
        batalhaPanel.style.display = 'none';
        codigoDiv.style.display = 'none';
        aceitarContainer.style.display = 'none';
        inputCodigoContainer.style.display = 'none';
        iniciarBtn.textContent = 'Iniciar Batalha';
    });

    iniciarBtn.addEventListener('click', () => {
        const codigo = gerarCodigoBatalha();
        codigoDiv.textContent = codigo;
        codigoDiv.style.display = 'block';
        aceitarContainer.style.display = 'block';
        iniciarBtn.textContent = 'Gerar Novo Código';
    });

    aceitarBtn.addEventListener('click', async () => {
        const codigo = codigoDiv.textContent;
        //const userData = localStorage.getItem('currentUser');
        const username = localStorage.getItem('nomeUsuario');
        
        if (username) {
            
            
            window.location.href = `batalha.html?codigo=${codigo}&username=${username}`;
        }else{
            
            window.location.href = `batalha.html?codigo=${codigo}&username=*__*`;
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarBatalha();
});

// Quando o jogador sair da batalha e voltar para index.html
function voltarParaIndex() {
    localStorage.setItem('vitoriasBatalhas', '0');
    window.location.href = 'hanging.html';
}

function verificarPalavraCompleta() {
    // ... existing code ...
    if (palavraCompleta) {
        // Se estiver em batalha.html
        if (window.location.pathname.includes('batalha.html')) {
            // Verifica se batalhaManager existe e está em batalha
            if (window.batalhaManager && window.batalhaManager.inBattle) {
                window.batalhaManager.incrementarVitoriasBatalha();
            }
        }
        // ... resto do código existente ...
    }
} 