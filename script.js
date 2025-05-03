/**
 * Main Script Module
 * Handles game loop, keyboard input, and integration with character
 */
let typingTimeout = null;
let isTyping = false;

document.addEventListener('DOMContentLoaded', () => {
    // Add this near the start of DOMContentLoaded
    // Check if device is mobile and add orientation change listener
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        window.addEventListener('orientationchange', function() {
            location.reload();
        });
    }
});

// Initialize game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add font-face declaration at the start
    // Load texts for current scenario
    console.log("localVolume = ", localStorage.getItem('localVolume'));
    
    loadTexts();
    const fontFace = new FontFace('PokemonFireRed', 'url("fonte/pokemon-firered-leafgreen-font-recreation.ttf")');
    fontFace.load().then(function(loadedFace) {
        document.fonts.add(loadedFace);
    }).catch(function(error) {
        console.error('Font loading failed:', error);
    });
    // Create character instance
    const personagem = new Personagem('personagem');
    
    // Key state tracking
    const keyState = {};
    
    // FPS control
    const FPS = 25;
    const frameInterval = 1000 / FPS;
    let lastFrameTime = 0;
    let frameCount = 0; // Add frame counter for sprite animation
    
    // Collision mode state
    let collisionModeActive = false;
    
    // Audio element
    const bgMusic = document.getElementById('bg-music');
    const volumeControl = document.getElementById('volume');

   
    
    // Initialize audio
    if (bgMusic && volumeControl) {
        const volumeIcon = document.getElementById('volume-icon');
        
        // Set initial volume and update slider background
        volumeControl.value = 0.15;
        bgMusic.volume = 0.15;
        const initialValue = 15;
        volumeControl.style.background = `linear-gradient(to right, #7a7f7f ${initialValue}%, #c9cece ${initialValue}%)`;
        
        // Add click handler for volume icon
        volumeIcon.addEventListener('click', function() {
            if (bgMusic.volume > 0) {
                // Store current volume before muting
                volumeIcon.dataset.previousVolume = volumeControl.value;
                volumeControl.value = 0;
                bgMusic.volume = 0;
                volumeIcon.textContent = '🔇';
                volumeControl.style.background = `linear-gradient(to right, #7a7f7f 0%, #c9cece 0%)`;
                localStorage.setItem('localVolume', '0');
            } else {
                // Restore previous volume or default to 0.15
                let previousVolume = 0;

                if(volumeIcon.dataset.previousVolume){
                    previousVolume= volumeIcon.dataset.previousVolume;

                }else if(localStorage.getItem('localVolume')!= null && localStorage.getItem('localVolume')!= -1){

                    previousVolume= localStorage.getItem('localVolume');

                }else{
                    previousVolume= 0.15;

                }
                
                volumeControl.value = previousVolume;
                bgMusic.volume = previousVolume;
                const value = previousVolume * 100;
                volumeControl.style.background = `linear-gradient(to right, #7a7f7f ${value}%, #c9cece ${value}%)`;
                updateVolumeIcon(previousVolume);
               

                
            }
        });

        if(localStorage.getItem('localVolume') != null && localStorage.getItem('localVolume') != -1){
            const savedVolume = localStorage.getItem('localVolume');
            bgMusic.volume = savedVolume;
            volumeControl.value = savedVolume; // Set the slider position
            console.log("bgMusic.volume = ", bgMusic.volume);
            updateVolumeIcon(bgMusic.volume);
            
            const volSet = bgMusic.volume * 100;
            
            // Update slider background
            volumeControl.style.background = `linear-gradient(to right, #7a7f7f ${volSet}%, #c9cece ${volSet}%)`;
        }

    
        // Helper function to update volume icon
        function updateVolumeIcon(value) {
            if (value == 0) {
                volumeIcon.textContent = '🔇';
            } else if (value <= 0.25) {
                volumeIcon.textContent = '🔈';
            } else if (value <= 0.50) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        }

         // Helper function to update volume icon
         function updateVolumeLocalVariable(value) {
            localStorage.setItem('localVolume', value);

        }


        
        // Play music when page loads
        document.addEventListener('click', function playAudio() {
            bgMusic.play();
           // document.removeEventListener('click', playAudio);
        });
        
        // Update volume and slider when changed
        volumeControl.addEventListener('input', function() {
            bgMusic.volume = this.value;
            const value = this.value * 100;
            
            // Update slider background
            this.style.background = `linear-gradient(to right, #7a7f7f ${value}%, #c9cece ${value}%)`;
            
            console.log("vol = ", this.value);

            updateVolumeLocalVariable(this.value) ;
            console.log("localVolume = ", localStorage.getItem('localVolume'));
            
            // Update volume icon based on level
            if (this.value == 0) {
                volumeIcon.textContent = '🔇';
            } else if (this.value <= 0.25) {
                volumeIcon.textContent = '🔈';
            } else if (this.value <= 0.50) {
                volumeIcon.textContent = '🔉';
            } else {
                volumeIcon.textContent = '🔊';
            }
        });
    }
    
    // Listen for collision mode changes
    document.addEventListener('collisionModeChanged', (e) => {
        collisionModeActive = e.detail.active;
    });
    
    // Keyboard event listeners
    // Add this to your keyboard event listener in script.js
    document.addEventListener('keydown', (e) => {
        keyState[e.key] = true;
        
        // Toggle collision boxes with 'C' key
        if (e.key === 'c' || e.key === 'C') {
            personagem.toggleCollisionBoxes();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keyState[e.key] = false;
    });
    
    // Mobile button event listeners
    const setupMobileButton = (id, direction) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default touch behavior
                keyState[direction] = true;
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                keyState[direction] = false;
            });
            
            // Also support mouse for testing on desktop
            button.addEventListener('mousedown', () => {
                keyState[direction] = true;
            });
            
            button.addEventListener('mouseup', () => {
                keyState[direction] = false;
            });
            
            button.addEventListener('mouseleave', () => {
                keyState[direction] = false;
            });
        }
    };
    
    // Set up mobile buttons
    setupMobileButton('btn-c', 'c');
    const btnC = document.getElementById('btn-c');
    if (btnC) {
        btnC.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // Simulate 'C' key press
            const keyEvent = new KeyboardEvent('keydown', {
                key: 'c',
                code: 'KeyC',
                bubbles: true
            });
            document.dispatchEvent(keyEvent);
            personagem.toggleCollisionBoxes();
        });

        btnC.addEventListener('click', (e) => {
            e.preventDefault();
            // Simulate 'C' key press
            const keyEvent = new KeyboardEvent('keydown', {
                key: 'c',
                code: 'KeyC',
                bubbles: true
            });
            document.dispatchEvent(keyEvent);
            personagem.toggleCollisionBoxes();
        });
    }

    setupMobileButton('btn-up', 'w');
    setupMobileButton('btn-left', 'a');
    setupMobileButton('btn-down', 's');
    setupMobileButton('btn-right', 'd');
    
    // Game loop
    // Add after the existing variables in DOMContentLoaded
    let textData = [];
    let currentTextElement = null;
    let currentTrigger = null;
    
    // Add this function after the setupMobileButton function
    // Remove the FontFace declaration and modify createTextDisplay
    function createTextDisplay() {
        const textDisplay = document.createElement('div');
        textDisplay.id = 'text-display';
        document.body.appendChild(textDisplay);
        return textDisplay;
    }
    
    function checkTextTriggers(position) {
        // Get current page name
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        const scenarioMap = {
            'index': 'pallet-town',
            'lab': 'lab',
            'casa': 'casa',
            'casa2': 'casa2'
        };
        const currentScenario = scenarioMap[currentPage] || 'pallet-town';

        // Check if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
        for (const trigger of textData) {
            if (trigger.scenario === currentScenario) {
                // Select appropriate trigger based on device type
                const triggerArea = isMobile ? trigger.Mobiletrigger : trigger.trigger;
                
                const inTriggerArea = position.x >= triggerArea.x - triggerArea.largura / 2 &&
                                    position.x <= triggerArea.x + triggerArea.largura / 2 &&
                                    position.y >= triggerArea.y - triggerArea.altura / 2 &&
                                    position.y <= triggerArea.y + triggerArea.altura / 2;
    
                if (inTriggerArea && currentTrigger !== trigger) {
                    showText(trigger.texto);
                    currentTrigger = trigger;
                    return;
                } else if (!inTriggerArea && currentTrigger === trigger) {
                    hideText();
                    currentTrigger = null;
                }
            }
        }
    }

    // Add this function to load texts based on current scenario
function loadTexts() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const scenarioMap = {
        'index': 'pallet-town',
        'lab': 'lab',
        'casa': 'casa',
        'casa2': 'casa2'
    };
    const currentScenario = scenarioMap[currentPage] || 'pallet-town';

    fetch('Textos.json')
        .then(response => response.json())
        .then(data => {
            // Filter texts for current scenario only
            textData = data.filter(text => text.scenario === currentScenario);
            console.log(`Loaded ${textData.length} texts for scenario: ${currentScenario}`);
        })
        .catch(error => {
            console.error('Error loading texts:', error);
        });
}

    function typeWriterEffect(element, text, speed = 50) {
        let index = 0;
        element.innerHTML = '';
        isTyping = true;
    
        function type() {
            if (!isTyping) return; // allow clean interruption
    
            const char = text[index];
            element.innerHTML += (char === '\n') ? '<br>' : char;
            index++;
    
            if (index < text.length) {
                typingTimeout = setTimeout(type, speed);
            }
        }
    
        type();
    }
    
    function showText(text) {
        if (!currentTextElement) {
            currentTextElement = createTextDisplay();
        }
    
        // Interrompe digitação anterior
        isTyping = false;
        clearTimeout(typingTimeout);
        typingTimeout = null;
    
        // Garante visibilidade
        currentTextElement.style.opacity = '1';
    
        const formattedText = text.replace(/\n/g, '\n'); // manter \n para o efeito
        typeWriterEffect(currentTextElement, formattedText);
    }
    
    
    function hideText() {
        if (currentTextElement) {
            isTyping = false;
            clearTimeout(typingTimeout);
            typingTimeout = null;
            currentTextElement.style.opacity = '0';
        }
    }
    
    
    // Add after bgMusic initialization
    fetch('Textos.json')
        .then(response => response.json())
        .then(data => {
            textData = data;
            console.log('Loaded text triggers:', textData.length);
        })
        .catch(error => {
            console.error('Error loading text data:', error);
        });
    
    // Modify the gameLoop function to include text trigger checks
    function gameLoop(timestamp) {
        const elapsed = timestamp - lastFrameTime;
        
        if (elapsed > frameInterval) {
            lastFrameTime = timestamp - (elapsed % frameInterval);
            frameCount++;
            
            if (!collisionModeActive) {
                handleInput();
                // Add text trigger check
                checkTextTriggers(personagem.getPosition());
            }
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    // Handle keyboard/button input
    function handleInput() {
        let isMoving = false;
        
        // Check for movement keys
        if (keyState['w'] || keyState['ArrowUp']) {
            personagem.mover('up', frameCount % 3 === 0); // Update sprite every 3 frames
            isMoving = true;
        }
        else if (keyState['s'] || keyState['ArrowDown']) {
            personagem.mover('down', frameCount % 3 === 0);
            isMoving = true;
        }
        else if (keyState['a'] || keyState['ArrowLeft']) {
            personagem.mover('left', frameCount % 3 === 0);
            isMoving = true;
        }
        else if (keyState['d'] || keyState['ArrowRight']) {
            personagem.mover('right', frameCount % 3 === 0);
            isMoving = true;
        }
        
        // If no movement keys are pressed, stop character animation
        if (!isMoving) {
            personagem.parar();
        }
    }
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    console.log('Game initialized');
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

// Call the function when the lab loads
setTimeout(simulateDebugKeyPress, 200);