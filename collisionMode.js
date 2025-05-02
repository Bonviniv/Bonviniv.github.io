/**
 * Collision Mode Module
 * Handles creation and export of collision rectangles
 */

//linha 232 pra ativar ou desativat o botão <-> this.toggleButton.style.display="none";

class CollisionMode {
    constructor() {
        // DOM elements
        this.collisionLayer = document.getElementById('collision-layer');
        this.toggleButton = document.getElementById('toggle-collision');
        this.exportButton = document.getElementById('export-collisions');
        
        // State variables
        this.active = false;
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.currentRect = null;
        this.collisionRects = [];
        this.debugMode = false;
        this.gridContainer = null;
        
        // Bind methods
        this.toggleMode = this.toggleMode.bind(this);
        this.exportCollisions = this.exportCollisions.bind(this);
        this.startDrawing = this.startDrawing.bind(this);
        this.drawRect = this.drawRect.bind(this);
        this.endDrawing = this.endDrawing.bind(this);
        this.toggleDebugMode = this.toggleDebugMode.bind(this);
        this.createGrid = this.createGrid.bind(this);
        this.removeGrid = this.removeGrid.bind(this);
        
        // Initialize
        this.init();
    }

    init() {
        // Set up event listeners
        this.toggleButton.addEventListener('click', this.toggleMode);
        this.exportButton.addEventListener('click', this.exportCollisions);
        
        this.collisionLayer.addEventListener('mousedown', this.startDrawing);
        this.collisionLayer.addEventListener('mousemove', this.drawRect);
        this.collisionLayer.addEventListener('mouseup', this.endDrawing);
        
        // Add keyboard listener for debug mode (C key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                this.toggleDebugMode();
            }
        });
        
        // Touch support
        this.collisionLayer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.collisionLayer.dispatchEvent(mouseEvent);
        });
        
        this.collisionLayer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.collisionLayer.dispatchEvent(mouseEvent);
        });
        
        this.collisionLayer.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup');
            this.collisionLayer.dispatchEvent(mouseEvent);
        });
        
        // Initially disable collision mode and debug mode
        this.toggleMode(false);
        this.debugMode = false; // Ensure debug mode is off by default
    }
    
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            this.createGrid();
            // Dispatch event to show character and scenario collisions
            const event = new CustomEvent('debugModeChanged', { detail: { active: true } });
            document.dispatchEvent(event);
        } else {
            this.removeGrid();
            // Dispatch event to hide character and scenario collisions
            const event = new CustomEvent('debugModeChanged', { detail: { active: false } });
            document.dispatchEvent(event);
        }
        
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
    }
    
    createGrid() {
        // Remove existing grid if any
        this.removeGrid();
        
        // Create grid container
        this.gridContainer = document.createElement('div');
        this.gridContainer.id = 'debug-grid-container';
        this.gridContainer.style.position = 'absolute';
        this.gridContainer.style.top = '50%';
        this.gridContainer.style.left = '50%';
        this.gridContainer.style.transform = 'translate(-50%, -50%)';
        this.gridContainer.style.width = '1920px';
        this.gridContainer.style.height = '1080px';
        this.gridContainer.style.zIndex = '6';
        this.gridContainer.style.pointerEvents = 'none';
        
        // Add to game container
        document.getElementById('game-container').appendChild(this.gridContainer);
        
        // Create vertical lines (X axis)
        for (let x = -900; x <= 900; x += 100) {
            const virtualX = x;
            const screenX = 960 + virtualX;
            
            const line = document.createElement('div');
            line.className = 'grid-line vertical';
            line.style.position = 'absolute';
            line.style.left = `${screenX}px`;
            line.style.top = '0';
            line.style.width = '1px';
            line.style.height = '100%';
            line.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
            
            // Add label at a more centered position (middle of the screen)
            const label = document.createElement('div');
            label.textContent = virtualX;
            label.style.position = 'absolute';
            label.style.top = '50%'; // Position in the middle vertically
            label.style.left = '50%';
            label.style.transform = 'translate(-50%, -50%)';
            label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            label.style.color = 'white';
            label.style.padding = '2px 5px';
            label.style.borderRadius = '3px';
            label.style.fontSize = '12px';
            
            line.appendChild(label);
            this.gridContainer.appendChild(line);
        }
        
        // Create horizontal lines (Y axis)
        for (let y = -500; y <= 500; y += 100) {
            const virtualY = y;
            const screenY = 540 + virtualY;
            
            const line = document.createElement('div');
            line.className = 'grid-line horizontal';
            line.style.position = 'absolute';
            line.style.left = '0';
            line.style.top = `${screenY}px`;
            line.style.width = '100%';
            line.style.height = '1px';
            line.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
            
            // Add label at a more centered position (middle of the screen)
            const label = document.createElement('div');
            label.textContent = virtualY;
            label.style.position = 'absolute';
            label.style.left = '50%'; // Position in the middle horizontally
            label.style.top = '50%';
            label.style.transform = 'translate(-50%, -50%)';
            label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            label.style.color = 'white';
            label.style.padding = '2px 5px';
            label.style.borderRadius = '3px';
            label.style.fontSize = '12px';
            
            line.appendChild(label);
            this.gridContainer.appendChild(line);
        }
        
        // Add origin marker
        const origin = document.createElement('div');
        origin.className = 'grid-origin';
        origin.style.position = 'absolute';
        origin.style.left = '960px';
        origin.style.top = '540px';
        origin.style.width = '10px';
        origin.style.height = '10px';
        origin.style.backgroundColor = 'red';
        origin.style.borderRadius = '50%';
        origin.style.transform = 'translate(-50%, -50%)';
        
        // Add origin label
        const originLabel = document.createElement('div');
        originLabel.textContent = '(0,0)';
        originLabel.style.position = 'absolute';
        originLabel.style.left = '50%';
        originLabel.style.top = '100%';
        originLabel.style.transform = 'translateX(-50%)';
        originLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        originLabel.style.color = 'white';
        originLabel.style.padding = '2px 5px';
        originLabel.style.borderRadius = '3px';
        originLabel.style.fontSize = '12px';
        originLabel.style.whiteSpace = 'nowrap';
        
        origin.appendChild(originLabel);
        this.gridContainer.appendChild(origin);
    }
    
    removeGrid() {
        if (this.gridContainer) {
            this.gridContainer.remove();
            this.gridContainer = null;
        }
    }
    
    toggleMode(forceState) {
        // If forceState is provided, use it, otherwise toggle
        this.active = forceState !== undefined ? forceState : !this.active;
        
        // Update UI
        this.toggleButton.textContent = `Collision Mode: ${this.active ? 'ON' : 'OFF'}`;
        this.toggleButton.style.backgroundColor = this.active ? '#F44336' : '#4CAF50';
        this.exportButton.style.display = this.active ? 'block' : 'none';
        this.collisionLayer.style.pointerEvents = this.active ? 'auto' : 'none';
        this.toggleButton.style.display="block";
        
        // Dispatch custom event for game to handle
        const event = new CustomEvent('collisionModeChanged', { detail: { active: this.active } });
        document.dispatchEvent(event);
    }
    
    startDrawing(e) {
        if (!this.active) return;
        
        this.isDrawing = true;
        
        // Get mouse position relative to collision layer
        const rect = this.collisionLayer.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        // Create new rectangle element
        this.currentRect = document.createElement('div');
        this.currentRect.className = 'collision-rect';
        this.currentRect.style.position = 'absolute';
        this.currentRect.style.border = '2px solid red';
        this.currentRect.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        this.currentRect.style.left = `${this.startX}px`;
        this.currentRect.style.top = `${this.startY}px`;
        this.currentRect.style.width = '0';
        this.currentRect.style.height = '0';
        
        this.collisionLayer.appendChild(this.currentRect);
    }
    
    drawRect(e) {
        if (!this.isDrawing || !this.active) return;
        
        // Get mouse position relative to collision layer
        const rect = this.collisionLayer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate width and height
        const width = mouseX - this.startX;
        const height = mouseY - this.startY;
        
        // Set rectangle position and size
        if (width < 0) {
            this.currentRect.style.left = `${mouseX}px`;
            this.currentRect.style.width = `${Math.abs(width)}px`;
        } else {
            this.currentRect.style.width = `${width}px`;
        }
        
        if (height < 0) {
            this.currentRect.style.top = `${mouseY}px`;
            this.currentRect.style.height = `${Math.abs(height)}px`;
        } else {
            this.currentRect.style.height = `${height}px`;
        }
    }
    
    endDrawing() {
        if (!this.isDrawing || !this.active) return;
        
        this.isDrawing = false;
        
        // Get final rectangle dimensions
        const left = parseInt(this.currentRect.style.left);
        const top = parseInt(this.currentRect.style.top);
        const width = parseInt(this.currentRect.style.width);
        const height = parseInt(this.currentRect.style.height);
        
        // Only add if rectangle has meaningful size
        if (width > 5 && height > 5) {
            // Convert to virtual coordinates (center-based)
            const centerX = Math.round((left + width / 2) - 960);
            const centerY = Math.round((top + height / 2) - 540);
            
            // Add to collision rectangles array
            const collisionData = {
                x: centerX,
                y: centerY,
                width: Math.round(width),
                height: Math.round(height),
                scenario: 'pallet-town' // Current scenario name
            };
            
            this.collisionRects.push(collisionData);
            
            // Add delete button to rectangle
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'X';
            deleteBtn.style.position = 'absolute';
            deleteBtn.style.top = '0';
            deleteBtn.style.right = '0';
            deleteBtn.style.backgroundColor = 'red';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '50%';
            deleteBtn.style.width = '20px';
            deleteBtn.style.height = '20px';
            deleteBtn.style.lineHeight = '16px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '12px';
            
            // Store reference to the collision data
            const rectIndex = this.collisionRects.length - 1;
            
            // Delete rectangle when button is clicked
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.collisionRects.splice(rectIndex, 1);
                this.currentRect.remove();
            });
            
            this.currentRect.appendChild(deleteBtn);
            
            // Add rectangle info
            const infoDiv = document.createElement('div');
            infoDiv.textContent = `(${centerX}, ${centerY}) ${width}x${height}`;
            infoDiv.style.position = 'absolute';
            infoDiv.style.bottom = '0';
            infoDiv.style.left = '0';
            infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            infoDiv.style.color = 'white';
            infoDiv.style.padding = '2px 5px';
            infoDiv.style.fontSize = '12px';
            
            this.currentRect.appendChild(infoDiv);
        } else {
            // Remove tiny rectangles
            this.currentRect.remove();
        }
        
        // Reset current rectangle
        this.currentRect = null;
    }
    
    exportCollisions() {
        if (this.collisionRects.length === 0) {
            alert('No collision rectangles to export!');
            return;
        }
        
        // Create JSON data
        const jsonData = {
            scenario: 'pallet-town',
            collisions: this.collisionRects
        };
        
        const jsonString = JSON.stringify(jsonData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'collisions.json';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
}

// Initialize collision mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short time to ensure other elements are initialized
    setTimeout(() => {
        const collisionMode = new CollisionMode();
    }, 100);
});