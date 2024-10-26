const character = document.getElementById('character');
const map = document.getElementById('map');
const initialTextBox = document.getElementById('text-box-initial');

let positionX = map.offsetWidth / 2 - 20; // Começa no meio do mapa
let positionY = map.offsetHeight / 2 - 20;

let currentDirection = null; // Nenhuma direção inicial
let frame = 0; // Para controlar as animações
const speed = 0.1; // Velocidade de movimento
let isMoving = false; // Controla se o personagem está se movendo
let isTextBoxVisible = false; // Controle se o text-box está visível
let isTextBox3Visible = false; // Controle se o text-box está visível

const directions = {
  down: [0, 1, 2, 3],    // Frames de 0 a 3 para ir para baixo
  left: [4, 5, 6, 7],    // Frames de 4 a 7 para esquerda
  right: [8, 9, 10, 11], // Frames de 8 a 11 para direita
  up: [12, 13, 14, 15]   // Frames de 12 a 15 para cima
};
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
  { x1: 50.5, y1: 56, x2: 57, y2: 56}, 
  { x1: 50.5, y1: 49, x2: 57, y2: 49},
  { x1: 50.5, y1: 56, x2: 50.5, y2: 49},
  { x1: 57, y1: 56, x2: 57, y2: 49},

  { x1: 51.5, y1: 45, x2: 56, y2: 45}, 
  { x1: 51.5, y1: 39, x2: 56, y2: 39},
  { x1: 51.5, y1: 39, x2: 51.5, y2: 45},
  { x1:  56, y1: 39, x2:  56, y2: 45},

  { x1: 44, y1: 45, x2: 48.5, y2: 45}, 
  { x1: 44, y1: 39, x2: 48.5, y2: 39},
  { x1: 44, y1: 39, x2:  44, y2: 45},
  { x1:  48.5, y1: 39, x2:  48.5, y2: 45},

  //caixas de correio
  { x1: 43, y1: 43, x2: 44, y2: 43}, 
  { x1: 43, y1: 45, x2: 44, y2: 45},
  { x1: 43, y1: 43, x2:  43, y2: 45},
  { x1: 44, y1: 43, x2:  44, y2: 45},

  { x1: 50.5, y1: 43, x2: 51.5, y2: 43}, 
  { x1: 50.5, y1: 45, x2: 51.5, y2: 45},
  { x1: 50.5, y1: 43, x2:  50.5, y2: 45},
  { x1: 51.5, y1: 43, x2:  51.5, y2: 45},

  //placa
  { x1: 44., y1: 55, x2: 45.25, y2: 55}, 
  { x1: 44, y1: 57, x2: 45.25, y2: 57},
  { x1: 44, y1: 55, x2:  44, y2: 57},
  { x1: 45.25, y1: 55, x2:  45.25, y2: 57},

];

// Criar um elemento canvas
let fadeTimeout; // Variável para armazenar o timeout de fade-out

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

function checkCollision(character, line) {
  // Obtém as coordenadas do personagem (em pixels)
  const characterX = convertToPixel(character.x, mapWidth);
  const characterY = convertToPixel(character.y, mapHeight);

  // Encontra o ponto mais próximo na linha
  const closestPoint = findClosestPointOnLine(characterX, characterY, line);

  // Calcula a distância entre o personagem e o ponto mais próximo
  const distance = calculateDistance(characterX, characterY, closestPoint.x, closestPoint.y);

  // Verifica se a distância é menor que o raio do personagem
  const characterRadius = 2; // Ajuste de acordo com o tamanho do personagem
  return distance <= characterRadius;
}

// Função para encontrar o ponto mais próximo na linha
function findClosestPointOnLine(px, py, line) {
  const { x1, y1, x2, y2 } = line;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return { x: x1 + t * dx, y: y1 + t * dy };
}

// Função para calcular a distância entre dois pontos
function calculateDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

function checkCollisionLines(characterX, characterY, collisionLines) {
  for (const line of collisionLines) {
    const { x1, y1, x2, y2 } = line;

    // Calcula a distância perpendicular do personagem ao segmento de linha
    const distance = perpendicularDistance(characterX, characterY, x1, y1, x2, y2);

    // Verifica se o ponto de colisão está dentro do intervalo do segmento de linha
    if (distance <= 2 && isPointOnLineSegment(characterX, characterY, x1, y1, x2, y2)) {
      return true; // Houve colisão
    }
  }

  return false; // Não houve colisão
}


// Função para calcular a distância perpendicular entre o personagem e uma linha
function perpendicularDistance(x, y, x1, y1, x2, y2) {
  const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  return numerator / denominator;   
}

// Função para verificar se o ponto está no intervalo do segmento de linha
function isPointOnLineSegment(px, py, x1, y1, x2, y2) {
  // Verifica se o ponto está dentro do intervalo dos pontos da linha
  const withinX = Math.min(x1, x2) <= px && px <= Math.max(x1, x2);
  const withinY = Math.min(y1, y2) <= py && py <= Math.max(y1, y2);
  return withinX && withinY;
}

function checkPlacaCollision(characterX, characterY) {
  for (const line of placaLines) {
    const { x1, y1, x2, y2 } = line;

    // Calcula a distância perpendicular do personagem ao segmento de linha
    const distance = perpendicularDistance(characterX, characterY, x1, y1, x2, y2);

    if (distance <= 2 && isPointOnLineSegment(characterX, characterY, x1, y1, x2, y2)) {
      console.log("Colisão detectada com a placa!");
      return true; // Houve colisão com a placa
    }
  }
  return false; // Não houve colisão com a placa
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

let aux=0
// Função para mover o personagem
function moveCharacter() {
  const { mapWidth, mapHeight } = getMapDimensions();

  let newXPercentage = positionX;
  let newYPercentage = positionY;
 

  if (isMoving && currentDirection ) {
    
    if (currentDirection === 'up') newYPercentage -= speed;
    if (currentDirection === 'down') newYPercentage += speed;
    if (currentDirection === 'left') newXPercentage -= speed;
    if (currentDirection === 'right') newXPercentage += speed;

    // Check for collision before updating position
    const willCollide = checkCollisionLines(newXPercentage, newYPercentage, collisionLines);

    // Update position only if there's no collision
    if (!willCollide) {
      positionX = newXPercentage;
      positionY = newYPercentage;
    }

    // Maintain character within map boundaries
    positionX = Math.max(0, Math.min(100, positionX));
    positionY = Math.max(0, Math.min(100, positionY));

    // Update character position in pixels
    const newXPixel = convertToPixel(positionX, mapWidth);
    const newYPixel = convertToPixel(positionY, mapHeight);
    character.style.left = `${newXPixel}px`;
    character.style.top = `${newYPixel}px`;

    // Update animation (change sprite)
    const spriteIndex = directions[currentDirection][frame % 4];
    character.style.backgroundImage = `url('images/tile${spriteIndex.toString().padStart(3, '0')}.png')`;

    // Update position display in percentage
    const positionDisplay = document.getElementById('position-display');
    positionDisplay.textContent = `X: ${positionX}%, Y: ${positionY}%`;

    // Advance frame
    aux+=1
    if(aux>10){
      frame++;
      aux=0
    }
    

    //if (44.25<positionX<44.75 && 57.25<positionY<57.75) {

    if (calcularDistancia(positionX,positionY,pontoX=51,pontoY=35)){
      if(!isTextBox3Visible)
        showTextBox3();
        clearTimeout(fadeTimeout);
        // Cancelar qualquer fade-out em andamento
        
      } else if (isTextBox3Visible) {
        // Quando o personagem sair da posição específica, iniciar o fade-out
        hideTextBox3WithFade();
        isTextBox3Visible
    }

    if (calcularDistancia(positionX,positionY,pontoX=44.25,pontoY=56)){
      if(!isTextBoxVisible)
        showTextBox2();
        clearTimeout(fadeTimeout);
        // Cancelar qualquer fade-out em andamento
        
      } else if (isTextBoxVisible) {
        // Quando o personagem sair da posição específica, iniciar o fade-out
        hideTextBox2WithFade();
        isTextBoxVisible=false
    }
  

    // Remove a caixa de texto inicial com fadeOut quando o personagem se move pela primeira vez
    if (!hasMoved) {
      hasMoved = true;
      initialTextBox.style.animation = 'fadeOut 1s forwards'; // Ativa a animação fadeOut
      setTimeout(() => {
        initialTextBox.style.display = 'none'; // Remove a caixa após a animação
      }, 1000); // Tempo para o fade-out completar
    }
  }


  // Repete o loop da animação
  requestAnimationFrame(moveCharacter);
  
}

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w': currentDirection = 'up'; break;
    case 'a': currentDirection = 'left'; break;
    case 's': currentDirection = 'down'; break;
    case 'd': currentDirection = 'right'; break;
  }
  isMoving = true;
});


document.addEventListener('keyup', (event) => {
  // Parar o movimento quando a tecla é solta
  isMoving = false;
});

// Inicializa o personagem no centro do mapa
window.onload = () => {
  positionX = 50; // Inicializa no meio do mapa
  positionY = 50;

  const newXPixel = convertToPixel(positionX, mapWidth);
  const newYPixel = convertToPixel(positionY, mapHeight);
  character.style.left = `${newXPixel}px`;
  character.style.top = `${newYPixel}px`;
  character.style.backgroundImage = "url('images/tile000.png')"; // Sprite inicial

  // Iniciar o loop de animação
  moveCharacter();
};


document.addEventListener('keydown', (event) => {
  if (!hasMoved && ['w', 'a', 's', 'd'].includes(event.key)) {
    hasMoved = true;
    textBox.style.animation = 'fadeOut 1s forwards'; // Ativa a animação fadeOut
    setTimeout(() => {
      textBox.style.display = 'none'; // Remove a caixa após a animação
    }, 1000); // Tempo para o fade-out completar
  }
});

const audio = document.getElementById('background-music');
const volumeSlider = document.getElementById('volume-slider');

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

  if (!isMoving) {
    if (event.key === 'w') currentDirection = 'up';
    if (event.key === 'a') currentDirection = 'left';
    if (event.key === 's') currentDirection = 'down';
    if (event.key === 'd') currentDirection = 'right';

    isMoving = true; // Começar o movimento
  }
});

// Configurar volume inicial
audio.volume = 0.25;


// Inicializa o personagem e toca a música
window.onload = () => {
  positionX = 50; // Inicializa no meio do mapa
  positionY = 50;

  const newXPixel = convertToPixel(positionX, mapWidth);
  const newYPixel = convertToPixel(positionY, mapHeight);
  character.style.left = `${newXPixel}px`;
  character.style.top = `${newYPixel}px`;
  character.style.backgroundImage = "url('images/tile000.png')"; // Sprite inicial

  // Iniciar o loop de animação
  moveCharacter();

  // Tocar música ao carregar a página (após usuário interagir)
  audio.play().catch((error) => {
    console.log("A reprodução automática foi bloqueada pelo navegador.");
  });
};


// Atualizar o volume conforme o controle deslizante
volumeSlider.addEventListener('input', (event) => {
  audio.volume = event.target.value;
});


