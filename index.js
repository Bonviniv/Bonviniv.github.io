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
  
      <a href="assets/cv/Vitor_Barbosa_Full_Stack_Software_Engineer.pdf" download="Vitor_Barbosa_Full_Stack_Software_Engineer">Download CV</a>  |  <a href="https://www.linkedin.com/in/vitorsantosbarbosa/" target="_blank">LinkedIn Profile</a> <br><br>
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
