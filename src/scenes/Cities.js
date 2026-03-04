import { BaseLevel } from './BaseLevel.js';

export class Cities extends BaseLevel {
  constructor() {
    super('Cities');
  }

  preload() {
    super.preload();
    this.load.image('city1', 'assets/City.PNG');
    this.load.image('city2', 'assets/City.PNG');
    this.load.image('city3', 'assets/City.PNG');
    this.load.image('city4', 'assets/City.PNG');
  }

  getPieceTypes() {
    return [
      { key: 'city1', edges: 1, count: 3, scale: 0.14, sidebarScale: 0.14 },
      { key: 'city2', edges: 2, count: 3, scale: 0.14, sidebarScale: 0.14 },
      { key: 'city3', edges: 3, count: 3, scale: 0.14, sidebarScale: 0.14 },
      { key: 'city4', edges: 4, count: 3, scale: 0.14, sidebarScale: 0.14 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const labels = {
      'city1': 'Hamlet',
      'city2': 'Town',
      'city3': 'City',
      'city4': 'Metropolis',
    };
    const name = labels[pieceKey] || 'City';
    return `${name}: ${edges} highway${edges !== 1 ? 's' : ''}`;
  }

  getBadgeOffset() {
    return { xOffset: 50, yOffset: -35 };
  }

  getCountLabelOffset() {
    return { xOffset: 50, yOffset: -40 };
  }

  getLabelYOffset() {
    return 65;
  }

  getTerminology() {
    return {
      piece: 'city',
      pieces: 'cities',
      connection: 'highway',
      connections: 'highways',
    };
  }

  canConnectPieces() {
    return true;
  }

  getLevelInstructions() {
    return `Welcome to the Highway Network!

**Scenario:**
A region of cities needs to be connected by highways. Each city can support a fixed number of highway connections depending on its size.

**Your task:**
Place cities on the board and connect them with highways so every city uses all of its available connections and the entire network is linked.

**City types:**
• Hamlet — 1 highway
• Town — 2 highways
• City — 3 highways
• Metropolis — 4 highways

**How to play:**
• Drag cities from the sidebar onto the play area
• Click two cities to build a highway between them
• Click a highway to remove it
• Highways cannot cross each other
• Drag a city back to the sidebar to remove it

**Objective:**
Build a connected highway network where every city has exactly the right number of highways.`;
  }
}
