# 🕹️ Scripttown – Full Project Specification

**Scripttown** is a browser-based static game simulation inspired by the first town in **Pokémon Red/Blue**. The player can move a character in a fixed virtual world using keyboard or touch inputs. Buildings can be entered by triggering transition zones, and each environment is represented by a separate HTML page. The game respects a fixed 1920x1080 coordinate system, does not use scaling (except for the background), and includes debug features for development.

---

## 📁 Project Folder Structure

```plaintext
Projeto/
├── assets/
│   ├── logo/                           # One .png file to be used as the webpage icon 
│   ├── music/                          # One .mp3 file per scene
│   ├── font/                           # Game fonts
│   ├── sprites/                        # Character animation tiles (tile000.png - tile015.png)
│   └── images/
│       ├── Index/
│       │   ├── cenario/                # Main scenario image
│       │   ├── cenarioOverlay/         # overlay scenario image to creat perspective of depth
│       │   ├── background/             # Background for unused screen areas
│       │   └── outros/                 # Other scene-specific assets
│       ├── lab/
│       │   ├── cenario/
│       │   ├── cenarioOverlay/
│       │   ├── background/
│       │   └── outros/
│       ├── casa/
│       │   ├── cenario/
│       │   ├── cenarioOverlay/
│       │   ├── background/
│       │   └── outros/
│       └── casa2/
│           ├── cenario/
│           ├── cenarioOverlay/
│           ├── background/
│           └── outros/
├── index.html                          # Initial scene
├── lab.html
├── casa.html
├── casa2.html
├── index.css                           # Desktop styles for each scene
├── lab.css
├── casa.css
├── casa2.css
├── indexMobile.css                     # Mobile-specific styles
├── labMobile.css
├── casaMobile.css
├── casa2Mobile.css
├── personagem.js                       # Character logic: movement, animation, sprite switching
├── script.js                           # General global logic
├── scriptMobile.js                     # Touch interaction and mobile behavior
├── index.js                            # Scene-specific logic (Index)
├── lab.js
├── casa.js
├── casa2.js
├── Textos.json                         # Dialogue text mapped to virtual coordinates
├── Colisoes.json                       # Collision rectangles
├── Transitions.json                    # Transition zones between scenes
├── ScripttownConfig.json               # Global config settings and debug toggle
└── README.md                           # Project documentation

----------------------------------------------------------------------------
# 🎮 Game Design Details

---

## 🧭 Coordinate System

- **Virtual Resolution**: `1920x1080`
- **Origin**: `(0, 0)` is the center of the screen
- **Fixed scenario size**, no scaling
- **Only the background** image scales to fill extra screen space
- All positions (collisions, text, transitions, player) use this coordinate system

---

## 👾 Character and Animation

- **Sprites**: `tile000.png` to `tile015.png`
- **Sprite Size**: `64x64 px`
- **FPS**: `25` (frame updated per movement, not time-based)

### Directional Animation Frames

| Direction | Frames           | Files              |
|-----------|------------------|--------------------|
| Down      | [0, 1, 2, 3]     | tile000–tile003    |
| Left      | [4, 5, 6, 7]     | tile004–tile007    |
| Right     | [8, 9, 10, 11]   | tile008–tile011    |
| Up        | [12, 13, 14, 15] | tile012–tile015    |

### Animation Code (TypeScript)

```ts
const directions = {
  down: [0, 1, 2, 3],
  left: [4, 5, 6, 7],
  right: [8, 9, 10, 11],
  up: [12, 13, 14, 15]
};

const spriteIndex = directions[currentDirection][frame % 4];
character.style.backgroundImage = `url('images/tile${spriteIndex.toString().padStart(3, '0')}.png')`;

# 🧱 Collision System

Collision data is stored in `Colisoes.json`.

Collisions are axis-aligned rectangles, represented by their center point $(x, y)$ and size (width, height).

```json
[
  {
    "cenario": "index",
    "x": 800,
    "y": 600,
    "largura": 100,
    "altura": 32
  }
]

# 🔀 Scene Transitions

Triggered when player enters a defined rectangular area

Stored in `Transitions.json`

Each transition has:

* `cenario` (where it exists)
* `trigger` rectangle
* `destino` object (next scene + player spawn point)

```json
[
  {
    "cenario": "index",
    "trigger": { "x": 960, "y": 580, "largura": 64, "altura": 32 },
    "destino": {
      "cenario": "lab",
      "spawn": { "x": 100, "y": 400 }
    }
  }
] 

**Logic:**

```typescript
window.location.href = "lab.html";

# 💬 Dialogue System

Stored in `Textos.json`

Dialogue boxes appear when player passes over coordinate zones

Fields:

* `coordenada`: center x/y
* `cenario`
* `texto`
* `tipo`: `"flutuante"` or `"fixo"`
* `duracao`: in milliseconds (default = 1000ms)

```json
[
  {
    "cenario": "index",
    "coordenada": { "x": 950, "y": 400 },
    "texto": "Welcome to Scripttown!",
    "tipo": "flutuante",
    "duracao": 1000
  }
]

# ⚙️ Configuration File

Stored in `ScripttownConfig.json`

```json
{
  "tela": { "largura": 1920, "altura": 1080 },
  "fps": 25,
  "tempoPadraoTexto": 1000,
  "debug": false
}

`debug = true`:

* Enables live collision box creation by mouse drag
* Shows all boxes in overlay
* Adds “Generate JSON” button to export collision data

# 📱 Mobile Support

Target screen: 670x370 px

No canvas scaling; layout adjusted via:

* `*.Mobile.css`
* `scriptMobile.ts`

On-screen buttons for W, A, S, D:

```html
<button onClick="move('up')">W</button>

# 🔈 Music

`.mp3` file per scene

Plays via HTML5 audio

Restarted on each scene load

Volume controlled via slider:

```html
<input type="range" min="0" max="1" step="0.01" oninput="setVolume(this.value)">

# 🛠️ UI Layers Order

1.  Background (scalable)
2.  Scenario (1920x1080 fixed)
3.  Character + Collision overlays
4.  Scenerio overlay (1920x1080 fixed)
5.  Text boxes
6.  UI elements (volume control, buttons)

# 📤 Deployment

Deployable to GitHub Pages

Static files only — no server logic required

All assets are locally referenced

# 🧪 Development Recommendations

* Use Live Server extension or local HTTP server to test
* Validate coordinates of collision/transition zones manually
* Export debug data only in development mode
* Use TypeScript strict typing for safe zone/object handling

# ✅ Next Steps

* Implement `personagem.ts`
* Implement `script.ts` (handle key events, trigger checks)
* Build base HTML and CSS for `index.html`
* Integrate all JSON systems
* Build debug UI
* Build mobile UI
* Finalize transitions and scene logic