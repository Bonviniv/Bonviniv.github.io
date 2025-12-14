/**
 * mapRenderer.js
 * Sistema de renderização de mapas
 * Carrega tiles individuais, monta canvas e gera imagem composta com cache
 */

const MapRenderer = {
  currentMap: null,
  mapData: null,
  mapImage: null,
  backgroundImage: null,
  
  /**
   * Carrega e renderiza um mapa
   * @param {string} mapName - Nome do mapa (ex: 'cidade')
   * @returns {Promise<void>}
   */
  async loadMap(mapName) {
    try {
      this.currentMap = mapName;
      
      // Atualizar progresso
      this._updateProgress(0, 'Carregando dados do mapa...');
      
      // Carregar dados JSON do mapa
      this.mapData = await this._loadMapData(mapName);
      this._updateProgress(10, 'Dados carregados');
      
      // Verificar cache
      const cacheKey = CACHE_CONFIG.mapImagePrefix + mapName;
      const cachedImage = localStorage.getItem(cacheKey);
      
      if (cachedImage && CACHE_CONFIG.enabled) {
        // Usar imagem em cache
        this._updateProgress(50, 'Carregando do cache...');
        await this._loadCachedImage(cachedImage);
        this._updateProgress(100, 'Mapa carregado');
      } else {
        // Renderizar mapa
        this._updateProgress(20, 'Montando mapa...');
        const mapImageURL = await this._assembleMapCanvas(this.mapData);
        this._updateProgress(80, 'Salvando no cache...');
        
        // Salvar no cache
        if (CACHE_CONFIG.enabled) {
          try {
            localStorage.setItem(cacheKey, mapImageURL);
          } catch (e) {
            console.warn('Não foi possível salvar no cache:', e);
          }
        }
        
        await this._loadCachedImage(mapImageURL);
        this._updateProgress(100, 'Mapa carregado');
      }
      
      // Renderizar mapa e background
      this._renderMapImage();
      this._renderBackground(mapName);
      
    } catch (error) {
      console.error('Erro ao carregar mapa:', error);
      throw new Error(ERROR_MESSAGES.mapLoad + ': ' + error.message);
    }
  },
  
  /**
   * Carrega dados JSON do mapa
   * @param {string} mapName - Nome do mapa
   * @returns {Promise<Object>}
   * @private
   */
  async _loadMapData(mapName) {
    const dataPath = getMapDataPath(mapName);
    const response = await fetch(dataPath);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar ${dataPath}: ${response.status}`);
    }
    
    const jsonData = await response.json();
    
    // Adaptar estrutura do JSON para o formato esperado
    return this._adaptMapData(jsonData, mapName);
  },
  
  /**
   * Adapta dados do JSON para formato interno
   * @param {Object} jsonData - Dados do JSON original
   * @param {string} mapName - Nome do mapa
   * @returns {Object} Dados adaptados
   * @private
   */
  _adaptMapData(jsonData, mapName) {
    // Criar array de tiles (GRID_SIZE x GRID_SIZE)
    // Tiles são nomeados como: {mapName}{X}_{Y}.png
    const tiles = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        tiles.push({
          imagem: `${mapName}${x}_${y}.png`,
          colide: false,
          trigger: null
        });
      }
    }
    
    // Adicionar colisões
    if (jsonData.colisao && Array.isArray(jsonData.colisao)) {
      jsonData.colisao.forEach(([x, y]) => {
        const index = y * GRID_SIZE + x;
        if (index >= 0 && index < tiles.length) {
          tiles[index].colide = true;
        }
      });
    }
    
    // Adicionar triggers de texto
    if (jsonData.triggers_txt && Array.isArray(jsonData.triggers_txt)) {
      jsonData.triggers_txt.forEach(trigger => {
        const [x, y] = trigger.pos;
        const index = y * GRID_SIZE + x;
        if (index >= 0 && index < tiles.length) {
          tiles[index].trigger = {
            tipo: 'texto',
            texto: trigger.texto,
            direcao: trigger.direcao
          };
        }
      });
    }
    
    // Adicionar triggers de mapa
    if (jsonData.triggers_mp && Array.isArray(jsonData.triggers_mp)) {
      jsonData.triggers_mp.forEach(trigger => {
        const [x, y] = trigger.pos;
        const index = y * GRID_SIZE + x;
        if (index >= 0 && index < tiles.length) {
          tiles[index].trigger = {
            tipo: 'mapa',
            mapa: trigger.texto,
            direcao: trigger.direcao
          };
        }
      });
    }
    
    return {
      cenario: mapName,
      tiles: tiles
    };
  },
  
  /**
   * Monta canvas com todos os tiles e retorna data URL
   * @param {Object} mapData - Dados do mapa
   * @returns {Promise<string>} Data URL da imagem
   * @private
   */
  async _assembleMapCanvas(mapData) {
    // Validar dados do mapa
    if (!mapData || !mapData.tiles || !Array.isArray(mapData.tiles)) {
      throw new Error('Dados do mapa inválidos ou ausentes');
    }
    
    if (mapData.tiles.length < 400) {
      throw new Error(`Mapa tem apenas ${mapData.tiles.length} tiles, esperado 400`);
    }
    
    // Criar canvas
    const canvas = document.createElement('canvas');
    canvas.width = BASE_MAP_SIZE;
    canvas.height = BASE_MAP_SIZE;
    const ctx = canvas.getContext('2d');
    
    // Preparar array de promessas para carregar todos os tiles
    const tilePromises = [];
    const tilePositions = [];
    
    for (let i = 0; i < mapData.tiles.length; i++) {
      const tile = mapData.tiles[i];
      const tilePath = getTilePath(mapData.cenario, tile.imagem);
      
      // Calcular posição no grid
      const x = i % GRID_SIZE;
      const y = Math.floor(i / GRID_SIZE);
      
      tilePositions.push({ x, y });
      tilePromises.push(this._loadImage(tilePath));
    }
    
    this._updateProgress(30, 'Carregando tiles...');
    
    // Carregar todos os tiles em paralelo
    const tileImages = await Promise.all(tilePromises);
    
    this._updateProgress(60, 'Desenhando tiles...');
    
    // Desenhar todos os tiles no canvas
    tileImages.forEach((img, index) => {
      const pos = tilePositions[index];
      ctx.drawImage(
        img,
        pos.x * BASE_TILE_SIZE,
        pos.y * BASE_TILE_SIZE,
        BASE_TILE_SIZE,
        BASE_TILE_SIZE
      );
    });
    
    // Converter canvas para data URL
    return canvas.toDataURL('image/png');
  },
  
  /**
   * Carrega uma imagem
   * @param {string} src - Caminho da imagem
   * @returns {Promise<HTMLImageElement>}
   * @private
   */
  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
      img.src = src;
    });
  },
  
  /**
   * Carrega imagem do cache
   * @param {string} dataURL - Data URL da imagem
   * @returns {Promise<void>}
   * @private
   */
  async _loadCachedImage(dataURL) {
    this.mapImage = await this._loadImage(dataURL);
  },
  
  /**
   * Renderiza a imagem do mapa no DOM
   * @private
   */
  _renderMapImage() {
    const mapContainer = document.getElementById('map-container');
    
    // Remover imagem anterior se existir
    const oldImage = document.getElementById('map-image');
    if (oldImage) {
      oldImage.remove();
    }
    
    // Criar novo elemento de imagem
    const img = document.createElement('img');
    img.id = 'map-image';
    img.src = this.mapImage.src;
    img.style.width = BASE_MAP_SIZE + 'px';
    img.style.height = BASE_MAP_SIZE + 'px';
    
    mapContainer.appendChild(img);
  },
  
  /**
   * Renderiza o background
   * @param {string} mapName - Nome do mapa
   * @private
   */
  _renderBackground(mapName) {
    const backgroundPath = getBackgroundPath(mapName);
    const backgroundDiv = document.getElementById('background');
    
    if (backgroundDiv) {
      backgroundDiv.style.backgroundImage = `url('${backgroundPath}')`;
    }
  },
  
  /**
   * Atualiza a barra de progresso
   * @param {number} percent - Percentual de progresso (0-100)
   * @param {string} text - Texto de status
   * @private
   */
  _updateProgress(percent, text) {
    const progressFill = document.getElementById('progress-fill');
    const loadingText = document.getElementById('loading-text');
    
    if (progressFill) {
      progressFill.style.width = percent + '%';
    }
    
    if (loadingText && text) {
      loadingText.textContent = text;
    }
  },
  
  /**
   * Limpa o cache do mapa
   * @param {string} mapName - Nome do mapa (opcional, limpa todos se omitido)
   */
  clearCache(mapName = null) {
    if (mapName) {
      const cacheKey = CACHE_CONFIG.mapImagePrefix + mapName;
      localStorage.removeItem(cacheKey);
    } else {
      // Limpar todos os caches de mapas
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.mapImagePrefix)) {
          localStorage.removeItem(key);
        }
      });
    }
  },
  
  /**
   * Obtém dados do mapa atual
   * @returns {Object|null}
   */
  getMapData() {
    return this.mapData;
  },
  
  /**
   * Obtém nome do mapa atual
   * @returns {string|null}
   */
  getCurrentMapName() {
    return this.currentMap;
  }
};
