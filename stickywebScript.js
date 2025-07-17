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
     * Inicia salvamento automático a cada 30 segundos
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges && !this.currentEditingPostit) {
                // Só salva se não estiver editando um post-it
                this.syncWithFirebase();
            }
        }, 30000); // 30 segundos em vez de 5
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
            if (e.target.closest('.postit')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.postit'));
            }
        });

        // Fecha context menu
        document.addEventListener('click', (e) => {
            if (!document.getElementById('contextMenu').contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Board events
        board.addEventListener('click', (e) => {
            if (e.target === board || e.target === document.getElementById('boardContainer')) {
                this.clearEditingMode();
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
        
        // Salva apenas no localStorage, Firebase será salvo pelo auto-save
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
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

        // Salva alterações no texto
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
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
        contextMenu.classList.add('active');
        
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
        
        // Salva apenas no localStorage, Firebase será salvo pelo auto-save
        localStorage.setItem('stickyWebBoardData', JSON.stringify(this.boardData));
        this.markUnsavedChanges();
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
    }

    /**
     * Alterna modo escuro
     */
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        this.applyDarkMode();
        
        // Salva preferência no localStorage
        localStorage.setItem('stickyWebDarkMode', this.isDarkMode.toString());
        
        // Marca como não salvo para o auto-save cuidar do Firebase
        this.markUnsavedChanges();
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
                this.syncWithFirebase();
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
            // Carregar dados do Firebase apenas no início
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
            
            // NÃO configurar listener em tempo real - apenas carrega dados uma vez
            console.log('Dados carregados. Listener em tempo real desabilitado para evitar recarregamentos.');
            
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            this.showStatus('Erro na sincronização. Trabalhando offline.');
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
