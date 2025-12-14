/**
 * player.js
 * Sistema de personagem
 * Gerencia posição, movimento, animação e sprite do jogador
 */

const PlayerSystem = {
  x: 10,
  y: 10,
  direction: 'DOWN',
  isMoving: false,
  currentFrame: 0,
  spriteElement: null,
  animationInterval: null,
  moveStartTime: 0,
  moveFrom: { x: 10, y: 10 },
  moveTo: { x: 10, y: 10 },
  
  /**
   * Inicializa o sistema de personagem
   * @param {number} startX - Posição X inicial
   * @param {number} startY - Posição Y inicial
   * @param {string} startDirection - Direção inicial
   */
  init(startX = 10, startY = 10, startDirection = 'DOWN') {
    // Definir posição inicial
    this.x = startX;
    this.y = startY;
    this.direction = startDirection;
    this.moveFrom = { x: startX, y: startY };
    this.moveTo = { x: startX, y: startY };
    
    // Criar elemento do sprite
    this._createSpriteElement();
    
    // Posicionar sprite
    this._updateSpritePosition();
    
    // Iniciar animação idle
    this._startAnimation();
  },
  
  /**
   * Cria elemento do sprite no DOM
   * @private
   */
  _createSpriteElement() {
    const mapContainer = document.getElementById('map-container');
    
    // Remover sprite anterior se existir
    const oldSprite = document.getElementById('player-sprite');
    if (oldSprite) {
      oldSprite.remove();
    }
    
    // Criar novo sprite
    this.spriteElement = document.createElement('img');
    this.spriteElement.id = 'player-sprite';
    this.spriteElement.src = getSpritePath(SPRITE_SETS[this.direction][0]);
    
    // Obter escala adicional do mapa atual
    const currentMap = MapRenderer.getCurrentMapName();
    const mapScale = MAP_CONFIG.playerSpriteScale[currentMap] || 1.0;
    
    // Definir tamanho do sprite - 50% maior que o tile * escala do mapa
    const spriteSize = BASE_TILE_SIZE * 1.5 * mapScale;
    this.spriteElement.style.width = spriteSize + 'px';
    this.spriteElement.style.height = spriteSize + 'px';
    this.spriteElement.style.display = 'block';
    
    // Ajustar margem para centralizar o sprite maior no tile
    const offset = (spriteSize - BASE_TILE_SIZE) / 2;
    this.spriteElement.style.marginLeft = -offset + 'px';
    this.spriteElement.style.marginTop = -offset + 'px';
    
    mapContainer.appendChild(this.spriteElement);
  },
  
  /**
   * Inicia animação do sprite
   * @private
   */
  _startAnimation() {
    // Limpar intervalo anterior se existir
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    
    // Animar sprite apenas quando em movimento (ciclo de 4 frames)
    this.animationInterval = setInterval(() => {
      if (this.isMoving) {
        this.currentFrame = (this.currentFrame + 1) % 4;
        this._updateSprite();
      }
    }, 150); // Trocar frame a cada 150ms
  },
  
  /**
   * Para a animação e volta para frame idle
   * @private
   */
  _stopAnimation() {
    this.currentFrame = 0;
    this._updateSprite();
  },
  
  /**
   * Atualiza o sprite do personagem
   * @private
   */
  _updateSprite() {
    if (this.spriteElement) {
      const spriteIndex = SPRITE_SETS[this.direction][this.currentFrame];
      this.spriteElement.src = getSpritePath(spriteIndex);
    }
  },
  
  /**
   * Atualiza a posição visual do sprite
   * @private
   */
  _updateSpritePosition() {
    if (!this.spriteElement) return;
    
    let displayX, displayY;
    
    if (this.isMoving) {
      // Calcular progresso da interpolação
      const elapsed = Date.now() - this.moveStartTime;
      const progress = Math.min(elapsed / GAMEPLAY_CONFIG.moveDuration, 1);
      
      // Interpolar posição
      displayX = this.moveFrom.x + (this.moveTo.x - this.moveFrom.x) * progress;
      displayY = this.moveFrom.y + (this.moveTo.y - this.moveFrom.y) * progress;
      
      // Se movimento completo, atualizar posição final
      if (progress >= 1) {
        this.isMoving = false;
        this.x = this.moveTo.x;
        this.y = this.moveTo.y;
        displayX = this.x;
        displayY = this.y;
        this._stopAnimation();
      }
    } else {
      displayX = this.x;
      displayY = this.y;
    }
    
    // Aplicar posição ao sprite
    const pixelPos = ScaleSystem.gridToPixel(displayX, displayY);
    this.spriteElement.style.left = pixelPos.x + 'px';
    this.spriteElement.style.top = pixelPos.y + 'px';
  },
  
  /**
   * Tenta mover o personagem em uma direção
   * @param {string} direction - Direção do movimento ('UP', 'DOWN', 'LEFT', 'RIGHT')
   * @returns {boolean} True se movimento foi iniciado
   */
  move(direction) {
    // Não permitir novo movimento se já estiver se movendo
    if (this.isMoving) {
      // Apenas atualizar direção se mudou
      if (this.direction !== direction) {
        this.direction = direction;
        this._updateSprite();
      }
      return false;
    }
    
    // Atualizar direção
    this.direction = direction;
    this.currentFrame = 0;
    this._updateSprite();
    
    // Calcular nova posição
    const dir = DIRECTIONS[direction];
    const newX = this.x + dir.dx;
    const newY = this.y + dir.dy;
    
    // Verificar limites do mapa
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      return false;
    }
    
    // Verificar colisão
    if (CollisionSystem.checkCollision(newX, newY)) {
      return false;
    }
    
    // Iniciar movimento
    this.isMoving = true;
    this.moveFrom = { x: this.x, y: this.y };
    this.moveTo = { x: newX, y: newY };
    this.moveStartTime = Date.now();
    
    // Atualizar posição durante movimento
    this._animateMovement();
    
    return true;
  },
  
  /**
   * Anima o movimento do personagem
   * @private
   */
  _animateMovement() {
    const animate = () => {
      if (this.isMoving) {
        this._updateSpritePosition();
        requestAnimationFrame(animate);
      } else {
        // Movimento completo - verificar triggers
        TriggerSystem.checkTrigger(this.x, this.y, this.direction);
        TriggerSystem.checkPlayerLeft(this.x, this.y, this.direction);
      }
    };
    
    requestAnimationFrame(animate);
  },
  
  /**
   * Define a posição do personagem (teleporte)
   * @param {number} x - Nova posição X
   * @param {number} y - Nova posição Y
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.moveFrom = { x, y };
    this.moveTo = { x, y };
    this.isMoving = false;
    this._updateSpritePosition();
  },
  
  /**
   * Obtém a posição atual do personagem
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return { x: this.x, y: this.y };
  },
  
  /**
   * Obtém a direção atual do personagem
   * @returns {string}
   */
  getDirection() {
    return this.direction;
  },
  
  /**
   * Verifica se o personagem está se movendo
   * @returns {boolean}
   */
  getIsMoving() {
    return this.isMoving;
  }
};
