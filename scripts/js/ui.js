/**
 * ui.js
 * Sistema de interface do usuário
 * Gerencia elementos da UI (diálogo, volume, loading, erros)
 */

const UISystem = {
  dialogBox: null,
  volumeSlider: null,
  volumeValue: null,
  volumeIcon: null,
  loadingScreen: null,
  errorMessage: null,
  
  /**
   * Inicializa o sistema de UI
   */
  init() {
    // Obter elementos do DOM
    this.dialogBox = document.getElementById('dialog-box');
    this.volumeSlider = document.getElementById('volume-slider');
    this.volumeValue = document.getElementById('volume-value');
    this.volumeIcon = document.getElementById('volume-icon');
    this.loadingScreen = document.getElementById('loading-screen');
    this.errorMessage = document.getElementById('error-message');
    
    // Configurar controle de volume
    this._setupVolumeControl();
  },
  
  /**
   * Configura controle de volume
   * @private
   */
  _setupVolumeControl() {
    if (!this.volumeSlider) return;
    
    // Definir valor inicial do slider (sempre 0)
    this.volumeSlider.value = 0;
    this._updateVolumeDisplay(0);
    
    // Listener para mudanças no slider
    this.volumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      AudioSystem.setVolume(volume);
      this._updateVolumeDisplay(volume);
    });
    
    // Listener para clicar no ícone (mute)
    if (this.volumeIcon) {
      this.volumeIcon.style.cursor = 'pointer';
      this.volumeIcon.addEventListener('click', () => {
        AudioSystem.setVolume(0);
        this.volumeSlider.value = 0;
        this._updateVolumeDisplay(0);
      });
    }
  },
  
  /**
   * Atualiza exibição do volume
   * @param {number} volume - Volume entre 0 e 1
   * @private
   */
  _updateVolumeDisplay(volume) {
    // Atualizar texto do valor
    if (this.volumeValue) {
      this.volumeValue.textContent = Math.round(volume * 100) + '%';
    }
    
    // Atualizar ícone
    if (this.volumeIcon) {
      if (volume === 0) {
        this.volumeIcon.textContent = '🔇';
      } else if (volume < 0.5) {
        this.volumeIcon.textContent = '🔉';
      } else {
        this.volumeIcon.textContent = '🔊';
      }
    }
  },
  
  /**
   * Exibe mensagem de diálogo
   * @param {string} text - Texto a exibir
   */
  showDialog(text) {
    if (!this.dialogBox) return;
    
    this.dialogBox.textContent = text;
    this.dialogBox.classList.remove('hidden');
  },
  
  /**
   * Oculta mensagem de diálogo
   */
  hideDialog() {
    if (!this.dialogBox) return;
    
    this.dialogBox.classList.add('hidden');
  },
  
  /**
   * Verifica se diálogo está visível
   * @returns {boolean}
   */
  isDialogVisible() {
    return this.dialogBox && !this.dialogBox.classList.contains('hidden');
  },
  
  /**
   * Exibe tela de loading
   */
  showLoading() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.remove('hidden');
    }
  },
  
  /**
   * Oculta tela de loading
   */
  hideLoading() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
    }
  },
  
  /**
   * Atualiza progresso de loading
   * @param {number} percent - Percentual de progresso (0-100)
   * @param {string} text - Texto de status (opcional)
   */
  updateLoadingProgress(percent, text = null) {
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
   * Exibe mensagem de erro
   * @param {string} title - Título do erro
   * @param {string} message - Mensagem de erro
   */
  showError(title, message) {
    if (!this.errorMessage) return;
    
    const errorTitle = document.getElementById('error-title');
    const errorText = document.getElementById('error-text');
    
    if (errorTitle) {
      errorTitle.textContent = title;
    }
    
    if (errorText) {
      errorText.textContent = message;
    }
    
    this.errorMessage.classList.add('show');
  },
  
  /**
   * Oculta mensagem de erro
   */
  hideError() {
    if (this.errorMessage) {
      this.errorMessage.classList.remove('show');
    }
  },
  
  /**
   * Exibe mensagem de erro fatal e para o jogo
   * @param {string} message - Mensagem de erro
   */
  fatalError(message) {
    this.hideLoading();
    this.showError('Erro Fatal', message);
    console.error('Erro fatal:', message);
  }
};
