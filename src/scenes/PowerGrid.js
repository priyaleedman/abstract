import { BaseLevel } from './BaseLevel.js';

export class PowerGrid extends BaseLevel {
  constructor() {
    super('PowerGrid');
  }

  preload() {
    super.preload();
    this.load.image('tower1', 'assets/PowerTower.PNG');
    this.load.image('tower2', 'assets/PowerTower.PNG');
    this.load.image('tower3', 'assets/PowerTower.PNG');
    this.load.image('tower4', 'assets/PowerTower.PNG');
  }

  getPieceTypes() {
    return [
      { key: 'tower1', edges: 1, count: 2, scale: 0.08, sidebarScale: 0.06 },
      { key: 'tower2', edges: 2, count: 2, scale: 0.08, sidebarScale: 0.06 },
      { key: 'tower3', edges: 3, count: 2, scale: 0.08, sidebarScale: 0.06 },
      { key: 'tower4', edges: 4, count: 2, scale: 0.08, sidebarScale: 0.06 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const labels = {
      'tower1': 'Relay',
      'tower2': 'Junction',
      'tower3': 'Distribution',
      'tower4': 'Hub',
    };
    const name = labels[pieceKey] || 'Tower';
    return `${name}: ${edges} line${edges !== 1 ? 's' : ''}`;
  }

  getDepletedTint() {
    return 0x444444;
  }

  getBadgeOffset() {
    return { xOffset: 55, yOffset: -60 };
  }

  getCountLabelOffset() {
    return { xOffset: 60, yOffset: -40 };
  }

  getLabelYOffset() {
    return 55;
  }

  getTerminology() {
    return {
      piece: 'tower',
      pieces: 'towers',
      connection: 'power line',
      connections: 'power lines',
    };
  }

  canConnectPieces() {
    return true;
  }

  getLevelInstructions() {
    return `Welcome to the Power Grid!

**Scenario:**
A region needs its power towers connected into a single network. Each tower has a fixed number of power line connections it can support.

**Your task:**
Place towers on the board and wire them together so every tower uses all of its available lines and the entire grid is connected.

**Tower types:**
• Relay — 1 power line
• Junction — 2 power lines
• Distribution — 3 power lines
• Hub — 4 power lines

**How to play:**
• Drag towers from the sidebar onto the play area
• Click two towers to run a power line between them
• Click a power line to remove it
• Power lines cannot cross each other
• Drag a tower back to the sidebar to remove it

**Objective:**
Build a connected power grid where every tower has exactly the right number of power lines.`;
  }
}
