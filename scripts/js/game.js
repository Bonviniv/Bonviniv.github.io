/**
 * game.js
 * Orquestrador principal do jogo
 * Inicializa todos os sistemas e gerencia o fluxo do jogo
 */

const Game = {
  initialized: false,
  currentMap: 'cidade',
  
  /**
   * Inicializa o jogo
   */
  async init() {
    try {
      console.log('Inicializando jogo...');
      
      // Obter parâmetros da URL
      const urlParams = getURLParams();
      
      // Determinar mapa a carregar
      const mapName = this._getMapNameFromURL();
      this.currentMap = mapName;
      
      // Determinar posição inicial
      const spawnConfig = MAP_CONFIG.spawnPositions[mapName] || { x: 10, y: 10, direction: 'DOWN' };
      const spawnX = urlParams.x !== null ? urlParams.x : spawnConfig.x;
      const spawnY = urlParams.y !== null ? urlParams.y : spawnConfig.y;
      const spawnDirection = spawnConfig.direction || 'DOWN';
      
      // Inicializar UI
      UISystem.init();
      UISystem.showLoading();
      
      // Inicializar sistema de áudio
      console.log('Inicializando áudio...');
      await AudioSystem.init();
      
      // Inicializar sistema de escala
      console.log('Inicializando escala...');
      ScaleSystem.init();
      
      // Carregar mapa
      console.log('Carregando mapa:', mapName);
      await MapRenderer.loadMap(mapName);
      
      const mapData = MapRenderer.getMapData();
      
      // Inicializar sistemas baseados no mapa
      console.log('Inicializando sistemas...');
      CollisionSystem.init(mapData);
      TriggerSystem.init(mapData);
      
      // Inicializar personagem
      console.log('Inicializando personagem...');
      PlayerSystem.init(spawnX, spawnY, spawnDirection);
      
      // Inicializar controles
      console.log('Inicializando controles...');
      ControlsSystem.init();
      
      // Inicializar debug
      console.log('Inicializando debug...');
      DebugSystem.init();
      
      // Ocultar loading
      UISystem.hideLoading();
      
      this.initialized = true;
      console.log('Jogo inicializado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao inicializar jogo:', error);
      UISystem.fatalError(error.message || ERROR_MESSAGES.gameInit);
    }
  },
  
  /**
   * Obtém nome do mapa a partir da URL
   * @returns {string}
   * @private
   */
  _getMapNameFromURL() {
    // Obter nome do arquivo HTML atual
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    
    // Extrair nome do mapa (ex: 'cidade.html' -> 'cidade')
    const mapName = filename.replace('.html', '').replace('.htm', '');
    
    // Validar se mapa existe
    if (MAP_CONFIG.spawnPositions[mapName]) {
      return mapName;
    }
    
    // Fallback para cidade
    console.warn(`Mapa '${mapName}' não encontrado, usando 'cidade' como fallback`);
    return 'cidade';
  },
  
  /**
   * Reinicia o jogo
   */
  async restart() {
    console.log('Reiniciando jogo...');
    
    // Limpar sistemas
    if (this.initialized) {
      TriggerSystem.clear();
      CollisionSystem.clear();
      ControlsSystem.clearKeys();
    }
    
    // Recarregar página
    window.location.reload();
  },
  
  /**
   * Muda para outro mapa
   * @param {string} mapName - Nome do mapa
   * @param {number} spawnX - Posição X inicial
   * @param {number} spawnY - Posição Y inicial
   */
  changeMap(mapName, spawnX = 10, spawnY = 10) {
    const currentVolume = AudioSystem.getVolume();
    const newURL = generateMapURL(mapName, spawnX, spawnY, currentVolume);
    window.location.href = newURL;
  }
};

// Inicializar jogo quando página carregar
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});

// Prevenir comportamento padrão de algumas teclas
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
});

// Log de erros globais
window.addEventListener('error', (e) => {
  console.error('Erro global:', e.error);
  if (!Game.initialized) {
    UISystem.fatalError('Erro ao carregar recursos do jogo. Verifique o console para detalhes.');
  }
});

// Log de erros de promessas não tratadas
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejeitada:', e.reason);
  if (!Game.initialized) {
    UISystem.fatalError('Erro ao carregar recursos do jogo. Verifique o console para detalhes.');
  }
});
