document.addEventListener('DOMContentLoaded', () => {
    function createCasaTextDisplay() {
        const textDisplay = document.createElement('div');
        textDisplay.id = 'casa2-text-display';
        document.body.appendChild(textDisplay);
        return textDisplay;
    }

    const casaText = `Welcome to my house!\n 
      Feel free to look around.\n`;

    const textElement = createCasaTextDisplay();
    textElement.innerHTML = casaText.replace(/\n/g, '<br>');

    // Initialize transition logic
    const transitionLogics = new TransitionLogics();

    function simulateUpKeyPress() {
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: 'w',
            code: 'KeyW',
            bubbles: true
        });
        document.dispatchEvent(keyDownEvent);

        setTimeout(() => {
            const keyUpEvent = new KeyboardEvent('keyup', {
                key: 'w',
                code: 'KeyW',
                bubbles: true
            });
            document.dispatchEvent(keyUpEvent);
        }, 10);
    }

    // Helper function to detect mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Set initial spawn point for casa if no transition spawn point exists
    const existingSpawnPoint = sessionStorage.getItem('spawnPoint');
    if (!existingSpawnPoint) {
        const initialPosition = isMobile() 
        ? { x:110, y: 20 }
        : { x:132, y: 52  };

            
        document.dispatchEvent(new CustomEvent('setPlayerPosition', {
            detail: initialPosition
        }));
        setTimeout(simulateUpKeyPress, 100);
    }

    // Set player position if coming from another scenario
    const spawnPoint = sessionStorage.getItem('spawnPoint');
    if (spawnPoint) {
        const spawn = JSON.parse(spawnPoint);
        document.dispatchEvent(new CustomEvent('setPlayerPosition', {
            detail: spawn
        }));
        setTimeout(simulateUpKeyPress, 100);
        sessionStorage.removeItem('spawnPoint');
    }

    // Listen for player movement and check transitions
    document.addEventListener('playerMoved', (event) => {
        const { position, direction } = event.detail;
        const transition = transitionLogics.checkTransition(position, direction);
        
        if (transition) {
            const transitionEvent = new CustomEvent('transitionTriggered', {
                detail: {
                    newScenario: transition.newScenario,
                    spawnPoint: transition.spawnPoint
                }
            });
            document.dispatchEvent(transitionEvent);
        }
    });

    function simulateDebugKeyPress() {
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

            setTimeout(() => {
                const keyDownEvent2 = new KeyboardEvent('keydown', {
                    key: 'c',
                    code: 'KeyC',
                    bubbles: true
                });
                document.dispatchEvent(keyDownEvent2);

                setTimeout(() => {
                    const keyUpEvent2 = new KeyboardEvent('keyup', {
                        key: 'c',
                        code: 'KeyC',
                        bubbles: true
                    });
                    document.dispatchEvent(keyUpEvent2);
                }, 0.1);
            }, 0.1);
        }, 0.1);
    }

    setTimeout(simulateDebugKeyPress, 200);
});
      

     