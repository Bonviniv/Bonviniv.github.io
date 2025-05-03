/**
 * Personagem Class
 * Handles character movement, animation, and sprite switching
 */
class Personagem {
    /**
     * Initialize character
     * @param {string} elementId - DOM element ID for the character
     */
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.x = -15; // Virtual x coordinate (default spawn position)
        this.y = 0; // Virtual y coordinate (default spawn position)
        this.direction = 'down'; // Initial direction
        this.frame = 0; // Animation frame
        this.moving = false; // Is character currently moving
        this.frameCounter = 0; // Counter for frame updates
        this.collisions = []; // Collision boxes
        this.showCollisions = false; // Flag to show collision boxes (default: hidden)
        this.collisionElements = []; // Store collision box elements
        
        // Direction frame maps
        this.directions = {
            down: [0, 1, 2, 3],
            left: [4, 5, 6, 7],
            right: [8, 9, 10, 11],
            up: [12, 13, 14, 15]
        };
        
        // Preload sprites to prevent flickering
        this.preloadSprites();
        
        // Create coordinates display
        this.createCoordinatesDisplay();
        
        // Load collision data
        this.loadCollisions();
        
        // Initialize character position
        this.atualizarDOM();
        
        // Listen for debug mode changes
        document.addEventListener('debugModeChanged', (event) => {
            this.showCollisions = event.detail.active;
            
            
                this.renderCollisionBoxes();
            
        });
         // Add event listener for player position setting
    document.addEventListener('setPlayerPosition', (event) => {
        const { x, y } = event.detail;
        this.setarPosicao(x, y);
    });
    
    }
    
    
    /**
     * Load collision data from JSON
     */
    loadCollisions() {
        // Get current page name without .html extension
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Map pages to their collision files
        let collisionFiles = {
            'index': 'Colisoes.json',
            'lab': 'ColisoesLab.json',
            'casa': 'ColisoesCasa.json',
            'casa2': 'ColisoesCasa2.json'
        };
        if(isMobile){
            // Map pages to their collision files
         collisionFiles = {
            'index': 'ColisoesMobile.json',
            'lab': 'ColisoesMobileLab.json',
            'casa': 'ColisoesMobileCasa.json',
            'casa2': 'ColisoesMobileCasa2.json'
        };
        }

       
    
        // Get the appropriate collision file or default to Colisoes.json
        let collisionFile = collisionFiles[currentPage] || 'Colisoes.json';

        if(isMobile){
            collisionFile = collisionFiles[currentPage] || 'ColisoesMobile.json';
        }
        
        fetch(collisionFile)
            .then(response => response.json())
            .then(data => {
                this.collisions = data.collisions;
                console.log(`Loaded ${this.collisions.length} collision boxes from ${collisionFile}`);
                this.renderCollisionBoxes();
            })
            .catch(error => {
                console.error(`Error loading collision data from ${collisionFile}:`, error);
            });
    }
    
    /**
     * Render collision boxes as visual elements
     */
    renderCollisionBoxes() {            
        const overlayLayer= document.getElementById('cenario-overlay');
        
        // Clear any existing collision elements
        this.clearCollisionBoxes();
        
        // Create a container for collision boxes if it doesn't exist
        let container = document.getElementById('collision-boxes-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'collision-boxes-container';
            container.style.position = 'absolute';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.width = '1920px';
            container.style.height = '1080px';
            container.style.zIndex = '7';
            container.style.pointerEvents = 'none';
            document.getElementById('game-container').appendChild(container);
        }
        
        // Create visual elements for each collision box
        this.collisions.forEach((box, index) => {
            const element = document.createElement('div');
            element.className = 'collision-box';
            
            // Calculate position from center coordinates
            const left = box.x - box.width / 2 + 960; // Convert to screen coordinates
            const top = box.y - box.height / 2 + 540;  // Convert to screen coordinates
            
            // Style the collision box
            element.style.position = 'absolute';
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
            element.style.width = `${box.width}px`;
            element.style.height = `${box.height}px`;
            element.style.border = '2px solid red';
            element.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
            element.style.zIndex = '7';
            overlayLayer.style.zIndex = '7';
            
            // Add label with box index
            element.innerHTML = `<span style="position:absolute;top:0;left:0;background:black;color:white;font-size:12px;padding:2px;">${index}</span>`;
            if(!this.showCollisions) {
                 // Style the collision box
            element.style.position = 'absolute';
            element.style.left = `${left}px`;
            element.style.top = `${top}px`;
            element.style.width = `${box.width}px`;
            element.style.height = `${box.height}px`;
            element.style.border = '0px solid red';
            element.style.backgroundColor = 'rgba(255, 0, 0, 0)';
            element.style.zIndex = '7';
            overlayLayer.style.zIndex = '11';
            // Add label with box index
            element.innerHTML = `<span style="disply=none"></span>`;

            }
            // Add to container and store reference
            container.appendChild(element);
            this.collisionElements.push(element);
        });
    
    // Render player collision box separately
    this.renderPlayerCollisionBox(container);
}

renderPlayerCollisionBox(container) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Default screen dimensions
    const defaultWidth = 1920;
    const defaultHeight = 1080;
    const defaultAspectRatio = defaultWidth / defaultHeight;
    
    // Current screen dimensions and aspect ratio
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    const currentAspectRatio = currentWidth / currentHeight;
    
    // Calculate scale factor for mobile
    const scaleFactor = isMobile ? (currentAspectRatio / defaultAspectRatio-(defaultAspectRatio*0.25)) : 1;
    
    // Check current page and set dimensions accordingly
    const currentPage = window.location.pathname.split('/').pop();
    const charWidth = currentPage === 'casa.html' ? 12 * scaleFactor : 8 * scaleFactor;
    const charHeight = currentPage === 'casa.html' ? 15 * scaleFactor : 10 * scaleFactor;
    
    const hitboxElement = document.createElement('div');
    hitboxElement.className = 'character-hitbox';
    
    const hitboxLeft = this.x - charWidth + 960;
    const hitboxTop = this.y - charHeight + 540;
    
    hitboxElement.style.position = 'absolute';
    hitboxElement.style.left = `${hitboxLeft}px`;
    hitboxElement.style.top = `${hitboxTop}px`;
    hitboxElement.style.width = `${charWidth * 4}px`;
    hitboxElement.style.height = `${charHeight * 4}px`;
    hitboxElement.style.backgroundImage = `url('${this.spriteCache[`tile${this.directions[this.direction][0].toString().padStart(3, '0')}.png`]}')`;
    hitboxElement.style.backgroundSize = 'contain';
    hitboxElement.style.backgroundRepeat = 'no-repeat';
    hitboxElement.style.border = '1px solid rgba(0, 0, 255, 0.5)';
    hitboxElement.style.zIndex = '8';

    if(!this.showCollisions) {
        hitboxElement.style.border = '0px solid rgba(0, 0, 255, 0.5)';

    }
    
    container.appendChild(hitboxElement);
    this.collisionElements.push(hitboxElement);
    
    this.updateHitbox = () => {
       
            hitboxElement.style.left = `${this.x - charWidth + 960}px`;
            hitboxElement.style.top = `${this.y - charHeight + 540}px`;
            
            const spriteIndex = this.directions[this.direction][this.frame].toString().padStart(3, '0');
            hitboxElement.style.backgroundImage = `url('${this.spriteCache[`tile${spriteIndex}.png`]}')`;
        
    };
}


/**
 * Update DOM element position based on virtual coordinates
 */
atualizarDOM() {
    if (!this.element) return;
    
    // Convert from virtual coordinates (0,0 at center) to screen coordinates
    // Always use 1920x1080 as the reference size
    const screenX = 960 + this.x; // 960 is half of 1920
    const screenY = 540 + this.y; // 540 is half of 1080
    
    // Position character with absolute positioning
    this.element.style.position = 'absolute';
    this.element.style.left = `${screenX - 16}px`; // Center the sprite horizontally
    this.element.style.top = `${screenY - 16}px`;  // Center the sprite vertically
    
    // Apply scale while preserving position
    this.element.style.transform = 'scale(0.5)';
    this.element.style.transformOrigin = 'center center';
    
    // Update hitbox position if it exists
    if (this.updateHitbox) {
        this.updateHitbox();
    }
}

/**
 * Update coordinates display
 */
updateCoordinatesDisplay() {
    if (this.coordDisplay) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (this.showCollisions) {
            this.coordDisplay.style.display = 'block';
            this.coordDisplay.textContent = `X: ${Math.round(this.x)}, Y: ${Math.round(this.y)} | Sprite: (${Math.round(this.x)},${Math.round(this.y)}) | Screen: ${screenWidth}x${screenHeight}`;
        } else {
            this.coordDisplay.textContent = `X: ${Math.round(this.x)}, Y: ${Math.round(this.y)} | Sprite: (${Math.round(this.x)},${Math.round(this.y)}) | Screen: ${screenWidth}x${screenHeight}`;

           // this.coordDisplay.style.display = 'none';
        }
    }
}
getPosition() {
    return {
        x: Math.round(this.x),
        y: Math.round(this.y)
    };
}
    
    /**
     * Clear all collision box visual elements
     */
    clearCollisionBoxes() {
        // Remove all collision elements
        this.collisionElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.collisionElements = [];
    }
    
    /**
     * Toggle collision box visibility
     */
    toggleCollisionBoxes() {
        this.showCollisions = !this.showCollisions;
        
      
            this.renderCollisionBoxes();
        
    }
    
    /**
     * Check if a position collides with any collision box
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {boolean} - True if collision detected
     */
    checkCollision(x, y) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const currentAspectRatio = window.innerWidth / window.innerHeight;
        const defaultAspectRatio = 1920 / 1080;
        const scaleFactor = isMobile ? (currentAspectRatio / defaultAspectRatio) : 1;
        
        const charWidth = 4 * scaleFactor;
        const charHeight = 4 * scaleFactor;

      
        const leftOffset = isMobile? 0.5: 0.8;
        const rightOffset = isMobile? 2 :  3;
        const topOffset = isMobile ? 1.75 : 1;
        const bottomOffset = isMobile ? 3 : 4;


        
        const charLeft = x + charWidth * leftOffset;
        const charRight = x + charWidth * rightOffset;
        const charTop = y + charHeight * topOffset;
        const charBottom = y + charHeight * bottomOffset;
        
        for (const box of this.collisions) {
            // Calculate box boundaries from center point
            const boxLeft = box.x - (box.width / 2);
            const boxRight = box.x + (box.width / 2);
            const boxTop = box.y - (box.height / 2);
            const boxBottom = box.y + (box.height / 2);
            
            // Add a small buffer for more consistent detection
            const buffer = 1;
            
            // Check for intersection with buffer
            if (charRight + buffer > boxLeft && 
                charLeft - buffer < boxRight && 
                charBottom + buffer > boxTop && 
                charTop - buffer < boxBottom) {
                console.log(`Collision detected at (${x}, ${y}) with box at (${box.x}, ${box.y})`);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Preload all sprite images
     */
    preloadSprites() {
        this.spriteCache = {};
        const spritePromises = [];

        // Preload all direction sprites
        for (const direction in this.directions) {
            const frames = this.directions[direction];
            for (const frame of frames) {
                const spriteIndex = frame.toString().padStart(3, '0');
                const spriteKey = `sprite_tile${spriteIndex}`;
                
                // Check if sprite is already in localStorage
                const cachedSprite = localStorage.getItem(spriteKey);
                if (cachedSprite) {
                    this.spriteCache[`tile${spriteIndex}.png`] = cachedSprite;
                } else {
                    // Load and cache new sprite
                    const promise = new Promise((resolve) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            const dataUrl = canvas.toDataURL('image/png');
                            localStorage.setItem(spriteKey, dataUrl);
                            this.spriteCache[`tile${spriteIndex}.png`] = dataUrl;
                            resolve();
                        };
                        img.src = `assets/sprites/tile${spriteIndex}.png`;
                    });
                    spritePromises.push(promise);
                }
            }
        }
        return Promise.all(spritePromises);
    }

    renderPlayerCollisionBox(container) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Default screen dimensions
        const defaultWidth = 1920;
        const defaultHeight = 1080;
        const defaultAspectRatio = defaultWidth / defaultHeight;
        
        // Current screen dimensions and aspect ratio
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
        const currentAspectRatio = currentWidth / currentHeight;
        
        // Calculate scale factor for mobile
        const scaleFactor = isMobile ? (currentAspectRatio / defaultAspectRatio-(defaultAspectRatio*0.25)) : 1;
        
        // Check current page and set dimensions accordingly
        const currentPage = window.location.pathname.split('/').pop();
        const charWidth = currentPage === 'casa.html' ? 12 * scaleFactor : 8 * scaleFactor;
        const charHeight = currentPage === 'casa.html' ? 15 * scaleFactor : 10 * scaleFactor;
        
        const hitboxElement = document.createElement('div');
        hitboxElement.className = 'character-hitbox';
        
        const hitboxLeft = this.x - charWidth + 960;
        const hitboxTop = this.y - charHeight + 540;
        
        hitboxElement.style.position = 'absolute';
        hitboxElement.style.left = `${hitboxLeft}px`;
        hitboxElement.style.top = `${hitboxTop}px`;
        hitboxElement.style.width = `${charWidth * 4}px`;
        hitboxElement.style.height = `${charHeight * 4}px`;
        hitboxElement.style.backgroundImage = `url('assets/sprites/tile${this.directions[this.direction][0].toString().padStart(3, '0')}.png')`;
        hitboxElement.style.backgroundSize = 'contain';
        hitboxElement.style.backgroundRepeat = 'no-repeat';
        hitboxElement.style.border = '1px solid rgba(0, 0, 255, 0.5)';
        hitboxElement.style.zIndex = '8';
    
        if(!this.showCollisions) {
            hitboxElement.style.border = '0px solid rgba(0, 0, 255, 0.5)';
    
        }
        
        container.appendChild(hitboxElement);
        this.collisionElements.push(hitboxElement);
        
        this.updateHitbox = () => {
            hitboxElement.style.left = `${this.x - charWidth + 960}px`;
            hitboxElement.style.top = `${this.y - charHeight + 540}px`;
            
            const spriteIndex = this.directions[this.direction][this.frame].toString().padStart(3, '0');
            hitboxElement.style.backgroundImage = `url('${this.spriteCache[`tile${spriteIndex}.png`]}')`;
        };
    }
    
    /**
     * Create coordinates display element
     */
    createCoordinatesDisplay() {
        this.coordDisplay = document.createElement('div');
        this.coordDisplay.id = 'coordinates-display';
        this.coordDisplay.style.position = 'fixed';
        this.coordDisplay.style.top = '10px';
        this.coordDisplay.style.left = '10px';
        this.coordDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.coordDisplay.style.color = 'white';
        this.coordDisplay.style.padding = '5px 10px';
        this.coordDisplay.style.borderRadius = '5px';
        this.coordDisplay.style.fontFamily = 'monospace';
        this.coordDisplay.style.fontSize = '14px';
        this.coordDisplay.style.zIndex = '10';
        document.body.appendChild(this.coordDisplay);
        this.updateCoordinatesDisplay();
    }
    
    /**
     * Update coordinates display
     */

    mover(direction) {
        this.direction = direction;
        this.moving = true;
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const baseSpeed = isMobile ? 0.8 * 1.5 : 1 * 1.5;  // Increased base speed by 1.5x
        const currentPage = window.location.pathname.split('/').pop();
        const speed = currentPage === 'casa.html' ? baseSpeed * 1.5 : baseSpeed;
        
        let nextX = this.x;
        let nextY = this.y;
        
        switch (direction) {
            case 'up':
                nextY -= speed;
                break;
            case 'down':
                nextY += speed;
                break;
            case 'left':
                nextX -= speed;
                break;
            case 'right':
                nextX += speed;
                break;
        }
        
        // Dispatch playerMoved event
        document.dispatchEvent(new CustomEvent('playerMoved', {
            detail: {
                position: this.getPosition(),
                direction: direction
            }
        }));
        
        // Check for collision before moving
        if (!this.checkCollision(nextX, nextY)) {
            // No collision, update position
            this.x = nextX;
            this.y = nextY;
            
            // Increment frame counter
            this.frameCounter++;
            
            // Update animation frame every 4 frames
            if (this.frameCounter >= 4) {
                this.frame = (this.frame + 1) % 4;
                this.frameCounter = 0;
                this.atualizarSprite();
            }
            
            // Update position and coordinates display
            this.atualizarDOM();
            this.updateCoordinatesDisplay();
        } else {
            // Collision detected, only update sprite direction without moving
            this.atualizarSprite();
        }
    }
    
    /**
     * Stop character movement
     */
    parar() {
        this.moving = false;
        this.frame = 0; // Reset to standing frame
        this.frameCounter = 0;
        this.atualizarSprite();
    }
    
    /**
     * Update character sprite based on direction and frame
     */
    atualizarSprite() {
        // Get frame index for current direction
        const frameIndices = this.directions[this.direction];
        const spriteIndex = frameIndices[this.frame];
        
        // Format sprite index with leading zeros (e.g., 000, 001, etc.)
        const spriteIndexFormatted = spriteIndex.toString().padStart(3, '0');
        
        // Set background image
        this.element.style.backgroundImage = `url('assets/sprites/tile${spriteIndexFormatted}.png')`;
        this.element.style.display="none"
    }
    
    /**
     * Set character position directly
     * @param {number} x - Virtual x coordinate
     * @param {number} y - Virtual y coordinate
     */
   
    setarPosicao(x, y) {
        this.x = x;
        this.y = y;
        this.frame = 0; // Reset animation frame
        this.frameCounter = 0;
        this.atualizarDOM();
        this.updateCoordinatesDisplay();
        this.atualizarSprite();
    }
}