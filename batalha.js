import { database } from './firebase-config.js';
import { 
    ref, 
    set, 
    onValue, 
    remove, 
    update, 
    onDisconnect,
    get,
    child
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const strikCount = document.getElementById('strik-count');
const battleControl = document.getElementById('battle-control');


class BatalhaManager {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.codigoBatalha = urlParams.get('codigo');
        this.meuNome = decodeURIComponent(urlParams.get('username') || '');
        
        console.log('Iniciando batalha:', {
            codigo: this.codigoBatalha,
            nome: this.meuNome
        });

        // Referências do Firebase
        this.salaRef = ref(database, `salas/${this.codigoBatalha}`);
        this.jogadoresRef = ref(database, `salas/${this.codigoBatalha}/jogadores`);
        
        this.inBattle = false;
        this.isCriador = false;
        this.toRestart = false;
        this.verificarCriadorSala();
        this.vitoriasBatalhas = 0;

        this.inicializarInterface();
        this.inicializarSala();
        this.configurarListeners();
        this.configurarBotaoSair();
        this.iniciarHeartbeat();
        this.iniciarMonitoramentoStrik();
        this.monitorarSalaTrancada(urlParams.get('codigo'));
        this.configurarBotaoBatalha();
        this.atualizarEstadoTeclas(); 
        


        setInterval(async () => {
            const jogadoresRef = ref(database, `salas/${this.codigoBatalha}/jogadores`);
            try {
                const snapshot = await get(jogadoresRef);
                const jogadores = snapshot.val() || {};
                this.atualizarListaJogadores(jogadores);
               
            } catch (error) {
                console.error("Erro ao buscar jogadores:", error);
            }
        }, 1000); // Atualiza a cada 1 segundo

        this.checkInBattle();
        this.iniciarMonitoramentoJogadores();
        this.verificarStrikVencedor();
    }

    reiniciarJogo() {
        console.log("Reiniciando jogo...");
    
        // Define a batalha como encerrada
        this.inBattle = false;
    
        // Destranca a sala na Firebase
        update(this.salaRef, { salaTrancada: false })
            .then(() => console.log("Sala destrancada para próxima batalha."))
            .catch(error => console.error("Erro ao destrancar sala:", error));
    
        // Reseta o strike de todos os jogadores
        get(this.jogadoresRef).then(snapshot => {
            const jogadores = snapshot.val() || {};
            Object.keys(jogadores).forEach(jogadorId => {
                const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${jogadorId}`);
                update(jogadorRef, { strik: 0 })
                    .then(() => console.log(`Strik resetado para ${jogadorId}`))
                    .catch(error => console.error(`Erro ao resetar strik para ${jogadorId}:`, error));
            });
        });
    
        // Aguarda 10 segundos e recarrega a página
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
    

    verificarStrikVencedor() {
        setInterval(async () => {
            try {
                const snapshot = await get(this.jogadoresRef);
                const jogadores = snapshot.val() || {};
    
                Object.values(jogadores).forEach(jogador => {
                    if (jogador.strik >= 5) {
                        const playersHeader = document.querySelector('.players-header h3');
                        playersHeader.textContent = `🎉 Vencedor: ${jogador.nome} 🎉 `;
                        console.log(`🎉 Vencedor: ${jogador.nome} com strik ${jogador.strik}!`);
                        this.inBattle = !this.inBattle; // Alterna entre true e false
                        this.desabilitarTeclas(); // Atualiza as teclas
                        
                        setTimeout(() => {
                            this.reiniciarJogo();
                        }, 10000);
                        
                        //this.mudarSalaTrancadaNaFirebase();

                    }
                });
    
            } catch (error) {
                console.error('Erro ao verificar strik dos jogadores:', error);
            }
        }, 1000); // Executa a cada 1 segundo
    }
    
    

    iniciarMonitoramentoJogadores() {
        onValue(this.jogadoresRef, (snapshot) => {
            const jogadores = snapshot.val() || {};
            console.log("Jogadores atualizados:", jogadores);
            this.atualizarListaJogadores(jogadores);
        });
    }

    atualizarListaJogadores(jogadores) {
        Object.keys(jogadores).forEach((idJogador) => {
            const jogador = jogadores[idJogador];
            const strikCount = document.getElementById('strik-count');
            
            // Atualiza o strik apenas se o jogador for o atual
            if (jogador.nome === this.meuNome && strikCount) {
                this.atualizarStrikNoFirebase(jogador.nome, parseInt(strikCount.textContent, 10));
            }
        });
    }
    
    atualizarStrikNoFirebase(nomeJogador, novoStrik) {
        const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${nomeJogador}`);
        update(jogadorRef, { strik: novoStrik })
            .then(() => console.log(`Strik atualizado para ${novoStrik} do jogador ${nomeJogador}`))
            .catch((error) => console.error("Erro ao atualizar Strik:", error));
    }
    

    inicializarInterface() {
        // Mostra o código da batalha
        const codigoDisplay = document.getElementById('codigo-batalha');
        if (codigoDisplay) {
            codigoDisplay.textContent = this.codigoBatalha;
            console.log('Código da sala definido:', this.codigoBatalha); // Debug
        } else {
            console.error('Elemento código-batalha não encontrado'); // Debug
        }
    }

    
    // Dentro da classe ou função onde você está manipulando o strik
    iniciarMonitoramentoStrik() {
        setInterval(async () => {
            const strikCount = document.getElementById('strik-count');
            
            // Verifica se o elemento 'strik-count' existe
            if (strikCount) {
                const strikValue = parseInt(strikCount.textContent, 10) || 0;  // Pega o valor de strik e garante que seja um número
                
                // Exibe o valor de strik no console a cada 5 segundos
                console.log(`Valor de strikCount: ${strikValue}`);
    
                // Atualiza o valor de strik na Firebase
                const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${this.meuNome}`);
                
                try {
                    await update(jogadorRef, {
                        strik: strikValue
                    });
                    console.log(`Valor de strik atualizado para ${strikValue} para o jogador ${this.meuNome}`);
                } catch (error) {
                    console.error('Erro ao atualizar strik na Firebase:', error);
                }
            }
        }, 1000);  // Executa a cada 5 segundos (5000 milissegundos)
    }
    
// Para iniciar o monitoramento, você chama a função

    async inicializarSala() {
        try {
            // Registra o jogador na sala
            const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${this.meuNome}`);
            
            await set(jogadorRef, {
                nome: this.meuNome,
                vitorias: 0,
                strik: 0, // Adicionando strik inicial
                ultimoAcesso: Date.now()
            });


            // Remove o jogador quando desconectar
            onDisconnect(jogadorRef).remove();

            // Adicionar listener para o estado de batalha
            onValue(ref(database, `salas/${this.codigoBatalha}/inBattle`), (snapshot) => {
                this.inBattle = snapshot.val() || false;
            });
            
            onValue(this.jogadoresRef, (snapshot) => {
                const jogadores = snapshot.val() || {};
                console.log('Jogadores atualizados:', jogadores);
                this.atualizarListaJogadores(jogadores);
                this.atualizarContadorJogadores(Object.keys(jogadores).length);
            });
            

        } catch (error) {
            console.error('Erro ao inicializar sala:', error);
        }
    }

    iniciarAtualizacaoLista() {
        // Limpa qualquer intervalo existente
        if (this.intervaloForca) {
            clearInterval(this.intervaloForca);
        }
        
        // Cria novo intervalo que atualiza a forca a cada 1 segundo
        this.intervaloForca = setInterval(() => {
            this.atualizarListaJogadores(jogadores);          
        }, 1000);
    }

    configurarListeners() {
        // Escuta mudanças nos jogadores
        onValue(this.jogadoresRef, (snapshot) => {
            const jogadores = snapshot.val() || {};
            console.log('Jogadores atualizados:', jogadores);
            this.atualizarListaJogadores(jogadores);
            this.atualizarContadorJogadores(Object.keys(jogadores).length);
        });
        
    }
     monitorarSalaTrancada(codigoBatalha) {
        const salaTrancadaRef = ref(database, `salas/${codigoBatalha}/salaTrancada`);
    
        onValue(salaTrancadaRef, (snapshot) => {
            const salaTrancada = snapshot.val();
            if (salaTrancada === true) {
                document.getElementById('strik-count').textContent = 0;
                console.log("Sala trancada! Strik resetado para 0.");
            }
        });
    }
    atualizarListaJogadores(jogadores) {
        const container = document.getElementById('players-container');
        const strikCount = document.getElementById('strik-count');
        if (!container) return;

        container.innerHTML = '';
        
        Object.values(jogadores).forEach(jogador => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            if (jogador.nome === this.meuNome) {
                playerItem.classList.add('current-player');
            }

            playerItem.innerHTML = `
                <span class="player-name">${jogador.nome}</span>  

                <span class="player-strik">Strick: ${jogador.strik || 0}</span>
            `;
            container.appendChild(playerItem);
        });
    }

    atualizarContadorJogadores(quantidade) {
        const contador = document.getElementById('contador-usuarios');
        if (contador) {
            contador.textContent = quantidade;
        }
    }

    async incrementarVitorias() {
        try {
            const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${this.meuNome}`);
            const snapshot = await get(jogadorRef);
            const vitoriasAtuais = (snapshot.val()?.vitorias || 0) + 1;
            
            
            await set(jogadorRef, {
                vitorias: vitoriasAtuais,
                ultimoAcesso: Date.now(),
                strik:strikCount
            });
        } catch (error) {
            console.error('Erro ao incrementar vitórias:', error);
        }
    }

    async sairDaSala() {
        try {
            // Remove o jogador da sala
            await remove(ref(database, `salas/${this.codigoBatalha}/jogadores/${this.meuNome}`));
            
            // Verifica se a sala ficou vazia
            const snapshot = await get(this.jogadoresRef);
            if (!snapshot.exists()) {
                // Se não há mais jogadores, remove a sala
                await remove(this.salaRef);
            }
            
            window.location.href = 'hanging.html';
        } catch (error) {
            console.error('Erro ao sair da sala:', error);
        }
    }

    configurarBotaoSair() {
        const sairBtn = document.getElementById('sair-batalha');
        if (sairBtn) {
            sairBtn.addEventListener('click', () => this.sairDaSala());
        }
    }

    atualizarEstatisticas() {
        const strikCount = document.getElementById('strik-count');
        
        if (strikCount) {
            const strikValue = parseInt(strikCount.textContent, 10) || 0;  // Pega o valor de strik e garante que seja um número
            
            const estatisticas = {
                vitoriasTotal: 90,  // Exemplo de vitória total
                maiorStrik: 2,  // Exemplo de maior strik
                strik: strikValue  // Usa o valor real de strik
            };
            
            // Salvar no localStorage ou Firebase
            localStorage.setItem('estatisticas', JSON.stringify(estatisticas));
            console.log('Estatísticas salvas:', estatisticas);
        }
    }

    // Função de heartbeat ou onde o strik está sendo atualizado
    iniciarHeartbeat() {
        // Atualiza o último acesso a cada 30 segundos
        setInterval(async () => {
            try {
                // Chame a função de atualizar as estatísticas a cada 5 segundos ou em outro lugar adequado
                this.atualizarEstatisticas();
            } catch (error) {
                console.error('Erro no heartbeat:', error);
            }
        }, 30000);
    }



   // Dentro da classe ou função de Batalha onde você inicializa os jogadores e as salas
    async verificarCriadorSala() {
        try {
            const salaSnapshot = await get(this.salaRef);
            const salaData = salaSnapshot.val() || {};
            
            // Se a sala não existe ainda, este jogador é o criador
            if (!salaData.criador) {
                await update(this.salaRef, {
                    criador: this.meuNome
                });
                this.isCriador = true;
            } else {
                this.isCriador = salaData.criador === this.meuNome;
            }

            this.configurarBotaoBatalha();
        this.atualizarStrikSala(); // Chama a função para manter o strik atualizado

        } catch (error) {
            console.error('Erro ao verificar criador da sala:', error);
        }
    }

async configurarBotaoBatalha() {
    console.log('configurarBotaoBatalha');

    const divBotaoBatalha = document.getElementById('battle-control');
    const botaoBatalha = document.getElementById('battle-toggle');
        
    if (!divBotaoBatalha || !botaoBatalha) {
        console.error('Elementos do botão de batalha não encontrados!');
        return;
    }

    try {
        const snapshot = await get(this.salaRef);
        const salaData = snapshot.val();

        if (salaData && salaData.criador === this.meuNome) {
            this.isCriador = true;
            divBotaoBatalha.style.display = 'block';
        } else {
            this.isCriador = false;
            divBotaoBatalha.style.display = 'none';
            console.log('Usuário não é o criador da sala, botão ocultado.');
            return;
        }

        botaoBatalha.addEventListener('click', async () => {
            console.log('Botão de batalha clicado!');
            this.inBattle = true; // Definir batalha como ativa
            this.atualizarEstadoTeclas(); // Habilita as teclas

            // Atualiza a Firebase para indicar que a batalha começou
            await update(this.salaRef, { salaTrancada: true })
                .then(() => console.log("Batalha iniciada e sala trancada na Firebase"))
                .catch(error => console.error("Erro ao atualizar Firebase:", error));

            divBotaoBatalha.style.display = 'none';
        });

    } catch (error) {
        console.error('Erro ao verificar criador da sala:', error);
    }
}



mudarSalaTrancadaNaFirebase() {
    update(this.salaRef, { salaTrancada: this.inBattle })
        .then(() => console.log(`Sala trancada atualizada para: ${this.inBattle}`))
        .catch((error) => console.error('Erro ao atualizar salaTrancada:', error));
}


checkInBattle() {
    const salaTrancadaRef = ref(database, `salas/${this.codigoBatalha}/salaTrancada`);

    console.log('strikCount de', this.strikCount, this.meuNome);

    onValue(salaTrancadaRef, async (snapshot) => {
        this.inBattle = snapshot.val() || false; // Atualiza o estado inBattle com o valor da Firebase

        this.atualizarEstadoTeclas(); // Atualiza as teclas
        const playersHeader = document.querySelector('.players-header h3');
        playersHeader.textContent = this.inBattle ? 'Batalha Iniciada' : 'Batalha prestes a começar';

        console.log(`Estado da batalha atualizado: ${this.inBattle}`);

        // Atualiza o strik do jogador atual na Firebase
        if (this.strikCount) {
            resetStrik();
        }
        });
    }


    async resetStrik() {
    const strikCount = document.getElementById('strik-count');
    strikCount.textContent = 0;
    const strikValue = parseInt(strikCount.textContent, 10);
            const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${this.meuNome}`);
                    await update(jogadorRef, { strik: strikValue });
                    
                    console.log('strik resetado:', strikValue);
}


atualizarEstadoTeclas() {
    const teclas = document.querySelectorAll('.tecla');
    teclas.forEach(tecla => {
        tecla.disabled = !this.inBattle; // Habilita se inBattle for true
        tecla.style.opacity = this.inBattle ? '1' : '0.5'; // Dá um efeito visual
    });
    console.log(`Teclas atualizadas: ${this.inBattle ? 'Habilitadas' : 'Desabilitadas'}`);
}


desabilitarTeclas() {
    const teclas = document.querySelectorAll('.tecla');
    teclas.forEach(tecla => {
        tecla.disabled =true; // Desativa se inBattle for false
        tecla.style.opacity ='0.5'; // Dá um efeito visual
    });
}






atualizarStrikSala() {
    const strikCount = document.getElementById('strik-count');
    if (strikCount) {
        // Envia a atualização apenas se o valor realmente mudar
        let strikAnterior = -1;

        setInterval(async () => {
            const strikValue = parseInt(strikCount.textContent, 10);
            
            if (strikValue !== strikAnterior) { // Só atualiza se houver mudança
                try {
                    const jogadorRef = ref(database, `salas/${this.codigoBatalha}/jogadores/${this.meuNome}`);
                    await update(jogadorRef, { strik: strikValue });
                    
                    strikAnterior = strikValue; // Atualiza o valor anterior
                    console.log('Strik atualizado na Firebase:', strikValue);
        } catch (error) {
                    console.error('Erro ao atualizar strik na Firebase:', error);
                }
        }
        }, 3000); // Atualiza a cada 3 segundos
    }
}

}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.batalhaManager = new BatalhaManager();
});

// Modifique a função verificarPalavraCompleta no seu arquivo de jogo
function verificarPalavraCompleta() {
    const palavraAtual = palavraSecreta.join('');
    const palavraEscolhida = palavraSecreta.join('');
    
    if (palavraAtual === palavraEscolhida) {
        // Se estamos em batalha.html
        if (window.location.pathname.includes('batalha.html') && window.batalhaManager) {
            window.batalhaManager.incrementarVitoriasBatalha();
        }
        // ... resto do código existente para lidar com o acerto da palavra ...
    }
} 
