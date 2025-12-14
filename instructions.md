# ScriptTownn - 2D Grid-Based Game Project

## Visão Geral do Projeto

Este é um **portfólio interativo** no estilo jogo 2D baseado em grid, desenvolvido inteiramente com **HTML5**, **CSS3** e **JavaScript puro** (Vanilla JS). O projeto apresenta múltiplos cenários/mapas interconectados, um personagem jogável com animações direcionais, sistema de colisão, triggers interativos, música de fundo e suporte para dispositivos móveis.

---

## ✅ Decisões de Design (FINAIS)

### Interface e Visual
- **Estilo UI:** Moderna minimalista (fundo semi-transparente, fonte sans-serif limpa)
- **Esquema de cores:** A definir posteriormente
- **Tamanho base dos tiles:** 25×25 pixels (imagens originais)
- **Viewport:** Mapa completo sempre visível, escalado dinamicamente
- **Background:** Imagem `{mapa}Background.png` preenchendo área restante da tela
- **Transições:** Instantâneas entre mapas (sem fade)
- **Controles mobile:** Botões semi-transparentes modernos, canto inferior esquerdo
- **Orientação mobile:** LANDSCAPE obrigatório (celular deitado)

### Sistema de Escala Responsivo
- **Desktop:** 70% da altura da viewport, scale 1.0-1.6× (tiles 25-40px)
- **Mobile landscape:** 90% da altura, scale 0.72-1.0× (tiles 18-25px)
- **Método:** CSS transform scale com limites inteligentes
- **Image rendering:** pixelated (mantém estilo pixel-art)
- **Grid lógica:** Sempre 20×20 células, independente da escala visual

### Renderização de Mapas
- **Método:** Canvas dinâmico (montagem em tempo real)
- **Processo:** 
  1. Carregar 400 tiles em paralelo (Promise.all)
  2. Montar em canvas invisível (500×500px)
  3. Converter para imagem única
  4. Aplicar scale CSS baseado em viewport
- **Cache:** localStorage (segunda visita instantânea)
- **Loading screen:** Mostrar durante primeira montagem
- **Grid virtual:** Sistema de coordenadas [x, y] para colisões/triggers

### Gameplay
- **Velocidade movimento:** 250ms por célula
- **Interpolação:** Linear (velocidade constante)
- **Mapa inicial:** Cidade, posição centro [10, 10]
- **Posição padrão:** Centro do mapa [10, 10] ao entrar via trigger (até mapear posições específicas)
- **Colisão:** Verificação antes de movimento, bloqueio instantâneo
- **Salvamento:** Não (portfólio simples)

### Triggers
- **Texto:** Aparece ao entrar na grid, desaparece 1s após sair
- **Agrupamento:** Triggers com mesmo texto compartilham estado (não desaparecem se mudar entre grids do mesmo grupo)
- **Indicação visual:** Nenhuma (sem borda/ícone)
- **Direção:** Validação obrigatória
- **Mapa:** Teletransporte via redirecionamento de página com params

### Áudio
- **Música:** Loop automático ao carregar página
- **Volume inicial:** 25% no mapa cidade
- **Controle:** Slider HTML padrão, canto superior direito, sempre visível
- **Persistência:** sessionStorage + URL params
- **Arquivo:** `outros/sons/musicLoop.mp3`

### Arquitetura
- **Organização:** Um HTML por mapa (cidade.html, casa.html, etc.)
- **Navegação:** Redirecionamento com query params (?volume=0.25&fromMap=casa)
- **Compartilhamento de código:** Todos os JS externos, carregados por cada HTML

### Features Especiais MVP
- **Debug mode:** Toggle com tecla D (mostra grid, posição, colisões)
- **Loading screen:** Indicador durante montagem de mapa
- **Fallbacks:** Mensagens de erro se assets não carregarem
- **Orientation lock:** Forçar landscape em mobile (API + aviso visual)

---

## Estrutura de Arquivos (Completa)

```
scriptTownn/
├── cenarios/
│   ├── casa/
│   │   ├── casa.json                    (colisões, triggers)
│   │   ├── casaBackground.png           (background fullscreen)
│   │   └── casa{X}_{Y}.png (400 tiles)  (X: 0-19, Y: 0-19, 25×25px cada)
│   ├── casa2/
│   │   ├── casa2.json
│   │   ├── casa2Background.png
│   │   └── casa2{X}_{Y}.png (400 tiles)
│   ├── casa3/
│   │   ├── casa3.json
│   │   ├── casa3Background.png
│   │   └── casa3{X}_{Y}.png (400 tiles)
│   ├── cidade/
│   │   ├── cidade.json
│   │   ├── cidadeBackground.png
│   │   └── cidade{X}_{Y}.png (400 tiles)
│   └── lab/
│       ├── lab.json
│       ├── labBackground.png
│       └── lab{X}_{Y}.png (400 tiles)
├── personagem/
│   └── tile000.png a tile015.png        (16 sprites, 25×25px cada)
├── outros/
│   └── sons/
│       └── musicLoop.mp3                (música de fundo)
└── scripts/
    ├── htmls/
    │   ├── cidade.html                  (MVP - mapa inicial)
    │   ├── casa.html
    │   ├── casa2.html
    │   ├── casa3.html
    │   └── lab.html
    └── js/
        ├── constants.js                 (constantes globais)
        ├── audio.js                     (sistema de música)
        ├── scale.js                     (cálculo de escala responsiva)
        ├── mapRenderer.js               (canvas + montagem de tiles)
        ├── player.js                    (personagem + movimento)
        ├── collision.js                 (detecção de colisões)
        ├── triggers.js                  (sistema de triggers)
        ├── controls.js                  (input teclado + touch)
        ├── ui.js                        (diálogos + controles mobile)
        ├── debug.js                     (modo debug)
        └── game.js                      (orquestrador principal)
```

---

## Estrutura dos Dados JSON

Cada cenário possui um arquivo JSON com a seguinte estrutura:

```json
{
  "nome_mapa": "casa",
  "colisao": [[x, y], ...],          // Array de coordenadas [x, y] com colisão
  "triggers_txt": [...],              // Triggers que exibem texto
  "triggers_mp": [...],               // Triggers que teletransportam para outro mapa
  "triggers_link": [...]              // Triggers de link (não implementados ainda)
}
```

### Triggers de Texto (triggers_txt)
```json
{
  "pos": [x, y],                      // Posição do trigger na grid
  "texto": "Mensagem...",             // Texto a ser exibido
  "direcao": ["UP", "DOWN", ...]      // Direções que ativam o trigger
}
```

### Triggers de Mapa (triggers_mp)
```json
{
  "pos": [x, y],                      // Posição do trigger na grid
  "texto": "nome_mapa",               // Nome do mapa de destino
  "direcao": ["UP", "DOWN", ...]      // Direções que ativam o trigger
}
```

### Triggers de Link (triggers_link)
```json
{
  "pos": [x, y],                      // Posição do trigger
  "texto": "links",                   // Identificador/URL
  "direcao": ["UP", "DOWN", ...]      // Direções que ativam
}
```
**NOTA:** Triggers de link serão deixados para última fase e não devem ser implementados inicialmente.

---

## Sistema de Grid e Coordenadas

### Convenção de Nomenclatura das Imagens
- Formato: `{nomeMapa}{X}_{Y}.png`
- Exemplo: `casa3_5.png` = mapa "casa", coluna X=3, linha Y=5
- **Coordenada de origem:** (0, 0) no **canto superior esquerdo**
- **X aumenta para a direita**, Y aumenta para baixo

### Dimensões dos Mapas
Todos os mapas possuem a mesma dimensão:
- **casa:** 20x20 tiles (0-19 em X e Y) = 400 imagens
- **casa2:** 20x20 tiles (0-19 em X e Y) = 400 imagens
- **casa3:** 20x20 tiles (0-19 em X e Y) = 400 imagens
- **cidade:** 20x20 tiles (0-19 em X e Y) = 400 imagens
- **lab:** 20x20 tiles (0-19 em X e Y) = 400 imagens

### Tamanho dos Tiles
- **Tamanho confirmado:** 25x25 pixels
- Todos os tiles do mapa: 25x25px
- Todos os sprites do personagem: 25x25px
- Dimensão total de cada mapa: 500px × 500px (20 tiles × 25px)

---

## Sistema de Personagem

### Sprites e Animações
O personagem possui 16 sprites (tile000.png a tile015.png) organizados em 4 direções:

| Direção | Sprites | Índices |
|---------|---------|---------|
| **BAIXO (DOWN)** | tile000.png - tile003.png | 0-3 |
| **ESQUERDA (LEFT)** | tile004.png - tile007.png | 4-7 |
| **DIREITA (RIGHT)** | tile008.png - tile011.png | 8-11 |
| **CIMA (UP)** | tile012.png - tile015.png | 12-15 |

### Sistema de Animação
- Cada movimento usa **4 frames** de animação
- Animação deve alternar entre os frames durante o movimento (ex: 0→1→2→3→0)
- Quando parado, usar o frame **inicial** da direção atual (0, 4, 8 ou 12)
- Frame rate sugerido: 100-150ms por frame

### Controles
- **Teclado Desktop:**
  - `W` ou `↑` (ArrowUp): Mover para cima
  - `S` ou `↓` (ArrowDown): Mover para baixo
  - `A` ou `←` (ArrowLeft): Mover para esquerda
  - `D` ou `→` (ArrowRight): Mover para direita

- **Controles Touch Mobile:**
  - Botões virtuais (D-Pad) na tela para as 4 direções
  - Posicionados no canto inferior (esquerdo ou direito, a definir)
  - Tamanho adequado para toque em telas pequenas (mínimo 44x44px)

---

## Sistema de Movimentação

### Movimento Baseado em Grid
1. O personagem se move **uma célula da grid por vez**
2. Durante o movimento, interpolar suavemente a posição visual
3. Movimento deve ser **bloqueado** durante a transição até chegar na próxima célula
4. Verificar colisão **antes** de iniciar o movimento

### Algoritmo de Movimento
```
1. Jogador pressiona tecla de direção
2. Calcular próxima posição (currentX + deltaX, currentY + deltaY)
3. Verificar se próxima posição está dentro dos limites do mapa
4. Verificar se próxima posição NÃO está na lista de colisões
5. Se válido:
   - Iniciar animação de movimento
   - Atualizar sprites com animação da direção
   - Mover visualmente (interpolação suave)
   - Atualizar posição lógica
   - Verificar triggers na nova posição
6. Se inválido: ignorar o input
```

### Velocidade de Movimento
- Sugestão: 200-300ms por movimento de célula
- Deve ser ajustável para testes e balanceamento

---

## Sistema de Colisão

### Verificação de Colisão
- Antes de cada movimento, verificar se a célula de destino está no array `colisao`
- Formato das coordenadas de colisão: `[x, y]`
- Comparação deve ser exata: `targetX === collision[0] && targetY === collision[1]`

### Tipos de Colisão
1. **Limites do Mapa:** Impedir movimento para fora da grid (x < 0, x >= maxX, y < 0, y >= maxY)
2. **Objetos/Paredes:** Células definidas no array `colisao` do JSON

---

## Sistema de Triggers

### Ativação de Triggers
Os triggers só são ativados quando **TODAS** as condições são atendidas:
1. Personagem está na posição exata do trigger: `playerX === trigger.pos[0] && playerY === trigger.pos[1]`
2. Personagem chegou nesta posição movendo-se numa direção válida
3. A direção de chegada está listada no array `direcao` do trigger

### Direções Válidas
- `"UP"`: Personagem moveu-se para cima (Y--)
- `"DOWN"`: Personagem moveu-se para baixo (Y++)
- `"LEFT"`: Personagem moveu-se para esquerda (X--)
- `"RIGHT"`: Personagem moveu-se para direita (X++)

### Tipos de Triggers

#### 1. Trigger de Texto (triggers_txt)
- **Comportamento:** Exibir caixa de diálogo com o texto
- **UI:** Caixa de texto sobreposta ao jogo (modal ou overlay)
- **Interação:** Jogador deve pressionar tecla/botão para fechar
- **Sugestão de tecla:** Barra de espaço, Enter ou clique/tap na caixa

#### 2. Trigger de Mapa (triggers_mp)
- **Comportamento:** Teletransportar jogador para outro mapa
- **Processo:**
  1. Detectar trigger
  2. Fade out (opcional, para transição suave)
  3. Carregar novo mapa (JSON + imagens)
  4. Posicionar jogador na posição de entrada padrão do novo mapa
  5. Fade in
- **Posicionamento:** Definir posições de entrada padrão para cada mapa

#### 3. Trigger de Link (triggers_link)
- **Status:** **NÃO IMPLEMENTAR NA FASE INICIAL**
- Reservado para futura expansão (possivelmente abrir links externos)

### Prevenção de Re-ativação
- Implementar cooldown ou flag para evitar trigger múltiplo
- Sugestão: Trigger só reativa após jogador sair e retornar à célula

---

## Renderização e Sistema Visual

### Camadas de Renderização (Z-Index)
1. **Camada de Fundo:** Grid do mapa (z-index: 1)
2. **Camada de Personagem:** Sprite do jogador (z-index: 10)
3. **Camada de UI:** Caixas de diálogo, controles mobile (z-index: 100)

### Construção do Mapa
- Criar container/grid com as dimensões corretas
- Carregar e posicionar todas as imagens `{mapa}{X}_{Y}.png`
- Organizar em ordem (linhas e colunas)
- Usar CSS Grid ou posicionamento absoluto

### Câmera e Viewport
Com mapas de 500px × 500px (20×20 tiles de 25px):
- **Opção 1 (Mapa Completo):** Mostrar os 500×500px completos
  - Ideal para telas desktop (facilmente visualizável)
  - Em mobile, pode precisar de zoom ou scroll
  
- **Opção 2 (Viewport com Câmera):** Implementar câmera que segue o personagem
  - Viewport menor (ex: 12×12 tiles = 300×300px)
  - Câmera centraliza no personagem
  - Scroll suave quando personagem se move
  - Melhor para mobile

**Recomendação:** Opção 1 para MVP (simples), avaliar Opção 2 em fase mobile se necessário

---

## Arquitetura de Código

### Estrutura de Arquivos Proposta

```
scripts/
├── htmls/
│   ├── casa.html         (página do mapa casa)
│   ├── casa2.html        (página do mapa casa2)
│   ├── casa3.html        (página do mapa casa3)
│   ├── cidade.html       (página do mapa cidade - início do jogo)
│   └── lab.html          (página do mapa lab)
└── js/
    ├── game.js           (lógica principal do jogo)
    ├── player.js         (classe/objeto do personagem)
    ├── map.js            (carregamento e renderização de mapas)
    ├── collision.js      (sistema de colisão)
    ├── triggers.js       (gerenciamento de triggers)
    ├── controls.js       (input de teclado e touch)
    └── ui.js             (caixas de diálogo, controles virtuais)
```

### Organização Modular

#### game.js - Controlador Principal
- Inicialização do jogo
- Loop principal (se necessário)
- Coordenação entre módulos
- Gestão de estado global

#### player.js - Sistema do Personagem
```javascript
const Player = {
  x: 0,              // Posição X na grid
  y: 0,              // Posição Y na grid
  direction: 'DOWN', // Direção atual
  isMoving: false,   // Estado de movimento
  animationFrame: 0, // Frame atual da animação
  
  move(direction) { ... },
  updateAnimation() { ... },
  render() { ... }
}
```

#### map.js - Sistema de Mapas
```javascript
const MapManager = {
  currentMap: null,
  mapData: null,
  
  loadMap(mapName) { ... },
  renderMap() { ... },
  getMapData() { ... }
}
```

#### collision.js - Detecção de Colisão
```javascript
const CollisionSystem = {
  checkCollision(x, y) { ... },
  isWithinBounds(x, y) { ... }
}
```

#### triggers.js - Sistema de Triggers
```javascript
const TriggerSystem = {
  checkTriggers(x, y, direction) { ... },
  activateTextTrigger(trigger) { ... },
  activateMapTrigger(trigger) { ... }
}
```

#### controls.js - Input do Jogador
```javascript
const Controls = {
  init() { ... },
  handleKeyboard(event) { ... },
  handleTouch(button) { ... }
}
```

#### ui.js - Interface do Usuário
```javascript
const UI = {
  showDialog(text) { ... },
  hideDialog() { ... },
  createMobileControls() { ... }
}
```

---

## Funcionalidades Principais

### ✅ Fase 1 - MVP (Mínimo Produto Viável)
1. **Renderização de Mapa**
   - Carregar e exibir imagens da grid do mapa
   - Mostrar mapa completo na tela

2. **Personagem Básico**
   - Exibir sprite do personagem sobre o mapa
   - Posicionar em coordenadas iniciais

3. **Movimentação**
   - Movimento por WASD e setas
   - Movimento baseado em grid (célula por célula)
   - Animação básica de sprites direcionais

4. **Sistema de Colisão**
   - Impedir movimento para células com colisão
   - Impedir movimento para fora do mapa

5. **Carregamento de Dados**
   - Ler arquivos JSON de cada mapa
   - Parsear dados de colisão e triggers

### ✅ Fase 2 - Triggers e Interações
6. **Triggers de Texto**
   - Detectar quando jogador entra em célula de trigger
   - Validar direção de movimento
   - Exibir caixa de diálogo com texto
   - Permitir fechar diálogo

7. **Triggers de Mapa**
   - Teletransporte entre mapas
   - Transição suave (fade)
   - Reposicionar jogador no novo mapa

8. **Interface de Diálogo**
   - Caixa de texto estilizada
   - Texto centralizado e legível
   - Botão ou indicação de "pressione para continuar"

### ✅ Fase 3 - Mobile e Polimento
9. **Controles Mobile**
   - D-Pad virtual na tela
   - Botões responsivos ao toque
   - Design adaptativo para diferentes tamanhos de tela

10. **Animações e Transições**
    - Suavização de movimento (interpolação)
    - Animação de walking (alternância de frames)
    - Transições entre mapas

11. **Otimizações**
    - Pré-carregamento de imagens
    - Cache de mapas visitados
    - Performance em dispositivos móveis

### 🔄 Fase 4 - Funcionalidades Avançadas (Opcional)
12. **Câmera Dinâmica**
    - Viewport que segue o personagem
    - Scroll suave

13. **Sistema de Save**
    - Salvar posição do jogador (localStorage)
    - Salvar mapas visitados

14. **Triggers de Link**
    - Implementar funcionalidade de triggers_link
    - Abrir páginas externas ou executar ações customizadas

15. **Audio**
    - Música de fundo
    - Efeitos sonoros de passos
    - Sons de triggers

---

## Boas Práticas e Diretrizes

### ✅ O QUE FAZER

1. **Código Limpo e Modular**
   - Separar responsabilidades em arquivos distintos
   - Usar funções pequenas e focadas
   - Comentar código complexo

2. **Nomenclatura Clara**
   - Variáveis descritivas em inglês ou português consistente
   - Nomes de funções que indicam ação (verbo + substantivo)

3. **Estrutura de Dados Consistente**
   - Manter formato [x, y] para coordenadas
   - Usar mesma estrutura para todos os triggers

4. **Performance**
   - Pré-carregar assets quando possível
   - Evitar renderizações desnecessárias
   - Usar event delegation para controles

5. **Responsividade**
   - Design que funciona em desktop e mobile
   - Testar em diferentes resoluções
   - Media queries para ajustar layout

6. **Acessibilidade Básica**
   - Textos legíveis (tamanho e contraste)
   - Controles grandes o suficiente para toque
   - Feedback visual de interações

7. **Testabilidade**
   - Código modular facilita testes
   - Console logs para debugging (remover em produção)
   - Funções puras quando possível

### ❌ O QUE EVITAR

1. **Dependências Externas**
   - ❌ **NÃO usar frameworks** (React, Vue, Angular)
   - ❌ **NÃO usar bibliotecas** (jQuery, Phaser, Pixi.js)
   - ✅ **APENAS HTML, CSS e JavaScript puro**

2. **Código Espaguete**
   - ❌ Evitar funções gigantes com múltiplas responsabilidades
   - ❌ Evitar código duplicado (princípio DRY)
   - ❌ Evitar variáveis globais desnecessárias

3. **Magic Numbers**
   - ❌ Evitar números hardcoded
   - ✅ Usar constantes nomeadas (ex: `const TILE_SIZE = 32`)

4. **Renderização Ineficiente**
   - ❌ Não redesenhar todo o mapa a cada frame
   - ❌ Não criar novos elementos DOM repetidamente
   - ✅ Reutilizar elementos e usar transforms CSS

5. **Acoplamento Forte**
   - ❌ Módulos não devem depender diretamente de implementação de outros
   - ✅ Usar interfaces claras entre módulos

6. **Ignorar Edge Cases**
   - ❌ Não assumir que dados estão sempre corretos
   - ✅ Validar posições, verificar bounds, tratar erros

7. **Sobrecarga Inicial**
   - ❌ Não implementar todas as features de uma vez
   - ✅ Seguir as fases incrementalmente (MVP primeiro)

---

## Posições de Entrada dos Mapas

Definir posições padrão onde o jogador aparece ao entrar em cada mapa:

### Sugestões Iniciais (a ajustar conforme necessidade)

| Mapa | Posição Entrada (X, Y) | Origem |
|------|------------------------|--------|
| **cidade** | (9, 14) | Início do jogo / vindo de casa ou lab |
| **casa** | (15, 7) | Vindo da cidade (entrada pela porta) |
| **casa2** | (10, 15) | Vindo da cidade ou casa3 |
| **casa3** | (14, 11) | Vindo da casa2 |
| **lab** | (9, 16) | Vindo da cidade (entrada pela porta) |

**NOTA:** Essas posições devem ser refinadas analisando os triggers_mp e a lógica de conexão entre mapas.

---

## Especificações Técnicas

### HTML
- DOCTYPE HTML5
- Meta tags: viewport, charset UTF-8
- Semântica apropriada (canvas, div, section)
- IDs e classes para styling e manipulação JS

### CSS
- CSS3 moderno (Flexbox, Grid)
- Variáveis CSS para valores reutilizáveis
- Media queries para responsividade
- Animações CSS para transições suaves
- Reset CSS básico para consistência

### JavaScript
- ES6+ features (const/let, arrow functions, template literals)
- Async/await para carregamento de assets
- Event listeners para input
- localStorage para save system
- Sem transpilação (código nativo do navegador)

### Compatibilidade
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Suporte mobile (iOS Safari, Chrome Android)
- Testar em diferentes tamanhos de tela

---

## ⏳ Pontos Pendentes de Definição

### 🔵 Design Visual
1. **Cores e Tema:** Esquema de cores específico para UI e controles mobile
2. **Fonte:** Qual fonte usar para textos (diálogos, UI)?

### 🔵 Triggers de Link
3. **triggers_link:** Funcionalidade desejada (abrir URLs externas, modal com iframe, portfolio items, etc.)

### 🔵 Posicionamento Preciso
4. **Posições de Entrada:** Definir coordenadas exatas de spawn para cada trigger_mp
5. **Mapeamento de Portas:** Relacionar cada trigger de saída com posição de entrada no mapa destino

---

## Sugestões e Melhorias

### 💡 Ideias para Considerar

1. **Loading Screen**
   - Mostrar indicador de carregamento ao trocar de mapa
   - Pré-carregar assets para evitar lag

2. **Indicador de Direção**
   - Pequena seta ou marcador mostrando direção que o personagem está virado

3. **Histórico de Diálogo**
   - Log de mensagens lidas (opcional)

4. **Easter Eggs**
   - Alguns triggers já mencionam Pokémon e personagens (Leela, Clarinha, Professor Oak)
   - Manter esse estilo divertido e adicionar referências sutis

5. **Mini-Mapa**
   - Mapa pequeno no canto da tela mostrando posição do jogador (fase avançada)

6. **Sistema de Flags**
   - Para triggers que devem ocorrer apenas uma vez
   - Para eventos ou diálogos condicionais

7. **Animação de Idle**
   - Pequena animação quando personagem está parado (respiração, piscar)

8. **Partículas/Efeitos**
   - Efeitos visuais leves para teletransporte
   - Partículas ao interagir com triggers

---

## Checklist de Desenvolvimento

### Fase 1 - MVP (Mapa Cidade)
**Objetivo:** Um mapa funcional completo com todas features essenciais

- [ ] Estrutura HTML base (cidade.html)
- [ ] CSS base e reset
- [ ] Constantes globais (constants.js)
- [ ] Sistema de áudio (audio.js + musicLoop.mp3)
- [ ] Slider de volume (canto superior direito)
- [ ] Carregamento de JSON do mapa cidade (map.js)
- [ ] Renderização do background (cidadeBackground.png)
- [ ] Renderização da grid do mapa (400 tiles)
- [ ] Sistema de coordenadas funcionando
- [ ] Exibir sprite do personagem (posição centro)
- [ ] Movimentação com teclado WASD/Setas (250ms linear)
- [ ] Sistema de colisão com objetos
- [ ] Sistema de colisão com limites
- [ ] Animação de sprites direcionais (4 frames)
- [ ] Sistema de detecção de triggers
- [ ] Validação de direção de movimento
- [ ] Triggers de texto com comportamento de grupo
- [ ] UI de caixa de diálogo (moderna minimalista)
- [ ] Timer de 1s para desaparecer texto
- [ ] Controles virtuais mobile (canto inferior esquerdo)

### Fase 2 - Expansão de Mapas
**Objetivo:** Adicionar todos os outros mapas e navegação

- [ ] HTML para casa, casa2, casa3, lab
- [ ] Triggers de mapa funcionando (cidade ↔ outros)
- [ ] Sistema de passagem de volume entre páginas
- [ ] Posicionamento correto ao entrar em novo mapa
- [ ] Testar todas transições de mapa
- [ ] VLANO DE IMPLEMENTAÇÃO COMPLETO

### 🎯 Estratégia: MVP Incremental - Mapa Cidade Funcional

**Filosofia:** Um mapa 100% funcional com todas as features antes de expandir.

**Abordagem técnica:**
- Canvas dinâmico para montar 400 tiles em 1 imagem
- Grid virtual 20×20 para lógica (colisões, triggers, movimento)
- Scale CSS responsivo (desktop 70%, mobile 90%)
- Cache localStorage para performance
- [ ] Testes em dispositivos mobile reais
- [ ] Ajustes de responsividade
- [ ] Otimização de carregamento de imagens
- [ ] Pré-carregamento de assets críticos
- [ ] Code review e refatoração
- [ ] Testes de performance
- [ ] Documentação do código

### Fase 4 - Features Avançadas (Futuro)
**Objetivo:** Melhorias opcionais

- [ ] Triggers de link (funcionalidade a definir)
- [ ] Animações extras (partículas, efeitos)
- [ ] Easter eggs adicionais
- [ ] Sistema de analytics (opcional)
- [ ] SEO e meta tags
- [ ] Loading screen customizado

---

## Próximos Passos Imediatos

1. ✅ **Decisões tomadas** - Todas as configurações principais definidas
2. ⏳ **Confirmar estrutura de arquivos** - Validar organização proposta
3. ⏳ **Revisar plano de implementação** - Aprovar estratégia de desenvolvimento
4. 🚀 **Iniciar MVP** - Começar com mapa cidade funcional
5. 📝 **Iterar e expandir** - Adicionar mapas e features incrementalmente

---

## 📋 Plano de Implementação Detalhado

### 🎯 Estratégia: MVP Incremental com Mapa Cidade

**Filosofia:** Desenvolver um mapa completamente funcional antes de expandir, garantindo que toda a arquitetura está sólida.

---

## 🚀 PLANO DETALHADO DE IMPLEMENTAÇÃO

### 📦 Fase 1: Fundação e Constantes (30 min)
**Objetivo:** Estrutura base e configurações globais

**Arquivos a criar:**
1. **constants.js** - Todas as configurações do jogo
2. **scripts/htmls/cidade.html** - Estrutura HTML base
3. **Arquivo CSS básico** (inline ou externo)

**constants.js:**
```javascript
// Configurações de Grid
const GRID_SIZE = 20;
const BASE_TILE_SIZE = 25;
const BASE_MAP_SIZE = GRID_SIZE * BASE_TILE_SIZE; // 500px

// Configurações de Escala
const SCALE_CONFIG = {
  desktop: {
    heightPercent: 0.70,
    minScale: 1.0,
    maxScale: 1.6
  },
  mobile: {
    heightPercent: 0.90,
    minScale: 0.72,
    maxScale: 1.0,
    breakpoint: 768
  }
};

// Configurações de Gameplay
const MOVE_DURATION = 250; // ms por movimento
const TEXT_DISAPPEAR_DELAY = 1000; // ms para texto sumir

// Configurações de Áudio
const AUDIO_CONFIG = {
  initialVolume: 0.25,
  musicPath: '../../../outros/sons/musicLoop.mp3'
};

// Sprites do personagem
const SPRITE_SETS = {
  DOWN: [0, 1, 2, 3],
  LEFT: [4, 5, 6, 7],
  RIGHT: [8, 9, 10, 11],
  UP: [12, 13, 14, 15]
};

// Direções e deltas
const DIRECTIONS = {
  UP: { dx: 0, dy: -1, key: 'UP' },
  DOWN: { dx: 0, dy: 1, key: 'DOWN' },
  LEFT: { dx: -1, dy: 0, key: 'LEFT' },
  RIGHT: { dx: 1, dy: 0, key: 'RIGHT' }
};

// Paths
const PATHS = {
  cenarios: '../../../cenarios',
  personagem: '../../../personagem',
  sons: '../../../outros/sons'
};
```

**cidade.html:**
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>ScriptTownn - Cidade</title>
  <style>
    /* CSS inline aqui */
  </style>
</head>
<body>
  <!-- Background fullscreen -->
  <div id="background"></div>
  
  <!-- Container principal -->
  <div id="game-container">
    <!-- Slider de volume -->
    <div id="volume-control">
      <input type="range" id="volume-slider" min="0" max="100" value="25">
    </div>
    
    <!-- Container do mapa -->
    <div id="map-container">
      <!-- Imagem do mapa (canvas convertido) -->
      <!-- Sprite do personagem -->
    </div>
    
    <!-- Caixa de diálogo -->
    <div id="dialog-box" class="hidden"></div>
    
    <!-- Controles mobile -->
    <div id="mobile-controls" class="hidden">
      <button data-direction="UP">▲</button>
      <button data-direction="LEFT">◄</button>
      <button data-direction="DOWN">▼</button>
      <button data-direction="RIGHT">►</button>
    </div>
    
    <!-- Loading screen -->
    <div id="loading-screen">
      <p>Carregando mapa...</p>
      <div class="progress-bar"></div>
    </div>
    
    <!-- Debug overlay -->
    <div id="debug-overlay" class="hidden"></div>
  </div>
  
  <!-- Scripts -->
  <script src="../js/constants.js"></script>
  <script src="../js/audio.js"></script>
  <script src="../js/scale.js"></script>
  <script src="../js/mapRenderer.js"></script>
  <script src="../js/player.js"></script>
  <script src="../js/collision.js"></script>
  <script src="../js/triggers.js"></script>
  <script src="../js/controls.js"></script>
  <script src="../js/ui.js"></script>
  <script src="../js/debug.js"></script>
  <script src="../js/game.js"></script>
</body>
</html>
```

**Entrega:** Estrutura HTML funcional com CSS básico

---

### 🎵 Fase 2: Sistema de Áudio (30 min)
**Objetivo:** Música de fundo com controle de volume funcionando

**Arquivo a criar:** `audio.js`

**Funcionalidades:**
```javascript
const AudioSystem = {
  music: null,
  
  init() {
    // Criar elemento audio
    // Configurar loop
    // Volume inicial de URL params ou 25%
    // Conectar com slider
    // Salvar volume em sessionStorage
  },
  
  play() { /* ... */ },
  pause() { /* ... */ },
  setVolume(value) { /* ... */ },
  getVolume() { /* ... */ }
};
```

**Integração:**
- Slider atualiza volume
- Volume salvo em sessionStorage
- Autoplay ao carregar (com tratamento de erro de browsers)

**Entrega:** Música tocando com controle de volume

---

### 📐 Fase 3: Sistema de Escala Responsivo (30 min)
**Objetivo:** Calcular scale correto baseado em viewport

**Arquivo a criar:** `scale.js`

**Funcionalidades:**
```javascript
const ScaleSystem = {
  currentScale: 1,
  isMobile: false,
  
  calculate() {
    // Detectar mobile (<768px)
    // Pegar config apropriada (desktop/mobile)
    // Calcular: targetHeight = vh × percent
    // Calcular: scale = targetHeight / 500
    // Aplicar limites (min/max)
    // Retornar scale
  },
  
  apply(element) {
    // element.style.transform = `scale(${scale})`
    // element.style.imageRendering = 'pixelated'
  },
  
  lockOrientation() {
    // Mobile: tentar travar landscape
    // Fallback: mostrar aviso se portrait
  }
};
```

**Entrega:** Função que calcula scale correto

---

### 🖼️ Fase 4: Renderização de Mapa com Canvas (2 horas)
**Objetivo:** Montar 400 tiles em 1 imagem usando canvas

**Arquivo a criar:** `mapRenderer.js`

**Funcionalidades:**
```javascript
const MapRenderer = {
  currentMap: null,
  mapData: null,
  
  async loadMap(mapName) {
    // 1. Mostrar loading screen
    // 2. Verificar cache localStorage
    // 3. Se cached: usar, senão: montar
    // 4. Carregar JSON (colisões, triggers)
    // 5. Carregar background
    // 6. Retornar dados
  },
  
  async assembleMapCanvas(mapName) {
    // 1. Criar canvas 500×500
    // 2. Preparar array de promises (400 tiles)
    // 3. Promise.all para carregar paralelo
    // 4. Desenhar cada tile no canvas
    // 5. Converter canvas.toDataURL()
    // 6. Cachear em localStorage
    // 7. Retornar imagem
  },
  
  renderMapImage(imageData) {
    // 1. Criar <img>
    // 2. Aplicar scale
    // 3. Inserir no #map-container
  },
  
  renderBackground(mapName) {
    // 1. Carregar background.png
    // 2. Aplicar como background do body
  }
};
```

**Detalhes técnicos:**
- Canvas invisível (não adicionar ao DOM)
- `ctx.imageSmoothingEnabled = false` para pixel-art
- Promise.all para paralelizar carregamento
- Try/catch para cada tile (fallback se falhar)
- Progress bar durante carregamento
- Cache: `localStorage.setItem('map_cidade', dataURL)`

**Entrega:** Mapa cidade visível, escalado corretamente

---

### 🎮 Fase 5: Sistema do Personagem (1.5 horas)

1. **cidade.html** - Estrutura básica
   - HTML5 semântico
   - Meta tags (viewport, charset)
   - Container para mapa (500×500px centralizado)
   - Container para background (fullscreen)
   - Slider de volume (canto superior direito)
   - Área para controles mobile (canto inferior esquerdo)
   - Área para caixa de diálogo

2. **styles.css** (criar novo arquivo)
   - Reset CSS básico
   - Layout flexbox/grid para centralização
   - Estilos do mapa container
   - Estilos do background (cover, centered)
   - Estilos do slider de volume
   - Estilos dos controles mobile
   - Estilos da caixa de diálogo (moderna minimalista)
   - Media queries básicas

3. **constants.js**
   ```javascript
   const TILE_SIZE = 25;
   const GRID_SIZE = 20;
   const MAP_SIZE = TILE_SIZE * GRID_SIZE; // 500px
   const MOVE_DURATION = 250; // ms
   const TEXT_DISAPPEAR_DELAY = 1000; // ms
   const INITIAL_VOLUME = 0.25;
   const SPRITE_SETS = {...};
   const DIRECTIONS = {...};
   ```

4. **audio.js** - Sistema de música
   - Carregar musicLoop.mp3
   - Função play/pause/volume
   - Integração com slider
   - Salvar volume em sessionStorage
   - Iniciar música automaticamente

**Entrega:** Página que carrega, mostra background, toca música com controle de volume

---

**Objetivo:** Personagem renderizado e movimentação básica

**Arquivo a criar:** `player.js`

**Funcionalidades:**
```javascript
const Player = {
  gridX: 10,
  gridY: 10,
  direction: 'DOWN',
  isMoving: false,
  animationFrame: 0,
  spriteElement: null,
  
  init(startX, startY) {
    // Criar <img> do sprite
    // Posicionar no grid
    // Adicionar ao #map-container
  },
  
  render() {
    // Atualizar sprite baseado em direction e animationFrame
    // Calcular posição pixel baseado em gridX, gridY e scale
    // Aplicar transform
  },
  
  move(direction) {
    // Se já está movendo, ignorar
    // Calcular próxima posição
    // Verificar colisão
    // Se OK: animar movimento
    // Atualizar sprites (4 frames)
    // Ao finalizar: verificar triggers
  },
  
  animateMovement(fromX, fromY, toX, toY) {
    // Interpolação linear durante MOVE_DURATION
    // RequestAnimationFrame ou CSS transition
    // Alternar sprites durante movimento
  },
  
  getPixelPosition() {
    // Retornar {x, y} em pixels considerando scale
  }
};
```

**Entrega:** Personagem visível no centro do mapa

---

### 🚧 Fase 6: Sistema de Colisão (45 min)
**Objetivo:** Impedir movimento em células bloqueadas

**Arquivo a criar:** `collision.js`

**Funcionalidades:**
```javascript
const CollisionSystem = {
  collisionData: [],
  
  loadCollisions(mapData) {
    // Armazenar array de colisões do JSON
  },
  
  checkCollision(x, y) {
    // Verificar se [x, y] está no array
    return this.collisionData.some(cell => 
      cell[0] === x && cell[1] === y
    );
  },
  
  isWithinBounds(x, y) {
    return x >= 0 && x < GRID_SIZE && 
           y >= 0 && y < GRID_SIZE;
  },
  
  canMoveTo(x, y) {
    return this.isWithinBounds(x, y) && 
           !this.checkCollision(x, y);
  }
};
```

**Entrega:** Personagem não atravessa paredes

---

### ⌨️ Fase 7: Sistema de Controles (1 hora)
**Objetivo:** Input de teclado e touch funcionando

**Arquivo a criar:** `controls.js`

**Funcionalidades:**
```javascript
const Controls = {
  isEnabled: true,
  
  init() {
    // Event listeners para teclado
    // Event listeners para botões mobile
    // Detectar mobile e mostrar controles
  },
  
  handleKeyboard(event) {
    // WASD e Arrow Keys
    // Mapear para direção
    // Chamar Player.move()
  },
  
  handleTouch(direction) {
    // Botões virtuais
    // Chamar Player.move()
  },
  
  enable() { /* ... */ },
  disable() { /* ... */ }
};
```

**Controles mobile:**
- Detectar se é mobile (touch support + width)
- Mostrar botões D-Pad no canto inferior esquerdo
- Estilo semi-transparente
- Touch events (touchstart/touchend)
- Prevenir scroll/zoom

**Entrega:** Movimento com WASD/setas e controles touch

---

### 💬 Fase 8: Sistema de Triggers de Texto (2 horas)
**Objetivo:** Triggers de texto com agrupamento funcionando

**Arquivo a criar:** `triggers.js`

**Funcionalidades:**
```javascript
const TriggerSystem = {
  triggersText: [],
  triggersMap: [],
  triggersLink: [],
  activeTextGroups: new Map(), // texto -> {timer, cells}
  lastPosition: null,
  
  loadTriggers(mapData) {
    // Carregar arrays do JSON
  },
  
  checkTriggersOnMove(x, y, direction) {
    // Verificar se saiu de trigger
    // Verificar se entrou em novo trigger
    // Gerenciar agrupamento
  },
  
  onEnterTextTrigger(trigger) {
    // Cancelar timer se texto já ativo
    // Mostrar diálogo
    // Adicionar célula ao grupo
  },
  
  onLeaveTextTrigger(trigger) {
    // Iniciar timer de 1s
    // Se não entrar em trigger do mesmo grupo, esconder
  },
  
  activateMapTrigger(trigger) {
    // Redirecionar para outro mapa
    // Passar volume e info via URL
  }
};
```

**Lógica de agrupamento:**
```javascript
// Map: texto -> { timer, activeCells }
// Ao entrar: cancelar timer, adicionar célula
// Ao sair: remover célula, se vazio -> timer 1s
```

**Entrega:** Triggers de texto funcionando com agrupamento

---

### 🎨 Fase 9: Interface do Usuário (1.5 horas)
**Objetivo:** Caixa de diálogo e controles visuais

**Arquivo a criar:** `ui.js`

**Funcionalidades:**
```javascript
const UI = {
  dialogBox: null,
  mobileControls: null,
  loadingScreen: null,
  
  init() {
    // Referenciar elementos DOM
    // Configurar estilos
  },
  
  showDialog(text) {
    // Mostrar caixa
    // Animação fade in
    // Inserir texto
  },
  
  hideDialog() {
    // Animação fade out
    // Esconder caixa
  },
  
  showLoading(progress) {
    // Atualizar barra de progresso
  },
  
  hideLoading() {
    // Fade out loading screen
  },
  
  showMobileControls() {
    // Se mobile, mostrar D-Pad
  },
  
  showRotateMessage() {
    // Se mobile portrait, aviso para virar
  }
};
```

**Estilo caixa de diálogo:**
- Moderna minimalista
- Fundo semi-transparente
- Centralizada ou na parte inferior
- Animação suave

**Entrega:** UI completa e funcional

---

### 🐛 Fase 10: Modo Debug (45 min)
**Objetivo:** Ferramentas de desenvolvimento

**Arquivo a criar:** `debug.js`

**Funcionalidades:**
```javascript
const DebugMode = {
  isActive: false,
  overlay: null,
  
  toggle() {
    // Tecla D liga/desliga
  },
  
  render() {
    // Grid visual sobre o mapa
    // Números de coordenadas
    // Highlight colisões (vermelho)
    // Highlight triggers (verde/amarelo)
    // Posição do player
    // Scale atual
    // FPS
  },
  
  logMovement(x, y, direction) {
    console.log(`Player: [${x}, ${y}] ${direction}`);
  },
  
  logTrigger(trigger) {
    console.log('Trigger:', trigger);
  }
};
```

**Entrega:** Debug mode funcional (tecla D)

---

### 🎯 Fase 11: Orquestração e Inicialização (1 hora)
**Objetivo:** Juntar tudo e fazer funcionar

**Arquivo a criar:** `game.js`

**Funcionalidades:**
```javascript
const Game = {
  mapName: 'cidade',
  scale: 1,
  
  async init() {
    // 1. Ler URL params (volume, fromMap, x, y)
    // 2. Inicializar AudioSystem
    // 3. Calcular scale
    // 4. Lock orientation (mobile)
    // 5. Carregar mapa
    // 6. Renderizar mapa e background
    // 7. Inicializar player
    // 8. Carregar colisões e triggers
    // 9. Inicializar controles
    // 10. Inicializar UI
    // 11. Inicializar debug
    // 12. Esconder loading
    // 13. Pronto!
  },
  
  restart() { /* ... */ },
  cleanup() { /* ... */ }
};

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  Game.init().catch(error => {
    console.error('Erro ao inicializar:', error);
    UI.showError('Falha ao carregar o jogo. Recarregue a página.');
  });
});
```

**Tratamento de erros:**
- Try/catch em cada fase
- Fallbacks para assets não carregados
- Mensagens amigáveis
- Console.log detalhado

**Entrega:** Mapa cidade 100% funcional!

---

### 📦 Fase 12: Expansão para Outros Mapas (2-3 horas)

1. **map.js** - Carregamento e renderização
   - Função async para carregar cidade.json
   - Parsear dados (colisao, triggers_txt, triggers_mp)
   - Gerar 400 elementos <img> para tiles
   - Posicionar em grid (CSS Grid ou absolute)
   - Carregar cidadeBackground.png
   - Função para limpar/recarregar mapa

2. **player.js** - Sistema do personagem
   - Objeto Player com x, y, direction, isMoving
   - Função render() - mostrar sprite correto
   - Posição inicial centro [10, 10]
   - Z-index sobre o mapa
   - Preparar para animação

3. **Integração em cidade.html**
   - Script tags na ordem correta
   - Inicialização no DOMContentLoaded
   - Renderizar mapa + personagem

**Entrega:** Mapa cidade completo visível, personagem parado no centro

---

### Fase 3: Movimento e Colisão (Mecânicas Core)
**Tempo estimado:** 3-4 horas  
**Objetivo:** Personagem se move pelo mapa respeitando colisões

1. **collision.js** - Sistema de colisão
   - Função checkCollision(x, y, mapData)
   - Função isWithinBounds(x, y)
   - Verificar array de colisões do JSON

2. **controls.js** - Input do jogador
   - Event listeners para WASD e Arrow keys
   - Função handleKeyPress(key)
   - Validar se pode mover (não está em movimento)
   - Chamar Player.move(direction)

3. **player.js** (expandir) - Movimento
   - Função move(direction)
   - Validar colisão antes de mover
   - Atualizar posição lógica (x, y)
   - Iniciar interpolação visual (CSS transform/transition)
   - Bloquear input durante movimento
   - Atualizar sprites de animação (frame 0→1→2→3)
   - Callback ao finalizar movimento

**Entrega:** Personagem se move com WASD/setas, não atravessa paredes, animação suave

---

### Fase 4: Sistema de Triggers de Texto (Interatividade)
**Tempo estimado:** 3-4 horas  
**Objetivo:** Triggers de texto funcionando com comportamento de grupo

1. **triggers.js** - Gerenciamento de triggers
   - Função checkTriggers(x, y, lastDirection, mapData)
   - Validar posição exata e direção
   - Identificar tipo de trigger (txt, mp, link)
   - Sistema de agrupamento (triggers com mesmo texto)
   - Timer de 1 segundo para desaparecer
   - Cancelar timer se entrar em trigger do mesmo grupo

2. **ui.js** - Interface de diálogo
   - Função showDialog(text)
   - Função hideDialog()
   - Estrutura HTML da caixa
   - Estilos modernos minimalistas
   - Transições suaves (CSS)

3. **Integração em player.js**
   - Após movimento, chamar checkTriggers
   - Passar direção do último movimento
   - Ativar/desativar diálogos conforme necessário

**Entrega:** Triggers de texto aparecem/desaparecem corretamente, agrupamento funciona

---

### Fase 5: Controles Mobile (Acessibilidade)
**Tempo estimado:** 2-3 horas  
**Objetivo:** Botões virtuais funcionais para mobile

1. **ui.js** (expandir) - Controles virtuais
   - Função createMobileControls()
   - 4 botões: ▲ ▼ ◄ ►
   - Estilo semi-transparente moderno
   - Posição: canto inferior esquerdo
   - Event listeners touch (touchstart/touchend)

2. **controls.js** (expandir) - Input touch
   - Função handleTouchButton(direction)
   - Integrar com mesmo sistema de movimento
   - Prevenir scroll/zoom indesejado

3. **styles.css** (expandir) - Responsividade
   - Media queries para mobile
   - Ajustar tamanhos de botões (mínimo 44×44px)
   - Escala do mapa se necessário
   - Testar em diferentes resoluções

**Entrega:** Controles mobile funcionais, jogável em smartphone

---

### Fase 6: Triggers de Mapa (Expansão - PREPARAÇÃO)
**Tempo estimado:** 2 horas  
**Objetivo:** Preparar navegação entre mapas (sem outros mapas ainda)

1. **triggers.js** (expandir) - Trigger de mapa
   - Função activateMapTrigger(trigger)
   - Detectar triggers_mp
   - Preparar URL com parâmetros: ?map=casa&x=15&y=7&volume=0.25
   - Implementar redirect (location.href)

2. **Preparação para outros mapas**
   - Template HTML genérico
   - Sistema de leitura de parâmetros URL
   - Lógica de posicionamento inicial

**Entrega:** MVP do mapa cidade 100% funcional, pronto para replicar

---

## ✅ O Que Está BOM no Plano

1. **Arquitetura Modular** 
   - Separação clara de responsabilidades
   - Fácil manutenção e debugging
   - Código reutilizável entre mapas

2. **Desenvolvimento Incremental**
   - Testar cada feature antes de avançar
   - Menos chances de bugs acumulados
   - Feedback visual constante

3. **Sistema de Triggers de Texto com Agrupamento**
   - Comportamento sofisticado mas implementável
   - UX natural (texto não "pisca" ao mover entre grids)
   - Flexível para diferentes casos de uso

4. **Sem Dependências Externas**
   - Vanilla JS = zero configuração
   - Performance nativa
   - Mais controle total

5. **Background + Mapa Centralizado**
   - Solução elegante para diferentes tamanhos de tela
   - Visual profissional
   - Imersão maior

---

## ⚠️ PREOCUPAÇÕES e Pontos de Atenção

### 🔴 Performance com 400 Imagens

**Problema:** Renderizar 400 elementos `<img>` pode ser pesado, especialmente em mobile.

**Soluções:**
- **Opção A (RECOMENDADA):** Usar CSS Sprites (combinar tiles em sprite sheet)
- **Opção B:** Usar Canvas 2D para renderizar mapa
- **Opção C:** Lazy loading (carregar apenas tiles visíveis)
- **Opção D:** Pré-carregar imagens em memória antes de exibir

**Decisão necessária:** Testar primeiro com 400 `<img>`, se laggar, implementar Canvas.

---

### 🟡 Gestão de Estado Entre Páginas

**Problema:** Com um HTML por mapa, perder estado ao navegar (posição, volume, etc.)

**Soluções implementadas:**
- ✅ Volume via sessionStorage
- ✅ Posição via URL params (?x=10&y=12)
- ⏳ Mapa destino via URL params (?map=casa)

**Atenção:** Garantir que TODOS os triggers_mp passem informações corretas.

---

### 🟡 Comportamento de Triggers de Texto Agrupados

**Problema:** Lógica complexa - triggers com mesmo texto compartilham estado.

**Implementação:**
```javascript
// Pseudo-código
const activeTextGroups = new Map(); // texto -> timerId

function onEnterTrigger(trigger) {
  const text = trigger.texto;
  if (activeTextGroups.has(text)) {
    clearTimeout(activeTextGroups.get(text)); // Cancela timer
  }
  showDialog(text);
}

function onLeaveTrigger(trigger) {
  const text = trigger.texto;
  const timerId = setTimeout(() => {
    hideDialog(text);
    activeTextGroups.delete(text);
  }, 1000);
  activeTextGroups.set(text, timerId);
}
```

**Atenção:** Testar edge cases (mover rápido entre triggers, sair e voltar, etc.)

---

### 🟡 Sincronização de Animação

**Problema:** Animação de sprites (4 frames) + movimento (250ms) precisam estar sincronizados.

**Solução:**
- Frame duration: 250ms / 4 = 62.5ms por frame
- Ou usar 4 frames durante os 250ms (timing CSS)
- Ou animar independentemente (velocidade fixa, ex: 100ms/frame)

**Decisão:** Alternar frames durante movimento, frame 0 quando parado.

---

### 🟠 Mobile - Conflitos de Input

**Problema:** Touch pode acionar múltiplos eventos (touchstart, click, etc.)

**Soluções:**
- `preventDefault()` em eventos touch
- `touch-action: none` em CSS
- Usar apenas touch events (não click) em mobile

---

### 🟠 Posições de Entrada nos Mapas

**Problema:** Cada trigger_mp precisa de coordenada exata no mapa destino.

**Solução proposta:**
1. Mapear todos os triggers_mp manualmente
2. Criar tabela de relacionamento:
   ```javascript
   const SPAWN_POSITIONS = {
     'cidade_to_casa': { x: 15, y: 7 },
     'casa_to_cidade': { x: 5, y: 7 },
     // ...
   };
   ```
3. Ou usar coordenada "oposta" à porta de saída
4. Ou padrão: centro do mapa

**Ação necessária:** Você definir posições ou usar centro por padrão?

---

### 🟢 Sugestões de Melhoria

1. **Loading Screen Simples**
   - Fade in ao carregar mapa
   - "Carregando..." enquanto assets não prontos
   - Previne "flash" de conteúdo

2. **Debug Mode**
   - Toggle para mostrar grid com números
   - Mostrar posição do player
   - Highlight de colisões e triggers
   - Console logs detalhados

3. **Versionamento de Assets**
   - Cache busting para imagens (?v=1)
   - Evita problemas de cache em updates

4. **Fallbacks**
   - Se JSON não carregar: mostrar erro amigável
   - Se imagem não carregar: placeholder
   - Se música não carregar: continuar sem áudio

5. **Easter Egg Inicial**
   - Mensagem "Bem-vindo ao meu portfólio!" na primeira vez
   - Tutorial rápido dos controles

---

## 🎯 O Que Pode Melhorar no Futuro

1. **Sistema de Eventos**
   - Arquitetura pub/sub para comunicação entre módulos
   - Mais desacoplado e escalável

2. **Pre-fetching de Mapas**
   - Carregar JSONs de mapas adjacentes em background
   - Transições instantâneas

3. **Service Worker**
   - Cache offline
   - Progressive Web App (PWA)

4. **Analytics Básico**
   - Quais mapas mais visitados
   - Quanto tempo em cada área
   - (Sem invasão de privacidade)

5. **Acessibilidade**
   - ARIA labels
   - Navegação por teclado completa
   - Screen reader support

---

## 🚀 Resumo do Plano

**MVP (Fase 1-5):** Mapa cidade 100% funcional  
**Tempo estimado:** 12-17 horas de desenvolvimento  
**Resultado:** Portfólio jogável em desktop e mobile, com música, triggers, movimento fluido

**Expansão (Fase 6+):** Adicionar outros 4 mapas  
**Tempo estimado:** 6-8 horas (já tem toda a base)  
**Resultado:** Portfólio completo com 5 mapas interconectados

---

**Objetivo:** Replicar estrutura para outros 4 mapas

**Tarefas:**
1. Duplicar cidade.html → casa.html, casa2.html, casa3.html, lab.html
2. Ajustar nome do mapa em cada arquivo
3. Testar navegação entre mapas
4. Mapear posições de entrada específicas (substituir centro padrão)
5. Validar todos triggers funcionando

**Entrega:** 5 mapas navegáveis

---

## ⏱️ CRONOGRAMA TOTAL

| Fase | Duração | Acumulado | Entrega |
|------|---------|-----------|---------|
| 1. Fundação | 30min | 0.5h | Estrutura HTML/CSS |
| 2. Áudio | 30min | 1h | Música com volume |
| 3. Escala | 30min | 1.5h | Cálculo responsivo |
| 4. Renderização | 2h | 3.5h | Mapa visível |
| 5. Personagem | 1.5h | 5h | Sprite no mapa |
| 6. Colisão | 45min | 5.75h | Paredes funcionam |
| 7. Controles | 1h | 6.75h | WASD + Touch |
| 8. Triggers | 2h | 8.75h | Textos + agrupamento |
| 9. UI | 1.5h | 10.25h | Diálogos + visual |
| 10. Debug | 45min | 11h | Debug mode |
| 11. Orquestração | 1h | 12h | **MVP COMPLETO** |
| 12. Expansão | 2-3h | 14-15h | 5 mapas |

**Total MVP (Cidade):** ~12 horas de código  
**Total Completo:** ~15 horas

---

## 🎯 ORDEM DE DESENVOLVIMENTO (Sequência Exata)

```
DIA 1 (6 horas):
├── Fase 1-3: Fundação + Áudio + Escala (1.5h)
├── Fase 4: Renderização Canvas (2h)
└── Fase 5-6: Personagem + Colisão (2.5h)
    ✅ CHECKPOINT: Personagem se move pelo mapa

DIA 2 (6 horas):
├── Fase 7: Controles (1h)
├── Fase 8: Triggers (2h)
├── Fase 9: UI (1.5h)
└── Fase 10-11: Debug + Orquestração (1.5h)
    ✅ MVP CIDADE COMPLETO

DIA 3 (3 horas):
└── Fase 12: Outros 4 mapas
    ✅ PROJETO COMPLETO
```

---

## 🔍 PONTOS CRÍTICOS DE ATENÇÃO

### 1. **Performance do Canvas (Fase 4)**
- 400 requests em paralelo podem dar timeout
- **Solução:** Carregar em batches de 50 tiles
- **Fallback:** Retry individual se batch falhar

### 2. **Cache localStorage (Fase 4)**
- Limite de 5-10MB
- DataURL pode ser grande (~500KB por mapa)
- **Solução:** Comprimir ou usar IndexedDB se necessário

### 3. **Agrupamento de Triggers (Fase 8)**
- Lógica complexa com timers e Maps
- **Solução:** Testar bem com console.logs
- **Edge case:** Mover muito rápido entre triggers

### 4. **Orientação Mobile (Fase 3)**
- API nem sempre funciona
- **Solução:** Fallback visual obrigatório

### 5. **Scale em Diferentes Resoluções (Fase 3)**
- Testar em: 1920×1080, 1366×768, iPhone, iPad
- **Solução:** Limites min/max garantem legibilidade

---

## ✅ CHECKLIST ANTES DE COMEÇAR

- [x] Decisões todas tomadas
- [x] Estrutura de arquivos definida
- [x] Plano detalhado aprovado
- [x] Ordem de desenvolvimento clara
- [ ] **Pronto para codificar!**

---

## 🚀 PRÓXIMO PASSO IMEDIATO

**Começar Fase 1: constants.js + cidade.html**

Vamos criar os arquivos base e estrutura HTML/CSS!

**CONFIRMA E COMEÇAMOS?** 💻✨

---

## Notas Técnicas Adicionais

### Estrutura de Coordenadas
```
Grid 20x20 (todos os mapas):
(0,0)  (1,0)  (2,0) ... (19,0)
(0,1)  (1,1)  (2,1) ... (19,1)
...
(0,19) (1,19) (2,19) ... (19,19)

Total: 400 células (20 × 20)
Dimensão visual: 500px × 500px (25px por tile)
```

### Direções e Deltas
```javascript
const DIRECTIONS = {
  UP:    { dx: 0,  dy: -1, key: 'UP' },
  DOWN:  { dx: 0,  dy: 1,  key: 'DOWN' },
  LEFT:  { dx: -1, dy: 0,  key: 'LEFT' },
  RIGHT: { dx: 1,  dy: 0,  key: 'RIGHT' }
};
```

### Animação de Sprites
```javascript
const SPRITE_SETS = {
  DOWN:  [0, 1, 2, 3],
  LEFT:  [4, 5, 6, 7],
  RIGHT: [8, 9, 10, 11],
  UP:    [12, 13, 14, 15]
};
```

---

## Conclusão

Este documento serve como blueprint completo para o desenvolvimento do jogo ScriptTownn. Seguir estas diretrizes garantirá um código limpo, modular, manutenível e compatível com os requisitos do projeto.

**Tecnologias:** HTML5, CSS3, JavaScript Vanilla
**Abordagem:** Incremental (MVP → Features → Polimento)
**Foco:** Simplicidade, performance, responsividade

---

**Última Atualização:** 13/12/2025
**Status:** Aguardando revisão e aprovação para iniciar desenvolvimento
