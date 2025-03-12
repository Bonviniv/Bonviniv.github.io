const { gerarArquivoPalavras } = require('./gerador-palavras');
const fs = require('fs');

function verificarEGerarPalavras() {
    try {
        let devegerarNovas = true;

        // Verifica se o arquivo de palavras do dia existe
        if (fs.existsSync('palavras-do-dia.json')) {
            const palavrasDoDia = JSON.parse(fs.readFileSync('palavras-do-dia.json', 'utf8'));
            const ultimaAtualizacao = new Date(palavrasDoDia.data);
            const agora = new Date();

            // Verifica se já passou um dia desde a última atualização
            if (ultimaAtualizacao.toDateString() === agora.toDateString()) {
                devegerarNovas = false;
            }
        }

        if (devegerarNovas) {
            console.log('Gerando novas palavras do dia...');
            gerarArquivoPalavras();
        } else {
            console.log('Palavras do dia já estão atualizadas.');
        }

    } catch (error) {
        console.error('Erro ao verificar/gerar palavras:', error);
    }
}

// Executa a verificação imediatamente ao iniciar
verificarEGerarPalavras();

// Agenda a execução para rodar a cada hora
setInterval(verificarEGerarPalavras, 1000 * 60 * 60); // A cada hora

console.log('Agendador iniciado. Verificará novas palavras a cada hora.'); 