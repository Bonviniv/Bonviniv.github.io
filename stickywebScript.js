/**
 * StickyWeb Board - Sistema de Post-its Interativo
 * Seguindo princípios de modularização, segurança e boas práticas
 */

class StickyWebBoard {
    constructor() {
        this.boardData = this.getDefaultBoardData();
        this.history = [];
        this.historyIndex = -1;
        this.currentEditingPostit = null;
        this.contextMenuTarget = null;
        this.draggedPostit = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDarkMode = false;
        this.zoomLevel = 1;
        this.autoSaveInterval = null;
        this.hasUnsavedChanges = false;
        
        // Firebase properties
        this.auth = null;
        this.db = null;
        this.currentUser = null;
        this.userDocRef = null;
        this.isOnline = navigator.onLine;
        this.pendingSync = false;
        this.syncInProgress = false;
        this.realtimeListener = null;
        
        // Mobile-specific properties
        this.isMobile = this.detectMobile();
        this.touchStart = { x: 0, y: 0 };
        this.lastTap = 0;
        this.tapDelay = 300;
        this.doubleTapDelay = 500;
        this.longPressDelay = 500;
        this.longPressTimer = null;
        this.isDragging = false;
        
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        this.initializeFirebase();
        this.checkAuthentication();
        this.loadBoardData();
        this.setupEventListeners();
        this.renderBoard();
        this.setupKeyboardShortcuts();
        this.startAutoSave();
        this.setupBeforeUnload();
        this.setupNetworkStatus();
        this.updateBoardSize();
    }

    /**
     * Dados padrão do board
     */
    getDefaultBoardData() {
        return {
            board: {
                backgroundColor: "#2d4a3d",
                width: 2000,
                height: 1500,
                showScrollbars: false
            },
            userPreferences: {
                lastFontFamily: "Aptos Corpus",
                lastFontSize: 16,
                lastPostitColor: "#ffeb3b",
                lastTextColor: "#222222",
                lastBold: false,
                lastItalic: false
            },
            postits: []
        };
    }

    /**
     * Detecta se está em dispositivo mobile
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               'ontouchstart' in window || 
               navigator.maxTouchPoints > 0;
    }

    /**
     * Carrega dados do localStorage
     */
    loadBoardData() {
        try {
            const saved = localStorage.getItem('stickyWebBoardData');
            if (saved) {
                this.boardData = { ...this.getDefaultBoardData(), ...JSON.parse(saved) };
            }
            
            // Carrega preferências do modo noturno
            const darkModePreference = localStorage.getItem('stickyWebDarkMode');
            if (darkModePreference === 'true') {
                this.isDarkMode = true;
            }
        } catch (error) {
            console.error('Erro ao carregar dados do board:', error);
            this.boardData = this.getDefaultBoardData();
        }
    }

    /**
     * Salva dados no localStorage e Firebase
     */
    async saveBoardData() {
        if (!this.hasUnsavedChanges) return;
        
        try {
            // Salvar localmente primeiro
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.hasUnsavedChanges = false;
            
            // Salvar no Firebase se disponível
            if (this.isOnline && this.userDocRef) {
                await this.saveToFirebase();
            } else {
                this.pendingSync = true;
            }
        } catch (error) {
            console.error('Erro ao salvar dados do board:', error);
        }
    }

    /**
     * Inicia salvamento automático a cada 60 segundos
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges && !this.currentEditingPostit && !this.syncInProgress) {
                // Só salva se não estiver editando um post-it e não estiver em sync
                console.log('Auto-save: Salvando mudanças...');
                this.syncWithFirebase();
            }
        }, 60000); // 60 segundos para reduzir conflitos
    }

    /**
     * Configura salvamento antes de fechar a página
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                // Salva dados de forma síncrona
                localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
                
                // Tenta salvar no Firebase se possível
                if (this.isOnline && this.userDocRef) {
                    this.syncWithFirebase();
                }
            }
        });
    }

    /**
     * Marca que há mudanças não salvas
     */
    markUnsavedChanges() {
        this.hasUnsavedChanges = true;
    }

    /**
     * Adiciona ação ao histórico para desfazer/refazer
     */
    addToHistory(action) {
        // Remove ações futuras se estivermos no meio do histórico
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(action)));
        this.historyIndex++;
        
        // Limita o histórico a 50 ações
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.markUnsavedChanges();
    }

    /**
     * Configuração de event listeners
     */
    setupEventListeners() {
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const menu = document.getElementById('menu');
        const board = document.getElementById('board');
        
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Save button
        const saveButton = document.getElementById('saveButton');
        saveButton.addEventListener('click', () => {
            this.manualSave();
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });

        // Fecha menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });

        // Configurações do próximo post-it
        document.getElementById('nextFontSize').addEventListener('input', (e) => {
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            this.boardData.userPreferences.lastFontSize = parseInt(e.target.value);
            this.updatePreview();
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        document.getElementById('nextPostitColor').addEventListener('change', (e) => {
            this.boardData.userPreferences.lastPostitColor = e.target.value;
            this.updatePreview();
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        document.getElementById('nextTextColor').addEventListener('change', (e) => {
            this.boardData.userPreferences.lastTextColor = e.target.value;
            this.updatePreview();
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        document.getElementById('nextFontFamily').addEventListener('change', (e) => {
            this.boardData.userPreferences.lastFontFamily = e.target.value;
            this.updatePreview();
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        // Formatação de texto
        document.getElementById('nextBoldBtn').addEventListener('click', () => {
            this.toggleTextFormat('bold', 'next');
            this.updatePreview();
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        document.getElementById('nextItalicBtn').addEventListener('click', () => {
            this.toggleTextFormat('italic', 'next');
            this.updatePreview();
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        // Cor do board
        document.getElementById('boardColor').addEventListener('change', (e) => {
            this.boardData.board.backgroundColor = e.target.value;
            this.updateBoardBackground(e.target.value);
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        // Mostrar scrollbars
        document.getElementById('showScrollbars').addEventListener('change', (e) => {
            this.boardData.board.showScrollbars = e.target.checked;
            this.toggleScrollbars(e.target.checked);
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        });

        // Botões de ação
        document.getElementById('createPostit').addEventListener('click', () => {
            this.createPostit();
        });

        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportJson();
        });

        document.getElementById('importJson').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importJson(e.target.files[0]);
        });

        document.getElementById('undoAction').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redoAction').addEventListener('click', () => {
            this.redo();
        });

        // Logout button
        document.getElementById('logout').addEventListener('click', () => {
            this.logout();
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.postit') && !this.isMobile) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.postit'));
            }
        });

        // Fecha context menu
        document.addEventListener('click', (e) => {
            if (!document.getElementById('contextMenu').contains(e.target) && !e.target.closest('.postit')) {
                this.hideContextMenu();
            }
        });

        // Touch events para fechar context menu em mobile
        if (this.isMobile) {
            document.addEventListener('touchstart', (e) => {
                if (!document.getElementById('contextMenu').contains(e.target) && !e.target.closest('.postit')) {
                    this.hideContextMenu();
                }
            });
        }

        // Board events
        board.addEventListener('click', (e) => {
            if (e.target === board || e.target === document.getElementById('boardContainer')) {
                this.clearEditingMode();
            }
        });

        // Mobile-specific optimizations
        if (this.isMobile) {
            this.setupMobileOptimizations();
        }
    }

    /**
     * Configurações específicas para mobile
     */
    setupMobileOptimizations() {
        // Previne zoom duplo toque
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });

        // Melhora scrolling em iOS
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.postit') && this.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });

        // Orientação
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateBoardSize();
                this.hideContextMenu();
            }, 100);
        });

        // Visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.clearEditingMode();
                this.hideContextMenu();
            }
        });
    }

    /**
     * Configuração de atalhos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.createPostit();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveBoardData();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportJson();
                        break;
                }
            }
        });
    }

    /**
     * Cria um novo post-it
     */
    createPostit() {
        const prefs = this.boardData.userPreferences;
        const newPostit = {
            id: this.generateId(),
            position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
            size: { width: 180, height: 180 },
            color: prefs.lastPostitColor,
            text: "Clique para editar",
            textColor: prefs.lastTextColor,
            font: { 
                family: prefs.lastFontFamily, 
                size: prefs.lastFontSize,
                bold: prefs.lastBold || false,
                italic: prefs.lastItalic || false
            },
            zIndex: this.getMaxZIndex() + 1
        };

        this.addToHistory({
            type: 'create',
            postit: JSON.parse(JSON.stringify(newPostit))
        });

        this.boardData.postits.push(newPostit);
        this.renderPostit(newPostit);
        this.checkBoardExpansion(newPostit.position.x, newPostit.position.y, newPostit.size.width, newPostit.size.height);
        
        // Salva imediatamente no localStorage e Firebase
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
        
        // Força salvamento imediato no Firebase
        if (this.isOnline && this.userDocRef) {
            this.syncWithFirebase();
        }
    }

    /**
     * Gera ID único para post-its
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Obtém o maior zIndex atual
     */
    getMaxZIndex() {
        return Math.max(0, ...this.boardData.postits.map(p => p.zIndex));
    }

    /**
     * Atualiza o background do board com textura
     */
    updateBoardBackground(color) {
        const board = document.getElementById('board');
        board.style.backgroundColor = color;
        board.style.backgroundImage = `
            radial-gradient(circle at 20% 50%, rgba(0,0,0,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 50%, rgba(0,0,0,0.1) 1px, transparent 1px),
            radial-gradient(circle at 40% 20%, rgba(0,0,0,0.08) 1px, transparent 1px),
            radial-gradient(circle at 60% 80%, rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0,0,0,0.05) 1px, transparent 1px)
        `;
        board.style.backgroundSize = `
            60px 60px,
            80px 80px,
            40px 40px,
            70px 70px,
            20px 20px,
            20px 20px
        `;
        board.style.backgroundPosition = `
            0 0,
            10px 10px,
            20px 20px,
            30px 30px,
            0 0,
            0 0
        `;
        board.style.boxShadow = 'inset 0 0 50px rgba(0,0,0,0.2)';
    }

    /**
     * Renderiza o board completo
     */
    renderBoard() {
        const boardContainer = document.getElementById('boardContainer');
        this.updateBoardBackground(this.boardData.board.backgroundColor);
        this.updateBoardSize();
        this.toggleScrollbars(this.boardData.board.showScrollbars);
        
        // Limpa post-its existentes
        boardContainer.querySelectorAll('.postit').forEach(p => p.remove());
        
        // Renderiza todos os post-its
        this.boardData.postits.forEach(postit => {
            this.renderPostit(postit);
        });

        // Atualiza controles do menu
        this.updateMenuControls();
        this.updatePreview();
        
        // Aplica modo noturno se estava salvo
        if (this.isDarkMode) {
            this.applyDarkMode();
        }

        // Otimizações mobile
        if (this.isMobile) {
            this.optimizeMobileBoard();
        }
    }

    /**
     * Otimizações específicas para mobile
     */
    optimizeMobileBoard() {
        const board = document.getElementById('board');
        const boardContainer = document.getElementById('boardContainer');
        
        // Melhora performance em mobile
        board.style.willChange = 'transform';
        boardContainer.style.willChange = 'transform';
        
        // Tamanho mínimo para mobile
        if (this.boardData.board.width < window.innerWidth) {
            this.boardData.board.width = window.innerWidth;
        }
        if (this.boardData.board.height < window.innerHeight) {
            this.boardData.board.height = window.innerHeight;
        }
        
        this.updateBoardSize();
    }

    /**
     * Renderiza um post-it individual
     */
    renderPostit(postit) {
        const boardContainer = document.getElementById('boardContainer');
        const postitElement = document.createElement('div');
        postitElement.className = 'postit';
        postitElement.dataset.id = postit.id;
        postitElement.style.left = postit.position.x + 'px';
        postitElement.style.top = postit.position.y + 'px';
        postitElement.style.width = postit.size.width + 'px';
        postitElement.style.height = postit.size.height + 'px';
        postitElement.style.backgroundColor = postit.color;
        postitElement.style.zIndex = postit.zIndex;

        const textarea = document.createElement('textarea');
        textarea.className = 'postit-content';
        textarea.value = this.sanitizeText(postit.text);
        textarea.style.color = postit.textColor;
        textarea.style.fontFamily = postit.font.family;
        textarea.style.fontSize = postit.font.size + 'px';
        textarea.style.fontWeight = postit.font.bold ? 'bold' : 'normal';
        textarea.style.fontStyle = postit.font.italic ? 'italic' : 'normal';
        textarea.setAttribute('readonly', 'true');

        postitElement.appendChild(textarea);
        boardContainer.appendChild(postitElement);

        this.setupPostitEvents(postitElement, postit);
    }

    /**
     * Sanitiza texto para prevenir XSS
     */
    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Configura eventos de um post-it
     */
    setupPostitEvents(element, postit) {
        const textarea = element.querySelector('.postit-content');
        
        if (this.isMobile) {
            // Touch events para mobile
            this.setupMobilePostitEvents(element, postit, textarea);
        } else {
            // Mouse events para desktop
            this.setupDesktopPostitEvents(element, postit, textarea);
        }

        // Eventos comuns para ambos
        textarea.addEventListener('blur', () => {
            this.savePostitText(postit, textarea.value);
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                textarea.blur();
            }
        });
    }

    /**
     * Configura eventos mobile para post-it
     */
    setupMobilePostitEvents(element, postit, textarea) {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let isLongPress = false;
        let hasMoved = false;

        // Touch start
        element.addEventListener('touchstart', (e) => {
            if (textarea.hasAttribute('readonly')) {
                e.preventDefault();
            }
            
            touchStartTime = Date.now();
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            hasMoved = false;
            isLongPress = false;
            
            // Long press timer for context menu
            this.longPressTimer = setTimeout(() => {
                if (!hasMoved) {
                    isLongPress = true;
                    this.showContextMenu(e, element);
                    navigator.vibrate && navigator.vibrate(50);
                }
            }, this.longPressDelay);
        }, { passive: false });

        // Touch move
        element.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartPos.x);
            const deltaY = Math.abs(touch.clientY - touchStartPos.y);
            
            if (deltaX > 10 || deltaY > 10) {
                hasMoved = true;
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
                
                if (textarea.hasAttribute('readonly')) {
                    this.handleTouchDrag(e, element, postit);
                }
            }
        }, { passive: false });

        // Touch end
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
            
            if (this.isDragging) {
                this.endTouchDrag(e, element, postit);
                return;
            }
            
            if (isLongPress) {
                return;
            }
            
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            if (!hasMoved && touchDuration < this.tapDelay) {
                this.handleTap(e, element, postit, textarea);
            }
        }, { passive: false });
    }

    /**
     * Configura eventos desktop para post-it
     */
    setupDesktopPostitEvents(element, postit, textarea) {
        // Modo de edição
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.enterEditMode(element, postit);
        });

        // Drag and drop
        element.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !textarea.hasAttribute('readonly')) {
                return; // Não inicia drag se estiver editando
            }
            
            this.startDrag(e, element, postit);
        });

        // Context menu
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, element);
        });
    }

    /**
     * Manipula tap em dispositivos mobile
     */
    handleTap(e, element, postit, textarea) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastTap;
        
        if (timeDiff < this.doubleTapDelay) {
            // Double tap - abre context menu
            this.showContextMenu(e, element);
            navigator.vibrate && navigator.vibrate(50);
        } else {
            // Single tap - entra em modo de edição
            this.enterEditMode(element, postit);
        }
        
        this.lastTap = currentTime;
    }

    /**
     * Manipula drag em touch
     */
    handleTouchDrag(e, element, postit) {
        if (!this.isDragging) {
            this.isDragging = true;
            element.classList.add('dragging');
            document.body.classList.add('no-select');
        }
        
        const touch = e.touches[0];
        const board = document.getElementById('board');
        const boardRect = board.getBoundingClientRect();
        
        const x = touch.clientX - boardRect.left - (element.offsetWidth / 2);
        const y = touch.clientY - boardRect.top - (element.offsetHeight / 2);
        
        element.style.left = Math.max(0, x) + 'px';
        element.style.top = Math.max(0, y) + 'px';
        
        // Feedback visual
        this.checkOverlap(element);
    }

    /**
     * Finaliza drag em touch
     */
    endTouchDrag(e, element, postit) {
        this.isDragging = false;
        element.classList.remove('dragging');
        document.body.classList.remove('no-select');
        
        // Atualiza posição no dados
        const oldPosition = { ...postit.position };
        const newX = parseInt(element.style.left);
        const newY = parseInt(element.style.top);
        
        // Só salva se a posição realmente mudou
        if (oldPosition.x !== newX || oldPosition.y !== newY) {
            postit.position.x = newX;
            postit.position.y = newY;
            
            // Verifica se precisa expandir o board
            this.checkBoardExpansion(postit.position.x, postit.position.y, postit.size.width, postit.size.height);
            
            this.addToHistory({
                type: 'move',
                postit: postit,
                oldPosition: oldPosition,
                newPosition: { ...postit.position }
            });
            
            // Salva imediatamente no localStorage e Firebase
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
            
            // Força salvamento imediato no Firebase
            if (this.isOnline && this.userDocRef) {
                this.syncWithFirebase();
            }
        }
        
        this.clearOverlapIndicators();
    }

    /**
     * Entra no modo de edição
     */
    enterEditMode(element, postit) {
        this.clearEditingMode();
        
        element.classList.add('editing');
        const textarea = element.querySelector('.postit-content');
        textarea.removeAttribute('readonly');
        textarea.focus();
        textarea.select();
        
        this.currentEditingPostit = { element, postit };
        
        // Eleva o zIndex
        postit.zIndex = this.getMaxZIndex() + 1;
        element.style.zIndex = postit.zIndex;
    }

    /**
     * Limpa modo de edição
     */
    clearEditingMode() {
        if (this.currentEditingPostit) {
            this.currentEditingPostit.element.classList.remove('editing');
            const textarea = this.currentEditingPostit.element.querySelector('.postit-content');
            textarea.setAttribute('readonly', 'true');
            this.currentEditingPostit = null;
        }
    }

    /**
     * Salva texto do post-it
     */
    savePostitText(postit, newText) {
        const oldText = postit.text;
        if (oldText === newText) return; // Não salva se não mudou
        
        postit.text = newText;
        
        this.addToHistory({
            type: 'edit',
            postit: postit,
            oldText: oldText,
            newText: newText
        });
        
        // Salva apenas no localStorage, Firebase será salvo pelo auto-save
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
    }

    /**
     * Inicia drag do post-it
     */
    startDrag(e, element, postit) {
        e.preventDefault();
        
        this.draggedPostit = { element, postit };
        element.classList.add('dragging');
        
        const rect = element.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));
    }

    /**
     * Manipula drag do post-it
     */
    handleDrag(e) {
        if (!this.draggedPostit) return;
        
        const board = document.getElementById('board');
        const boardRect = board.getBoundingClientRect();
        
        const x = e.clientX - boardRect.left - this.dragOffset.x;
        const y = e.clientY - boardRect.top - this.dragOffset.y;
        
        this.draggedPostit.element.style.left = x + 'px';
        this.draggedPostit.element.style.top = y + 'px';
        
        // Verifica sobreposição
        this.checkOverlap(this.draggedPostit.element);
    }

    /**
     * Finaliza drag do post-it
     */
    endDrag(e) {
        if (!this.draggedPostit) return;
        
        document.removeEventListener('mousemove', this.handleDrag.bind(this));
        document.removeEventListener('mouseup', this.endDrag.bind(this));
        
        const element = this.draggedPostit.element;
        const postit = this.draggedPostit.postit;
        
        element.classList.remove('dragging');
        
        // Atualiza posição no dados
        const oldPosition = { ...postit.position };
        const newX = parseInt(element.style.left);
        const newY = parseInt(element.style.top);
        
        // Só salva se a posição realmente mudou
        if (oldPosition.x !== newX || oldPosition.y !== newY) {
            postit.position.x = newX;
            postit.position.y = newY;
            
            // Verifica se precisa expandir o board
            this.checkBoardExpansion(postit.position.x, postit.position.y, postit.size.width, postit.size.height);
            
            this.addToHistory({
                type: 'move',
                postit: postit,
                oldPosition: oldPosition,
                newPosition: { ...postit.position }
            });
            
            // Salva apenas no localStorage, Firebase será salvo pelo auto-save
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        }
        
        this.clearOverlapIndicators();
        this.draggedPostit = null;
    }

    /**
     * Verifica sobreposição entre post-its
     */
    checkOverlap(draggedElement) {
        const postits = document.querySelectorAll('.postit');
        const draggedRect = draggedElement.getBoundingClientRect();
        
        this.clearOverlapIndicators();
        
        postits.forEach(postit => {
            if (postit === draggedElement) return;
            
            const rect = postit.getBoundingClientRect();
            if (this.isOverlapping(draggedRect, rect)) {
                postit.classList.add('overlapping');
            }
        });
    }

    /**
     * Verifica se dois elementos estão sobrepostos
     */
    isOverlapping(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    /**
     * Limpa indicadores de sobreposição
     */
    clearOverlapIndicators() {
        document.querySelectorAll('.postit.overlapping').forEach(p => {
            p.classList.remove('overlapping');
        });
    }

    /**
     * Mostra menu de contexto
     */
    showContextMenu(e, postitElement) {
        const contextMenu = document.getElementById('contextMenu');
        const postit = this.boardData.postits.find(p => p.id === postitElement.dataset.id);
        
        if (!postit) return;
        
        this.contextMenuTarget = { element: postitElement, postit };
        
        // Preenche valores atuais
        document.getElementById('contextPostitColor').value = postit.color;
        document.getElementById('contextTextColor').value = postit.textColor;
        document.getElementById('contextFontSize').value = postit.font.size;
        document.getElementById('contextFontSizeValue').textContent = postit.font.size + 'px';
        document.getElementById('contextPostitSize').value = postit.size.width;
        document.getElementById('contextPostitSizeValue').textContent = postit.size.width + 'px';
        
        // Formatação
        document.getElementById('contextBoldBtn').classList.toggle('active', postit.font.bold);
        document.getElementById('contextItalicBtn').classList.toggle('active', postit.font.italic);
        
        // Posiciona menu
        if (this.isMobile) {
            // Mobile: centraliza o menu
            contextMenu.style.left = '50%';
            contextMenu.style.top = '50%';
            contextMenu.style.transform = 'translate(-50%, -50%)';
        } else {
            // Desktop: posiciona no cursor
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.style.transform = 'none';
        }
        
        contextMenu.classList.add('active');
        
        // Adiciona overlay para mobile
        if (this.isMobile) {
            this.createContextMenuOverlay();
        }
        
        this.setupContextMenuEvents();
    }

    /**
     * Configura eventos do menu de contexto
     */
    setupContextMenuEvents() {
        if (!this.contextMenuTarget) return;
        
        const { element, postit } = this.contextMenuTarget;
        
        // Cor do post-it
        document.getElementById('contextPostitColor').onchange = (e) => {
            postit.color = e.target.value;
            element.style.backgroundColor = e.target.value;
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        };
        
        // Cor do texto
        document.getElementById('contextTextColor').onchange = (e) => {
            postit.textColor = e.target.value;
            element.querySelector('.postit-content').style.color = e.target.value;
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        };
        
        // Tamanho da fonte
        document.getElementById('contextFontSize').oninput = (e) => {
            const size = parseInt(e.target.value);
            postit.font.size = size;
            element.querySelector('.postit-content').style.fontSize = size + 'px';
            document.getElementById('contextFontSizeValue').textContent = size + 'px';
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        };
        
        // Tamanho do post-it
        document.getElementById('contextPostitSize').oninput = (e) => {
            const size = parseInt(e.target.value);
            postit.size.width = size;
            postit.size.height = size;
            element.style.width = size + 'px';
            element.style.height = size + 'px';
            document.getElementById('contextPostitSizeValue').textContent = size + 'px';
            this.checkBoardExpansion(postit.position.x, postit.position.y, size, size);
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        };
        
        // Formatação
        document.getElementById('contextBoldBtn').onclick = () => {
            this.toggleTextFormat('bold', 'context');
        };
        
        document.getElementById('contextItalicBtn').onclick = () => {
            this.toggleTextFormat('italic', 'context');
        };
        
        // Duplicar post-it
        document.getElementById('duplicatePostit').onclick = () => {
            this.duplicatePostit(postit);
            this.hideContextMenu();
        };
        
        // Deletar post-it
        document.getElementById('deletePostit').onclick = () => {
            this.deletePostit(postit);
            this.hideContextMenu();
        };
    }

    /**
     * Esconde menu de contexto
     */
    hideContextMenu() {
        document.getElementById('contextMenu').classList.remove('active');
        this.contextMenuTarget = null;
        this.removeContextMenuOverlay();
    }

    /**
     * Cria overlay para context menu em mobile
     */
    createContextMenuOverlay() {
        let overlay = document.getElementById('contextMenuOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'contextMenuOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideContextMenu();
                }
            });
        }
    }

    /**
     * Remove overlay do context menu
     */
    removeContextMenuOverlay() {
        const overlay = document.getElementById('contextMenuOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Deleta um post-it
     */
    deletePostit(postit) {
        this.addToHistory({
            type: 'delete',
            postit: JSON.parse(JSON.stringify(postit))
        });
        
        const index = this.boardData.postits.findIndex(p => p.id === postit.id);
        if (index > -1) {
            this.boardData.postits.splice(index, 1);
        }
        
        const element = document.querySelector(`[data-id="${postit.id}"]`);
        if (element) {
            element.remove();
        }
        
        // Salva imediatamente no localStorage e Firebase
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
        
        // Força salvamento imediato no Firebase
        if (this.isOnline && this.userDocRef) {
            this.syncWithFirebase();
        }
    }

    /**
     * Duplica um post-it ao lado do post-it original
     */
    duplicatePostit(originalPostit) {
        // Calcula a posição do novo post-it (primeiro tenta ao lado direito)
        let newX = originalPostit.position.x + originalPostit.size.width + 10;
        let newY = originalPostit.position.y;
        
        // Se não couber na horizontal, coloca embaixo
        const boardWidth = this.boardData.board.width;
        if (newX + originalPostit.size.width > boardWidth) {
            newX = originalPostit.position.x;
            newY = originalPostit.position.y + originalPostit.size.height + 10;
        }
        
        // Cria um novo post-it com as mesmas configurações do original
        const newPostit = {
            id: this.generateId(), // Usa a função generateId existente
            text: originalPostit.text,
            position: {
                x: newX,
                y: newY
            },
            size: {
                width: originalPostit.size.width,
                height: originalPostit.size.height
            },
            color: originalPostit.color,
            textColor: originalPostit.textColor,
            font: {
                family: originalPostit.font.family, // Adiciona family que estava faltando
                size: originalPostit.font.size,
                bold: originalPostit.font.bold,
                italic: originalPostit.font.italic
            },
            zIndex: this.getMaxZIndex() + 1
        };

        // Adiciona ao histórico para desfazer
        this.addToHistory({
            type: 'create',
            postit: JSON.parse(JSON.stringify(newPostit))
        });

        // Adiciona aos dados do board
        this.boardData.postits.push(newPostit);

        // Verifica se precisa expandir o board
        this.checkBoardExpansion(
            newPostit.position.x, 
            newPostit.position.y, 
            newPostit.size.width, 
            newPostit.size.height
        );

        // Cria o elemento visual
        this.renderPostit(newPostit);

        // Salva imediatamente no localStorage e Firebase
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
        
        // Força salvamento imediato no Firebase
        if (this.isOnline && this.userDocRef) {
            this.syncWithFirebase();
        }
    }

    /**
     * Atualiza controles do menu
     */
    updateMenuControls() {
        const prefs = this.boardData.userPreferences;
        
        document.getElementById('nextPostitColor').value = prefs.lastPostitColor;
        document.getElementById('nextTextColor').value = prefs.lastTextColor;
        document.getElementById('nextFontSize').value = prefs.lastFontSize;
        document.getElementById('fontSizeValue').textContent = prefs.lastFontSize + 'px';
        document.getElementById('nextFontFamily').value = prefs.lastFontFamily;
        document.getElementById('boardColor').value = this.boardData.board.backgroundColor;
        document.getElementById('showScrollbars').checked = this.boardData.board.showScrollbars;
        
        // Formatação
        document.getElementById('nextBoldBtn').classList.toggle('active', prefs.lastBold);
        document.getElementById('nextItalicBtn').classList.toggle('active', prefs.lastItalic);
    }

    /**
     * Atualiza o preview do post-it
     */
    updatePreview() {
        const prefs = this.boardData.userPreferences;
        const previewPostit = document.querySelector('.preview-postit');
        const previewContent = document.querySelector('.preview-content');
        
        if (previewPostit && previewContent) {
            previewPostit.style.backgroundColor = prefs.lastPostitColor;
            previewContent.style.color = prefs.lastTextColor;
            previewContent.style.fontFamily = prefs.lastFontFamily;
            previewContent.style.fontSize = Math.max(10, prefs.lastFontSize - 4) + 'px';
            previewContent.style.fontWeight = prefs.lastBold ? 'bold' : 'normal';
            previewContent.style.fontStyle = prefs.lastItalic ? 'italic' : 'normal';
        }
    }

    /**
     * Desfaz última ação
     */
    undo() {
        if (this.historyIndex < 0) return;
        
        const action = this.history[this.historyIndex];
        this.historyIndex--;
        
        switch (action.type) {
            case 'create':
                this.undoCreate(action.postit);
                break;
            case 'delete':
                this.undoDelete(action.postit);
                break;
            case 'edit':
                this.undoEdit(action.postit, action.oldText);
                break;
            case 'move':
                this.undoMove(action.postit, action.oldPosition);
                break;
        }
        
        // Salva apenas no localStorage, Firebase será salvo pelo auto-save
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
    }

    /**
     * Refaz última ação desfeita
     */
    redo() {
        if (this.historyIndex >= this.history.length - 1) return;
        
        this.historyIndex++;
        const action = this.history[this.historyIndex];
        
        switch (action.type) {
            case 'create':
                this.redoCreate(action.postit);
                break;
            case 'delete':
                this.redoDelete(action.postit);
                break;
            case 'edit':
                this.redoEdit(action.postit, action.newText);
                break;
            case 'move':
                this.redoMove(action.postit, action.newPosition);
                break;
        }
        
        // Salva apenas no localStorage, Firebase será salvo pelo auto-save
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
    }

    /**
     * Métodos de undo/redo específicos
     */
    undoCreate(postit) {
        const element = document.querySelector(`[data-id="${postit.id}"]`);
        if (element) element.remove();
        
        const index = this.boardData.postits.findIndex(p => p.id === postit.id);
        if (index > -1) this.boardData.postits.splice(index, 1);
    }

    redoCreate(postit) {
        this.boardData.postits.push(postit);
        this.renderPostit(postit);
    }

    undoDelete(postit) {
        this.boardData.postits.push(postit);
        this.renderPostit(postit);
    }

    redoDelete(postit) {
        this.deletePostit(postit);
    }

    undoEdit(postit, oldText) {
        postit.text = oldText;
        const element = document.querySelector(`[data-id="${postit.id}"]`);
        if (element) {
            element.querySelector('.postit-content').value = oldText;
        }
    }

    redoEdit(postit, newText) {
        postit.text = newText;
        const element = document.querySelector(`[data-id="${postit.id}"]`);
        if (element) {
            element.querySelector('.postit-content').value = newText;
        }
    }

    undoMove(postit, oldPosition) {
        postit.position = oldPosition;
        const element = document.querySelector(`[data-id="${postit.id}"]`);
        if (element) {
            element.style.left = oldPosition.x + 'px';
            element.style.top = oldPosition.y + 'px';
        }
    }

    redoMove(postit, newPosition) {
        postit.position = newPosition;
        const element = document.querySelector(`[data-id="${postit.id}"]`);
        if (element) {
            element.style.left = newPosition.x + 'px';
            element.style.top = newPosition.y + 'px';
        }
    }

    /**
     * Exporta dados para JSON
     */
    exportJson() {
        const dataStr = JSON.stringify(this.boardData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `stickyweb-board-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Importa dados de JSON
     */
    async importJson(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Valida estrutura básica
            if (!data.board || !data.postits || !Array.isArray(data.postits)) {
                throw new Error('Formato de arquivo inválido');
            }
            
            this.boardData = { ...this.getDefaultBoardData(), ...data };
            this.renderBoard();
            this.markUnsavedChanges();
            
            alert('Board importado com sucesso!');
        } catch (error) {
            console.error('Erro ao importar arquivo:', error);
            alert('Erro ao importar arquivo. Verifique o formato.');
        }
    }

    /**
     * Aplica o modo noturno nos elementos da interface
     */
    applyDarkMode() {
        const toggle = document.getElementById('darkModeToggle');
        const header = document.querySelector('.header');
        const menu = document.getElementById('menu');
        const contextMenu = document.getElementById('contextMenu');
        
        if (this.isDarkMode) {
            toggle.classList.add('active');
            header.classList.add('dark-mode');
            menu.classList.add('dark-mode');
            contextMenu.classList.add('dark-mode');
        } else {
            toggle.classList.remove('active');
            header.classList.remove('dark-mode');
            menu.classList.remove('dark-mode');
            contextMenu.classList.remove('dark-mode');
        }
        
        this.updateModeIcon();
    }

    /**
     * Alterna modo escuro
     */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        this.applyDarkMode();
        this.updateModeIcon();
        
        // Salva preferência no localStorage
        localStorage.setItem('stickyWebDarkMode', this.isDarkMode.toString());
        
        // Marca como não salvo para o auto-save cuidar do Firebase
        this.markUnsavedChanges();
    }

    /**
     * Atualiza o ícone do modo noturno/diurno
     */
    updateModeIcon() {
        const modeIcon = document.getElementById('modeIcon');
        if (modeIcon) {
            modeIcon.textContent = this.isDarkMode ? '🌙' : '☀️';
        }
    }

    /**
     * Salvamento manual do board
     */
    async manualSave() {
        const saveButton = document.getElementById('saveButton');
        const saveText = saveButton.querySelector('.save-text');
        
        // Feedback visual
        saveButton.classList.add('saving');
        saveText.textContent = 'Salvando...';
        
        try {
            await this.syncWithFirebase();
            
            // Sucesso
            saveButton.classList.remove('saving');
            saveButton.classList.add('saved');
            saveText.textContent = 'Salvo!';
            
            // Volta ao normal após 2 segundos
            setTimeout(() => {
                saveButton.classList.remove('saved');
                saveText.textContent = 'Salvar';
            }, 2000);
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            
            // Erro
            saveButton.classList.remove('saving');
            saveText.textContent = 'Erro';
            
            // Volta ao normal após 2 segundos
            setTimeout(() => {
                saveText.textContent = 'Salvar';
            }, 2000);
        }
    }

    /**
     * Zoom in
     */
    zoomIn() {
        if (this.zoomLevel < 3) {
            this.zoomLevel += 0.1;
            this.applyZoom();
        }
    }

    /**
     * Zoom out
     */
    zoomOut() {
        if (this.zoomLevel > 0.3) {
            this.zoomLevel -= 0.1;
            this.applyZoom();
        }
    }

    /**
     * Aplica zoom ao board
     */
    applyZoom() {
        const boardContainer = document.getElementById('boardContainer');
        boardContainer.style.transform = `scale(${this.zoomLevel})`;
        boardContainer.style.transformOrigin = 'top left';
        document.getElementById('zoomLevel').textContent = Math.round(this.zoomLevel * 100) + '%';
    }

    /**
     * Atualiza tamanho do board
     */
    updateBoardSize() {
        const boardContainer = document.getElementById('boardContainer');
        boardContainer.style.width = this.boardData.board.width + 'px';
        boardContainer.style.height = this.boardData.board.height + 'px';
    }

    /**
     * Verifica se post-it está próximo das bordas e expande o board
     */
    checkBoardExpansion(x, y, width, height) {
        const margin = 100;
        let needsUpdate = false;
        
        if (x + width + margin > this.boardData.board.width) {
            this.boardData.board.width = x + width + margin;
            needsUpdate = true;
        }
        
        if (y + height + margin > this.boardData.board.height) {
            this.boardData.board.height = y + height + margin;
            needsUpdate = true;
        }
        
        if (needsUpdate) {
            this.updateBoardSize();
            this.markUnsavedChanges();
        }
    }

    /**
     * Alterna formatação de texto
     */
    toggleTextFormat(format, context) {
        const prefs = this.boardData.userPreferences;
        
        if (context === 'next') {
            if (format === 'bold') {
                prefs.lastBold = !prefs.lastBold;
                document.getElementById('nextBoldBtn').classList.toggle('active', prefs.lastBold);
            } else if (format === 'italic') {
                prefs.lastItalic = !prefs.lastItalic;
                document.getElementById('nextItalicBtn').classList.toggle('active', prefs.lastItalic);
            }
            // Não marca mudanças não salvas para preferências
        } else if (context === 'context' && this.contextMenuTarget) {
            const postit = this.contextMenuTarget.postit;
            const element = this.contextMenuTarget.element;
            const textarea = element.querySelector('.postit-content');
            
            if (format === 'bold') {
                postit.font.bold = !postit.font.bold;
                document.getElementById('contextBoldBtn').classList.toggle('active', postit.font.bold);
                textarea.style.fontWeight = postit.font.bold ? 'bold' : 'normal';
            } else if (format === 'italic') {
                postit.font.italic = !postit.font.italic;
                document.getElementById('contextItalicBtn').classList.toggle('active', postit.font.italic);
                textarea.style.fontStyle = postit.font.italic ? 'italic' : 'normal';
            }
            
            // Salva apenas no localStorage, Firebase será salvo pelo auto-save
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.markUnsavedChanges();
        }
    }

    /**
     * Alterna visibilidade das scrollbars
     */
    toggleScrollbars(show) {
        const board = document.getElementById('board');
        if (show) {
            board.classList.add('show-scrollbars');
        } else {
            board.classList.remove('show-scrollbars');
        }
    }

    // ============================================
    // Firebase Integration Methods
    // ============================================

    /**
     * Inicializa o Firebase
     */
    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // Configurar persistência offline
            this.db.enablePersistence().catch(err => {
                console.warn('Persistência offline não disponível:', err);
            });
        } else {
            console.warn('Firebase não carregado. Funcionando em modo offline.');
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    checkAuthentication() {
        if (!this.auth) return;

        this.auth.onAuthStateChanged(user => {
            if (user) {
                this.currentUser = user;
                this.userDocRef = this.db.collection('users').doc(user.uid);
                this.loadInitialDataFromFirebase(); // Carrega dados apenas uma vez
                this.showStatus('Conectado como: ' + user.email);
            } else {
                this.currentUser = null;
                this.userDocRef = null;
                this.showStatus('Trabalhando offline');
                // Só redireciona se não estiver já na página de login
                if (!window.location.pathname.includes('stickyweblogin.html') && 
                    !window.location.pathname.includes('stickyweb.html')) {
                    window.location.href = 'stickyweblogin.html';
                }
            }
        });
    }

    /**
     * Sincroniza dados com Firebase
     */
    async syncWithFirebase() {
        if (!this.userDocRef || this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            // Se há mudanças não salvas, salva no Firebase
            if (this.hasUnsavedChanges) {
                await this.saveToFirebase();
                this.showStatus('Dados salvos na nuvem');
            }
            
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            this.showStatus('Erro na sincronização. Trabalhando offline.');
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Carrega dados iniciais do Firebase (apenas no início)
     */
    async loadInitialDataFromFirebase() {
        if (!this.userDocRef || this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            const doc = await this.userDocRef.get();
            
            if (doc.exists) {
                const userData = doc.data();
                if (userData.boardData) {
                    this.boardData = userData.boardData;
                    this.renderBoard();
                    this.applyBoardSettings();
                    this.showStatus('Dados carregados da nuvem');
                }
                
                // Carrega preferência do modo noturno do Firebase
                if (userData.preferences && userData.preferences.darkMode !== undefined) {
                    this.isDarkMode = userData.preferences.darkMode;
                    this.applyDarkMode();
                    localStorage.setItem('stickyWebDarkMode', this.isDarkMode.toString());
                }
            } else {
                // Primeira vez do usuário - criar documento
                await this.saveToFirebase();
            }
            
            console.log('Dados iniciais carregados do Firebase');
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showStatus('Erro ao carregar dados. Usando dados locais.');
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Salva dados no Firebase
     */
    async saveToFirebase() {
        if (!this.userDocRef || !this.currentUser || this.syncInProgress) return;
        
        try {
            const userData = {
                email: this.currentUser.email,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                boardData: this.boardData,
                preferences: {
                    darkMode: this.isDarkMode
                }
            };
            
            await this.userDocRef.set(userData, { merge: true });
            this.hasUnsavedChanges = false;
            this.showStatus('Dados salvos na nuvem');
            
        } catch (error) {
            console.error('Erro ao salvar no Firebase:', error);
            this.showStatus('Erro ao salvar. Dados mantidos localmente.');
        }
    }

    /**
     * Aplica configurações do board carregadas
     */
    applyBoardSettings() {
        // Aplica zoom se estava salvo
        if (this.boardData.userPreferences && this.boardData.userPreferences.zoomLevel) {
            this.zoomLevel = this.boardData.userPreferences.zoomLevel;
            this.applyZoom();
        }
        
        // Atualiza controles do menu
        this.updateMenuControls();
    }

    /**
     * Configura monitoramento de status da rede
     */
    setupNetworkStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showStatus('Conectado à internet');
            if (this.pendingSync && this.hasUnsavedChanges) {
                this.saveToFirebase();
                this.pendingSync = false;
            }
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showStatus('Trabalhando offline');
        });
    }

    /**
     * Mostra status na interface
     */
    showStatus(message) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.classList.add('show');
            
            setTimeout(() => {
                statusElement.classList.remove('show');
            }, 3000);
        } else {
            console.log('Status:', message);
        }
    }

    /**
     * Logout do usuário
     */
    async logout() {
        if (this.auth) {
            try {
                // Limpa o listener em tempo real
                if (this.realtimeListener) {
                    this.realtimeListener();
                    this.realtimeListener = null;
                }
                
                // Limpa o intervalo de auto-save
                if (this.autoSaveInterval) {
                    clearInterval(this.autoSaveInterval);
                    this.autoSaveInterval = null;
                }
                
                await this.auth.signOut();
                window.location.href = 'stickyweblogin.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        }
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new StickyWebBoard();
});
