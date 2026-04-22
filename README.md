# Abstract — Thesis Game

An educational puzzle game built with [Phaser Launcher](https://phaser.io/download/phaser-launcher) that teaches graph theory concepts through 8 themed real-world scenarios. Players connect nodes (pieces) on a board, learning about degree constraints, planarity, and connection rules.

**Created by:** Priya Leedman

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Running Locally](#3-running-locally)
4. [How the Code Works](#4-how-the-code-works)
5. [Adding a New Level](#5-adding-a-new-level)
6. [Custom Overrides (BaseLevel API)](#6-custom-overrides-baselevel-api)
7. [Configuration Settings](#7-configuration-settings)
8. [Editing the Map](#8-editing-the-map)
9. [Editing the Landing Page](#9-editing-the-landing-page)
10. [Forking the Repository](#10-forking-the-repository)

---

## 1. Project Overview

Each level presents a themed graph theory puzzle. Players:

- Drag **pieces** (nodes) from a sidebar onto the board
- Click two pieces to **connect** them with an edge
- Must satisfy each piece's **degree constraint** (the number of connections it requires)
- May need to ensure the graph is **planar** (no crossing edges)

The 8 levels are:

| Level | Theme | Graph Concept |
|---|---|---|
| Airport | Flight routes | All-to-all connection |
| Social Network | Friendship graph | Degree constraints |
| Power Grid | Power network | Connection rules |
| Forest | Food web | Fixed edges |
| Cities | City connections | Planarity |
| Settlements (cott-edge-s) | Village graph | Edge constraints |
| Public Transport (Quicker to bi-cycle) | Transport network | Degree + planarity |
| Molecule (Can't say no[de] to coffee) | Caffeine structure | Bond type rules |

---

## 2. Project Structure

```
Thesis Game/
├── index.html                  # Entry point — loads Phaser and main.js
├── phaser.js                   # Phaser 3.88.2 (bundled, no CDN needed)
├── project.config              # Phaser editor metadata
├── src/
│   ├── main.js                 # Game config, canvas size, scene registry
│   ├── scenes/
│   │   ├── Start.js            # Animated landing/title screen
│   │   ├── Map.js              # Level selection hub with unlock logic
│   │   ├── BaseLevel.js        # Core puzzle framework (extend this for new levels)
│   │   ├── Airport.js          # Level: flight routes
│   │   ├── SocialNetwork.js    # Level: friendship graph
│   │   ├── PowerGrid.js        # Level: power network
│   │   ├── Forest.js           # Level: food web
│   │   ├── Cities.js           # Level: city connections
│   │   ├── Settlements.js      # Level: settlement graph
│   │   ├── PublicTransport.js  # Level: transport network
│   │   └── Molecule.js         # Level: caffeine bonding
│   └── helpers/
│       ├── ProgressManager.js  # Save/load progress via localStorage
│       └── ConnectionRules.js  # Reusable connection rule factories
└── assets/                     # PNG images for all pieces and UI
```

---

## 3. Running Locally

Run the game by pressing "Play" in [Phaser Launcher](https://phaser.io/download/phaser-launcher).

Or, run the game runs as plain JavaScript in the browser.

### Requirements

- Any static file server (Python, Node, etc.)
- A modern browser (Chrome, Firefox, Safari, Edge)

### Steps

```bash
# Clone the repository
git clone <your-repo-url>
cd "Thesis Game"

# Option A — Python (usually pre-installed on Mac/Linux)
python3 -m http.server 8000

# Option B — Node.js
npx http-server .


```

Then open `http://localhost:8000` in your browser.


---

## 4. How the Code Works

### Game Initialization (`src/main.js`)

`main.js` configures the Phaser game instance:

```javascript
const config = {
    type: Phaser.AUTO,         // WebGL or Canvas fallback
    width: 1280,
    height: 720,
    scene: [Start, Map, Airport, SocialNetwork, ...],  // Scene registry
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};
new Phaser.Game(config);
```

All scenes must be listed in the `scene` array. The first scene (`Start`) launches automatically.

### Scene Flow

```
Start (landing page)
  └─ [Play button] ──→ Map (level hub)
                          └─ [Level button] ──→ Level Scene
                                                  └─ [Back button] ──→ Map
```

### BaseLevel — The Puzzle Engine

Every level extends `BaseLevel.js`, which handles all the generic puzzle logic:

| Responsibility | What it does |
|---|---|
| **Piece spawning** | Renders pieces in the sidebar inventory |
| **Drag & drop** | Lets players drag pieces onto the board |
| **Edge drawing** | Clicking two pieces draws a connection line |
| **Validation** | Checks degree constraints and connection rules |
| **Planarity check** | Detects crossing edges (if enabled) |
| **UI layout** | Navbar (top), sidebar (right 250px), gameplay area |
| **Progress saving** | Calls `ProgressManager` on solve |

### UI Layout

```
┌────────────────────────────────┬─────────────┐
│                                │             │
│        Gameplay Area           │   Sidebar   │
│    (drag pieces here)          │  (250px)    │
│                                │             │
└────────────────────────────────┴─────────────┘
  ↑ Navbar (60px) at top
```

### Progress (localStorage)

`ProgressManager.js` saves all progress to `localStorage` under the key `thesis_game_progress`:

```json
{
  "levels": {
    "Airport": { "status": "solved", "solvedAt": 1714000000000 },
    "Molecule": { "status": "unsolved" }
  }
}
```

The Map scene reads this to decide which levels are locked/unlocked.

---

## 5. Adding a New Level

### Step 1 — Create the scene file

Create `src/scenes/MyLevel.js`:

```javascript
import BaseLevel from './BaseLevel.js';

export default class MyLevel extends BaseLevel {

    // Required: unique scene key
    constructor() {
        super('MyLevel');
    }

    // Required: define piece types
    getPieceTypes() {
        return [
            { key: 'my-piece-2', edges: 2, count: 3 },  // 3 pieces that need 2 connections
            { key: 'my-piece-4', edges: 4, count: 1 },  // 1 piece that needs 4 connections
        ];
    }

    // Required: instructions shown in the info panel
    getLevelInstructions() {
        return `Connect all pieces so each one has the right number of connections.`;
    }

    // Optional overrides eg. custom terminology
    getTerminology() {
        return {
            piece: 'node',
            pieces: 'nodes',
            connection: 'edge',
            connections: 'edges',
        };
    }
}
```

### Step 2 — Add assets

Place PNG images for each piece type in `assets/`. The filename must match the `key` value (e.g. `assets/my-piece-2.png`).

Load them in your level's `preload()` method (or override the base `preload`):

```javascript
preload() {
    super.preload();  // always call super first
    this.load.image('my-piece-2', 'assets/my-piece-2.png');
    this.load.image('my-piece-4', 'assets/my-piece-4.png');
}
```

### Step 3 — Register the scene in `main.js`

```javascript
import MyLevel from './scenes/MyLevel.js';

const config = {
    scene: [Start, Map, Airport, ..., MyLevel],  // add here
};
```

### Step 4 — Add a button on the Map

Open `src/scenes/Map.js` and add your level to the `levels` array:

```javascript
const levels = [
    { key: 'Airport',       label: 'Airport',       x: 320, y: 260 },
    // ... existing levels ...
    { key: 'MyLevel',       label: 'My Level',      x: 640, y: 540 },
];
```

Choose `x` and `y` coordinates that fit the layout (see [Editing the Map](#8-editing-the-map)).

### Step 5 — Register in ProgressManager

Open `src/helpers/ProgressManager.js` and add your level key to the `getAllLevelKeys()` list (if one exists), so it appears correctly in save data.

---

## 6. Custom Overrides (BaseLevel)

These are the methods you can override in a level subclass to customise behaviour.

### Piece configuration

```javascript
// Define what pieces exist and how many
getPieceTypes() {
    return [
        {
            key: 'asset-key',     // image key loaded in preload()
            edges: 3,             // how many connections this piece needs
            count: 4,             // how many of this type appear in sidebar
            scale: 1.0,           // board scale (default 1.0)
            sidebarScale: 0.6,    // sidebar scale (default 0.6)
        },
    ];
}

// Human-readable label for a piece with N edges
getPieceLabel(edges) {
    return `${edges}-edge piece`;
}
```

### Connection rules

```javascript
// Return true to allow, false to block the connection
canConnectPieces(piece1, piece2) {
    // piece1.type and piece2.type match the `key` from getPieceTypes()
    if (piece1.type === 'hydrogen' && piece2.type === 'hydrogen') return false;
    return true;
}
```

You can also use the helpers in `ConnectionRules.js`:

```javascript
import { allowAll, allowBetween } from '../helpers/ConnectionRules.js';

canConnectPieces(piece1, piece2) {
    return allowBetween('carbon', ['hydrogen', 'oxygen'])(piece1, piece2);
}
```

### Planarity

```javascript
// Set to true if edges are allowed to cross (default: false = planar required)
allowEdgeCrossing() {
    return true;
}
```

### Piece spacing

```javascript
// Minimum pixel distance between placed pieces (default: 60)
getMinPiecePlacementDistance() {
    return 40;  // tighter spacing, useful for small pieces like atoms
}
```

### Terminology

Rename "pieces" and "connections" to match your theme:

```javascript
getTerminology() {
    return {
        piece: 'atom',
        pieces: 'atoms',
        connection: 'bond',
        connections: 'bonds',
    };
}
```

### Sidebar label positioning

The label shown under each piece in the sidebar can be repositioned per level:

```javascript
// Y offset (px) from piece centre to the label — default 60
getLabelYOffset(type) {
    return 50;
}

// X offset (px) from sidebar centre to the label — default 0 (centred)
getLabelXOffset() {
    return -10;
}
```

### Sidebar count badge positioning

The `x3` count shown beside each sidebar piece:

```javascript
// xOffset and yOffset from the piece centre — defaults: { xOffset: 65, yOffset: -35 }
getCountLabelOffset(type) {
    return { xOffset: 55, yOffset: -30 };
}

// Set to false to hide the count entirely (useful when each piece type has exactly one)
showSidebarCount() {
    return false;
}
```

### Board edge-count badge positioning

The small numbered circle on each board piece showing remaining connections needed:

```javascript
// xOffset and yOffset from the piece centre — defaults: { xOffset: 40, yOffset: -40 }
getBadgeOffset(piece) {
    return { xOffset: 30, yOffset: -30 };  // pull badge in for smaller pieces
}
```

### Depleted piece tint

The colour applied to a sidebar piece when its count reaches 0:

```javascript
// Default: 0x888888 (mid grey)
getDepletedTint() {
    return 0xbbbbbb;  // lighter grey
}
```

### Hit testing mode

By default pieces use pixel-perfect click detection (ignores transparent pixels). Turn this off per piece type if you have irregular assets that cause click issues:

```javascript
// pieceKey is the asset key string; return false for bounding-box hit testing
usePixelPerfectHit(pieceKey) {
    if (pieceKey === 'my-large-piece') return false;
    return true;
}
```

### Connection rejection message

Customise the notification shown when `canConnectPieces` returns false:

```javascript
getConnectionRejectionMessage(piece1, piece2) {
    return `A ${piece1.type} cannot bond with a ${piece2.type}.`;
}
```

### Lifecycle hooks

These are called by BaseLevel at key moments. Override them to add custom behaviour without replacing core logic:

```javascript
// Called after a piece is dragged from the sidebar onto the board
onPiecePlaced(piece) {
    console.log(`Placed a ${piece.type} at (${piece.x}, ${piece.y})`);
}

// Called after an edge is successfully drawn between two pieces
onEdgeCreated(piece1, piece2) {
    console.log(`Connected ${piece1.type} to ${piece2.type}`);
}
```

### Fixed edges (pre-drawn connections)

For puzzles where some connections are given (like `Forest`), override `create()`:

```javascript
create() {
    super.create();
    // After super.create(), some pieces are already placed — add fixed edges here
    this.addFixedEdge('piece-a-id', 'piece-b-id');
}
```

---

## 7. Configuration Settings

### Canvas size (`src/main.js`)

```javascript
const config = {
    width: 1280,
    height: 720,
    // ...
};
```

Change these to resize the game canvas. The scale mode (`Phaser.Scale.FIT`) will automatically shrink the game to fit smaller screens.

### Sidebar and navbar dimensions (`src/scenes/BaseLevel.js`)

Search for these constants near the top of `BaseLevel.js`:

```javascript
this.sidebarWidth = 250;    // width of right-hand sidebar
this.navbarHeight = 60;     // height of the top navbar
```

### Background colour

In `src/main.js`:

```javascript
backgroundColor: '#ffffff',
```

### Level unlock count (`src/scenes/Map.js`)

By default, the first 3 unsolved levels are unlocked at any time. Find this value in `Map.js`:

```javascript
const maxUnlocked = 3;
```

Increase this to unlock more levels simultaneously.

### localStorage key (`src/helpers/ProgressManager.js`)

```javascript
const STORAGE_KEY = 'thesis_game_progress';
```

Change this if you need to isolate save data (e.g. for a separate fork or demo).

---

## 8. Editing the Map

The map is defined in `src/scenes/Map.js`.

### Moving or adding level buttons

Each button is an entry in the `levels` array:

```javascript
const levels = [
    { key: 'SocialNetwork',   label: 'Social Network',           x: 320,  y: 260 },
    { key: 'Airport',         label: 'Airport',                  x: 640,  y: 260 },
    { key: 'PowerGrid',       label: 'Power Grid',               x: 960,  y: 260 },
    { key: 'Forest',          label: 'Forest',                   x: 427,  y: 410 },
    { key: 'Cities',          label: 'Cities',                   x: 854,  y: 410 },
    // ... etc
];
```

- `key` must match the scene key used in that level's `constructor` call (`super('Airport')`)
- `x` and `y` are the canvas coordinates of the button centre (canvas is 1280×720)
- `label` is the display text on the button

### Changing the map background

The background image or colour is set in `Map.js`'s `create()` method. Look for:

```javascript
this.add.image(640, 360, 'map-background');
// or
this.cameras.main.setBackgroundColor('#your-color');
```

### Changing unlock logic

The unlock/lock behaviour lives in the `isLevelLocked(key)` helper inside `Map.js`. Edit this function to change how levels unlock (e.g. sequential unlock, always-open, etc.).

---

## 9. Editing the Landing Page

The landing page is `src/scenes/Start.js`.

### Changing the title or subtitle

Find the `add.text` calls:

```javascript
this.add.text(640, 280, 'Abstract', { fontSize: '72px', ... });
this.add.text(640, 370, 'a game about graph theory', { fontSize: '24px', ... });
```

Edit the string arguments to change the text.

### Changing the background or animation

The animated clouds are created in `create()` and moved in `update()`. You can:
- Remove cloud sprites for a static background
- Swap the cloud image (`this.load.image('cloud', 'assets/cloud.png')` in `preload()`)
- Change cloud speed by editing the velocity values in `update()`

### Changing the Play button behaviour

Find the button's `on('pointerdown')` handler:

```javascript
playButton.on('pointerdown', () => {
    this.scene.start('Map');
});
```

Change `'Map'` to another scene key if you want to skip the map.

### Changing the background colour

```javascript
this.cameras.main.setBackgroundColor('#your-hex-color');
```

---

## 10. Forking the Repository

### Forking on GitHub

1. Go to the repository page on GitHub
2. Click **Fork** (top right)
3. Clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/REPO-NAME.git
cd "Thesis Game"
```

### Making and publishing changes

```bash
# Create a feature branch
git checkout -b my-new-level

# Make your changes, then commit
git add src/scenes/MyLevel.js assets/my-piece.png
git commit -m "Add MyLevel puzzle"

# Push to your fork
git push origin my-new-level
```

Then open a Pull Request on GitHub if you want to contribute back.

### Deploying the game

Because there is no build step, any static hosting service works:

| Service | How |
|---|---|
| **GitHub Pages** | Enable Pages from `main` in Settings |
| **Netlify** | Drag-and-drop the project folder, or connect your repo |
| **Vercel** | `vercel` CLI or connect repo, set output dir to `.` |
| **Any web server** | Copy all files to the server's public directory |

> There is no `dist` folder to build. Deploy the project root as-is.

It is recommended to deploy using GitHub pages for simplicity - this is how the original site was deployed.

### Replacing the Phaser library

`phaser.js` is the pre-built Phaser 3.88.2 library. To upgrade:

1. Download the latest `phaser.min.js` from [phaser.io/download](https://phaser.io/download)
2. Replace `phaser.js` in the project root
3. Update the script tag in `index.html` if the filename changes

---

## Quick Reference

| Task | Where |
|---|---|
| Change canvas size | `src/main.js` |
| Add a new level | `src/scenes/MyLevel.js`, `src/main.js`, `src/scenes/Map.js` |
| Edit connection rules | Your level's `canConnectPieces()` or `src/helpers/ConnectionRules.js` |
| Customise rejection message | Your level's `getConnectionRejectionMessage()` |
| Edit level instructions | Your level's `getLevelInstructions()` |
| Rename pieces/connections | Your level's `getTerminology()` |
| Adjust sidebar label position | Your level's `getLabelYOffset()` / `getLabelXOffset()` |
| Adjust count badge position | Your level's `getCountLabelOffset()` |
| Hide sidebar count | Your level's `showSidebarCount()` returning `false` |
| Adjust board edge-count badge | Your level's `getBadgeOffset()` |
| Change depleted piece colour | Your level's `getDepletedTint()` |
| Disable pixel-perfect clicking | Your level's `usePixelPerfectHit()` |
| React to piece placed/edge drawn | Your level's `onPiecePlaced()` / `onEdgeCreated()` |
| Allow crossing edges | Your level's `allowEdgeCrossing()` returning `true` |
| Tighten piece spacing | Your level's `getMinPiecePlacementDistance()` |
| Move map buttons | `src/scenes/Map.js` — `levels` array |
| Edit landing page text | `src/scenes/Start.js` |
| Clear saved progress | Browser DevTools → Application → localStorage → delete `thesis_game_progress` |
| Change unlock behaviour | `src/scenes/Map.js` — `isLevelLocked()` function |
