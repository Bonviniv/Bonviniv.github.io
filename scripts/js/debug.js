/**
 * debug.js
 * Sistema de debug
 * Exibe informações de debug e overlay visual
 */

const DebugSystem = {
  enabled: false,
  overlay: null,
  infoPanel: null,
  updateInterval: null,
  
  /**
   * Inicializa o sistema de debug
   */
  init() {
    this.overlay = document.getElementById('debug-overlay');
    this.infoPanel = document.getElementById('debug-info');
    
    // Debug desabilitado por padrão
    if (DEBUG_CONFIG.enabled) {
      this.enable();
    }
  },
  
  /**
   * Alterna debug on/off
   */
  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  },
  
  /**
   * Ativa debug
   */
  enable() {
    this.enabled = true;
    
    if (this.overlay) {
      this.overlay.classList.remove('hidden');
    }
    
    // Renderizar grid e overlays
    this._renderDebugGrid();
    this._renderCollisionOverlay();
    this._renderTriggerOverlay();
    
    // Iniciar atualização de info
    this._startInfoUpdate();
    
    console.log('Debug mode enabled');
  },
  
  /**
   * Desativa debug
   */
  disable() {
    this.enabled = false;
    
    if (this.overlay) {
      this.overlay.classList.add('hidden');
    }
    
    // Parar atualização de info
    this._stopInfoUpdate();
    
    console.log('Debug mode disabled');
  },
  
  /**
   * Renderiza grid de debug
   * @private
   */
  _renderDebugGrid() {
    if (!this.overlay) return;
    
    // Limpar células antigas
    const oldCells = this.overlay.querySelectorAll('.debug-cell:not(.debug-collision):not(.debug-trigger)');
    oldCells.forEach(cell => cell.remove());
    
    // Posicionar overlay corretamente
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      const rect = mapContainer.getBoundingClientRect();
      this.overlay.style.width = BASE_MAP_SIZE + 'px';
      this.overlay.style.height = BASE_MAP_SIZE + 'px';
    }
    
    // Criar células do grid
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = document.createElement('div');
        cell.className = 'debug-cell';
        cell.style.left = (x * BASE_TILE_SIZE) + 'px';
        cell.style.top = (y * BASE_TILE_SIZE) + 'px';
        cell.style.width = BASE_TILE_SIZE + 'px';
        cell.style.height = BASE_TILE_SIZE + 'px';
        cell.textContent = `${x},${y}`;
        
        this.overlay.appendChild(cell);
      }
    }
  },
  
  /**
   * Renderiza overlay de colisões
   * @private
   */
  _renderCollisionOverlay() {
    if (!this.overlay) return;
    
    // Limpar overlays antigos
    const oldOverlays = this.overlay.querySelectorAll('.debug-collision');
    oldOverlays.forEach(overlay => overlay.remove());
    
    // Obter colisões
    const collisions = CollisionSystem.getAllCollisions();
    
    // Criar overlay para cada colisão
    collisions.forEach(({ x, y }) => {
      const overlay = document.createElement('div');
      overlay.className = 'debug-cell debug-collision';
      overlay.style.left = (x * BASE_TILE_SIZE) + 'px';
      overlay.style.top = (y * BASE_TILE_SIZE) + 'px';
      overlay.style.width = BASE_TILE_SIZE + 'px';
      overlay.style.height = BASE_TILE_SIZE + 'px';
      overlay.title = `Colisão em (${x}, ${y})`;
      
      this.overlay.appendChild(overlay);
    });
  },
  
  /**
   * Renderiza overlay de triggers
   * @private
   */
  _renderTriggerOverlay() {
    if (!this.overlay) return;
    
    // Limpar overlays antigos
    const oldOverlays = this.overlay.querySelectorAll('.debug-trigger');
    oldOverlays.forEach(overlay => overlay.remove());
    
    // Obter triggers
    const triggers = TriggerSystem.getAllTriggers();
    
    // Criar overlay para cada trigger
    triggers.forEach(({ x, y, trigger }) => {
      const overlay = document.createElement('div');
      overlay.className = 'debug-cell debug-trigger';
      overlay.style.left = (x * BASE_TILE_SIZE) + 'px';
      overlay.style.top = (y * BASE_TILE_SIZE) + 'px';
      overlay.style.width = BASE_TILE_SIZE + 'px';
      overlay.style.height = BASE_TILE_SIZE + 'px';
      
      let title = `Trigger em (${x}, ${y})\nTipo: ${trigger.tipo}`;
      if (trigger.tipo === 'texto') {
        title += `\nTexto: ${trigger.texto}`;
      } else if (trigger.tipo === 'mapa') {
        title += `\nMapa: ${trigger.mapa}`;
        if (trigger.spawnX !== undefined) title += `\nSpawn: (${trigger.spawnX}, ${trigger.spawnY})`;
      }
      overlay.title = title;
      
      this.overlay.appendChild(overlay);
    });
  },
  
  /**
   * Inicia atualização contínua de informações
   * @private
   */
  _startInfoUpdate() {
    this.updateInfo();
    this.updateInterval = setInterval(() => this.updateInfo(), 100);
  },
  
  /**
   * Para atualização de informações
   * @private
   */
  _stopInfoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  },
  
  /**
   * Atualiza painel de informações
   */
  updateInfo() {
    if (!this.infoPanel || !this.enabled) return;
    
    const pos = PlayerSystem.getPosition();
    const dir = PlayerSystem.getDirection();
    const moving = PlayerSystem.getIsMoving();
    const scale = ScaleSystem.getScale();
    const tileSize = ScaleSystem.getEffectiveTileSize();
    const mapName = MapRenderer.getCurrentMapName();
    const playerSpriteScale = MAP_CONFIG.playerSpriteScale[mapName] || 1.0;
    const volume = Math.round(AudioSystem.getVolume() * 100);
    const isPlaying = AudioSystem.isPlaying();
    
    const info = `
=== DEBUG INFO ===
Mapa: ${mapName || 'N/A'}
Posição: (${pos.x}, ${pos.y})
Direção: ${dir}
Movendo: ${moving ? 'Sim' : 'Não'}
Escala: ${scale.toFixed(3)}x
Player Scale: ${playerSpriteScale.toFixed(2)}x
Tile Size: ${tileSize.toFixed(1)}px
Volume: ${volume}%
Música: ${isPlaying ? 'Tocando' : 'Parado'}
Viewport: ${window.innerWidth}x${window.innerHeight}
Device: ${isMobileDevice() ? 'Mobile' : 'Desktop'}
    `.trim();
    
    this.infoPanel.textContent = info;
  },
  
  /**
   * Registra uma mensagem no console se debug estiver ativo
   * @param {...any} args - Argumentos para console.log
   */
  log(...args) {
    if (this.enabled) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  /**
   * Atualiza overlays (útil após mudanças no mapa)
   */
  refresh() {
    if (this.enabled) {
      this._renderDebugGrid();
      this._renderCollisionOverlay();
      this._renderTriggerOverlay();
      this.updateInfo();
    }
  }
};
