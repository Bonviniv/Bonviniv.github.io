/**
 * collision.js
 * Sistema de colisão
 * Gerencia detecção de colisões com o cenário
 */

const CollisionSystem = {
  collisionMap: null,
  
  /**
   * Inicializa o sistema de colisão
   * @param {Object} mapData - Dados do mapa
   */
  init(mapData) {
    // Criar mapa de colisão (grid 20x20)
    this.collisionMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    
    // Processar tiles do mapa
    if (mapData && mapData.tiles) {
      mapData.tiles.forEach((tile, index) => {
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        
        // Marcar células com colisão
        if (tile.colide) {
          this.collisionMap[y][x] = true;
        }
      });
    }
  },
  
  /**
   * Verifica se há colisão em uma posição
   * @param {number} x - Coordenada X do grid
   * @param {number} y - Coordenada Y do grid
   * @returns {boolean} True se há colisão
   */
  checkCollision(x, y) {
    // Verificar limites do mapa
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
      return true;
    }
    
    // Verificar mapa de colisão
    return this.collisionMap[y][x];
  },
  
  /**
   * Obtém todas as posições com colisão
   * @returns {Array<{x: number, y: number}>}
   */
  getAllCollisions() {
    const collisions = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (this.collisionMap[y][x]) {
          collisions.push({ x, y });
        }
      }
    }
    
    return collisions;
  },
  
  /**
   * Define colisão em uma posição específica
   * @param {number} x - Coordenada X do grid
   * @param {number} y - Coordenada Y do grid
   * @param {boolean} hasCollision - Se deve ter colisão
   */
  setCollision(x, y, hasCollision) {
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      this.collisionMap[y][x] = hasCollision;
    }
  },
  
  /**
   * Limpa o mapa de colisão
   */
  clear() {
    this.collisionMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  }
};
