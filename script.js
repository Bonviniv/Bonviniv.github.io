const character = document.getElementById('character');
const map = document.getElementById('map');
const initialTextBox = document.getElementById('text-box-initial');
const audio = document.getElementById('background-music');
const volumeSlider = document.getElementById('volume-slider');
const positionDisplay = document.getElementById('position-display');
const maplinks = document.getElementById('map-overlay-links');
const maplinksimage = document.getElementById('overlay-image-links');
const link1 = document.getElementById('link1');
const link2 = document.getElementById('link2');
const downloadArea = document.getElementById('download-area');
const volumeIcon = document.querySelector('.volume-icon');

const mapWidth = map.offsetWidth;
const mapHeight = map.offsetHeight;

const speed = 0.075; // Velocidade de movimento

// Define os links
const url1 = 'https://github.com/Bonviniv'; // Substitua pelo seu link
const url2 = 'https://www.linkedin.com/in/vitorsantosbarbosa/'; // Substitua pelo seu link
const pdfUrl = 'pdf/VitorBarbosaCV.pdf'; // Substitua pelo caminho do seu PDF

const debug=true

const directions = {
  down: [0, 1, 2, 3],    // Frames de 0 a 3 para ir para baixo
  left: [4, 5, 6, 7],    // Frames de 4 a 7 para esquerda
  right: [8, 9, 10, 11], // Frames de 8 a 11 para direita
  up: [12, 13, 14, 15]   // Frames de 12 a 15 para cima
};

const frames = [];
const textBox = document.getElementById('text-box');
const textBox2 = document.getElementById('text-box2');
const textBox3 = document.getElementById('text-box3');
const textBox4 = document.getElementById('text-box4');
const textBox5 = document.getElementById('text-box5');
const textBox6 = document.getElementById('text-box6');
const textBox7 = document.getElementById('text-box7');
const textBox8 = document.getElementById('text-box8');

let hasMoved = false;
let LabTown=false

let aux=0
// Seleciona a div que mostrará a posição
let cenario=1
// Variável para monitorar o estado da tecla "W"
let isWPressed = false;
let isSPressed = false;
let isAPressed = false;

let positionX = 50; // Começa no meio do mapa em porcentagem
let positionY = 50;

let currentDirection = null; // Nenhuma direção inicial
let frame = 0; // Para controlar as animações
let isMoving = false; // Controla se o personagem está se movendo
let isTextBoxcasaVisible = false; // Controle se o text-box está visível

let isTextBoxVisible = false; // Controle se o text-box está visível
let isTextBox3Visible = false; // Controle se o text-box está visível
let isTextBox4Visible = false; // Controle se o text-box está visível
let isTextBox5Visible = false; // Controle se o text-box está visível
let isTextBox6Visible = false; // Controle se o text-box está visível
let isTextBox7Visible = false; // Controle se o text-box está visível
let isTextBox8Visible = false; // Controle se o text-box está visível
let isTextVisible=false

let contador=0
let lines

let fadeTimeout; // Variável para armazenar o timeout de fade-out

const changeFactor = 0.5; // Define o valor que será subtraído de y1 e y2


const collisionLines = [
  { x1: 42, y1: 35.5, x2: 58, y2: 35.5 },
  { x1: 42, y1: 64, x2: 58, y2: 64},   
  { x1: 42, y1: 35.5, x2: 42, y2: 64 }, 
  { x1: 58, y1: 35.5, x2: 58, y2: 64 },     

  //{x1: 42, y1: 36.5, x2: 58, y2: 36.5},
  //{x1: 42, y1: 62.5, x2: 58, y2: 62.5},
  //{x1: 42, y1: 34.75, x2: 36.5, y2: 62.5},
  //{x1: 58, y1: 36.5, x2: 58, y2: 62.5},
  

  //agua
  
  //{ x1: 45, y1: 58.5, x2: 50, y2: 58.5}, 
  //{ x1: 45, y1: 64, x2: 45, y2: 58.5}, 
  //{ x1: 50, y1: 64, x2: 50, y2: 58.5}, 

  { x1: 45, y1: 59, x2: 50, y2: 59}, 
  { x1: 45, y1: 64, x2: 45, y2: 59}, 
  { x1: 50, y1: 64, x2: 50, y2: 59},

  //cercas
  //{ x1: 51, y1: 59, x2: 56, y2: 59}, 
  //{ x1: 51, y1: 57, x2: 56, y2: 57},
  //{ x1: 51, y1: 57, x2: 51, y2: 59},
  //{ x1: 56, y1: 57, x2: 56, y2: 59},

  { x1: 51, y1: 60, x2: 56, y2: 60}, 
  { x1: 51, y1: 58, x2: 56, y2: 58},
  { x1: 51, y1: 58, x2: 51, y2: 60},
  { x1: 56, y1: 58, x2: 56, y2: 60},

  { x1: 44, y1: 52, x2: 49, y2: 52}, 
  { x1: 44, y1: 49.5, x2: 49, y2: 49.5},
  { x1: 44, y1: 52, x2: 44, y2: 49.5},
  { x1: 49, y1: 49.5, x2: 49, y2: 52},

  //predios
  { x1: 50.25, y1: 56, x2: 57.5, y2: 56}, 
  { x1: 50.25, y1: 49, x2: 57.5, y2: 49},
  { x1: 50.25, y1: 56, x2: 50.25, y2: 49},
  { x1: 57.5, y1: 56, x2: 57.5, y2: 49},

  { x1: 51, y1: 45, x2: 56.5, y2: 45}, 
  { x1: 51, y1: 39, x2: 56.5, y2: 39},
  { x1: 51, y1: 39, x2: 51, y2: 45},
  { x1:  56.5, y1: 39, x2:  56.5, y2: 45},

  //{ x1: 43.5, y1: 46, x2: 49, y2: 46}, 
  //{ x1: 43.5, y1: 40, x2: 49, y2: 40},
  //{ x1: 43.5, y1: 40, x2:  43.5, y2: 46},
  //{ x1:  49, y1: 39, x2:  49, y2: 46},

  { x1: 43.5, y1: 45, x2: 49, y2: 45}, 
  { x1: 43.5, y1: 39, x2: 49, y2: 39},
  { x1: 43.5, y1: 39, x2:  43.5, y2: 45},
  { x1:  49, y1: 39, x2:  49, y2: 45},

  //caixas de correio
  { x1: 43, y1: 42, x2: 44, y2: 42}, 
  { x1: 43, y1: 45, x2: 44, y2: 45},
  { x1: 43, y1: 42, x2:  43, y2: 45},
  { x1: 44, y1: 42, x2:  44, y2: 45},

  { x1: 50.5, y1: 42, x2: 51.5, y2: 42}, 
  { x1: 50.5, y1: 45, x2: 51.5, y2: 45},
  { x1: 50.5, y1: 42, x2:  50.5, y2: 45},
  { x1: 51.5, y1: 42, x2:  51.5, y2: 45},

  //placa
  { x1: 44., y1: 55, x2: 45.25, y2: 55}, 
  { x1: 44, y1: 57, x2: 45.25, y2: 57},
  { x1: 44, y1: 55, x2:  44, y2: 57},
  { x1: 45.25, y1: 55, x2:  45.25, y2: 57},

];

const collisionLines2 = [
  //paredes lab
  { x1: 51, y1: 62.5, x2: 57, y2: 62.5 }, 
  { x1: 49.5, y1: 62.5, x2: 43, y2: 62.5 }, 

  { x1: 51, y1: 62.5, x2: 51, y2: 65 }, 
  { x1: 49.5, y1: 62.5, x2: 49.5, y2: 65 }, 

  { x1: 43, y1: 62.5, x2: 43, y2: 39 }, 
  { x1: 56.5, y1: 62.5, x2: 56.5, y2: 39 }, 
  { x1: 56.5, y1: 40, x2: 43, y2: 40 },    

  //moveis
  { x1: 49.5, y1: 40.5, x2: 44, y2: 40.5 },  
  { x1: 49.5, y1: 40.5, x2:49.5, y2: 39 },

  { x1: 52, y1: 40.5, x2: 57, y2: 40.5 }, 
  { x1: 52, y1: 40.5, x2: 52, y2: 39 }, 

  { x1: 48.75, y1: 56.5, x2: 43, y2: 56.5 }, 
  { x1: 48.75, y1: 51.5, x2: 43, y2: 51.5 }, 
  { x1: 48.75, y1:51.5, x2: 48.75, y2: 56.5 },

  { x1: 57, y1: 56.5, x2: 51, y2: 56.5 }, 
  { x1: 57, y1: 51.5, x2: 51, y2: 51.5 }, 
  { x1: 51, y1: 51.5, x2: 51, y2: 56.5 },

  //plantas
  { x1: 43, y1: 60.75, x2: 44, y2: 60.75 }, 
  { x1:  44, y1: 60.75, x2:  44, y2: 63 },

  { x1: 55.5, y1: 60.75, x2: 57, y2: 60.75 }, 
  { x1:  55.5, y1: 60.75, x2: 55.5, y2: 63 },

  //professor oak

  { x1: 51.5, y1: 46.5, x2: 48.25, y2: 46.5 },
  { x1: 51.5, y1: 41.5, x2: 48.25, y2: 41.5 },
  { x1: 51.5, y1: 46.5, x2: 51.5, y2:  41.5 },
  { x1: 48.25, y1: 46.5, x2: 48.25, y2: 41.5 },


  //mesa
  { x1: 55.25, y1: 47.75, x2: 55.25, y2: 44.5 },
  { x1: 51, y1: 47.75, x2: 51, y2: 44.5 },
  { x1: 51, y1: 44.5, x2: 55.25, y2: 44.5 },
  { x1: 51, y1: 47.75, x2: 55.25, y2: 47.75 },

  //equipamentos
  { x1: 43, y1: 48.5, x2: 46.5, y2: 48.5 },
  { x1: 43, y1: 44, x2: 46.5, y2: 44 },
  { x1: 46.5, y1: 44, x2: 46.5, y2:48.5 },

  { x1: 44, y1: 45, x2: 44, y2: 41.75 },
  { x1: 43, y1:41.75, x2: 44, y2: 41.75 },



];

const collisionLines3 = [
  //paredes
  { x1: 44.75, y1: 40, x2:44.75, y2: 64.15 },
  { x1: 44.75, y1: 64.15 , x2:58, y2: 64.15 },
  { x1: 57.5 ,y1: 40, x2:57.5, y2: 64.15 },
  { x1: 44.75, y1: 44 , x2:57.5, y2: 44 },
  //escada
  { x1: 56, y1: 48 , x2:53, y2: 48 },
  //{ x1: 56, y1: 48 , x2:56, y2: 46 },
  { x1: 53, y1: 47.5 , x2:53, y2: 43},
  //moveis
  { x1: 50, y1: 45 , x2:43, y2: 45 },
  { x1: 50, y1: 45 , x2:50, y2: 43 },
  { x1: 45.5, y1: 46 , x2:45.5, y2: 43 },
  { x1: 45.5, y1: 46 , x2:43, y2: 46 },

  //cama
  { x1: 47, y1: 56 , x2:47, y2: 60.75 },
  { x1: 43, y1: 56 , x2:47, y2: 56 },
  { x1: 43, y1: 60.75 , x2:47, y2: 60.75 },

  //tv
  { x1: 51, y1: 53.75 , x2:51, y2: 59 },
  { x1: 49, y1: 53.75 , x2:49, y2: 59 },
  { x1: 49, y1: 53.75 , x2:51, y2: 53.75 },
  { x1: 49, y1: 59 , x2:51, y2: 59 },
];

const collisionLines4 = [
 
];

let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
let zoom=false

function checkZoom() {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;

    if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
      textBoxcasa.style.display="none" 
      textBox.style.display="none" 
      textBox2.style.display="none" 
      textBox3.style.display="none" 
      textBox4.style.display="none" 
      textBox5.style.display="none" 
      textBox6.style.display="none" 
      textBox7.style.display="none" 
      textBox8.style.display="none"
    } 

    // Atualiza os valores para a próxima verificação
    lastWidth = currentWidth;
    lastHeight = currentHeight;
}

  // Simula os eventos de teclado para as teclas virtuais
  document.querySelectorAll('.virtual-key').forEach(button => {
    button.addEventListener('mousedown', () => {
      const key = button.getAttribute('data-key');
      document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    button.addEventListener('mouseup', () => {
      const key = button.getAttribute('data-key');
      document.dispatchEvent(new KeyboardEvent('keyup', { key }));
    });

    button.addEventListener('mouseleave', () => {
      const key = button.getAttribute('data-key');
      document.dispatchEvent(new KeyboardEvent('keyup', { key }));
    });
  });

// Verifica a cada 500ms (ou ajuste conforme necessário)


// Verifica quando a janela é redimensionada
window.addEventListener('resize', checkZoom);
function adjustYValuesWithFactor(lines, change) {
  const adjustedLines = lines.map(line => ({
    ...line,
    y1: line.y1 - change,
    y2: line.y2 - change
  }));

  console.log(adjustedLines);
}

function textBoxCheck(){
  if(isTextBoxVisible&&isTextBox3Visible&&isTextBox4Visible&&isTextBox5Visible&&isTextBox6Visible&&isTextBox7Visible&&isTextBox8Visible&&isTextBoxcasaVisible){
    isTextVisible=true
  }else{
    isTextVisible=false
  }
}
// Função para alterar a escala do personagem
function setCharacterScale(scale) {
  const character = document.getElementById('character');
  // Define a transformação com a nova escala
  character.style.transform = `translate(-50%, -50%) scale(${scale})`;
}



// Para alterar a escala dinamicamente, você pode fazer algo como:
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
      scale += 0.1; // Aumenta a escala
  } else if (event.key === 'ArrowDown') {
      scale -= 0.1; // Diminui a escala
  }
  setCharacterScale(scale); // Aplica a nova escala
});

function transformYCoordinates(lines) {
  // Calcula a média de todos os valores y1 e y2
  let yValues = lines.flatMap(line => [line.y1, line.y2]);
  let yMean = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;

  // Ajusta cada y1 e y2 de acordo com a média calculada
  const transformedLines = lines.map(line => ({
    ...line,
    y1: line.y1 < yMean ? line.y1 - 1 : line.y1 - 0.5,
    y2: line.y2 < yMean ? line.y2 - 1 : line.y2 - 0.5
  }));

  return transformedLines;
}

volumeSlider.addEventListener('input', function () {
  const value = this.value * 100; // Converte o valor para porcentagem
  this.style.background = `linear-gradient(to right, #7a7f7f ${value}%, #ccc ${value}%)`;

  if (this.value == 0) {
    volumeIcon.textContent = '🔇'; // Ícone de sem som
  } else {
    volumeIcon.textContent = '🔊'; // Ícone de som
  }
});


// Função para mostrar a caixa de texto 2
function showTextBox2() {
  textBox2.style.display = 'flex'; // Mostra a caixa de texto
  textBox2.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBoxVisible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox2WithFade() {
  if (isTextBoxVisible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox2.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox2.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox2.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBoxVisible = false;
      }, 1500); // Tempo para o fade-out completar (1 segundo)
    }, 3000);// 5 segundos de atraso antes do fade-out
  }
}


function showTextBox3() {
  textBox3.style.display = 'flex'; // Mostra a caixa de texto
  textBox3.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBox3Visible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox3WithFade() {
  if (isTextBox3Visible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox3.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox3.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox3.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBox3Visible = false;
      }, 1500); // Tempo para o fade-out completar (1 segundo)
    }, 3000); // 5 segundos de atraso antes do fade-out
  }
}

function showTextBox4() {
  textBox4.style.display = 'flex'; // Mostra a caixa de texto
  textBox4.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBox4Visible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox4WithFade() {
  if (isTextBox4Visible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox4.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox4.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox4.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBox4Visible = false;
      }, 1500); // Tempo para o fade-out completar (1 segundo)
    }, 3000); // 5 segundos de atraso antes do fade-out
  }
}

function showTextBox5() {
  textBox5.style.display = 'flex'; // Mostra a caixa de texto
  textBox5.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBox5Visible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox5WithFade() {
  if (isTextBox5Visible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox5.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox5.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox5.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBox5Visible = false;
      }, 1000); // Tempo para o fade-out completar (1 segundo)
    }, 500); // 5 segundos de atraso antes do fade-out
  }
}

function showTextBox6() {
  textBox6.style.display = 'flex'; // Mostra a caixa de texto
  textBox6.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBox6Visible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox6WithFade() {
  if (isTextBox6Visible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox6.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox6.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox6.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBox6Visible = false;
      }, 1000); // Tempo para o fade-out completar (1 segundo)
    }, 500); // 5 segundos de atraso antes do fade-out
  }
}

function showTextBox7() {
  textBox7.style.display = 'flex'; // Mostra a caixa de texto
  textBox7.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBox7Visible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox7WithFade() {
  if (isTextBox7Visible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox7.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox7.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox7.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBox7Visible = false;
      }, 1000); // Tempo para o fade-out completar (1 segundo)
    }, 500); // 5 segundos de atraso antes do fade-out
  }
}

function showTextBox8() {
  textBox8.style.display = 'flex'; // Mostra a caixa de texto
  textBox8.style.opacity = '1'; // Restaura a opacidade se estiver em fade-out
  isTextBox8Visible = true;
}

// Função para esconder a caixa de texto 2 com fade-out após 5 segundos
function hideTextBox8WithFade() {
  if (isTextBox8Visible) {
    // Inicia o fade-out após 5 segundos
    fadeTimeout = setTimeout(() => {
      textBox8.style.transition = 'opacity 1s'; // Define a duração do fade-out
      textBox8.style.opacity = '0'; // Reduz a opacidade para 0
      setTimeout(() => {
        textBox8.style.display = 'none'; // Oculta a caixa de texto após o fade-out
        isTextBox8Visible = false;
      }, 1000); // Tempo para o fade-out completar (1 segundo)
    }, 500); // 5 segundos de atraso antes do fade-out
  }
}


// ... (restante do código)
// Função para obter as dimensões do mapa
function getMapDimensions() {
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;
  return { mapWidth, mapHeight };
}
// Função para converter de porcentagem para pixel
function convertToPixel(value, mapDimension) {
  return (value / 100) * mapDimension;
}

// Função para converter de pixel para porcentagem
function convertToPercentage(value, mapDimension) {
  return (value / 100) * mapDimension;
}


function ativarTextos (positionX, positionY){
if(!isTextVisible){
    if (calcularDistancia(positionX,positionY,pontoX=51,pontoY=adjustYValue(35))){
    if(!isTextBox3Visible){
      showTextBox3();
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBox3Visible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox3WithFade();
      isTextBox3Visible=false
  }

  if (calcularDistancia(positionX,positionY,pontoX=44.25,pontoY=adjustYValue(56))){
    if(!isTextBoxVisible){
      showTextBox2()
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBoxVisible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox2WithFade();
      isTextBoxVisible=false
  }
}

}


function ativarTextoslab (positionX, positionY){
if(!isTextVisible){
  if (calcularDistancia(positionX,positionY,pontoX=50,pontoY=adjustYValue(46.5))){
    if(!isTextBox4Visible){
      showTextBox4();
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBox4Visible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox4WithFade();
      isTextBox4Visible=false
  }
}
  
  

}

function ativarTextoscasa (positionX, positionY){
if(!isTextVisible){
   if (calcularDistancia(positionX,positionY,pontoX=47.5,pontoY=adjustYValue(59))){
    if(!isTextBox5Visible){
      showTextBox5();
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBox5Visible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox5WithFade();
      isTextBox5Visible=false
  }


  if (calcularDistancia(positionX,positionY,pontoX=49,pontoY=adjustYValue(44))){
    if(!isTextBox6Visible){
      showTextBox6();
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBox6Visible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox6WithFade();
      isTextBox6Visible=false
  }

  if (calcularDistancia(positionX,positionY,pontoX=43.5,pontoY=adjustYValue(46))){
    if(!isTextBox7Visible){
      showTextBox7();
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBox7Visible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox7WithFade();
      isTextBox7Visible=false
  }

  if (calcularDistancia(positionX,positionY,pontoX=58.4,pontoY=adjustYValue(44))){
    if(!isTextBox8Visible){
      showTextBox8();
      clearTimeout(fadeTimeout);
      // Cancelar qualquer fade-out em andamento
    }
    } else if (isTextBox8Visible) {
      // Quando o personagem sair da posição específica, iniciar o fade-out
      hideTextBox8WithFade();
      isTextBox8Visible=false
  }
}
 
  
}
  
function ativarLinks(positionX, positionY) {
  // Seleciona o elemento de overlay
  const maplinks = document.getElementById("map-overlay-links");
  const maplinksa = document.getElementById("overlay-image-links");

  // Verifique se o elemento maplinks existe
  if (!maplinks) {
    console.error("Elemento com id 'map-overlay-links' não encontrado.");
    return; // Pare a execução se o elemento não for encontrado
  }

  // Verifica a posição e a tecla pressionada para exibir ou ocultar os links
  if (isWPressed && positionX >= 52 && positionX <= 54 && positionY >= adjustYValue(46) && positionY <= adjustYValue(49)) {
    // Adiciona a classe "active" para exibir o overlay
    maplinks.style.display="flex"
    maplinksa.style.display="flex"
  } else {
    // Remove a classe "active" para esconder o overlay
    maplinks.style.display="none"
    maplinksa.style.display="none"
  }
}


function checkCollisionLines(newXPercentage, newYPercentage,lines) {
  // Coordenadas iniciais e finais do personagem na tentativa de movimento
  const startX = positionX;
  const startY = positionY;
  const endX = newXPercentage;
  const endY = newYPercentage;

  // Função auxiliar para verificar a interseção entre dois segmentos de linha
  function isIntersecting(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Calcula a orientação das tripletas de pontos
    function orientation(px, py, qx, qy, rx, ry) {
      const val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
      return val === 0 ? 0 : (val > 0 ? 1 : 2);
    }

    // Checa a orientação para decidir se os segmentos se intersectam
    const o1 = orientation(x1, y1, x2, y2, x3, y3);
    const o2 = orientation(x1, y1, x2, y2, x4, y4);
    const o3 = orientation(x3, y3, x4, y4, x1, y1);
    const o4 = orientation(x3, y3, x4, y4, x2, y2);

    // Condição geral para interseção
    if (o1 !== o2 && o3 !== o4) return true;

    return false;
  }

  // Verifica cada linha de colisão
  
    for (let line of lines) {
      const { x1, y1, x2, y2 } = line;
  
      // Checa se a linha de movimento do personagem colide com a linha de colisão
      if (isIntersecting(startX, startY, endX, endY, x1, y1, x2, y2)) {
        return true; // Há colisão
      }
    }


  return false; // Sem colisão
}

function calcularDistancia(personagemX, personagemY, pontoX, pontoY) {
  // Convertendo as porcentagens para valores decimais (entre 0 e 1)
  const xPersonagem = personagemX / 100;
  const yPersonagem = personagemY / 100;
  const xPonto = pontoX / 100;
  const yPonto = pontoY / 100;

  // Calculando a distância euclidiana (distância em linha reta)
  const distanciaX = Math.abs(xPersonagem - xPonto);
  const distanciaY = Math.abs(yPersonagem - yPonto);
  const distancia = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);

  // Verificando se a distância é menor que 2%
  return distancia < 0.02;
}
      // Detecta quando uma tecla é pressionada e solta
document.addEventListener('keydown', (event) => {
  if (event.key === 'w' || event.key === 'W') {
    isWPressed = true;
  }
});
document.addEventListener('keyup', (event) => {
  if (event.key === 'w' || event.key === 'W') {
    isWPressed = false;
  }
});


document.addEventListener('keydown', (event) => {
  if (event.key === 's' || event.key === 's') {
    isSPressed = true;
  }
});
document.addEventListener('keyup', (event) => {
  if (event.key === 's' || event.key === 's') {
    isSPressed = false;
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'a' || event.key === 'a') {
    isAPressed = true;
  }
});
document.addEventListener('keyup', (event) => {
  if (event.key === 'a' || event.key === 'a') {
    isAPressed = false;
  }
});

function applyResponsiveStyles() {
  const { mapWidth, mapHeight } = getMapDimensions();

  const maps = ['map', 'mapup', 'town-map', 'lab-map', 'casa-map'];
  maps.forEach(mapId => {
    const mapElement = document.getElementById(mapId);
    if (mapElement) {
      mapElement.style.width = `${mapWidth}px`;
      mapElement.style.height = `${mapHeight}px`;
    }
  });

  // Ajuste e centralização dos overlays de mapa
  const overlays = ['map-overlay', 'map-overlay-links'];
  overlays.forEach(overlayId => {
    const overlayElement = document.getElementById(overlayId);
    if (overlayElement) {
      overlayElement.style.width = `${mapWidth}px`;
      overlayElement.style.height = `${mapHeight}px`;
    }
  });

  // Ajuste de canvas para cada mapa
  const collisionCanvas = document.getElementById('collisionCanvas');
  if (collisionCanvas) {
    collisionCanvas.style.width = `${mapWidth}px`;
    collisionCanvas.style.height = `${mapHeight}px`;
  }

  const mainCanvas = document.getElementById('canvas');
  if (mainCanvas) {
    mainCanvas.style.width = `${mapWidth}px`;
    mainCanvas.style.height = `${mapHeight}px`;
  }

  // Ajuste do #water-overlay
  const watergif = document.getElementById('water-gif');
  if (watergif) {
    watergif.style.top = `${convertToPixel(62.2, mapHeight)}px`;
    watergif.style.left = `${convertToPixel(45.5, mapWidth)}px`;
    watergif.style.width = `${convertToPixel(4, mapWidth)}px`;
    watergif.style.height = `${convertToPixel(8.2, mapHeight)}px`;
  }

  const waterOverlay = document.getElementById('water-overlay');
  if (waterOverlay) {
    waterOverlay.style.top = `${convertToPixel(60.5, mapHeight)}px`;
    waterOverlay.style.left = `${convertToPixel(45.5, mapWidth)}px`;
    waterOverlay.style.width = `${convertToPixel(8, mapWidth)}px`;
    waterOverlay.style.height = `${convertToPixel(17, mapHeight)}px`;
  }

  // Ajuste do #text-boxfix
  const textBoxFix = document.getElementById('text-boxfix');
  textBoxFix.style.top = `${convertToPixel(25, mapHeight)}px`;
  textBoxFix.style.right = `${convertToPixel(2, mapWidth)}px`;
  textBoxFix.style.width = `${convertToPixel(33.5, mapWidth)}px`; // Aproximado para 500px em 1495px
  textBoxFix.style.height = `${convertToPixel(54.8, mapHeight)}px`; // Aproximado para 400px em 730px

  // Ajuste do #text-box
  const textBox = document.getElementById('text-box');
  textBox.style.top = `${convertToPixel(31.5, mapHeight)}px`;
  textBox.style.left = `${convertToPixel(15, mapWidth)}px`;
  textBox.style.width = `${convertToPixel(20, mapWidth)}px`;
  textBox.style.height = `${convertToPixel(34.3, mapHeight)}px`;

  // Ajuste do #text-box2
  const textBox2 = document.getElementById('text-box2');
  textBox2.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox2.style.left = `${convertToPixel(2, mapWidth)}px`;
  textBox2.style.width = `${convertToPixel(36.8, mapWidth)}px`; // Aproximado para 550px em 1495px
  textBox2.style.height = `${convertToPixel(41, mapHeight)}px`; // Aproximado para 300px em 730px

  // Ajuste do #text-box3
  const textBox3 = document.getElementById('text-box3');
  textBox3.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox3.style.left = `${convertToPixel(2, mapWidth)}px`;
  textBox3.style.width = `${convertToPixel(36.8, mapWidth)}px`; // Aproximado para 550px em 1495px
  textBox3.style.height = `${convertToPixel(41, mapHeight)}px`; // Aproximado para 300px em 730px

  // Ajuste do #text-box4
  const textBox4 = document.getElementById('text-box4');
  textBox4.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox4.style.left = `${convertToPixel(1, mapWidth)}px`;
  textBox4.style.width = `${convertToPixel(40, mapWidth)}px`; // Aproximado para 598px em 1495px
  textBox4.style.height = `${convertToPixel(50, mapHeight)}px`; // Aproximado para 365px em 730px

  // Ajuste do #text-box5
  const textBox5 = document.getElementById('text-box5');
  textBox5.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox5.style.left = `${convertToPixel(6, mapWidth)}px`;
  textBox5.style.width = `${convertToPixel(31, mapWidth)}px`; // Aproximado para 463.45px em 1495px
  textBox5.style.height = `${convertToPixel(50, mapHeight)}px`; // Aproximado para 365px em 730px

  // Ajuste do #text-box6
  const textBox6 = document.getElementById('text-box6');
  textBox6.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox6.style.left = `${convertToPixel(6, mapWidth)}px`;
  textBox6.style.width = `${convertToPixel(31, mapWidth)}px`;
  textBox6.style.height = `${convertToPixel(50, mapHeight)}px`;

  // Ajuste do #text-box7
  const textBox7 = document.getElementById('text-box7');
  textBox7.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox7.style.left = `${convertToPixel(6, mapWidth)}px`;
  textBox7.style.width = `${convertToPixel(31, mapWidth)}px`;
  textBox7.style.height = `${convertToPixel(50, mapHeight)}px`;

  // Ajuste do #text-box8
  const textBox8 = document.getElementById('text-box8');
  textBox8.style.top = `${convertToPixel(20, mapHeight)}px`;
  textBox8.style.left = `${convertToPixel(6, mapWidth)}px`;
  textBox8.style.width = `${convertToPixel(31, mapWidth)}px`;
  textBox8.style.height = `${convertToPixel(50, mapHeight)}px`;

  // Ajuste do #character
  const character = document.getElementById('character');
  character.style.left = `${mapWidth / 2}px`;
  character.style.top = `${mapHeight / 2}px`;

  

  // Ajuste do #canvas
  const canvas = document.getElementById('canvas');
  canvas.style.width = `${mapWidth}px`;
  canvas.style.height = `${mapHeight}px`;

  

  // Ajuste do #map-element1 (Exemplo de elemento no mapa 1)
  const mapElement1 = document.getElementById('map-element1');
  if (mapElement1) {
    mapElement1.style.top = `${convertToPixel(10, mapHeight)}px`;
    mapElement1.style.left = `${convertToPixel(5, mapWidth)}px`;
    mapElement1.style.width = `${convertToPixel(20, mapWidth)}px`;
    mapElement1.style.height = `${convertToPixel(15, mapHeight)}px`;
  }

  // Ajuste do #map-element2 (Exemplo de elemento no mapa 2)
  const mapElement2 = document.getElementById('map-element2');
  if (mapElement2) {
    mapElement2.style.top = `${convertToPixel(25, mapHeight)}px`;
    mapElement2.style.left = `${convertToPixel(30, mapWidth)}px`;
    mapElement2.style.width = `${convertToPixel(10, mapWidth)}px`;
    mapElement2.style.height = `${convertToPixel(12, mapHeight)}px`;
  }

  // Ajuste de overlays
  const mapOverlay = document.getElementById('map-overlay');
  if (mapOverlay) {
    mapOverlay.style.width = `${mapWidth}px`;
    mapOverlay.style.height = `${mapHeight}px`;
  }

  const mapOverlayLinks = document.getElementById('map-overlay-links');
  if (mapOverlayLinks) {
    mapOverlayLinks.style.width = `${mapWidth}px`;
    mapOverlayLinks.style.height = `${mapHeight}px`;
  }

  // Ajuste de canvas para cada mapa
  

  

   // Ajustes adicionais específicos de elementos internos de cada mapa
   const additionalElements = ['map-element1', 'map-element2']; // Exemplo
   additionalElements.forEach(elId => {
     const element = document.getElementById(elId);
     if (element) {
       element.style.width = `${convertToPixel(10, mapWidth)}px`;
       element.style.height = `${convertToPixel(15, mapHeight)}px`;
     }
   });
}


window.addEventListener('resize', () => {
  applyResponsiveStyles();
  applyResponsiveStylesToMaps();
});
document.addEventListener('DOMContentLoaded', () => {
  applyResponsiveStyles();
  applyResponsiveStylesToMaps();
});
function calcularY(x) {
  const m = -0.000694444; // Inclinação da reta
  const b = 0.657;        // Intercepto da reta
  return m * x + b;      // Retorna o valor de y
}

const screenRatio=map.offsetWidth/map.offsetHeight
const dist = screenRatio - 1.986;
const factor=screenRatio*(0.063 + (dist*0.1))

const distAlt=map.offsetHeight-946

// Exemplo de uso da função
let scale = 1; // Escala padrão

let lastFrameTime = 0; // Armazena o tempo do último frame
const frameInterval = 1000/10 ; // 1/30 segundos em milissegundos


function moveCharacter() {

  setCharacterScale(scale - (calcularY(map.offsetHeight)));
  textBoxCheck()
        

  const { mapWidth, mapHeight } = getMapDimensions();

  // Define as novas posições em porcentagem
  let newXPercentage = positionX;
  let newYPercentage = positionY;

  const body = document.body;
    
  // Apenas calcula a nova posição e atualiza a direção se o personagem está em movimento
  if (isMoving && currentDirection) {
    if (currentDirection === 'up') newYPercentage -= speed;
    if (currentDirection === 'down') newYPercentage += speed;
    if (currentDirection === 'left') newXPercentage -= speed;
    if (currentDirection === 'right') newXPercentage += speed;
    let lines
   

   
   if(contador==3){
  character.style.opacity=1
  }


  if (body.dataset.background == "casa2") {
    const spanText = document.querySelector("#text-box .text-background span");
     spanText.style.color = "white";
     
    if(contador==0){
      newXPercentage = 42.5;
      newYPercentage = 71.5
     }contador++
    // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
    lines = adjustYValues(collisionLines4,factor);
    cenario = 4;
    console.log("Cenário alterado para o casa.");
    ativarTextoscasa(newXPercentage,newYPercentage)
  }  


  if (body.dataset.background == "casa") {
    const spanText = document.querySelector("#text-box .text-background span");
     spanText.style.color = "white";
     
    if(contador==0){
      newXPercentage = 56.5;
      newYPercentage = 49
     }contador++
    // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
    lines = adjustYValues(collisionLines3,factor);
    cenario = 3;
    console.log("Cenário alterado para o casa.");
    ativarTextoscasa(newXPercentage,newYPercentage)
  }  
  
    if (body.dataset.background == "lab") {
      if(contador==0){
        newXPercentage = 50;
        newYPercentage = 63
       }contador++
    
      // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
      lines = adjustYValues(collisionLines2,factor);
      cenario = 2;
      console.log("Cenário alterado para o lab.");
      ativarTextoslab(newXPercentage,newYPercentage)
      ativarLinks(newXPercentage,newYPercentage)
    } 

    if (body.dataset.background == "town") {
      // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
      
      lines = adjustYValues(collisionLines,factor);
      cenario = 1;
      console.log("Cenário alterado para town.");
      ativarTextos(newXPercentage,newYPercentage)


    } 
    
    // Checa colisão na nova posição
    const willCollide = checkCollisionLines(newXPercentage, newYPercentage, lines);
    
    if (!willCollide) {
      // Atualiza a posição somente se não houver colisão
      positionX = Math.max(0, Math.min(100, newXPercentage));
      positionY = Math.max(0, Math.min(100, newYPercentage));

      // Converte porcentagens para pixels e aplica ao estilo do personagem
      const newXPixel = convertToPixel(positionX, mapWidth);
      const newYPixel = convertToPixel(positionY, mapHeight);
      character.style.left = `${newXPixel}px`;
      character.style.top = `${newYPixel}px`;


      // Controle do frame para a animação (avança um frame a cada 1/30 segundos)
      const currentTime = performance.now();
      if (currentTime - lastFrameTime >= frameInterval) {
        character.style.opacity=1
        frame++;
        lastFrameTime = currentTime; // Atualiza o tempo do último frame
      }

      // Atualiza a animação
      const spriteIndex = directions[currentDirection][frame % 4];
      character.style.backgroundImage = `url('images/tile${spriteIndex.toString().padStart(3, '0')}.png')`;
      
      // Controle do frame para a animação (evita flickering ao pausar)
   
      if(debug){
       
        positionDisplay.innerText = `X: ${newXPercentage}, Y: ${newYPercentage}`;
        //positionDisplay.innerText = `X: ${positionX.toFixed(2)}%, Y: ${positionY.toFixed(2)}%`;
      }else{
        positionDisplay.style.display="none"
      }


      if(cenario==1){
        if (isWPressed && positionX >= 45 && positionX <= 46 && positionY >= 45&& positionY <= 46) {       
        window.location.href = "casa.html";
        document.body.style.backgroundImage = "url('images/casa.png')";
        newWindow()
      }
      }

      
      //if(cenario==1){
       // if (isWPressed && positionX >= 51 && positionX <= 54 && positionY >= 45&& positionY <= 46) {       
       // window.location.href = "casa2.html";
       // document.body.style.backgroundImage = "url('images/casa2.1.png')";
       // newWindow()
      //}
      //}



      if(cenario==1){
        if (isWPressed && positionX >= 53 && positionX <= 55 && positionY >= 55.5 && positionY <= 57) {
        // Redireciona para a nova página e define o fundo
        window.location.href = "lab.html";
        document.body.style.backgroundImage = "url('images/oaks-lab.png')";
        newWindow()
      }
      }

       if(cenario==2){
        if (isSPressed && positionX >= 49 && positionX <= 51 && positionY >= 63 && positionY <= 65) {
        // Redireciona para a nova página e define o fundo
        window.location.href = "index.html";
        document.body.style.backgroundImage = "url('images/pallet-town.png')";
        newWindow()
      }
      }

      if(cenario==3){
        if (isAPressed && positionX >= 54.4 && positionX <= 55 && positionY >= 42 && positionY <= 46) {
        window.location.href = "index.html";
        document.body.style.backgroundImage = "url('images/pallet-town.png')";
        newWindow()
      }
      }
    }
       
  } 

  requestAnimationFrame(moveCharacter);
}

// Mantém a lógica de colisão e ativação das caixas de texto
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w': currentDirection = 'up'; break;
    case 'a': currentDirection = 'left'; break;
    case 's': currentDirection = 'down'; break;
    case 'd': currentDirection = 'right'; break;
    default:
      currentDirection = null;
  }
  isMoving = true;
 
});

// Parar o movimento quando a tecla é solta
document.addEventListener('keyup', (event) => {
  isMoving = false;
});


document.addEventListener('keydown', (event) => {
  if (!hasMoved && ['w', 'a', 's', 'd'].includes(event.key)) {
    hasMoved = true;
    if (document.body.dataset.background == "casa") {
      textBox.style.animation = 'fadeOut 3s forwards'; // Ativa a animação fadeOut
      setTimeout(() => {
        textBox.style.display = 'none'; // Remove a caixa após a animação
      }, 3000); 
    }else{
textBox.style.animation = 'fadeOut 1s forwards'; // Ativa a animação fadeOut
    setTimeout(() => {
      textBox.style.display = 'none'; // Remove a caixa após a animação
    }, 1000); 
    } // Tempo para o fade-out completar
  }
});


// Tocar música somente após interação do usuário
document.addEventListener('keydown', (event) => {
  if (!audio.played.length) {
    audio.play().catch((error) => {
      console.log("A reprodução automática foi bloqueada pelo navegador.");
    });
  }

  // Controla o movimento do personagem aqui
  if (!hasMoved && ['w', 'a', 's', 'd'].includes(event.key)) {
    hasMoved = true;
    if (document.body.dataset.background == "casa") {
      textBox.style.animation = 'fadeOut 3s forwards'; // Ativa a animação fadeOut
      setTimeout(() => {
        textBox.style.display = 'none'; // Remove a caixa após a animação
      }, 3000); 
    }else{
textBox.style.animation = 'fadeOut 1s forwards'; // Ativa a animação fadeOut
    setTimeout(() => {
      textBox.style.display = 'none'; // Remove a caixa após a animação
    }, 1000); 
    }

    // Tempo para o fade-out completar
  }
});



// Restaura o valor do volume salvo no localStorage (ou usa 0.15 como valor padrão)
const savedVolume = localStorage.getItem('backgroundVolume');
audio.volume = savedVolume ? parseFloat(savedVolume) : 0.15;
volumeSlider.value = audio.volume;

// Atualizar o volume conforme o controle deslizante e salvar no localStorage
volumeSlider.addEventListener('input', (event) => {
  const newVolume = event.target.value;
  audio.volume = newVolume;
  localStorage.setItem('backgroundVolume', newVolume);
});


function preloadFrames() {
  for (let i = 0; i <= 15; i++) {
    const img = new Image();
    img.src = `images/tile${i.toString().padStart(3, '0')}.png`;
    frames.push(img);
  }
}

function adjustYValues(collisionLines,adjustmentFactor) {
  const centerY = 50; // Ponto central em Y
  
  return collisionLines.map(line => {
      // Calcula a diferença em relação ao centro
      const y1Distance = line.y1 - centerY;
      const y2Distance = line.y2 - centerY;

      // Ajusta y1 e y2 baseado na distância, multiplicando pela variável adjustmentFactor
      const adjustedY1 = line.y1 - y1Distance * adjustmentFactor; // Para valores acima de 50
      const adjustedY2 = line.y2 - y2Distance * adjustmentFactor; // Para valores acima de 50

      // Se y1 e y2 são menores que 50, devemos aumentar
      return {
          ...line,
          y1: line.y1 < centerY ? line.y1 + Math.abs(y1Distance) * adjustmentFactor : adjustedY1,
          y2: line.y2 < centerY ? line.y2 + Math.abs(y2Distance) * adjustmentFactor : adjustedY2,
      };
  });
}
function adjustYValue(y) {
  const centerY = 50; // Ponto central em Y
  const distanceFromCenter = y - centerY;
  const adjustmentFactor=changeFactor*0.35

  // Calcula o valor ajustado para y com base na posição em relação ao centro
  const adjustedY = y < centerY
    ? y + Math.abs(distanceFromCenter) * adjustmentFactor // Para valores abaixo do centro
    : y - distanceFromCenter * adjustmentFactor;          // Para valores acima do centro

  return adjustedY;
}

function newWindow(){
  preloadFrames();
  character.style.opacity=0
  const { mapWidth, mapHeight } = getMapDimensions();
  positionX = 50;
  positionY = 50;
  const newXPixel = convertToPixel(positionX, mapWidth);
  const newYPixel = convertToPixel(positionY, mapHeight);
  character.style.left = `${newXPixel}px`;
  character.style.top = `${newYPixel}px`;
  character.style.backgroundImage = "url('images/tile000.png')";
  adjustYValuesWithFactor(collisionLines, changeFactor);
  adjustYValues(collisionLines)
  //transformYCoordinates(collisionLines)
  //transformYCoordinates(collisionLines2)
  //transformYCoordinates(collisionLines3)
}

window.onload = async () => {
  await preloadFrames(); // Carregar todos os frames
  newWindow(); // Configurar o personagem e o mapa
  character.style.opacity=0
  moveCharacter(); // Iniciar a animação
};


