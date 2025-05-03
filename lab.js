document.addEventListener('DOMContentLoaded', () => {
    function createLabTextDisplay() {
        const textDisplay = document.createElement('div');
        textDisplay.id = 'lab-text-display';
        document.body.appendChild(textDisplay);
        return textDisplay;
    }



    const labText = `Welcome to the Lab!\n 
      Here you can find information about\n
      my technical skills and projects.\n
      Feel free to explore!\n`;

    const textElement = createLabTextDisplay();
    textElement.innerHTML = labText.replace(/\n/g, '<br>');

    // Initialize transition logic
    const transitionLogics = new TransitionLogics();
 function createImagePopup() {
        const popup = document.createElement('div');
        popup.id = 'image-popup';
        popup.style.display = 'none';
        popup.style.position = 'fixed';
        popup.style.top = '0';
        popup.style.left = '0';
        popup.style.width = '100vw';
        popup.style.height = '100vh';
        popup.style.backgroundColor = '#131213';
        popup.style.zIndex = '1000';
        
        const img = document.createElement('img');
        img.src = 'assets/images/lab/outros/oaks-lab-links .png';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Create clickable areas
        fetch(isMobile() ? 'labAreasMobile.Json' : 'labAreas.Json')
            .then(response => response.json())
            .then(data => {
                data.areas.forEach(area => {
                    const clickArea = document.createElement('div');
                    clickArea.style.position = 'absolute';
                    clickArea.style.left = `${window.innerWidth/2 + area.x - area.width/2}px`;
                    clickArea.style.top = `${window.innerHeight/2 + area.y - area.height/2}px`;
                    clickArea.style.width = `${area.width}px`;
                    clickArea.style.height = `${area.height}px`;
                    clickArea.style.cursor = 'pointer';
                    
                    clickArea.addEventListener('click', () => {
                        if (area.cv) {
                            const link = document.createElement('a');
                            link.href = area.cv;
                            link.download = 'VitorBarbosaCV.pdf';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        } else if (area.link) {
                            window.open(area.link, '_blank');
                        } else if (area.action === 's') {
                            const keyDownEvent = new KeyboardEvent('keydown', {
                                key: 's',
                                code: 'KeyS',
                                bubbles: true
                            });
                            document.dispatchEvent(keyDownEvent);
                            
                            setTimeout(() => {
                                const keyUpEvent = new KeyboardEvent('keyup', {
                                    key: 's',
                                    code: 'KeyS',
                                    bubbles: true
                                });
                                document.dispatchEvent(keyUpEvent);
                            }, 10);
                        }
                    });
                    
                    popup.appendChild(clickArea);
                });
            });
        
        popup.appendChild(img);
        document.body.appendChild(popup);
        return popup;
    }

    // Helper function to detect mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    const imagePopup = createImagePopup();

    // Add keyboard event listener for popup
    // Add these variables
    let currentTrigger = null;
    const triggerArea = {
        normal: { x: 57, y: -13, largura: 47, altura: 18 },
        mobile: { x: 36, y: -1, largura: 30, altura: 15 }
    };

    // Listen for player movement to check trigger area
    document.addEventListener('playerMoved', (event) => {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'lab.html') {
            const { position } = event.detail;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const area = isMobile ? triggerArea.mobile : triggerArea.normal;

            // Check if player is in trigger area
            const inTriggerArea = position.x >= area.x - area.largura / 2 &&
                                position.x <= area.x + area.largura / 2 &&
                                position.y >= area.y - area.altura / 2 &&
                                position.y <= area.y + area.altura / 2;

            currentTrigger = inTriggerArea ? { imagePopup: true } : null;
        }
    });

    // Add event listener for virtual button
    document.getElementById('btn-up').addEventListener('click', () => {
        if (currentTrigger?.imagePopup) {
            imagePopup.style.display = 'block';
        }
    });

    // Modify keyboard event listeners to handle both physical and virtual inputs
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'w' || e.key === 'ArrowUp' || e.target.id === 'btn-up') && currentTrigger?.imagePopup) {
            imagePopup.style.display = 'block';
        }
        if ((e.key === 's' || e.key === 'ArrowDown' || e.target.id === 'btn-down') && imagePopup.style.display === 'block') {
            imagePopup.style.display = 'none';
        }
    });

    // Remove this keyup event listener completely
    /* Remove this block
    document.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 'ArrowUp') {
            imagePopup.style.display = 'none';
        }
    });
    */
    function simulateUpKeyPress() {
        // Simulate key press down
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: 'w',
            code: 'KeyW',
            bubbles: true
        });
        document.dispatchEvent(keyDownEvent);

        // Release key after 10ms
        setTimeout(() => {
            const keyUpEvent = new KeyboardEvent('keyup', {
                key: 'w',
                code: 'KeyW',
                bubbles: true
            });
            document.dispatchEvent(keyUpEvent);
        }, 10);
    }

    // Set initial spawn point for lab if no transition spawn point exists
    const existingSpawnPoint = sessionStorage.getItem('spawnPoint');
    if (!existingSpawnPoint) {
        document.dispatchEvent(new CustomEvent('setPlayerPosition', {
            detail: { x: -10, y: 100 }
        }));
        setTimeout(simulateUpKeyPress, 100); // Slight delay to ensure character is spawned
    }

    // Set player position if coming from another scenario
    const spawnPoint = sessionStorage.getItem('spawnPoint');
    if (spawnPoint) {
        const spawn = JSON.parse(spawnPoint);
        document.dispatchEvent(new CustomEvent('setPlayerPosition', {
            detail: spawn
        }));
        setTimeout(simulateUpKeyPress, 100); // Slight delay to ensure character is spawned
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
});



