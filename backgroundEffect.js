// Função para extrair a cor predominante de uma imagem
function extrairCorDominante(imagem) {
    // Criar um canvas temporário
    const canvas = document.createElement('canvas');
    const contexto = canvas.getContext('2d');
    
    // Definir as dimensões do canvas para corresponder à imagem
    canvas.width = imagem.naturalWidth || imagem.offsetWidth;
    canvas.height = imagem.naturalHeight || imagem.offsetHeight;
    
    // Desenhar a imagem no canvas
    contexto.drawImage(imagem, 0, 0);
    
    // Obter os dados da imagem
    const dadosImagem = contexto.getImageData(0, 0, canvas.width, canvas.height);
    const dados = dadosImagem.data;
    
    // Calcular a média das cores
    let vermelho = 0, verde = 0, azul = 0;
    
    for (let i = 0; i < dados.length; i += 4) {
        vermelho += dados[i];
        verde += dados[i + 1];
        azul += dados[i + 2];
    }
    
    const totalPixels = dados.length / 4;
    vermelho = Math.floor(vermelho / totalPixels);
    verde = Math.floor(verde / totalPixels);
    azul = Math.floor(azul / totalPixels);
    
    return { vermelho, verde, azul };
}

// Função para escurecer a cor (para não ficar muito brilhante)
function escurecerCor(cor, fator = 0.65) {
    return {
        vermelho: Math.floor(cor.vermelho * fator),
        verde: Math.floor(cor.verde * fator),
        azul: Math.floor(cor.azul * fator)
    };
}

// Função para aplicar a cor ao background
function aplicarCorBackground(cor) {
    document.body.style.backgroundColor = `rgb(${cor.vermelho}, ${cor.verde}, ${cor.azul})`;
}

// Função para restaurar a cor original
function restaurarCorOriginal() {
    const corOriginal = getComputedStyle(document.documentElement)
        .getPropertyValue('--background-dark').trim();
    document.body.style.backgroundColor = corOriginal;
}

// Configurar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const cardsJogos = document.querySelectorAll('.game-card');
    
    cardsJogos.forEach(card => {
        const imagem = card.querySelector('img');
        let corMedia;
        
        // Calcular a cor média quando a imagem carregar
        if (imagem.complete) {
            corMedia = extrairCorDominante(imagem);
            corMedia = escurecerCor(corMedia);
        } else {
            imagem.addEventListener('load', () => {
                corMedia = extrairCorDominante(imagem);
                corMedia = escurecerCor(corMedia);
            });
        }
        
        // Quando o mouse passa sobre o card
        card.addEventListener('mouseenter', () => {
            if (corMedia) {
                aplicarCorBackground(corMedia);
            }
        });
        
        // Quando o mouse sai do card
        card.addEventListener('mouseleave', () => {
            restaurarCorOriginal();
        });
    });
});


