class TransitionLogics {
    constructor() {
        this.transitions = [];
        // Get current page name and set the corresponding scenario
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        const scenarioMap = {
            'index': 'pallet-town',
            'lab': 'lab',
            'casa': 'casa',
            'casa2': 'casa2'
        };
        this.currentScenario = scenarioMap[currentPage] || 'pallet-town';
        this.transitionElements = [];
        this.showCollisions = false;
        this.loadTransitions();
        this.setupTransitionHandler();
    }

    loadTransitions() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        let transitionFile='Transitions.json';
        if(isMobile){
            transitionFile='TransitionsMobile.json'
        }

        fetch(transitionFile)
            .then(response => response.json())
            .then(data => {
                this.transitions = data;
                console.log('Loaded transitions:', this.transitions.length);
                // Render triggers initially if debug mode is active
                const debugModeActive = document.querySelector('.collision-box') !== null;
                if (debugModeActive) {
                    this.renderTransitionTriggers();
                }
            })
            .catch(error => {
                console.error('Error loading transitions:', error);
            });
    }

    checkTransition(position, direction) {
        // Convert arrow keys to corresponding direction
        const directionMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        const normalizedDirection = directionMap[direction] || direction;

        for (const transition of this.transitions) {
            if (transition.scenario === this.currentScenario) {
                const trigger = transition.trigger;
                
                const inTriggerArea = position.x >= trigger.x - trigger.largura / 2 &&
                                    position.x <= trigger.x + trigger.largura / 2 &&
                                    position.y >= trigger.y - trigger.altura / 2 &&
                                    position.y <= trigger.y + trigger.altura / 2;

                if (inTriggerArea && normalizedDirection === trigger.pressing) {
                    sessionStorage.setItem('spawnPoint', JSON.stringify(transition.destino.spawn));
                    document.dispatchEvent(new CustomEvent('transitionTriggered', {
                        detail: {
                            newScenario: transition.destino.scenarioDestination,
                            spawnPoint: transition.destino.spawn
                        }
                    }));
                    return transition.destino;
                }
            }
        }
        return null;
    }

    renderTransitionTriggers() {
        this.clearTransitionTriggers();

        let container = document.getElementById('transition-triggers-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'transition-triggers-container';
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

        this.transitions.forEach((transition, index) => {
            if (transition.scenario === this.currentScenario) {
                const trigger = transition.trigger;
                const element = document.createElement('div');
                element.className = 'transition-trigger';
                
                const left = trigger.x - trigger.largura / 2 + 960;
                const top = trigger.y - trigger.altura / 2 + 540;
                
                element.style.position = 'absolute';
                element.style.left = `${left}px`;
                element.style.top = `${top}px`;
                element.style.width = `${trigger.largura}px`;
                element.style.height = `${trigger.altura}px`;
                
                if (this.showCollisions) {
                    element.style.border = '2px solid yellow';
                    element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                    element.innerHTML = `<span style="position:absolute;top:0;left:0;background:rgba(255, 255, 255, 0.24);color:rgb(0, 0, 0);font-size:12px;padding:2px;">To: ${transition.destino.scenarioDestination} (${trigger.pressing})</span>`;
                } else {
                    element.style.border = '0px solid yellow';
                    element.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                    element.innerHTML = '';
                }
                
                container.appendChild(element);
                this.transitionElements.push(element);
            }
        });
    }

    setupTransitionHandler() {
        document.addEventListener('debugModeChanged', (event) => {
            this.showCollisions = event.detail.active;
            if (event.detail.active) {
                this.renderTransitionTriggers();
            } else {
                this.clearTransitionTriggers();
            }
        });

        document.addEventListener('transitionTriggered', (event) => {
            const { newScenario, spawnPoint } = event.detail;
            if (newScenario) {
                window.location.href = `${newScenario}.html`;
            }
        });
    }

    clearTransitionTriggers() {
        this.transitionElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.transitionElements = [];
    }
}