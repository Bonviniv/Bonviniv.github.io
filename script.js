const character = document.getElementById('character');
const map = document.getElementById('map');
const initialTextBox = document.getElementById('text-box-initial');
const audio = document.getElementById('background-music');
const volumeSlider = document.getElementById('volume-slider');

let positionX = 50; // Começa no meio do mapa em porcentagem
let positionY = 50;

let currentDirection = null; // Nenhuma direção inicial
let frame = 0; // Para controlar as animações
const speed = 0.1; // Velocidade de movimento
let isMoving = false; // Controla se o personagem está se movendo
let isTextBoxVisible = false; // Controle se o text-box está visível
let isTextBox3Visible = false; // Controle se o text-box está visível

const debug=true

const directions = {
  down: [0, 1, 2, 3],    // Frames de 0 a 3 para ir para baixo
  left: [4, 5, 6, 7],    // Frames de 4 a 7 para esquerda
  right: [8, 9, 10, 11], // Frames de 8 a 11 para direita
  up: [12, 13, 14, 15]   // Frames de 12 a 15 para cima
};

let fadeTimeout; // Variável para armazenar o timeout de fade-out


let aux=0

// Obtendo as dimensões do mapa
const textBox = document.getElementById('text-box');
let hasMoved = false;
const textBox2 = document.getElementById('text-box2');
const textBox3 = document.getElementById('text-box3');


const mapWidth = map.offsetWidth;
const mapHeight = map.offsetHeight;

const placaLines = [
  { x1: 44, y1: 55, x2: 45.25, y2: 55 },
  { x1: 44, y1: 57, x2: 45.25, y2: 57 },
  { x1: 44, y1: 55, x2: 44, y2: 57 },
  { x1: 45.25, y1: 55, x2: 45.25, y2: 57 }
];

// Definindo as áreas de colisão em porcentagem
// Definição das linhas de colisão em porcentagem
const collisionLines = [
  { x1: 42, y1: 35.5, x2: 58, y2: 35.5 }, // Linha superior
  { x1: 42, y1: 64, x2: 58, y2: 64},   // Linha inferior
  { x1: 42, y1: 35.5, x2: 42, y2: 64 }, // Linha esquerda
  { x1: 58, y1: 35.5, x2: 58, y2: 64 },     // Linha direita

  //agua
  { x1: 45, y1: 59, x2: 50, y2: 59}, 
  { x1: 45, y1: 64, x2: 45, y2: 59}, 
  { x1: 50, y1: 64, x2: 50, y2: 59}, 

  //cercas
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
// ... (restante do código)
// Função para obter as dimensões do mapa
function getMapDimensions() {
  const mapWidth = map.offsetWidth;
  const mapHeight = map.offsetHeight;
  return { mapWidth, mapHeight };
}

// Função para converter de pixel para porcentagem
function convertToPercentage(value, mapDimension) {
  return (value / mapDimension) * 100;
}

// Função para converter de porcentagem para pixel
function convertToPixel(value, mapDimension) {
  return (value / 100) * mapDimension;
}

function ativarTextos (positionX, positionY){
  if (calcularDistancia(positionX,positionY,pontoX=51,pontoY=35)){
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

  if (calcularDistancia(positionX,positionY,pontoX=44.25,pontoY=56)){
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
  
function checkCollisionLines(newXPercentage, newYPercentage) {
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
  for (let line of collisionLines) {
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

// Função para mover o personagem
function moveCharacter() {
  const { mapWidth, mapHeight } = getMapDimensions();

  // Define as novas posições em porcentagem
  let newXPercentage = positionX;
  let newYPercentage = positionY;
  
  // Apenas calcula a nova posição e atualiza a direção se o personagem está em movimento
  if (isMoving && currentDirection) {
    if (currentDirection === 'up') newYPercentage -= speed;
    if (currentDirection === 'down') newYPercentage += speed;
    if (currentDirection === 'left') newXPercentage -= speed;
    if (currentDirection === 'right') newXPercentage += speed;

    // Checa colisão na nova posição
    const willCollide = checkCollisionLines(newXPercentage, newYPercentage);

    if (!willCollide) {
      // Atualiza a posição somente se não houver colisão
      positionX = Math.max(0, Math.min(100, newXPercentage));
      positionY = Math.max(0, Math.min(100, newYPercentage));

      // Converte porcentagens para pixels e aplica ao estilo do personagem
      const newXPixel = convertToPixel(positionX, mapWidth);
      const newYPixel = convertToPixel(positionY, mapHeight);
      character.style.left = `${newXPixel}px`;
      character.style.top = `${newYPixel}px`;

      // Atualiza a animação
      const spriteIndex = directions[currentDirection][frame % 4];
      character.style.backgroundImage = `url('images/tile${spriteIndex.toString().padStart(3, '0')}.png')`;
      
      // Controle do frame para a animação (evita flickering ao pausar)
      aux++;
      if (aux >= 10) {
        frame++;
        aux = 0;
      }
    }

    // Atualiza a posição do display (para depuração)
   
  } 

  ativarTextos(positionX, positionY);
  
  requestAnimationFrame(moveCharacter);
}

// Mantém a lógica de colisão e ativação das caixas de texto
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w': currentDirection = 'up'; break;
    case 'a': currentDirection = 'left'; break;
    case 's': currentDirection = 'down'; break;
    case 'd': currentDirection = 'right'; break;
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
    textBox.style.animation = 'fadeOut 1s forwards'; // Ativa a animação fadeOut
    setTimeout(() => {
      textBox.style.display = 'none'; // Remove a caixa após a animação
    }, 1000); // Tempo para o fade-out completar
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
    textBox.style.animation = 'fadeOut 1s forwards'; // Ativa a animação fadeOut
    setTimeout(() => {
      textBox.style.display = 'none'; // Remove a caixa após a animação
    }, 1000); // Tempo para o fade-out completar
  }
});


audio.volume=0.25
// Atualizar o volume conforme o controle deslizante
volumeSlider.addEventListener('input', (event) => {
  audio.volume = event.target.value;
});


window.onload = () => {
  const { mapWidth, mapHeight } = getMapDimensions();
  positionX = 50;
  positionY = 50;
  const newXPixel = convertToPixel(positionX, mapWidth);
  const newYPixel = convertToPixel(positionY, mapHeight);
  character.style.left = `${newXPixel}px`;
  character.style.top = `${newYPixel}px`;
  character.style.backgroundImage = "url('images/tile000.png')";

  moveCharacter();
};

