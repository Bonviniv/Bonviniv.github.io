const testeDebug = false;
const darDica = true;
let ptBr = true; 



  // Adicionar listeners para o botão de dica do ro

   
const desenhoForca = document.getElementById('desenho-forca');
const strikCount = document.getElementById('strik-count');
// Lista de palavras em português (você pode expandir esta lista)
const palavras = [
    "abacaxi", "elefante", "bicicleta", "chocolate", "borboleta",
    "cachorro", "dinossauro", "escorpião", "flamingo", "girassol",
    "hipopótamo", "jabuticaba", "laranjeira", "margarida", "orquídea",
    "papagaio", "quadrado", "rinoceronte", "serpente", "tartaruga"
];

const letrasMapeadas = {
    'a': ['a', 'á', 'à', 'ã', 'â'],
    'e': ['e', 'é', 'è', 'ê'],
    'i': ['i', 'í', 'ì', 'î'],
    'o': ['o', 'ó', 'ò', 'õ', 'ô', 'o’'],
    'u': ['u', 'ú', 'ù', 'û'],
    'c': ['c', 'ç']
    // Adicione mais mapeamentos conforme necessário
};
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


function copiarCodigo() {
    const codigoElemento = document.getElementById('codigo-batalha');
    const codigo = codigoElemento.textContent.trim(); // Remove espaços extras

    if (!codigo) { // Verifica se o código está vazio
        alert('Nenhum código disponível para copiar.');
        return;
    }

    navigator.clipboard.writeText(codigo)
        .then(() => {
           // alert('Código copiado: ' + codigo);
        })
        .catch(err => {
            console.error('Erro ao copiar código: ', err);
        });
}
// ...existing code...

// Adicione esta classe CSS ao seu arquivo CSS ou dentro de uma tag <style> no HTML


// ...existing code...


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
        this.ptBr = true;
        this.palavras = [];
        this.palavraAtual = '';
        this.letrasReveladas = new Set();
        this.erros = 0;
        this.maxErros = 10;
        this.vitorias = 0;
        this.vitoriasTotal = 0;
        this.maiorStrik = 0;
        this.strik = 0;
        this.dicasUsadaNoRound= false;
        this.carregarEstatisticas();
        this.desenhoForca = document.getElementById('desenho-forca');
        this.userUndefined = this.gerarNomeAleatorio();
        this.codeRedirectBatalha =document.getElementById('codeRedirectBatalha');
        this.dicasDisponiveis = 0;
        this.avisoStrikCount=0;
        this.firstReset=false;
      
        if(localStorage.getItem('nomeUsuario') == undefined){
            localStorage.setItem('nomeUsuario', this.userUndefined);
        }

      



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
        this.atualizarContadorDicas();   
        this.configurarPtBotao();
        this.checkBatalhaLingua();
        this.changeToogleByFirebase();
        this.carregarPlavraIdiomaBatalha();
              
       
       
    }

    atualizarContadorDicas() {
        const contadorDicasElement = document.getElementById('contador-dicas');
        const dicaRoboBtn = document.getElementById('dica-robo-btn');

        if(Math.floor(this.strik / 5) > this.avisoStrikCount){
            this.avisoStrikCount++;
            this.mostrarAviso('Você ganhou uma dica', 'piscar-verde');

        }

        if(this.dicasDisponiveis>=5){
            if (contadorDicasElement) {
                let dicasPerStrik = Math.floor(this.dicasDisponiveis / 5);
               
                dicaRoboBtn.style.display = 'block';
                if(dicasPerStrik>1){
                    contadorDicasElement.textContent = `${dicasPerStrik}`;
                    contadorDicasElement.style.display = 'block';
                }else{
                    contadorDicasElement.style.display = 'none'
                }
                
            }
        }
        
        if (this.dicasDisponiveis<5){   
            if (contadorDicasElement) {
                dicaRoboBtn.style.display = 'none';
                contadorDicasElement.style.display = 'none';
            }
        }
    }

    mostrarAviso(texto, cor) {
        const avisosElement = document.getElementById('avisos');
        if (avisosElement) {
            avisosElement.textContent = texto;
            avisosElement.style.display = 'block';
            avisosElement.style.color = 'red';
            avisosElement.style.opacity = '1';

            // Piscar em vermelho
            avisosElement.classList.add(cor);

            setTimeout(() => {
                // Voltar à cor original e remover a classe de piscar
                avisosElement.style.color = '';
                avisosElement.classList.remove(cor);

                // Perder a transparência por 2 segundos
                avisosElement.style.opacity = '1';
                setTimeout(() => {
                    avisosElement.style.display = 'none';
                }, 2000);
            }, 500); // Tempo de piscar em vermelho
        }
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
        this.palavras = ["a", "a"];
        this.iniciarNovoJogo();

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

    async carregarPalavras(arquivo) {
        try {
            const response = await fetch(arquivo);
            if (!response.ok) {
                throw new Error(`Erro ao carregar palavras: ${response.statusText}`);
            }
            const texto = await response.text();
            this.palavras = texto.split("\n").map(palavra => palavra.trim()).filter(palavra => palavra.length > 0);

            if (window.location.pathname.includes('batalha.html')){
                return;
            }else{
            
            this.jogoTerminado = true;
            this.strik = 0;
            
            this.atualizarStrik();
        
            this.dicasDisponiveis=0;
            this.dicasUsadaNoRound= false;
            this.atualizarContadorDicas();
            this.pararAtualizacaoForca();
        
            this.iniciarNovoJogo();

            }




                
           
        } catch (error) {
            console.error("Erro ao carregar palavras:", error);
        }
    }


    configurarPtBotao() {
        const togglePtBr = document.getElementById('toggle-ptBr');
        const toggleLabel = document.querySelector('label[for="toggle-ptBr"]');

        toggleLabel.textContent = this.ptBr ? 'PT' : 'EN';

        if (togglePtBr) {
            togglePtBr.checked = this.ptBr; // Define o estado inicial do toggle switch

            togglePtBr.addEventListener('change', async () => {
                this.ptBr = togglePtBr.checked;
                console.log('ptBr:', this.ptBr); // Debug para verificar a mudança
                toggleLabel.textContent = this.ptBr ? 'PT' : 'EN';

                if (this.ptBr) {
                    await this.carregarPalavras('palavras.txt');
                } else {
                    await this.carregarPalavras('words.txt');
                }
            });
        }
    }



    async carregarPlavraIdiomaBatalha(){
        if (window.location.pathname.includes('batalha.html')){
            
            

            const playersHeader = document.querySelector('.players-header h3');
            const togglePtBrCheck = document.getElementById('toggle-ptBr');
            //playersHeader.textContent!='Batalha prestes a começar'
            let contadorFilho=0;

            setInterval(async () => {
                try {

                    if(playersHeader.textContent!='Batalha prestes a começar' && contadorFilho<=3){

                        if(togglePtBrCheck.checked){

                            //emPT

                            this.carregarPalavras('palavras.txt');
                            this.letrasReveladas.clear();
                            this.atualizarContadorErros();
                            this.selecionarNovaPalavra();
                       
                            console.log('togglePtBrCheck ta checkado '); // Debug para verificar a mudança
                           
                        }
                        if(!togglePtBrCheck.checked){

                            //emEN
                            console.log('togglePtBrCheck ta NÃO checkado ');
                            this.carregarPalavras('words.txt');
                            this.letrasReveladas.clear();
                            this.atualizarContadorErros();
                            this.selecionarNovaPalavra();
                            
                        }

                        contadorFilho++;

                    }

                } catch (error) {
                    console.error('Erro ao verificar o atributo isNotPt:', error);
                }
            }, 500); // Verifica a cada 1 segundo

      
        }
    }
    

    changeToogleByFirebase(){
        if (window.location.pathname.includes('batalha.html')){

            const togglePtBr = document.getElementById('toggle-container');
            const toggleLabel = document.querySelector('label[for="toggle-ptBr"]');
            const togglePtBrCheck = document.getElementById('toggle-ptBr');

                    setInterval(async () => {
                        try {

                            if(togglePtBr.opacity>=0.001){

                                if(togglePtBrCheck.checked){
                               
                                    console.log('carregando palavras em pt'); // Debug para verificar a mudança
                                     this.carregarPalavras('palavras.txt');
                                }
                                if(!togglePtBrCheck.checked){
                                    console.log('carregando palavras em ingles');
                                     this.carregarPalavras('words.txt');
                                }

                            }

                        } catch (error) {
                            console.error('Erro ao verificar o atributo isNotPt:', error);
                        }
                    }, 500); // Verifica a cada 1 segundo
        }
    }


    verificarLetra(letra, tecla) {
        if (letra === '') return;
        if (this.letrasReveladas.has(letra)) return;

        // Adiciona a letra e suas variantes ao conjunto de letras reveladas
        const letrasParaVerificar = letrasMapeadas[letra] || [letra];
        letrasParaVerificar.forEach(l => this.letrasReveladas.add(l));

        const temLetra = letrasParaVerificar.some(l => this.palavraAtual.toLowerCase().includes(l));

        if (temLetra) {
            tecla.style.backgroundColor = '#4CAF50';
            tecla.style.opacity = '0.5';

            const espacos = document.querySelectorAll('.letra-espaco');
            let todasLetrasReveladas = true;

            [...this.palavraAtual].forEach((letraPalavra, index) => {
                if (letrasParaVerificar.includes(letraPalavra.toLowerCase()) || letraPalavra === ' ' || letraPalavra === '-') {
                    espacos[index].textContent = letraPalavra;
                }
                // Verifica se todas as letras foram reveladas
                if (!this.letrasReveladas.has(letraPalavra.toLowerCase()) && letraPalavra !== ' ' && letraPalavra !== '-') {
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
                this.dicasDisponiveis=0;
                this.dicasUsadaNoRound= false;
                this.atualizarContadorDicas();
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

    atualizarDicaRobo(texto) {
        const dicaRoboParagrafo = document.querySelector('#dica-robo-painel p');
        if (dicaRoboParagrafo) {
            dicaRoboParagrafo.textContent = texto;
        }
    }


      
      async  dica(palavraAtual) {

        
        let prompt = `Estou jogando forca com um amigo e ele tem que
        adivinhar, escolhi a palavra "${palavraAtual}". Me dê uma dica
        para passar para ele, a dica não deve fazer com que
        adivinhar seja muito facil, a dica pode ser vaga. 
        Responda somentecom a dica.`;

        if(!this.ptBr){

             prompt =`Im playing hangman with a friend,
             and they have to guess. I chose the word "${palavraAtual}". 
             Give me a hint to pass to them. The hint should not 
             make guessing too easy; it can be vague. 
             Respond with the hint only.`;


            
        }

        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        
        try {
          const configResponse = await fetch('config.json');
          const config = await configResponse.json();
          const apiKey = config.apiKeyGemini;
      
          let tentativas = 5;
          let espera = 2000;
      
          for (let i = 0; i < tentativas; i++) {
            try {
              const response = await fetch(`${apiUrl}?key=${apiKey}`, {  // Melhor forma de passar a chave
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{ text: prompt }]  // Formato correto para a API Gemini
                  }],
                  generationConfig: {
                    maxOutputTokens: 50  // Usar generationConfig para definir parâmetros de geração
                  }
                })
              });
      
              if (response.status === 429) {
                console.warn(`Muitas requisições. Tentando novamente em ${espera / 1000} segundos...`);
                await new Promise(resolve => setTimeout(resolve, espera));
                espera *= 2;
                continue;
              }
      
              if (!response.ok) {
                console.error(`Erro na requisição: ${response.status} - ${response.statusText}`);
                return null; // Indica que a requisição falhou
              }
      
              const data = await response.json();
      
              if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
                const dica = data.candidates[0].content.parts[0].text.trim();
                console.log('Dica obtida da API:', dica);
                this.atualizarDicaRobo(dica);

                

                return dica;
              } else {
                console.error('Resposta da API não contém dicas válidas:', data);
                return null; // Indica que não foi possível obter a dica
              }
      
            } catch (error) {
              console.error('Erro na tentativa de obter dica:', error);
              await new Promise(resolve => setTimeout(resolve, espera)); // Espera antes de tentar novamente
              espera *= 2; // Aumenta o tempo de espera
            }
          }
          console.error('Falha ao obter dica após várias tentativas.');
          return null; // Retorna null após todas as tentativas falharem
      
        } catch (error) {
          console.error('Erro ao carregar configuração ou API Key:', error);
          return null; // Retorna null em caso de erro na configuração
        }
      }
      
       
    

      criarEspacosLetras() {
        const container = document.getElementById('palavra-escondida');
        container.innerHTML = '';
        
        [...this.palavraAtual].forEach(letra => {
            const espaco = document.createElement('div');
            espaco.className = 'letra-espaco';
            if (letra === ' ' || letra === '-') {
                espaco.textContent = letra;
                this.letrasReveladas.add(letra);
            } else {
                espaco.textContent = '_';
            }
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


    // ...existing code...


// ...existing code...

mostrarTelaEnforcado() {
    this.jogoTerminado = true;
    this.strik = 0;
    
    this.atualizarStrik();

    this.dicasDisponiveis=0;
    this.dicasUsadaNoRound= false;
    this.atualizarContadorDicas();
    this.pararAtualizacaoForca();

    // Completa a palavra e aplica a animação
    const espacos = document.querySelectorAll('.letra-espaco');
    espacos.forEach((espaco, index) => {
        espaco.textContent = this.palavraAtual[index];
        espaco.style.animationDelay = `${index * 0.1}s`; // Adiciona um atraso de 0.1s para cada letra
        espaco.classList.add('letra-erro');
    });

    // Espera a animação terminar antes de mostrar o painel
    setTimeout(() => {
        const telaEnforcado = document.querySelector('.tela-enforcado');
        if (telaEnforcado) {
            this.iniciarNovoJogo();
        }
    }, 1600 + espacos.length * 100); // Tempo total da animação (600ms + 1000ms + delay por letra)
}

// ...existing code...

    esconderTelaEnforcado() {
        const telaEnforcado = document.getElementById('tela-enforcado');
        if (telaEnforcado) {
            telaEnforcado.style.display = 'none';
        }
    }

     printCodeRedirectBatalha() {
        console.log("codeRedirectBatalha controle1 =", codeRedirectBatalha);
    }

    iniciarNovoJogo() {

        this.printCodeRedirectBatalha();
        this.firstReset=false;
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
       
        this.configurarTeclado();
        this.configurarBotaoDica();
        console.log('Nova rodada iniciada. Palavra:', this.palavraAtual); // Debug
        this.checkBatalhaLingua();
        if(localStorage.getItem('nomeUsuario') == 'carol'){
            this.mostrarAviso('OI ASMORRRRR', 'piscar-verde');
        }

        this.verificarCodeRedirectBatalha();
        
    }


    verificarCodeRedirectBatalha() {

        console.log("O código redirect : ",codeRedirectBatalha);
        const userRedirect = localStorage.getItem('nomeUsuario');
        
        if(codeRedirectBatalha){
             if (codeRedirectBatalha.length === 4) {
                
            console.log("O código tem o tamanho certo");
            window.location.href = `batalha.html?codigo=${codeRedirectBatalha}&username=${userRedirect}`;
        }else{
            return;
        }
        }
       
    }

    iniciarNovaRodada() {
        // Continua o jogo mantendo as vitórias

        this.dicasUsadaNoRound= false;
        this.strik++;
        this.dicasDisponiveis++;
        this.atualizarStrik();
        this.letrasReveladas.clear();
        this.erros = 0;
        this.atualizarContadorErros();
        this.selecionarNovaPalavra();
        this.resetarTeclado();
       
        this.configurarBotaoDica();
        
        document.querySelectorAll('.letra-vitoria').forEach(elemento => {
            elemento.classList.remove('letra-vitoria');
        });

        console.log('Nova rodada iniciada. Palavra:', this.palavraAtual); // Debug
        console.log('nomeUsuario:', localStorage.getItem('nomeUsuario')); 

        if(localStorage.getItem('nomeUsuario') == 'carol'){
            this.mostrarAviso('OI ASMORRRRR', 'piscar-verde');
        }
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



    async checkBatalhaLingua() {    
    if (window.location.pathname.includes('batalha.html') ){

        const playersHeader = document.querySelector('.players-header h3');
       


        let contador=0;

        setInterval(() => {    
            const battleControl = document.getElementById('battle-control');   
            const togglePtBr = document.getElementById('toggle-container');
        
            if (playersHeader.textContent!='Batalha prestes a começar' && contador<2) {
                contador++;
                this.letrasReveladas.clear();
                this.atualizarContadorErros();
                this.selecionarNovaPalavra();
            }
        }, 100); // Verifica a cada 0.1 segundo
        
     }
        
    }

configurarBotaoDica() {

    if (window.location.pathname.includes('batalha.html')){
       return;
    }
    const dicaRoboBtn = document.getElementById('dica-robo-btn');
    const dicaRoboPainel = document.getElementById('dica-robo-painel');
    const fecharDicaRoboBtn = document.getElementById('fechar-dica-robo-btn');   

       dicaRoboBtn.addEventListener('click', () => {


        if(this.dicasDisponiveis>=5){

            if(!this.dicasUsadaNoRound){
                this.dica(this.palavraAtual);
                dicaRoboPainel.style.display = 'block'; 
                let aux=this.dicasDisponiveis;
                this.dicasDisponiveis=aux-5;
                this.dicasUsadaNoRound= true;
                
                this.atualizarContadorDicas();

              }else{
                this.mostrarAviso('Uma dica por rodada', 'piscar-vermelho');
              }

        }else{
                return;}
        });

        fecharDicaRoboBtn.addEventListener('click', () => {
            if(dicaRoboPainel){
                dicaRoboPainel.style.display = 'none'; 
              }
        });
    
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
=========`;            } else if (this.erros === 6) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`;            } else if (this.erros === 6) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`;            } else if (this.erros === 7) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
*     |
=========`;            } else if (this.erros === 8) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
*  *  |
=========`;            } else if (this.erros === 9) {
                desenho = `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
*  *  |
=========
LAST BREATH`;       }
            
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

        if (this.erros >= 10) {
            this.mostrarTelaEnforcado();
            this.dicasDisponiveis=0;
            this.atualizarContadorDicas();
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
            this.configurarBotaoDica();
            this.atualizarContadorDicas();
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

        gerarNomeAleatorio() {
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let nomeAleatorio = '';
    
        for (let i = 0; i < 4; i++) {
            nomeAleatorio += letras.charAt(Math.floor(Math.random() * letras.length));
        }
    
        return nomeAleatorio;
    }

    atualizarStrik() {

        const username = localStorage.getItem('nomeUsuario');

        const strikCount = document.getElementById('strik-count');
        if(username == undefined){
            username='*__*';
        }

        console.log('strik',this.strik, ' username - ', username );
        if (strikCount) {
            strikCount.textContent = this.strik;
        }

    

    }

}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const jogo = new JogoDaForca();

    if(testeDebug){
        jogo.inicializarTestes();
    }else{
        jogo.inicializar();
    }
    //jogo.inicializar();
   
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


        if(batalhaPanel.style.display == 'block'){

            batalhaPanel.style.display = 'none';

        }else{
            batalhaPanel.style.display = 'block';
        codigoDiv.style.display = 'none';
        aceitarContainer.style.display = 'none';
        inputCodigoContainer.style.display = 'none';
        criarBatalhaContainer.style.display = 'block';
        entrarBatalhaBtn.style.display = 'block';
        iniciarBtn.textContent = 'Iniciar Batalha';
        }

        
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



document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codigo = urlParams.get('codeRedirectBatalha');
    if (codigo) {
        codeRedirectBatalha = codigo;
        console.log('codeRedirectBatalha:', codeRedirectBatalha);
    }
});


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
               
                // Adiciona a classe de animação
                codigoElemento.classList.add('blink');
                // Remove a classe de animação após 0.25 segundos
                setTimeout(() => {
                    codigoElemento.classList.remove('blink');
                }, 250);
            })
            .catch(err => {
                console.error("Erro ao copiar código: ", err);
            });
    });
});

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
