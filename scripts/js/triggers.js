/**
 * triggers.js
 * Sistema de triggers (gatilhos)
 * Gerencia triggers de texto e mudança de mapa
 */

const TriggerSystem = {
  triggerMap: null,
  textTriggerGroups: new Map(), // Mapeia ID do texto -> {activated: boolean, timeout: number|null}
  
  /**
   * Inicializa o sistema de triggers
   * @param {Object} mapData - Dados do mapa
   */
  init(mapData) {
    // Criar mapa de triggers (grid 20x20)
    this.triggerMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    // Limpar grupos de texto anteriores
    this.textTriggerGroups.clear();
    
    // Processar tiles do mapa
    if (mapData && mapData.tiles) {
      mapData.tiles.forEach((tile, index) => {
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        
        // Verificar se tile tem trigger
        if (tile.trigger) {
          this.triggerMap[y][x] = tile.trigger;
          
          // Se for trigger de texto, inicializar grupo
          if (tile.trigger.tipo === 'texto' && tile.trigger.texto) {
            const textId = tile.trigger.texto;
            if (!this.textTriggerGroups.has(textId)) {
              this.textTriggerGroups.set(textId, {
                activated: false,
                timeout: null
              });
            }
          }
        }
      });
    }
  },
  
  /**
   * Ativa trigger manualmente (quando player pressiona tecla)
   * @param {number} x - Coordenada X do grid
   * @param {number} y - Coordenada Y do grid
   * @param {string} direction - Direção pressionada
   */
  activateTrigger(x, y, direction) {
    const trigger = this.getTrigger(x, y);
    if (!trigger) return;
    
    console.log('[TriggerSystem] Ativando trigger:', trigger);
    
    // Executar trigger baseado no tipo
    switch (trigger.tipo) {
      case 'texto':
        this._handleTextTrigger(trigger);
        break;
      case 'mapa':
        this._handleMapTrigger(trigger);
        break;
    }
  },
  
  /**
   * Verifica e ativa trigger em uma posição
   * @param {number} x - Coordenada X do grid
   * @param {number} y - Coordenada Y do grid
   * @param {string} playerDirection - Direção atual do jogador
   */
  checkTrigger(x, y, playerDirection) {
    // Verificar limites
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      return;
    }
    
    // Obter trigger na posição
    const trigger = this.triggerMap[y][x];
    
    if (!trigger) return;
    
    // Verificar se a direção do jogador está nas direções permitidas do trigger
    if (trigger.direcao && Array.isArray(trigger.direcao)) {
      if (!trigger.direcao.includes(playerDirection)) {
        return; // Direção não permitida, não ativar trigger
      }
    }
    
    console.log('[TriggerSystem] Trigger ativado por movimento:', trigger);
    
    // Executar trigger baseado no tipo
    switch (trigger.tipo) {
      case 'texto':
        this._handleTextTrigger(trigger);
        break;
      case 'mapa':
        this._handleMapTrigger(trigger);
        break;
    }
  },
  
  /**
   * Processa trigger de texto
   * @param {Object} trigger - Dados do trigger
   * @private
   */
  _handleTextTrigger(trigger) {
    if (!trigger.texto) return;
    
    const textId = trigger.texto;
    const group = this.textTriggerGroups.get(textId);
    
    if (!group) return;
    
    // Se texto já está ativo, apenas manter visível
    if (group.activated) {
      // Limpar timeout anterior se existir
      if (group.timeout !== null) {
        clearTimeout(group.timeout);
        group.timeout = null;
      }
      return;
    }
    
    // Marcar grupo como ativado
    group.activated = true;
    
    // Exibir texto
    UISystem.showDialog(textId);
  },
  
  /**
   * Processa trigger de mudança de mapa
   * @param {Object} trigger - Dados do trigger
   * @private
   */
  _handleMapTrigger(trigger) {
    console.log('[TriggerSystem] _handleMapTrigger chamado:', trigger);
    
    if (!trigger.mapa) {
      console.log('[TriggerSystem] Trigger sem mapa definido');
      return;
    }
    
    const targetMap = trigger.mapa;
    const currentMap = MapRenderer.getCurrentMapName();
    
    // Verificar se existe spawn específico para esta transição
    const transitionKey = `${currentMap}->${targetMap}`;
    const transitionSpawn = MAP_CONFIG.transitionSpawns[transitionKey];
    
    let spawnX, spawnY;
    
    if (transitionSpawn) {
      // Usar spawn específico da transição
      spawnX = transitionSpawn.x;
      spawnY = transitionSpawn.y;
      console.log('[TriggerSystem] Usando spawn de transição:', transitionKey, spawnX, spawnY);
    } else if (trigger.spawnX !== undefined && trigger.spawnY !== undefined) {
      // Usar spawn definido no trigger
      spawnX = trigger.spawnX;
      spawnY = trigger.spawnY;
    } else {
      // Usar spawn padrão do mapa
      const spawnConfig = MAP_CONFIG.spawnPositions[targetMap] || { x: 10, y: 10, direction: 'DOWN' };
      spawnX = spawnConfig.x;
      spawnY = spawnConfig.y;
    }
    
    // Obter volume atual
    const currentVolume = AudioSystem.getVolume();
    
    console.log('[TriggerSystem] Transição:', currentMap, '->', targetMap, 'spawn:', spawnX, spawnY);
    
    // Gerar URL do novo mapa
    const newURL = generateMapURL(targetMap, currentVolume, spawnX, spawnY);
    console.log('[TriggerSystem] URL gerada:', newURL);
    
    // Navegar para novo mapa
    window.location.href = newURL;
  },
  
  /**
   * Obtém trigger em uma posição
   * @param {number} x - Coordenada X do grid
   * @param {number} y - Coordenada Y do grid
   * @returns {Object|null}
   */
  getTrigger(x, y) {
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      return this.triggerMap[y][x];
    }
    return null;
  },
  
  /**
   * Obtém todos os triggers do mapa
   * @returns {Array<{x: number, y: number, trigger: Object}>}
   */
  getAllTriggers() {
    const triggers = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (this.triggerMap[y][x]) {
          triggers.push({
            x,
            y,
            trigger: this.triggerMap[y][x]
          });
        }
      }
    }
    
    return triggers;
  },
  
  /**
   * Verifica se player saiu de um trigger de texto e oculta
   * @param {number} x - Coordenada X atual
   * @param {number} y - Coordenada Y atual
   * @param {string} playerDirection - Direção atual do jogador
   */
  checkPlayerLeft(x, y, playerDirection) {
    const trigger = this.getTrigger(x, y);
    
    // Verificar se está em um trigger de texto válido (com direção correta)
    const isOnValidTextTrigger = trigger && 
      trigger.tipo === 'texto' && 
      (!trigger.direcao || !Array.isArray(trigger.direcao) || trigger.direcao.includes(playerDirection));
    
    // Se não há trigger de texto válido na posição atual, verificar se precisa ocultar textos
    if (!isOnValidTextTrigger) {
      // Verificar todos os grupos de texto ativos
      this.textTriggerGroups.forEach((group, textId) => {
        if (group.activated && group.timeout === null) {
          // Agendar ocultação do texto após delay
          group.timeout = setTimeout(() => {
            UISystem.hideDialog();
            // Resetar grupo após ocultar
            group.activated = false;
            group.timeout = null;
          }, GAMEPLAY_CONFIG.textDisappearDelay);
        }
      });
    }
  },
  
  /**
   * Limpa todos os triggers
   */
  clear() {
    this.triggerMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    // Limpar timeouts pendentes
    this.textTriggerGroups.forEach(group => {
      if (group.timeout !== null) {
        clearTimeout(group.timeout);
      }
    });
    
    this.textTriggerGroups.clear();
  }
};
