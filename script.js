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

let LabTown=false

// Define os links
const url1 = 'https://github.com/Bonviniv'; // Substitua pelo seu link
const url2 = 'https://www.linkedin.com/in/vitorsantosbarbosa/'; // Substitua pelo seu link
const pdfUrl = 'pdf/VitorBarbosaCV.pdf'; // Substitua pelo caminho do seu PDF

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
const speed = 0.1; // Velocidade de movimento
let isMoving = false; // Controla se o personagem está se movendo
let isTextBoxVisible = false; // Controle se o text-box está visível
let isTextBox3Visible = false; // Controle se o text-box está visível
let isTextBox4Visible = false; // Controle se o text-box está visível


const debug=false

const directions = {
  down: [0, 1, 2, 3],    // Frames de 0 a 3 para ir para baixo
  left: [4, 5, 6, 7],    // Frames de 4 a 7 para esquerda
  right: [8, 9, 10, 11], // Frames de 8 a 11 para direita
  up: [12, 13, 14, 15]   // Frames de 12 a 15 para cima
};

let fadeTimeout; // Variável para armazenar o timeout de fade-out




// Obtendo as dimensões do mapa
const textBox = document.getElementById('text-box');

let hasMoved = false;
const textBox2 = document.getElementById('text-box2');
const textBox3 = document.getElementById('text-box3');
const textBox4 = document.getElementById('text-box4');


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

const collisionLines2 = [
  //paredes lab
  { x1: 51, y1: 62.5, x2: 57, y2: 62.5 }, 
  { x1: 49.5, y1: 62.5, x2: 43, y2: 62.5 }, 
  { x1: 43, y1: 62.5, x2: 43, y2: 39 }, 
  { x1: 56.5, y1: 62.5, x2: 56.5, y2: 39 }, 
  { x1: 56.5, y1: 40, x2: 43, y2: 40 },    

  //moveis
  { x1: 49.5, y1: 41, x2: 44, y2: 41 },  
  { x1: 49.5, y1: 41, x2:49.5, y2: 39 },

  { x1: 52, y1: 41, x2: 57, y2: 41 }, 
  { x1: 52, y1: 41, x2: 52, y2: 39 }, 

  { x1: 48.75, y1: 56, x2: 43, y2: 56 }, 
  { x1: 48.75, y1: 52, x2: 43, y2: 52 }, 
  { x1: 48.75, y1: 52, x2: 48.75, y2: 56 },

  { x1: 57, y1: 56, x2: 51, y2: 56 }, 
  { x1: 57, y1: 52, x2: 51, y2: 52 }, 
  { x1: 51, y1: 52, x2: 51, y2: 56 },

  //plantas
  { x1: 43, y1: 60.75, x2: 44, y2: 60.75 }, 
  { x1:  44, y1: 60.75, x2:  44, y2: 63 },

  { x1: 55.5, y1: 60.75, x2: 57, y2: 60.75 }, 
  { x1:  55.5, y1: 60.75, x2: 55.5, y2: 63 },

  //professor oak

  { x1: 51.5, y1: 46.5, x2: 48.25, y2: 46.5 },
  { x1: 51.5, y1: 42, x2: 48.25, y2: 42 },
  { x1: 51.5, y1: 46.5, x2: 51.5, y2:  42 },
  { x1: 48.25, y1: 46.5, x2: 48.25, y2: 42 },


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
  { x1: 44.75, y1: 40, x2:44.75, y2: 58 },
  { x1:55.5, y1: 40, x2:55.5, y2: 58 },
  { x1: 44.75, y1: 57.5, x2:55.5, y2: 57.5 },
  { x1: 44.75, y1: 43, x2:55.5, y2: 43 },

  //escada
  { x1: 53.4, y1: 48, x2:51.8, y2: 48 },
  { x1: 51.25, y1: 48, x2:51.25, y2: 43 },

  //tv
  
];
let lines



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
    if(!isTextBox4Visible){
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


function ativarTextoslab (positionX, positionY){

  if (calcularDistancia(positionX,positionY,pontoX=50,pontoY=45)){
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
  if (isWPressed && positionX >= 52 && positionX <= 54 && positionY >= 46.5 && positionY <= 48) {
    // Adiciona a classe "active" para exibir o overlay
    maplinks.style.display="flex"
    maplinksa.style.display="flex"
  } else {
    // Remove a classe "active" para esconder o overlay
    maplinks.style.display="none"
    maplinksa.style.display="none"
  }
}


let contador=0

// Função para mover o personagem
function moveCharacter() {

  
  
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


   
   if(contador==2){
  character.style.opacity=1
  }


  if (body.dataset.background == "casa") {
    if(contador==0){
      newXPercentage = 54.4;
      newYPercentage = 44.6
     }
    // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
    lines = collisionLines3;
    cenario = 3;
    console.log("Cenário alterado para o casa.");
    
  } 
  
    if (body.dataset.background == "lab") {
      if(contador==0){
        newXPercentage = 50;
        newYPercentage = 63
       }
    
    
      // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
      lines = collisionLines2;
      cenario = 2;
      console.log("Cenário alterado para o lab.");
      ativarTextoslab(newXPercentage,newYPercentage)
      ativarLinks(newXPercentage,newYPercentage)
    } 

    if (body.dataset.background == "town") {
      // Se o fundo já é "oaks-lab.png", altere as variáveis ou execute as ações
     
    
    
      lines = collisionLines;
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

      // Atualiza a animação
      const spriteIndex = directions[currentDirection][frame % 4];
      character.style.backgroundImage = `url('images/tile${spriteIndex.toString().padStart(3, '0')}.png')`;
      
      // Controle do frame para a animação (evita flickering ao pausar)

      aux++;
      contador++;
      if (aux >= 10) {
        frame++;
        aux = 0;
      }

      if(debug){

        positionDisplay.innerText = `X: ${positionX.toFixed(2)}%, Y: ${positionY.toFixed(2)}%`;

      }
      if(cenario==1){
        if (isWPressed && positionX >= 45 && positionX <= 46 && positionY >= 45&& positionY <= 46) {
        // Redireciona para a nova página e define o fundo
       
        window.location.href = "casa.html";
        document.body.style.backgroundImage = "url('images/casa.png')";
        newWindow()
        
      }
      }

      if(cenario==1){
        if (isWPressed && positionX >= 53 && positionX <= 55 && positionY >= 56.5 && positionY <= 57) {
        // Redireciona para a nova página e define o fundo
       
        window.location.href = "lab.html";
        document.body.style.backgroundImage = "url('images/oaks-lab.png')";
        newWindow()
        
        
      }
      }
       // Checa se a tecla "W" está pressionada e se o personagem está na área especificada
       if(cenario==2){
        if (isSPressed && positionX >= 49 && positionX <= 51 && positionY >= 63 && positionY <= 65) {
         
        // Redireciona para a nova página e define o fundo
        window.location.href = "index.html";
        document.body.style.backgroundImage = "url('images/pallet-town.png')";
        
        newWindow()
        
      
      }
      }

      if(cenario==3){
        if (isAPressed && positionX >= 52 && positionX <= 53 && positionY >= 43.9 && positionY <= 46) {
         
        // Redireciona para a nova página e define o fundo
        window.location.href = "index.html";
        document.body.style.backgroundImage = "url('images/pallet-town.png')";
        
        newWindow()
        
      
      }
      }

      
    
    }
    
    // Atualiza a posição do display (para depuração)
   
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


const frames = [];

// Precarregar frames
function preloadFrames() {
  for (let i = 0; i <= 15; i++) {
    const img = new Image();
    img.src = `images/tile${i.toString().padStart(3, '0')}.png`;
    frames.push(img);
  }
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
 
}

window.onload = () => {
  newWindow()
  moveCharacter();
};

