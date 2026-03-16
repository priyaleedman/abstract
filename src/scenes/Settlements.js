import { BaseLevel } from './BaseLevel.js';

/**
 * Settlements - Basic puzzle where all pieces can connect with each other
 */
export class Settlements extends BaseLevel {
  constructor() {
    super('Settlements');
  }

  preload() {
    super.preload(); // Load base level assets (green-tick)
    this.load.image('piece1', 'assets/Piece1.PNG');
    this.load.image('piece2', 'assets/Piece2.PNG');
    this.load.image('piece3', 'assets/Piece3.PNG');
    this.load.image('piece4', 'assets/piece4.png');
  }

  /**
   * Define Settlements pieces
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
   * Settlements piece labels
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

  getBadgeOffset(piece) {
    if (piece && piece.pieceType === 'piece2') {
      return { xOffset: 66, yOffset: -37 };
    }
    return { xOffset: 55, yOffset: -30 };
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
   * Settlements: all pieces can connect with each other
   */
  canConnectPieces(piece1, piece2) {
    return true;
  }

  /**
   * Settlements instructions
   */
  getLevelInstructions() {
    return `**Scenario:**
You are building a network of settlements in a new area. Each settlement can support a certain number of roads depending on its size.

**Settlement types:**
• Inn — 1 road
• Hamlet — 2 roads
• Village — 3 roads
• Town — 4 roads

**How to play:**
• Drag settlements from the sidebar onto the play area to place them
• Click two settlements to connect them with a road
• Click two connected settlements again to remove the road
• Drag a settlement back to the sidebar to remove it

**Planarity:**
• Roads cannot cross since the terrain is too rugged for intersections

**Objective:**
Build a connected network where every settlement has exactly the right number of roads.`;
  }
}
