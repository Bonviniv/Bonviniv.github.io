/**
 * ScriptTownn - Constantes Globais
 * Todas as configurações do jogo centralizadas
 */

// ============================================
// CONFIGURAÇÕES DE GRID
// ============================================
const GRID_SIZE = 25; // 25×25 células
const BASE_TILE_SIZE = 20; // Tamanho original dos tiles em pixels
const BASE_MAP_SIZE = GRID_SIZE * BASE_TILE_SIZE; // 500px

// ============================================
// CONFIGURAÇÕES DE ESCALA RESPONSIVA
// ============================================
const SCALE_CONFIG = {
  desktop: {
    viewportPercentage: 0.70, // 70% da altura da viewport
    minScale: 1.0,       // Tiles mínimo 20px
    maxScale: 1.6        // Tiles máximo 32px
  },
  mobile: {
    viewportPercentage: 0.90, // 90% da altura (landscape)
    minScale: 0.72,      // Tiles mínimo 14.4px
    maxScale: 1.0,       // Tiles máximo 20px
    breakpoint: 768      // Largura para considerar mobile
  }
};

// ============================================
// CONFIGURAÇÕES DE GAMEPLAY
// ============================================
const GAMEPLAY_CONFIG = {
  moveDuration: 250, // Milissegundos por movimento de célula
  textDisappearDelay: 1000, // Delay para texto sumir após sair da célula
  animationFrameDuration: 62.5 // ms por frame de animação
};

// Constantes de atalho (compatibilidade)
const MOVE_DURATION = GAMEPLAY_CONFIG.moveDuration;
const TEXT_DISAPPEAR_DELAY = GAMEPLAY_CONFIG.textDisappearDelay;
const ANIMATION_FRAME_DURATION = GAMEPLAY_CONFIG.animationFrameDuration;

// ============================================
// CONFIGURAÇÕES DE ÁUDIO
// ============================================
const AUDIO_CONFIG = {
  initialVolume: 0.25, // 25% volume inicial
  musicPath: '../../../outros/sons/musicLoop.mp3',
  autoplay: true,
  loop: true
};

// ============================================
// SPRITES DO PERSONAGEM
// ============================================
const SPRITE_SETS = {
  DOWN: [0, 1, 2, 3],   // tile000.png a tile003.png
  LEFT: [4, 5, 6, 7],   // tile004.png a tile007.png
  RIGHT: [8, 9, 10, 11], // tile008.png a tile011.png
  UP: [12, 13, 14, 15]   // tile012.png a tile015.png
};

// Frame idle (parado) para cada direção
const IDLE_FRAMES = {
  DOWN: 0,
  LEFT: 4,
  RIGHT: 8,
  UP: 12
};

// ============================================
// DIREÇÕES E DELTAS
// ============================================
const DIRECTIONS = {
  UP: { dx: 0, dy: -1, key: 'UP', opposite: 'DOWN' },
  DOWN: { dx: 0, dy: 1, key: 'DOWN', opposite: 'UP' },
  LEFT: { dx: -1, dy: 0, key: 'LEFT', opposite: 'RIGHT' },
  RIGHT: { dx: 1, dy: 0, key: 'RIGHT', opposite: 'LEFT' }
};

// Mapeamento de teclas para direções
const KEY_MAPPINGS = {
  'ArrowUp': 'UP',
  'ArrowDown': 'DOWN',
  'ArrowLeft': 'LEFT',
  'ArrowRight': 'RIGHT',
  'KeyW': 'UP',
  'KeyS': 'DOWN',
  'KeyA': 'LEFT',
  'KeyD': 'RIGHT'
};

// ============================================
// PATHS E ESTRUTURA DE ARQUIVOS
// ============================================
const PATHS = {
  cenarios: '../../../cenarios',
  personagem: '../../../personagem',
  sons: '../../../outros/sons'
};

// ============================================
// CONFIGURAÇÕES DE CACHE
// ============================================
const CACHE_CONFIG = {
  enabled: true,
  prefix: 'scripttown_',
  mapImagePrefix: 'scripttown_map_',
  volumeKey: 'scripttown_volume',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias em ms
};

// ============================================
// CONFIGURAÇÕES DE DEBUG
// ============================================
const DEBUG_CONFIG = {
  enabled: false, // Inicia desabilitado
  toggleKey: 'KeyX', // Tecla X para ligar/desligar
  showGrid: true,
  showCoordinates: true,
  showCollisions: true,
  showTriggers: true,
  showPlayerInfo: true,
  showFPS: true,
  gridColor: 'rgba(255, 0, 0, 0.3)',
  collisionColor: 'rgba(255, 0, 0, 0.5)',
  triggerTextColor: 'rgba(0, 255, 0, 0.5)',
  triggerMapColor: 'rgba(255, 255, 0, 0.5)',
  fontSize: '8px'
};

// ============================================
// CONFIGURAÇÕES DE UI
// ============================================
const UI_CONFIG = {
  dialogFadeDuration: 200, // ms
  loadingMinDuration: 500,  // Mostrar loading por no mínimo 500ms
  mobileControlSize: 60,    // Tamanho dos botões mobile em px
  mobileControlOpacity: 0.7,
  volumeSliderWidth: 150    // Largura do slider em px
};

// ============================================
// MAPAS E POSIÇÕES INICIAIS
// ============================================
const MAP_CONFIG = {
  initialMap: 'cidade',
  defaultSpawnPosition: { x: 12, y: 12 }, // Centro do mapa 25x25
  
  // Posições específicas de spawn (a serem mapeadas)
  spawnPositions: {
    cidade: { x: 12, y: 12, direction: 'DOWN' },
    casa: { x: 18, y: 7, direction: 'DOWN' },
    casa2: { x: 12, y: 18, direction: 'UP' },
    casa3: { x: 18, y: 15, direction: 'RIGHT' },
    lab: { x: 12, y: 18, direction: 'UP' }
  },
  
  // Escala adicional do sprite do player por mapa (multiplicador após escala do mapa)
  playerSpriteScale: {
    cidade: 1.0,
    casa: 1.25,
    casa2: 1.15,
    casa3: 1.15,
    lab: 1.25
  },
  
  // Spawns baseados em transições entre mapas específicos
  // Formato: 'mapaOrigem->mapaDestino': { x, y, direction }
  transitionSpawns: {
    'casa3->casa2': { x: 17, y: 18, direction: 'LEFT' },
    'casa2->cidade': { x: 15, y: 9, direction: 'DOWN' },
    'casa->cidade': { x: 7, y: 9, direction: 'DOWN' },
    'lab->cidade': { x: 16, y: 15, direction: 'DOWN' }
  }
};

// ============================================
// TIPOS DE TRIGGERS
// ============================================
const TRIGGER_TYPES = {
  TEXT: 'triggers_txt',
  MAP: 'triggers_mp',
  LINK: 'triggers_link'
};

// ============================================
// MENSAGENS DE ERRO
// ============================================
const ERROR_MESSAGES = {
  mapLoad: 'Falha ao carregar o mapa',
  mapLoadFailed: 'Falha ao carregar o mapa. Verifique sua conexão e tente novamente.',
  audioInit: 'Não foi possível inicializar o áudio',
  audioLoadFailed: 'Não foi possível carregar a música.',
  tileLoadFailed: 'Erro ao carregar tiles do mapa.',
  jsonLoadFailed: 'Erro ao carregar dados do mapa.',
  cacheError: 'Erro ao acessar cache local.',
  orientationLockFailed: 'Não foi possível travar orientação.',
  gameInit: 'Erro ao inicializar o jogo'
};

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Verifica se está em dispositivo mobile
 */
function isMobileDevice() {
  return window.innerWidth < SCALE_CONFIG.mobile.breakpoint || 
         ('ontouchstart' in window);
}

/**
 * Verifica se está em orientação portrait (mobile)
 */
function isPortraitOrientation() {
  return window.innerHeight > window.innerWidth;
}

/**
 * Gera path completo para tile do mapa
 * @param {string} mapName - Nome do mapa
 * @param {string} tileFilename - Nome do arquivo do tile (ex: 'tile000.png')
 */
function getTilePath(mapName, tileFilename) {
  return `${PATHS.cenarios}/${mapName}/${tileFilename}`;
}

/**
 * Gera path completo para sprite do personagem
 */
function getSpritePath(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `${PATHS.personagem}/tile${paddedIndex}.png`;
}

/**
 * Gera path completo para background do mapa
 */
function getBackgroundPath(mapName) {
  return `${PATHS.cenarios}/${mapName}/${mapName}Background.png`;
}

/**
 * Gera path completo para JSON do mapa
 */
function getMapDataPath(mapName) {
  return `${PATHS.cenarios}/${mapName}/${mapName}.json`;
}

/**
 * Lê parâmetros da URL
 */
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  const x = params.get('x');
  const y = params.get('y');
  const volume = params.get('volume');
  
  return {
    volume: volume !== null ? parseFloat(volume) : null,
    fromMap: params.get('fromMap'),
    x: x !== null ? parseInt(x, 10) : null,
    y: y !== null ? parseInt(y, 10) : null
  };
}

/**
 * Gera URL com parâmetros para navegação entre mapas
 */
function generateMapURL(mapName, volume, x = null, y = null) {
  let url = `${mapName}.html?volume=${volume}`;
  if (x !== null && y !== null) {
    url += `&x=${x}&y=${y}`;
  }
  return url;
}

console.log('✅ Constants.js carregado');
