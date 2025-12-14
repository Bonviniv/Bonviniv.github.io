/**
 * audio.js
 * Sistema de áudio para o jogo
 * Gerencia música de fundo com controle de volume e persistência
 */

const AudioSystem = {
  audio: null,
  initialized: false,
  
  /**
   * Inicializa o sistema de áudio
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Criar elemento de áudio
      this.audio = new Audio(AUDIO_CONFIG.musicPath);
      this.audio.loop = true;
      
      // Sempre começar com volume 0
      let volume = 0;
      
      // Garantir que o volume está no range válido
      volume = Math.max(0, Math.min(1, volume));
      this.audio.volume = volume;
      
      // Sempre começar do início
      this.audio.currentTime = 0;
      
      // Salvar volume no sessionStorage
      sessionStorage.setItem('gameVolume', volume.toString());
      
      // Tentar reproduzir automaticamente
      try {
        await this.audio.play();
      } catch (err) {
        // Autoplay bloqueado - esperar interação do usuário
        console.warn('Autoplay bloqueado. Aguardando interação do usuário.');
        this._setupUserInteractionPlay();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
      throw new Error(ERROR_MESSAGES.audioInit);
    }
  },
  
  /**
   * Configura reprodução após interação do usuário
   * @private
   */
  _setupUserInteractionPlay() {
    const playOnInteraction = () => {
      if (this.audio && this.audio.paused) {
        this.audio.play().catch(err => {
          console.error('Erro ao reproduzir áudio:', err);
        });
      }
      // Remover listeners após primeira interação
      document.removeEventListener('click', playOnInteraction);
      document.removeEventListener('keydown', playOnInteraction);
      document.removeEventListener('touchstart', playOnInteraction);
    };
    
    document.addEventListener('click', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);
  },
  
  /**
   * Reproduz a música
   */
  play() {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(err => {
        console.error('Erro ao reproduzir áudio:', err);
      });
    }
  },
  
  /**
   * Pausa a música
   */
  pause() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  },
  
  /**
   * Define o volume
   * @param {number} volume - Volume entre 0 e 1
   */
  setVolume(volume) {
    volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = volume;
      sessionStorage.setItem('gameVolume', volume.toString());
    }
  },
  
  /**
   * Obtém o volume atual
   * @returns {number} Volume entre 0 e 1
   */
  getVolume() {
    return this.audio ? this.audio.volume : AUDIO_CONFIG.initialVolume;
  },
  
  /**
   * Alterna entre reproduzir e pausar
   */
  toggle() {
    if (this.audio) {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  },
  
  /**
   * Verifica se a música está tocando
   * @returns {boolean}
   */
  isPlaying() {
    return this.audio && !this.audio.paused;
  }
};
