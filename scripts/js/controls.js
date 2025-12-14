/**
 * controls.js
 * Sistema de controles
 * Gerencia entrada de teclado e controles touch mobile
 */

const ControlsSystem = {
  keysPressed: new Set(),
  isMobile: false,
  touchStartTime: 0,
  
  /**
   * Inicializa o sistema de controles
   */
  init() {
    this.isMobile = isMobileDevice();
    
    // Configurar controles de teclado
    this._setupKeyboardControls();
    
    // Configurar controles mobile se necessário
    if (this.isMobile) {
      this._setupMobileControls();
    }
  },
  
  /**
   * Configura controles de teclado
   * @private
   */
  _setupKeyboardControls() {
    // Keydown
    document.addEventListener('keydown', (e) => {
      // Prevenir scroll com setas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      
      // Tecla de debug
      if (e.code === DEBUG_CONFIG.toggleKey) {
        DebugSystem.toggle();
        return;
      }
      
      // Adicionar tecla ao conjunto
      this.keysPressed.add(e.code);
      
      // Processar movimento imediatamente (sem verificar repeat)
      this._processMovement(e.code);
    });
    
    // Keyup
    document.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.code);
    });
  },
  
  /**
   * Processa tecla de movimento
   * @param {string} keyCode - Código da tecla
   * @private
   */
  _processMovement(keyCode) {
    // Mapear tecla para direção
    const direction = KEY_MAPPINGS[keyCode];
    
    if (direction) {
      // Verificar se está em cima de um trigger de MAPA e a direção pressionada ativa ele
      const trigger = TriggerSystem.getTrigger(PlayerSystem.x, PlayerSystem.y);
      if (trigger && trigger.tipo === 'mapa' && trigger.direcao && Array.isArray(trigger.direcao) && trigger.direcao.includes(direction)) {
        // Ativar o trigger de mapa sem mover (transição de cenário)
        TriggerSystem.activateTrigger(PlayerSystem.x, PlayerSystem.y, direction);
        return;
      }
      
      // Tentar mover personagem (triggers de texto não bloqueiam movimento)
      PlayerSystem.move(direction);
    }
  },
  
  /**
   * Configura controles mobile
   * @private
   */
  _setupMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    
    if (!mobileControls) return;
    
    // Exibir controles mobile
    mobileControls.classList.remove('hidden');
    
    // Variável para armazenar o intervalo de movimento contínuo
    this.mobileInterval = null;
    this.currentMobileDirection = null;
    
    // Obter todos os botões
    const buttons = mobileControls.querySelectorAll('.mobile-btn');
    
    buttons.forEach(button => {
      const direction = button.getAttribute('data-direction');
      
      // Touch start - inicia movimento contínuo
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this._startContinuousMovement(direction);
      });
      
      // Touch end - para movimento contínuo
      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this._stopContinuousMovement();
      });
      
      // Touch cancel - para movimento se o touch sair do botão
      button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this._stopContinuousMovement();
      });
      
      // Também suportar mouse para testes
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this._startContinuousMovement(direction);
      });
      
      button.addEventListener('mouseup', (e) => {
        e.preventDefault();
        this._stopContinuousMovement();
      });
      
      button.addEventListener('mouseleave', (e) => {
        this._stopContinuousMovement();
      });
    });
  },
  
  /**
   * Inicia movimento contínuo mobile
   * @param {string} direction - Direção do movimento
   * @private
   */
  _startContinuousMovement(direction) {
    // Para qualquer movimento anterior
    this._stopContinuousMovement();
    
    this.currentMobileDirection = direction;
    
    // Primeiro movimento imediato
    PlayerSystem.move(direction);
    
    // Configurar movimento contínuo
    this.mobileInterval = setInterval(() => {
      if (this.currentMobileDirection) {
        PlayerSystem.move(this.currentMobileDirection);
      }
    }, 100); // Intervalo de repetição
  },
  
  /**
   * Para movimento contínuo mobile
   * @private
   */
  _stopContinuousMovement() {
    if (this.mobileInterval) {
      clearInterval(this.mobileInterval);
      this.mobileInterval = null;
    }
    this.currentMobileDirection = null;
  },
  
  /**
   * Verifica se uma tecla está pressionada
   * @param {string} keyCode - Código da tecla
   * @returns {boolean}
   */
  isKeyPressed(keyCode) {
    return this.keysPressed.has(keyCode);
  },
  
  /**
   * Limpa todas as teclas pressionadas
   */
  clearKeys() {
    this.keysPressed.clear();
  }
};
