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
      { key: 'city1', edges: 1, count: 3, scale: 0.08, sidebarScale: 0.07 },
      { key: 'city2', edges: 2, count: 3, scale: 0.08, sidebarScale: 0.07 },
      { key: 'city3', edges: 3, count: 3, scale: 0.08, sidebarScale: 0.07 },
      { key: 'city4', edges: 4, count: 3, scale: 0.08, sidebarScale: 0.07 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const labels = {
      'city1': 'Town',
      'city2': 'City',
      'city3': 'Metropolis',
      'city4': 'Megacity',
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
    return `**Scenario:**
A region of cities needs to be connected by highways. Each city can support a fixed number of highway connections depending on its size.

**City types:**
• Hamlet — 1 highway
• Town — 2 highways
• City — 3 highways
• Metropolis — 4 highways

**How to play:**
• Drag cities from the sidebar onto the play area
• Click two cities to build a highway between them
• Click two connected cities again to remove the highway
• Highways cannot cross — no overpasses allowed in this budget!
• Drag a city back to the sidebar to remove it

**Objective:**
Build a connected highway network where every city has exactly the right number of highways.`;
  }
}
