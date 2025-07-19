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
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.startAutoSave();
        this.setupBeforeUnload();
        this.setupNetworkStatus();
        
        // Carrega dados locais primeiro (fallback)
        this.loadBoardData();
        
        // Aplica modo noturno se estiver ativado localmente
        if (this.isDarkMode) {
            this.applyDarkMode();
        }
        this.updateModeIcon();
        
        // Renderiza o board com dados locais primeiro
        this.renderBoard();
        this.updateBoardSize();
        
        // Inicia verificação de autenticação (que carregará dados do Firebase)
        this.checkAuthentication();
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
                // Valida e corrige a estrutura dos post-its
                this.validateAndFixPostits();
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
     * Valida e corrige a estrutura dos post-its
     */
    validateAndFixPostits() {
        if (!this.boardData.postits || !Array.isArray(this.boardData.postits)) {
            this.boardData.postits = [];
            return;
        }

        this.boardData.postits.forEach(postit => {
            // Garantir que font existe e tem todas as propriedades
            if (!postit.font || typeof postit.font !== 'object') {
                postit.font = {
                    family: 'Arial, sans-serif',
                    size: 14,
                    bold: false,
                    italic: false
                };
            } else {
                // Garantir que todas as propriedades existem
                if (!postit.font.family) postit.font.family = 'Arial, sans-serif';
                if (!postit.font.size) postit.font.size = 14;
                if (postit.font.bold === undefined) postit.font.bold = false;
                if (postit.font.italic === undefined) postit.font.italic = false;
            }

            // Garantir outras propriedades essenciais
            if (!postit.id) postit.id = this.generateId();
            if (!postit.text) postit.text = 'Clique para editar';
            if (!postit.color) postit.color = '#ffeb3b';
            if (!postit.textColor) postit.textColor = '#222222';
            if (!postit.position) postit.position = { x: 100, y: 100 };
            if (!postit.size) postit.size = { width: 180, height: 180 };
            if (!postit.zIndex) postit.zIndex = 1;
        });

        console.log('Post-its validados e corrigidos:', this.boardData.postits.length);
    }

    /**
     * Salva dados no localStorage e Firebase
     */
    async saveBoardData() {
        try {
            console.log('Salvando dados do board...', this.boardData);
            
            // Salvar localmente primeiro
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            this.hasUnsavedChanges = false;
            
            // Salvar no Firebase se disponível
            if (this.isOnline && this.userDocRef) {
                await this.saveToFirebase();
            } else {
                this.pendingSync = true;
            }
            
            console.log('Dados salvos com sucesso');
        } catch (error) {
            console.error('Erro ao salvar dados do board:', error);
        }
    }

    /**
     * Inicia salvamento automático a cada 5 segundos
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges && !this.currentEditingPostit && !this.syncInProgress) {
                // Só salva se não estiver editando um post-it e não estiver em sync
                console.log('Auto-save: Sincronizando com Firebase...');
                this.syncWithFirebase();
            }
        }, 5000); // 5 segundos para sincronização mais rápida
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
        const menuOverlay = document.getElementById('menuOverlay');
        const board = document.getElementById('board');
        
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            menu.classList.toggle('active');
            
            if (this.isMobile) {
                menuOverlay.classList.toggle('active');
            }
        });
        
        // Fecha menu ao clicar no overlay (mobile)
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        const modeIcon = document.getElementById('modeIcon');
        
        darkModeToggle.addEventListener('click', () => {
            this.toggleDarkMode();
        });
        
        // Permite clicar no ícone também
        modeIcon.addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Save button
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                console.log('Botão salvar clicado');
                this.manualSave();
            });
        } else {
            console.error('Botão salvar não encontrado');
        }

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomOut();
        });

        // Fecha menu ao clicar fora
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('menu');
            const menuToggle = document.getElementById('menuToggle');
            
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                this.closeMenu();
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
            if (this.isMobile) this.closeMenu();
        });

        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportJson();
            if (this.isMobile) this.closeMenu();
        });

        document.getElementById('importJson').addEventListener('click', () => {
            document.getElementById('importFile').click();
            if (this.isMobile) this.closeMenu();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importJson(e.target.files[0]);
            if (this.isMobile) this.closeMenu();
        });

        document.getElementById('undoAction').addEventListener('click', () => {
            this.undo();
            if (this.isMobile) this.closeMenu();
        });

        document.getElementById('redoAction').addEventListener('click', () => {
            this.redo();
            if (this.isMobile) this.closeMenu();
        });

        // Logout button
        document.getElementById('logout').addEventListener('click', () => {
            this.logout();
            if (this.isMobile) this.closeMenu();
        });

        // Reset defaults button
        document.getElementById('resetDefaults').addEventListener('click', () => {
            this.resetToDefaults();
            if (this.isMobile) this.closeMenu();
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            console.log('Contextmenu event:', {
                target: e.target,
                isPostit: e.target.closest('.postit'),
                isBoard: e.target.closest('.board'),
                isMobile: this.isMobile
            });
            
            if (e.target.closest('.postit') && !this.isMobile) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.postit'));
            } else if (e.target.closest('.board') && !e.target.closest('.postit') && !this.isMobile) {
                // Context menu do board
                console.log('Mostrando contexto menu do board');
                e.preventDefault();
                this.showBoardContextMenu(e);
            }
        });

        // Reset defaults button
        document.getElementById('resetDefaults').addEventListener('click', () => {
            this.resetToDefaults();
            if (this.isMobile) this.closeMenu();
        });

        // Board context menu buttons
        const createPostitBtn = document.getElementById('createPostitAt');
        const resetBoardColorBtn = document.getElementById('resetBoardColor');
        
        if (createPostitBtn) {
            createPostitBtn.addEventListener('click', () => {
                console.log('Botão "Criar Novo Post-it" clicado');
                this.createPostitAtPosition();
                this.hideBoardContextMenu();
            });
        } else {
            console.error('Elemento createPostitAt não encontrado');
        }

        if (resetBoardColorBtn) {
            resetBoardColorBtn.addEventListener('click', () => {
                console.log('Botão "Cor Padrão do Board" clicado');
                this.resetBoardColorToDefault();
                this.hideBoardContextMenu();
            });
        } else {
            console.error('Elemento resetBoardColor não encontrado');
        }

        // Context menu event listeners
        this.setupContextMenuGlobalEvents();

        // Teste de funcionalidades (temporário)
        console.log('Elementos do DOM:', {
            createPostitBtn: !!document.getElementById('createPostitAt'),
            resetBoardColorBtn: !!document.getElementById('resetBoardColor'),
            boardContextMenu: !!document.getElementById('boardContextMenu'),
            saveButton: !!document.getElementById('saveButton')
        });

        // Board events
        board.addEventListener('click', (e) => {
            if (e.target === board || e.target === document.getElementById('boardContainer')) {
                this.clearEditingMode();
            }
        });

        // Mobile-specific optimizations
        if (this.isMobile) {
            this.setupMobileOptimizations();
            this.setupMobileHelpIndicator();
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
                this.closeMenu();
            }, 100);
        });

        // Visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.clearEditingMode();
                this.hideContextMenu();
                this.closeMenu();
            }
        });

        // Fechar menu com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
                this.closeMenu();
            }
        });
    }

    /**
     * Adiciona indicador visual para ajudar no mobile
     */
    setupMobileHelpIndicator() {
        const helpIndicator = document.createElement('div');
        helpIndicator.className = 'mobile-help-indicator';
        helpIndicator.innerHTML = `
            <div class="help-text">
                <i class="fas fa-hand-pointer"></i>
                <span>Duplo toque para menu de contexto</span>
            </div>
        `;
        document.body.appendChild(helpIndicator);

        // Mostra indicador na primeira vez
        setTimeout(() => {
            helpIndicator.style.display = 'block';
            setTimeout(() => {
                helpIndicator.style.opacity = '0';
                setTimeout(() => {
                    helpIndicator.style.display = 'none';
                }, 500);
            }, 3000);
        }, 1000);
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
        console.log('Renderizando board com', this.boardData.postits?.length || 0, 'post-its');
        
        const boardContainer = document.getElementById('boardContainer');
        this.updateBoardBackground(this.boardData.board.backgroundColor);
        this.updateBoardSize();
        this.toggleScrollbars(this.boardData.board.showScrollbars);
        
        // Limpa post-its existentes
        boardContainer.querySelectorAll('.postit').forEach(p => p.remove());
        
        // Renderiza todos os post-its
        if (this.boardData.postits && this.boardData.postits.length > 0) {
            this.boardData.postits.forEach(postit => {
                console.log('Renderizando post-it:', postit.id, postit.text);
                this.renderPostit(postit);
            });
        }

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
        
        console.log('Board renderizado com sucesso');
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
     * Fecha o menu mobile
     */
    closeMenu() {
        const menu = document.getElementById('menu');
        const menuToggle = document.getElementById('menuToggle');
        const menuOverlay = document.getElementById('menuOverlay');
        
        menu.classList.remove('active');
        menuToggle.classList.remove('active');
        
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
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
        
        // Garantir que postit.font existe e tem todas as propriedades necessárias
        if (!postit.font) {
            postit.font = {
                family: 'Arial, sans-serif',
                size: 14,
                bold: false,
                italic: false
            };
        }
        
        // Aplicar estilos da fonte com valores padrão
        textarea.style.fontFamily = postit.font.family || 'Arial, sans-serif';
        textarea.style.fontSize = (postit.font.size || 14) + 'px';
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
        
        if (timeDiff < this.doubleTapDelay && timeDiff > 50) {
            // Double tap - abre context menu
            e.preventDefault();
            this.showContextMenu(e, element);
            navigator.vibrate && navigator.vibrate(50);
            this.lastTap = 0; // Reset para evitar triple tap
        } else {
            // Single tap - entra em modo de edição (com delay para detectar double tap)
            setTimeout(() => {
                if (Date.now() - this.lastTap > this.doubleTapDelay) {
                    this.enterEditMode(element, postit);
                }
            }, this.doubleTapDelay + 50);
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
        
        // Calcula posição considerando scroll do board
        const x = touch.clientX - boardRect.left - (element.offsetWidth / 2) + board.scrollLeft;
        const y = touch.clientY - boardRect.top - (element.offsetHeight / 2) + board.scrollTop;
        
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
        
        const board = document.getElementById('board');
        const boardRect = board.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        
        // Calcula offset considerando scroll do board
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
        
        // Calcula posição considerando scroll do board
        const x = e.clientX - boardRect.left - this.dragOffset.x + board.scrollLeft;
        const y = e.clientY - boardRect.top - this.dragOffset.y + board.scrollTop;
        
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
        
        // Garantir que postit.font existe
        if (!postit.font) {
            postit.font = {
                family: 'Arial, sans-serif',
                size: 14,
                bold: false,
                italic: false
            };
        }
        
        this.contextMenuTarget = { element: postitElement, postit };
        
        // Preenche valores atuais
        document.getElementById('contextPostitColor').value = postit.color;
        document.getElementById('contextTextColor').value = postit.textColor;
        document.getElementById('contextFontSize').value = postit.font.size || 14;
        document.getElementById('contextFontSizeValue').textContent = (postit.font.size || 14) + 'px';
        document.getElementById('contextPostitSize').value = postit.size.width;
        document.getElementById('contextPostitSizeValue').textContent = postit.size.width + 'px';
        
        // Formatação
        document.getElementById('contextBoldBtn').classList.toggle('active', postit.font.bold || false);
        document.getElementById('contextItalicBtn').classList.toggle('active', postit.font.italic || false);
        
        // Posiciona menu
        if (this.isMobile) {
            // Mobile: centraliza o menu
            contextMenu.style.left = '50%';
            contextMenu.style.top = '50%';
            contextMenu.style.transform = 'translate(-50%, -50%)';
        } else {
            // Desktop: posiciona no cursor com verificação de limites
            let menuX = e.pageX;
            let menuY = e.pageY;
            
            // Mostra o menu temporariamente para obter suas dimensões
            contextMenu.style.visibility = 'hidden';
            contextMenu.classList.add('active');
            
            const menuRect = contextMenu.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const scrollX = window.pageXOffset;
            const scrollY = window.pageYOffset;
            
            // Se o menu for maior que a tela, centraliza
            if (menuRect.width > windowWidth * 0.9 || menuRect.height > windowHeight * 0.8) {
                menuX = (windowWidth - menuRect.width) / 2 + scrollX;
                menuY = (windowHeight - menuRect.height) / 2 + scrollY;
            } else {
                // Ajusta X se o menu sair da tela pela direita
                if (menuX + menuRect.width > windowWidth + scrollX) {
                    menuX = e.pageX - menuRect.width;
                }
                
                // Ajusta X se ainda sair da tela pela esquerda
                if (menuX < scrollX) {
                    menuX = scrollX + 10;
                }
                
                // Ajusta Y se o menu sair da tela por baixo
                if (menuY + menuRect.height > windowHeight + scrollY) {
                    menuY = e.pageY - menuRect.height;
                }
                
                // Ajusta Y se ainda sair da tela por cima
                if (menuY < scrollY) {
                    menuY = scrollY + 10;
                }
            }
            
            // Garante que o menu não saia dos limites mínimos
            menuX = Math.max(scrollX + 5, Math.min(menuX, windowWidth + scrollX - menuRect.width - 5));
            menuY = Math.max(scrollY + 5, Math.min(menuY, windowHeight + scrollY - menuRect.height - 5));
            
            // Aplica a posição final
            contextMenu.style.left = menuX + 'px';
            contextMenu.style.top = menuY + 'px';
            contextMenu.style.transform = 'none';
            contextMenu.style.visibility = 'visible';
        }
        
        // Para mobile, adiciona a classe active aqui (para desktop já foi adicionada acima)
        if (this.isMobile) {
            contextMenu.classList.add('active');
        }
        
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
            if (!postit.font) {
                postit.font = { family: 'Arial, sans-serif', size: 14, bold: false, italic: false };
            }
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
        
        // Limpar event listeners anteriores e adicionar novos
        const deleteBtn = document.getElementById('deletePostit');
        const cloneBtn = document.getElementById('clonePostit');
        const cloneEmptyBtn = document.getElementById('clonePostitEmpty');
        
        // Remove listeners antigos
        deleteBtn.replaceWith(deleteBtn.cloneNode(true));
        cloneBtn.replaceWith(cloneBtn.cloneNode(true));
        cloneEmptyBtn.replaceWith(cloneEmptyBtn.cloneNode(true));
        
        // Adiciona novos listeners
        document.getElementById('deletePostit').addEventListener('click', () => {
            this.deletePostit(postit);
            this.hideContextMenu();
        });
        
        document.getElementById('clonePostit').addEventListener('click', () => {
            this.clonePostit(postit, false);
            this.hideContextMenu();
        });
        
        document.getElementById('clonePostitEmpty').addEventListener('click', () => {
            this.clonePostit(postit, true);
            this.hideContextMenu();
        });
        
        // Botão de fechar menu
        const closeBtn = document.getElementById('contextMenuClose');
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            const newCloseBtn = document.getElementById('contextMenuClose');
            newCloseBtn.addEventListener('click', (e) => {
                console.log('Botão de fechar clicado');
                e.preventDefault();
                e.stopPropagation();
                this.hideContextMenu();
            });
            console.log('Event listener do botão de fechar adicionado');
        } else {
            console.error('Botão contextMenuClose não encontrado');
        }
    }

    /**
     * Esconde menu de contexto
     */
    hideContextMenu() {
        console.log('hideContextMenu chamada');
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            console.log('Classes antes:', contextMenu.classList.toString());
            contextMenu.classList.remove('active');
            // Remove qualquer style inline de display que possa estar interferindo
            contextMenu.style.display = '';
            contextMenu.style.visibility = '';
            console.log('Classes depois:', contextMenu.classList.toString());
            console.log('Display style:', window.getComputedStyle(contextMenu).display);
            console.log('Menu de contexto fechado');
        }
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
     * Clona um post-it com as mesmas configurações
     * @param {Object} originalPostit - Post-it original para clonar
     * @param {boolean} isEmpty - Se true, cria post-it vazio; se false, copia o texto
     */
    clonePostit(originalPostit, isEmpty = false) {
        // Calcula a posição do novo post-it (ao lado direito)
        let newX = originalPostit.position.x + originalPostit.size.width + 20;
        let newY = originalPostit.position.y;
        
        // Se não couber na horizontal, coloca embaixo
        const boardWidth = this.boardData.board.width;
        if (newX + originalPostit.size.width > boardWidth) {
            newX = originalPostit.position.x;
            newY = originalPostit.position.y + originalPostit.size.height + 20;
        }
        
        // Cria o novo post-it com as mesmas configurações
        const clonedPostit = {
            id: this.generateId(),
            position: { x: newX, y: newY },
            size: { 
                width: originalPostit.size.width, 
                height: originalPostit.size.height 
            },
            color: originalPostit.color,
            text: isEmpty ? "Clique para editar" : originalPostit.text,
            textColor: originalPostit.textColor,
            font: { 
                family: originalPostit.font?.family || 'Arial, sans-serif', 
                size: originalPostit.font?.size || 14,
                bold: originalPostit.font?.bold || false,
                italic: originalPostit.font?.italic || false
            },
            zIndex: this.getMaxZIndex() + 1
        };

        // Adiciona ao histórico
        this.addToHistory({
            type: 'create',
            postit: JSON.parse(JSON.stringify(clonedPostit))
        });

        // Adiciona ao board e renderiza
        this.boardData.postits.push(clonedPostit);
        this.renderPostit(clonedPostit);
        this.checkBoardExpansion(clonedPostit.position.x, clonedPostit.position.y, clonedPostit.size.width, clonedPostit.size.height);
        
        // Salva imediatamente no localStorage e Firebase
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
        
        // Força salvamento imediato no Firebase
        if (this.isOnline && this.userDocRef) {
            this.syncWithFirebase();
        }
        
        // Mostra mensagem de sucesso
        this.showStatus(`Post-it ${isEmpty ? 'vazio ' : ''}clonado com sucesso!`);
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
                family: originalPostit.font?.family || 'Arial, sans-serif',
                size: originalPostit.font?.size || 14,
                bold: originalPostit.font?.bold || false,
                italic: originalPostit.font?.italic || false
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
            // Usando símbolos que funcionam melhor com filtros CSS
            modeIcon.textContent = this.isDarkMode ? '🌙' : '☀️';
            
            // Aplica filtros para controlar a cor
            if (this.isDarkMode) {
                // Lua branca no modo escuro
                modeIcon.style.filter = 'brightness(2) contrast(1.5) saturate(0)';
            } else {
                // Sol preto no modo claro
                modeIcon.style.filter = 'brightness(0.2) contrast(2) saturate(0)';
            }
        }
    }

    /**
     * Salvamento manual do board
     */
    async manualSave() {
        console.log('manualSave chamado');
        console.log('Estado atual:', {
            userDocRef: !!this.userDocRef,
            currentUser: !!this.currentUser,
            isOnline: this.isOnline,
            hasUnsavedChanges: this.hasUnsavedChanges,
            postitsCount: this.boardData.postits?.length || 0
        });
        
        const saveButton = document.getElementById('saveButton');
        
        // Feedback visual
        saveButton.classList.add('saving');
        this.showStatus('Salvando dados...');
        
        try {
            // Salva localmente primeiro
            localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
            console.log('Dados salvos no localStorage');
            
            // Força sincronização com Firebase
            if (this.userDocRef && this.currentUser) {
                console.log('Iniciando salvamento no Firebase...');
                await this.saveToFirebase();
                console.log('Dados salvos no Firebase com sucesso');
                
                // Sucesso
                saveButton.classList.remove('saving');
                saveButton.classList.add('saved');
                this.showStatus('Dados salvos na nuvem com sucesso!');
                
            } else {
                console.warn('Firebase não disponível:', {
                    userDocRef: !!this.userDocRef,
                    currentUser: !!this.currentUser,
                    authAvailable: !!this.auth
                });
                
                // Salvou localmente mas não no Firebase
                saveButton.classList.remove('saving');
                saveButton.classList.add('saved');
                this.showStatus('Dados salvos localmente. Firebase não disponível.');
            }
            
            // Marca como sem mudanças pendentes
            this.hasUnsavedChanges = false;
            
            // Volta ao normal após 3 segundos
            setTimeout(() => {
                saveButton.classList.remove('saved');
            }, 3000);
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            
            // Erro
            saveButton.classList.remove('saving');
            saveButton.classList.add('error');
            this.showStatus('Erro ao salvar: ' + error.message);
            
            // Volta ao normal após 3 segundos
            setTimeout(() => {
                saveButton.classList.remove('error');
            }, 3000);
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
            
            // Garantir que postit.font existe
            if (!postit.font) {
                postit.font = {
                    family: 'Arial, sans-serif',
                    size: 14,
                    bold: false,
                    italic: false
                };
            }
            
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
        console.log('Inicializando Firebase...');
        console.log('Firebase disponível:', typeof firebase !== 'undefined');
        
        if (typeof firebase !== 'undefined') {
            try {
                this.auth = firebase.auth();
                
                // Tenta conectar à database específica "stickyweb" primeiro, 
                // depois fallback para default se der erro
                try {
                    // Primeiro tenta a database padrão
                    this.db = firebase.firestore();
                    console.log('Conectado à database padrão do Firestore');
                } catch (dbError) {
                    console.warn('Erro ao conectar à database padrão:', dbError);
                    // Se houver uma database específica chamada "stickyweb", tente:
                    // this.db = firebase.app().firestore('stickyweb');
                    throw dbError;
                }
                
                console.log('Firebase Auth inicializado:', !!this.auth);
                console.log('Firebase Firestore inicializado:', !!this.db);
                console.log('Project ID:', this.db.app.options.projectId);
                console.log('Auth Domain:', this.db.app.options.authDomain);
                
                // Configurar persistência offline
                this.db.enablePersistence().catch(err => {
                    console.warn('Persistência offline não disponível:', err);
                });
                
                console.log('Firebase inicializado com sucesso');
                console.log('Configuração completa do Firebase:', {
                    projectId: this.db.app.options.projectId,
                    authDomain: this.db.app.options.authDomain,
                    hasAuth: !!this.auth,
                    hasDb: !!this.db,
                    databaseType: 'firestore-default',
                    apiKey: this.db.app.options.apiKey ? '***configurado***' : 'não configurado'
                });
                
            } catch (error) {
                console.error('Erro ao inicializar Firebase:', error);
                console.error('Verifique se:');
                console.error('1. O projeto Firebase está configurado corretamente');
                console.error('2. As credenciais estão corretas');
                console.error('3. O Firestore está habilitado no projeto');
                console.error('4. Você tem permissões adequadas');
                this.auth = null;
                this.db = null;
            }
        } else {
            console.warn('Firebase não carregado. Verifique se os scripts do Firebase foram carregados corretamente.');
            this.auth = null;
            this.db = null;
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    checkAuthentication() {
        console.log('Verificando autenticação...', {
            auth: !!this.auth,
            db: !!this.db,
            projectId: this.db?.app?.options?.projectId
        });
        
        if (!this.auth) {
            console.log('Firebase auth não disponível, trabalhando offline');
            this.showStatus('Trabalhando offline - Firebase Auth não disponível');
            return;
        }

        this.auth.onAuthStateChanged(user => {
            if (user) {
                console.log('Usuário autenticado:', {
                    email: user.email,
                    uid: user.uid,
                    projectId: this.db?.app?.options?.projectId
                });
                this.currentUser = user;
                this.userDocRef = this.db.collection('users').doc(user.uid);
                console.log('UserDocRef criado para coleção "users", documento:', user.uid);
                console.log('Path da referência:', `users/${user.uid}`);
                this.loadInitialDataFromFirebase(); // Carrega dados apenas uma vez
                this.showStatus('Conectado como: ' + user.email);
            } else {
                console.log('Usuário não autenticado');
                this.currentUser = null;
                this.userDocRef = null;
                
                // Limpa listener em tempo real se existir
                if (this.realtimeListener) {
                    this.realtimeListener();
                    this.realtimeListener = null;
                }
                
                this.showStatus('Trabalhando offline - Usuário não autenticado');
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
                this.updateSyncStatus('synced');
            }
            
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            this.updateSyncStatus('error');
            this.showStatus('Erro na sincronização. Trabalhando offline.');
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Atualiza status de sincronização visual
     */
    updateSyncStatus(status) {
        const saveButton = document.getElementById('saveButton');
        
        // Remove classes anteriores
        saveButton.classList.remove('saving', 'saved', 'error');
        
        switch (status) {
            case 'syncing':
                saveButton.classList.add('saving');
                break;
            case 'synced':
                saveButton.classList.add('saved');
                setTimeout(() => {
                    saveButton.classList.remove('saved');
                }, 2000);
                break;
            case 'error':
                saveButton.classList.add('error');
                setTimeout(() => {
                    saveButton.classList.remove('error');
                }, 3000);
                break;
        }
    }

    /**
     * Carrega dados iniciais do Firebase (apenas no início)
     */
    async loadInitialDataFromFirebase() {
        if (!this.userDocRef || this.syncInProgress) return;
        
        this.syncInProgress = true;
        
        try {
            console.log('Carregando dados do Firebase...');
            const doc = await this.userDocRef.get();
            
            if (doc.exists) {
                const userData = doc.data();
                console.log('Dados encontrados no Firebase:', userData);
                
                if (userData.boardData) {
                    // Substitui completamente os dados locais pelos do Firebase
                    this.boardData = userData.boardData;
                    
                    // Valida e corrige a estrutura dos post-its
                    this.validateAndFixPostits();
                    
                    // Salva no localStorage também para funcionamento offline
                    localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
                    
                    // Re-renderiza o board com os dados do Firebase
                    this.renderBoard();
                    this.applyBoardSettings();
                    this.showStatus('Dados carregados da nuvem (' + (this.boardData.postits?.length || 0) + ' post-its)');
                    
                    console.log('Board renderizado com dados do Firebase:', this.boardData.postits?.length, 'post-its');
                } else {
                    console.log('Nenhum boardData encontrado no Firebase');
                }
                
                // Carrega preferência do modo noturno do Firebase
                if (userData.preferences && userData.preferences.darkMode !== undefined) {
                    this.isDarkMode = userData.preferences.darkMode;
                    if (this.isDarkMode) {
                        this.applyDarkMode();
                    }
                    localStorage.setItem('stickyWebDarkMode', this.isDarkMode.toString());
                }
                
                // Configura listener em tempo real para sincronização
                this.setupRealtimeListener();
                
            } else {
                console.log('Documento não existe no Firebase, criando...');
                // Primeira vez do usuário - criar documento com dados atuais
                await this.saveToFirebase();
                this.showStatus('Dados iniciais salvos na nuvem');
            }
            
            console.log('Dados iniciais carregados do Firebase com sucesso');
            
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.showStatus('Erro ao carregar dados. Usando dados locais.');
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Configura listener em tempo real para sincronização automática
     */
    setupRealtimeListener() {
        if (!this.userDocRef || this.realtimeListener) return;
        
        console.log('Configurando listener em tempo real...');
        
        this.realtimeListener = this.userDocRef.onSnapshot((doc) => {
            if (!doc.exists) return;
            
            const userData = doc.data();
            if (!userData.boardData) return;
            
            // Só atualiza se não estivermos editando e se há diferenças
            if (!this.currentEditingPostit && !this.syncInProgress) {
                const currentDataStr = JSON.stringify(this.boardData);
                const newDataStr = JSON.stringify(userData.boardData);
                
                if (currentDataStr !== newDataStr) {
                    console.log('Dados atualizados em tempo real do Firebase');
                    this.boardData = userData.boardData;
                    
                    // Valida e corrige a estrutura dos post-its
                    this.validateAndFixPostits();
                    
                    localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
                    this.renderBoard();
                    this.showStatus('Dados sincronizados automaticamente');
                }
            }
        }, (error) => {
            console.error('Erro no listener em tempo real:', error);
        });
    }

    /**
     * Salva dados no Firebase
     */
    async saveToFirebase() {
        console.log('saveToFirebase chamado');
        
        if (!this.userDocRef || !this.currentUser) {
            console.error('Firebase não configurado:', {
                userDocRef: !!this.userDocRef,
                currentUser: !!this.currentUser,
                auth: !!this.auth,
                db: !!this.db
            });
            throw new Error('Firebase não está configurado corretamente');
        }
        
        try {
            const userData = {
                email: this.currentUser.email,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                boardData: this.boardData,
                preferences: {
                    darkMode: this.isDarkMode
                }
            };
            
            console.log('Dados a serem salvos no Firebase:', {
                email: userData.email,
                postitsCount: userData.boardData.postits?.length || 0,
                boardConfig: userData.boardData.board,
                darkMode: userData.preferences.darkMode
            });
            
            console.log('Enviando dados para Firebase...');
            await this.userDocRef.set(userData, { merge: true });
            
            this.hasUnsavedChanges = false;
            console.log('Dados salvos no Firebase com sucesso');
            this.showStatus('Dados salvos na nuvem');
            
        } catch (error) {
            console.error('Erro detalhado ao salvar no Firebase:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            this.showStatus('Erro ao salvar. Dados mantidos localmente.');
            throw error; // Re-throw para que o manualSave possa capturar
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

    /**
     * Configura eventos globais para o menu de contexto
     */
    setupContextMenuGlobalEvents() {
        // Remove listeners anteriores se existirem
        if (this.contextMenuClickHandler) {
            document.removeEventListener('click', this.contextMenuClickHandler);
        }
        if (this.contextMenuRightClickHandler) {
            document.removeEventListener('contextmenu', this.contextMenuRightClickHandler);
        }

        // Fecha context menu com clique esquerdo fora
        this.contextMenuClickHandler = (e) => {
            const contextMenu = document.getElementById('contextMenu');
            const boardContextMenu = document.getElementById('boardContextMenu');
            
            console.log('Click detectado:', {
                target: e.target,
                menuAtivo: contextMenu?.classList.contains('active'),
                boardMenuAtivo: boardContextMenu?.classList.contains('active'),
                isPostit: e.target.closest('.postit'),
                isMenu: contextMenu?.contains(e.target),
                isBoardMenu: boardContextMenu?.contains(e.target)
            });
            
            // Se o menu de post-it está ativo e clicou fora dele
            if (contextMenu && contextMenu.classList.contains('active')) {
                const clickedPostit = e.target.closest('.postit');
                const clickedMenu = contextMenu.contains(e.target);
                
                if (!clickedPostit && !clickedMenu) {
                    console.log('Fechando menu por clique fora');
                    this.hideContextMenu();
                }
            }
            
            // Se o menu de board está ativo e clicou fora dele
            if (boardContextMenu && boardContextMenu.classList.contains('active')) {
                const clickedBoardMenu = boardContextMenu.contains(e.target);
                
                if (!clickedBoardMenu) {
                    console.log('Fechando menu do board por clique fora');
                    this.hideBoardContextMenu();
                }
            }
        };

        // Fecha context menu com clique direito no menu
        this.contextMenuRightClickHandler = (e) => {
            const contextMenu = document.getElementById('contextMenu');
            
            console.log('Right click detectado:', {
                target: e.target,
                menuAtivo: contextMenu?.classList.contains('active'),
                isMenu: contextMenu?.contains(e.target)
            });
            
            // Se o menu está ativo e clicou direito nele, fecha o menu
            if (contextMenu && contextMenu.classList.contains('active') && 
                contextMenu.contains(e.target)) {
                console.log('Fechando menu por right click no menu');
                e.preventDefault();
                this.hideContextMenu();
            }
        };

        // Adiciona os listeners sem capture para testar
        document.addEventListener('click', this.contextMenuClickHandler, false);
        document.addEventListener('contextmenu', this.contextMenuRightClickHandler, false);
    }

    /**
     * Mostra o menu de contexto do board
     */
    showBoardContextMenu(event) {
        console.log('showBoardContextMenu chamado', event);
        
        const boardContextMenu = document.getElementById('boardContextMenu');
        if (!boardContextMenu) {
            console.error('boardContextMenu não encontrado');
            return;
        }

        // Armazena a posição do clique para criar o post-it
        this.boardContextClickPosition = {
            x: event.pageX,
            y: event.pageY
        };

        console.log('Posição do clique armazenada:', this.boardContextClickPosition);

        // Posiciona o menu
        boardContextMenu.style.left = `${event.pageX}px`;
        boardContextMenu.style.top = `${event.pageY}px`;
        
        // Aplica dark mode se necessário
        if (this.isDarkMode) {
            boardContextMenu.classList.add('dark-mode');
        } else {
            boardContextMenu.classList.remove('dark-mode');
        }
        
        // Mostra o menu
        boardContextMenu.classList.add('active');
        
        console.log('Menu de contexto do board mostrado');
    }

    /**
     * Esconde o menu de contexto do board
     */
    hideBoardContextMenu() {
        const boardContextMenu = document.getElementById('boardContextMenu');
        if (boardContextMenu) {
            boardContextMenu.classList.remove('active');
        }
    }

    /**
     * Cria um post-it na posição do clique do mouse
     */
    createPostitAtPosition() {
        console.log('createPostitAtPosition chamado', this.boardContextClickPosition);
        
        if (!this.boardContextClickPosition) {
            console.error('Posição do clique não encontrada');
            return;
        }

        const boardContainer = document.getElementById('boardContainer');
        const boardRect = boardContainer.getBoundingClientRect();
        
        // Calcula a posição relativa ao board
        const x = this.boardContextClickPosition.x - boardRect.left + boardContainer.scrollLeft;
        const y = this.boardContextClickPosition.y - boardRect.top + boardContainer.scrollTop;

        console.log('Posição calculada:', { x, y });

        // Cria o post-it com as preferências atuais mas texto vazio
        const prefs = this.boardData.userPreferences;
        const postit = {
            id: this.generateId(),
            position: { 
                x: Math.max(0, x - 90), // Centraliza o post-it no clique
                y: Math.max(0, y - 90)
            },
            size: { width: 180, height: 180 },
            color: prefs.lastPostitColor,
            text: '', // Texto vazio
            textColor: prefs.lastTextColor,
            font: { 
                family: prefs.lastFontFamily, 
                size: prefs.lastFontSize,
                bold: prefs.lastBold || false,
                italic: prefs.lastItalic || false
            },
            zIndex: this.getMaxZIndex() + 1
        };

        console.log('Post-it criado:', postit);

        // Adiciona ao histórico
        this.addToHistory({
            type: 'create',
            postit: JSON.parse(JSON.stringify(postit))
        });

        // Adiciona à estrutura de dados
        this.boardData.postits.push(postit);
        
        // Renderiza o post-it
        this.renderPostit(postit);
        
        // Verifica expansão do board
        this.checkBoardExpansion(postit.position.x, postit.position.y, postit.size.width, postit.size.height);
        
        // Marca como alteração não salva
        this.markUnsavedChanges();
        
        // Salva no localStorage imediatamente
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        
        // Salva no Firebase
        this.saveBoardData();
        
        console.log('Post-it adicionado ao board, total:', this.boardData.postits.length);
        
        // Entra em modo de edição automaticamente
        setTimeout(() => {
            const postitElement = document.querySelector(`[data-id="${postit.id}"]`);
            if (postitElement) {
                console.log('Iniciando edição do post-it');
                this.startEditing(postitElement);
            } else {
                console.error('Elemento do post-it não encontrado para edição');
                console.log('Tentando buscar elemento novamente...');
                // Tenta buscar novamente após um pequeno delay
                setTimeout(() => {
                    const retryElement = document.querySelector(`[data-id="${postit.id}"]`);
                    if (retryElement) {
                        console.log('Elemento encontrado na segunda tentativa');
                        this.startEditing(retryElement);
                    } else {
                        console.error('Elemento ainda não encontrado após retry');
                    }
                }, 200);
            }
        }, 150);
    }

    /**
     * Restaura a cor padrão do board
     */
    resetBoardColorToDefault() {
        const defaultColor = "#2d4a3d";
        
        console.log('Restaurando cor do board para:', defaultColor);
        
        // Atualiza a cor do board
        this.boardData.board.backgroundColor = defaultColor;
        this.updateBoardBackground(defaultColor);
        
        // Atualiza o controle de cor no menu
        const boardColorInput = document.getElementById('boardColor');
        if (boardColorInput) {
            boardColorInput.value = defaultColor;
        }
        
        // Marca como alteração não salva
        this.markUnsavedChanges();
        
        // Salva no localStorage imediatamente
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        
        // Salva as alterações no Firebase
        this.saveBoardData();
        
        // Mostra mensagem de confirmação
        this.showStatus('Cor do board restaurada ao padrão!');
    }

    /**
     * Retorna todas as definições ao padrão
     */
    resetToDefaults() {
        const defaultData = this.getDefaultBoardData();
        
        // Restaura cor do board
        this.boardData.board.backgroundColor = defaultData.board.backgroundColor;
        this.updateBoardBackground(defaultData.board.backgroundColor);
        
        // Restaura preferências do usuário
        this.boardData.userPreferences = { ...defaultData.userPreferences };
        
        // Atualiza todos os controles do menu
        this.updateMenuControls();
        
        // Atualiza o preview
        this.updatePreview();
        
        // Salva as alterações
        this.saveBoardData();
        
        // Mostra mensagem de confirmação
        this.showStatus('Todas as definições foram restauradas ao padrão!');
    }

    /**
     * Método de debug para verificar estado do Firebase
     */
    debugFirebaseState() {
        const state = {
            firebase: {
                available: typeof firebase !== 'undefined',
                version: typeof firebase !== 'undefined' ? firebase.SDK_VERSION : 'N/A'
            },
            auth: {
                available: !!this.auth,
                currentUser: !!this.currentUser,
                userEmail: this.currentUser?.email || 'N/A',
                userUID: this.currentUser?.uid || 'N/A'
            },
            firestore: {
                available: !!this.db,
                projectId: this.db?.app?.options?.projectId || 'N/A',
                authDomain: this.db?.app?.options?.authDomain || 'N/A'
            },
            userDocRef: {
                available: !!this.userDocRef,
                path: this.userDocRef ? `users/${this.currentUser?.uid}` : 'N/A'
            },
            data: {
                postitsCount: this.boardData?.postits?.length || 0,
                hasUnsavedChanges: this.hasUnsavedChanges,
                isOnline: this.isOnline
            }
        };
        
        console.group('🔍 Firebase Debug State');
        console.table(state.firebase);
        console.table(state.auth);
        console.table(state.firestore);
        console.table(state.userDocRef);
        console.table(state.data);
        console.groupEnd();
        
        return state;
    }

    /**
     * Testa conectividade com Firebase
     */
    async testFirebaseConnection() {
        console.group('🧪 Teste de Conexão Firebase');
        
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth não inicializado');
            }
            
            if (!this.db) {
                throw new Error('Firebase Firestore não inicializado');
            }
            
            if (!this.currentUser) {
                throw new Error('Usuário não autenticado');
            }
            
            if (!this.userDocRef) {
                throw new Error('UserDocRef não está configurado');
            }
            
            console.log('📋 Configuração atual:', {
                projectId: this.db.app.options.projectId,
                authDomain: this.db.app.options.authDomain,
                userEmail: this.currentUser.email,
                userUID: this.currentUser.uid,
                collectionPath: `users/${this.currentUser.uid}`
            });
            
            console.log('1️⃣ Testando leitura do documento...');
            const doc = await this.userDocRef.get();
            console.log('✅ Leitura bem-sucedida:', doc.exists ? 'Documento existe' : 'Documento não existe');
            
            if (doc.exists) {
                const data = doc.data();
                console.log('📄 Dados existentes:', {
                    hasEmail: !!data.email,
                    hasBoardData: !!data.boardData,
                    postitsCount: data.boardData?.postits?.length || 0,
                    lastUpdated: data.lastUpdated?.toDate?.() || 'N/A'
                });
            }
            
            console.log('2️⃣ Testando escrita no documento...');
            await this.userDocRef.set({
                testConnection: {
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'connection_test_ok',
                    projectId: this.db.app.options.projectId
                }
            }, { merge: true });
            console.log('✅ Escrita bem-sucedida');
            
            console.log('3️⃣ Verificando escrita...');
            const verifyDoc = await this.userDocRef.get();
            const testData = verifyDoc.data()?.testConnection;
            console.log('✅ Verificação bem-sucedida:', testData);
            
            console.log('🎉 Todas as operações Firebase funcionaram corretamente!');
            console.log('💡 O problema não é de conectividade. Verifique:');
            console.log('   - Se o usuário está autenticado corretamente');
            console.log('   - Se as regras do Firestore permitem read/write para usuários autenticados');
            console.log('   - Se a coleção "users" tem as permissões corretas');
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro no teste Firebase:', error);
            console.error('Detalhes do erro:', {
                message: error.message,
                code: error.code,
                details: error.details || 'N/A'
            });
            
            // Diagnóstico específico baseado no tipo de erro
            if (error.code === 'permission-denied') {
                console.error('🚫 PROBLEMA DE PERMISSÃO: Verifique as regras do Firestore');
                console.error('   Regras sugeridas para desenvolvimento:');
                console.error('   rules_version = "2";');
                console.error('   service cloud.firestore {');
                console.error('     match /databases/{database}/documents {');
                console.error('       match /users/{userId} {');
                console.error('         allow read, write: if request.auth != null && request.auth.uid == userId;');
                console.error('       }');
                console.error('     }');
                console.error('   }');
            } else if (error.code === 'unauthenticated') {
                console.error('🔐 PROBLEMA DE AUTENTICAÇÃO: Usuário não está logado');
            } else if (error.message.includes('network')) {
                console.error('🌐 PROBLEMA DE REDE: Verifique sua conexão com a internet');
            }
            
            return false;
        } finally {
            console.groupEnd();
        }
    }

    /**
     * Atualiza todos os controles do menu com os valores atuais
     */
    updateMenuControls() {
        // Cor do board
        const boardColorInput = document.getElementById('boardColor');
        if (boardColorInput) {
            boardColorInput.value = this.boardData.board.backgroundColor;
        }
        
        // Próximo post-it
        const nextPostitColor = document.getElementById('nextPostitColor');
        if (nextPostitColor) {
            nextPostitColor.value = this.boardData.userPreferences.lastPostitColor;
        }
        
        const nextTextColor = document.getElementById('nextTextColor');
        if (nextTextColor) {
            nextTextColor.value = this.boardData.userPreferences.lastTextColor;
        }
        
        const nextFontSize = document.getElementById('nextFontSize');
        if (nextFontSize) {
            nextFontSize.value = this.boardData.userPreferences.lastFontSize;
            const fontSizeValue = document.getElementById('fontSizeValue');
            if (fontSizeValue) {
                fontSizeValue.textContent = this.boardData.userPreferences.lastFontSize + 'px';
            }
        }
        
        const nextFontFamily = document.getElementById('nextFontFamily');
        if (nextFontFamily) {
            nextFontFamily.value = this.boardData.userPreferences.lastFontFamily;
        }
        
        // Botões de formatação
        const nextBoldBtn = document.getElementById('nextBoldBtn');
        if (nextBoldBtn) {
            if (this.boardData.userPreferences.lastBold) {
                nextBoldBtn.classList.add('active');
            } else {
                nextBoldBtn.classList.remove('active');
            }
        }
        
        const nextItalicBtn = document.getElementById('nextItalicBtn');
        if (nextItalicBtn) {
            if (this.boardData.userPreferences.lastItalic) {
                nextItalicBtn.classList.add('active');
            } else {
                nextItalicBtn.classList.remove('active');
            }
        }
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Cria instância global para debug
    window.stickyWebBoard = new StickyWebBoard();
    
    // Adiciona métodos de debug ao window para acesso no console
    window.debugFirebase = () => {
        return window.stickyWebBoard.debugFirebaseState();
    };
    
    window.testFirebaseConnection = async () => {
        return await window.stickyWebBoard.testFirebaseConnection();
    };
    
    window.testSave = async () => {
        console.log('Testando salvamento manual...');
        await window.stickyWebBoard.manualSave();
    };
    
    console.log('StickyWeb carregado. Use debugFirebase(), testFirebaseConnection() ou testSave() no console para debug.');
});
