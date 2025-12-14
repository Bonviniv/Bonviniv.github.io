/**
 * scale.js
 * Sistema de escalonamento responsivo
 * Gerencia a escala do mapa com base no viewport e orientação
 */

const ScaleSystem = {
  currentScale: 1.0,
  isMobile: false,
  orientationLocked: false,
  
  /**
   * Inicializa o sistema de escalonamento
   */
  init() {
    this.isMobile = isMobileDevice();
    
    // Configurar orientação mobile
    if (this.isMobile) {
      this._lockOrientation();
      this._setupOrientationCheck();
    }
    
    // Calcular e aplicar escala inicial
    this.updateScale();
    
    // Atualizar escala quando janela redimensionar
    window.addEventListener('resize', () => this.updateScale());
    
    // Atualizar escala quando orientação mudar
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateScale(), 100);
    });
  },
  
  /**
   * Calcula e aplica a escala apropriada
   */
  updateScale() {
    const config = this.isMobile ? SCALE_CONFIG.mobile : SCALE_CONFIG.desktop;
    const viewportHeight = window.innerHeight;
    
    // Calcular escala baseada na altura do viewport
    const targetHeight = viewportHeight * config.viewportPercentage;
    let scale = targetHeight / BASE_MAP_SIZE;
    
    // Aplicar limites
    scale = Math.max(config.minScale, Math.min(config.maxScale, scale));
    
    // Armazenar escala atual
    this.currentScale = scale;
    
    // Aplicar escala aos elementos
    this._applyScale(scale);
    
    // Atualizar debug se ativo
    if (DebugSystem && DebugSystem.enabled) {
      DebugSystem.updateInfo();
    }
  },
  
  /**
   * Aplica a escala aos elementos do DOM
   * @param {number} scale - Escala a ser aplicada
   * @private
   */
  _applyScale(scale) {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      mapContainer.style.transform = `scale(${scale})`;
    }
    
    // Debug overlay herda a escala do map-container por estar dentro dele
    // Não precisa aplicar transform separadamente
  },
  
  /**
   * Tenta bloquear orientação em landscape (mobile)
   * @private
   */
  _lockOrientation() {
    // Tentar usar Screen Orientation API
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').then(() => {
        this.orientationLocked = true;
        console.log('Orientação bloqueada em landscape');
      }).catch(err => {
        console.warn('Não foi possível bloquear orientação:', err);
        this.orientationLocked = false;
      });
    } else {
      console.warn('Screen Orientation API não disponível');
      this.orientationLocked = false;
    }
  },
  
  /**
   * Configura verificação de orientação e exibe aviso se necessário
   * @private
   */
  _setupOrientationCheck() {
    const rotateMessage = document.getElementById('rotate-message');
    
    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      
      if (isPortrait && rotateMessage) {
        rotateMessage.classList.add('show');
      } else if (rotateMessage) {
        rotateMessage.classList.remove('show');
      }
    };
    
    // Verificar orientação inicial
    checkOrientation();
    
    // Verificar quando orientação mudar
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    });
  },
  
  /**
   * Obtém a escala atual
   * @returns {number}
   */
  getScale() {
    return this.currentScale;
  },
  
  /**
   * Obtém o tamanho efetivo do tile na escala atual
   * @returns {number}
   */
  getEffectiveTileSize() {
    return BASE_TILE_SIZE * this.currentScale;
  },
  
  /**
   * Converte coordenadas de grid para coordenadas de pixel escaladas
   * @param {number} x - Coordenada X do grid
   * @param {number} y - Coordenada Y do grid
   * @returns {{x: number, y: number}}
   */
  gridToPixel(x, y) {
    return {
      x: x * BASE_TILE_SIZE,
      y: y * BASE_TILE_SIZE
    };
  },
  
  /**
   * Converte coordenadas de pixel para coordenadas de grid
   * @param {number} pixelX - Coordenada X em pixel
   * @param {number} pixelY - Coordenada Y em pixel
   * @returns {{x: number, y: number}}
   */
  pixelToGrid(pixelX, pixelY) {
    return {
      x: Math.floor(pixelX / BASE_TILE_SIZE),
      y: Math.floor(pixelY / BASE_TILE_SIZE)
    };
  }
};
