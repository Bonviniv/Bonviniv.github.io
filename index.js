document.addEventListener('DOMContentLoaded', () => {
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
  

    function createIndexTextDisplay() {
        const textDisplay = document.createElement('div');
        textDisplay.id = 'index-text-display';
        document.body.appendChild(textDisplay);
        return textDisplay;
    }

    const welcomeText = `Welcome to my site,\n 
      My name is Vitor Barbosa\n 
      I'm a Computer Engineering Master's student \n
       at ISCTE.\n 
      Hope you enjoy your stay here!\n 
      \n 
  
      <a href="assets/cv/VitorBarbosaCV.pdf" download="VitorBarbosaCV">Download CV</a>  |  <a href="https://www.linkedin.com/in/vitorsantosbarbosa/" target="_blank">LinkedIn Profile</a> <br><br>
      <a href="https://bonviniv.github.io/projects.html" class="game-link">Other Projects</a>`;

    const textElement = createIndexTextDisplay();
    textElement.innerHTML = welcomeText.replace(/\n/g, '<br>');

    // Initialize transition logic
    const transitionLogics = new TransitionLogics();

    // Listen for player movement and check transitions
    document.addEventListener('playerMoved', (event) => {
        const { position, direction } = event.detail;
        const transition = transitionLogics.checkTransition(position, direction);
        
        if (transition) {
            // Trigger transition event
            const transitionEvent = new CustomEvent('transitionTriggered', {
                detail: {
                    newScenario: transition.newScenario,
                    spawnPoint: transition.spawnPoint
                }
            });
            document.dispatchEvent(transitionEvent);
        }
    });

    // Store spawn point in session storage if coming from another scenario
    const spawnPoint = sessionStorage.getItem('spawnPoint');
    if (spawnPoint) {
        const spawn = JSON.parse(spawnPoint);
        // Dispatch event to set player position
        document.dispatchEvent(new CustomEvent('setPlayerPosition', {
            detail: spawn
        }));
        sessionStorage.removeItem('spawnPoint');
    }
});
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