import { BaseLevel } from './BaseLevel.js';

/**
 * Level1 - Basic puzzle where all pieces can connect with each other
 */
export class Level1 extends BaseLevel {
  constructor() {
    super('Level1');
  }

  preload() {
    super.preload(); // Load base level assets (green-tick)
    this.load.image('piece1', 'assets/Piece1.PNG');
    this.load.image('piece2', 'assets/Piece2.PNG');
    this.load.image('piece3', 'assets/Piece3.PNG');
    this.load.image('piece4', 'assets/piece4.png');
  }

  /**
   * Define Level 1 specific pieces
   */
  getPieceTypes() {
    return [
      { key: 'piece1', edges: 1, count: 2, scale: 0.06, sidebarScale: 0.07 },
      { key: 'piece2', edges: 2, count: 4, scale: 0.06, sidebarScale: 0.07 },
      { key: 'piece3', edges: 3, count: 6, scale: 0.06, sidebarScale: 0.07 },
      { key: 'piece4', edges: 4, count: 2, scale: 0.06, sidebarScale: 0.07 },
    ];
  }

  /**
   * Level 1 piece labels - customize the sidebar labels
   */
  getPieceLabel(pieceKey, edges) {
    const labels = {
      'piece1': `Inn: ${edges} road`,
      'piece2': `Hamlet: ${edges} roads`,
      'piece3': `Village: ${edges} roads`,
      'piece4': `Town: ${edges} roads`
    };
    return labels[pieceKey] || `Piece: ${edges} edge${edges !== 1 ? 's' : ''}`;
  }

  getTerminology() {
    return {
      piece: 'settlement',
      pieces: 'settlements',
      connection: 'road',
      connections: 'roads',
    };
  }

  /**
   * Level 1 connection rule: all pieces can connect with each other
   */
  canConnectPieces(piece1, piece2) {
    return true;
  }

  /**
   * Level 1 instructions
   */
  getLevelInstructions() {
    return `**Objective:**  Your mission is to build a series of villages in a new territory. You must connect the settlements to each other using roads, with each settlement requiring a certain number of roads depending on its size.

**How to Play:**
• Drag settlements from the sidebar onto the map to place them
• Click two settlements to connect them with a road
• Click a road to remove it
• All settlements can connect with each other
• Roads cannot cross
• Settlements cannot overlap each other or be placed on top of roads
• Drag a settlement back to the sidebar to remove it

**Win Condition:**  All settlements placed and fully connected.`;
  }
}
