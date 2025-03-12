class GeradorPalavras {
    constructor() {
        this.palavrasBase = [
            "abacate", "abelha", "abraço", /* ... palavras de backup ... */
        ];
        this.frequenciasPalavras = new Map();
    }

    async carregarFrequencias() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/giovanicascaes/openlexicon/master/data/frequency/BrWaC.json');
            const data = await response.json();
            
            data.forEach(item => {
                this.frequenciasPalavras.set(item.word.toLowerCase(), item.frequency);
            });

            return true;
        } catch (error) {
            console.error('Erro ao carregar frequências:', error);
            return false;
        }
    }

    async carregarDicionario() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/pythonprobr/palavras/master/palavras.txt');
            const texto = await response.text();
            return texto.split('\n').map(palavra => palavra.trim().toLowerCase());
        } catch (error) {
            console.error('Erro ao carregar dicionário:', error);
            return this.palavrasBase;
        }
    }

    async gerarListaPalavras() {
        await this.carregarFrequencias();
        const palavras = await this.carregarDicionario();
        
        const palavrasComFrequencia = palavras
            .filter(palavra => 
                palavra.length >= 5 && 
                /^[a-záàâãéèêíïóôõöúçñ]+$/i.test(palavra) &&
                this.frequenciasPalavras.has(palavra)
            )
            .map(palavra => ({
                palavra: palavra,
                frequencia: this.frequenciasPalavras.get(palavra) || 0
            }));

        palavrasComFrequencia.sort((a, b) => b.frequencia - a.frequencia);

        const metade = Math.floor(palavrasComFrequencia.length / 2);
        const palavrasMaisComuns = palavrasComFrequencia.slice(0, metade);

        const palavrasPorLetra = {};
        'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letra => {
            palavrasPorLetra[letra] = [];
        });

        for (const item of palavrasMaisComuns) {
            const letraInicial = item.palavra[0].toLowerCase();
            if (palavrasPorLetra[letraInicial] && 
                palavrasPorLetra[letraInicial].length < 100) {
                palavrasPorLetra[letraInicial].push(item.palavra);
            }
        }

        const palavrasFiltradas = Object.values(palavrasPorLetra)
            .flat()
            .sort(() => Math.random() - 0.5);

        return {
            palavras: palavrasFiltradas,
            total: palavrasFiltradas.length,
            dataGeracao: new Date().toISOString(),
            estatisticas: {
                totalPalavrasOriginais: palavras.length,
                palavrasComFrequencia: palavrasComFrequencia.length,
                palavrasSelecionadas: palavrasFiltradas.length,
                frequenciaMedia: palavrasFiltradas.reduce((acc, palavra) => 
                    acc + (this.frequenciasPalavras.get(palavra) || 0), 0) / palavrasFiltradas.length
            }
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeradorPalavras;
} 