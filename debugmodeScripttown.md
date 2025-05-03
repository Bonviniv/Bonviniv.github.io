force debug mode:
colocar este codigo na classe da logica da pagina

function simulateDebugKeyPress() {
    // First press
    const keyDownEvent1 = new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        bubbles: true
    });
    document.dispatchEvent(keyDownEvent1);
    
    setTimeout(() => {
        const keyUpEvent1 = new KeyboardEvent('keyup', {
            key: 'c',
            code: 'KeyC',
            bubbles: true
        });
        document.dispatchEvent(keyUpEvent1);

        // Second press after first one completes
        setTimeout(() => {
            const keyDownEvent2 = new KeyboardEvent('keydown', {
                key: 'w',
                code: 'KeyW',
                bubbles: true
            });
            document.dispatchEvent(keyDownEvent2);

            setTimeout(() => {
                const keyUpEvent2 = new KeyboardEvent('keyup', {
                    key: 'w',
                    code: 'KeyW',
                    bubbles: true
                });
                document.dispatchEvent(keyUpEvent2);
            }, 0.1);
        }, 0.1);
    }, 0.1);
}

// Call the function when the lab loads
setTimeout(simulateDebugKeyPress, 200);

-------------------------------------------------------------
botão para fazer caixas de colisão e exportar:

em textsPokemon.css 

/* Collision mode styles */
#collision-controls {
  position: fixed;
  top: 10px;
  right: 10px;
  display: none;  /* Hidden by default */ <-------------------
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}

---------------------------------------------------------------------

show coordinates and screen size 

em personagem.js

 else {
            //this.coordDisplay.textContent = `X: ${Math.round(this.x)}, Y: ${Math.round(this.y)} | Sprite: (${Math.round(this.x)},${Math.round(this.y)}) | Screen: ${screenWidth}x${screenHeight}`;

            this.coordDisplay.style.display = 'none';
        }
