import { BaseLevel } from './BaseLevel.js';

/**
 * Level2 - Advanced puzzle with edges 2-5 and same-type connection requirement
 * Each piece must be connected to at least one other piece of the same type
 */
export class Level2 extends BaseLevel {
  constructor() {
    super('Level2');
  }

  preload() {
    super.preload(); // Load base level assets (green-tick)
    this.load.image('L2piece1', 'assets/L2P1.PNG');
    this.load.image('L2piece2', 'assets/L2P2.PNG');
    this.load.image('L2piece3', 'assets/L2P3.PNG');
    this.load.image('L2piece4', 'assets/L2P4.PNG');
  }

  /**
   * Define Level 2 specific pieces with edges 2-5
   * Total edges: (2*4) + (3*4) + (4*6) + (5*4) = 8 + 12 + 24 + 20 = 64 (even) ✓
   */
  getPieceTypes() {
    return [
      { key: 'L2piece1', edges: 2, count: 4, scale: 0.08, sidebarScale: 0.1 },
      { key: 'L2piece2', edges: 3, count: 4, scale: 0.04, sidebarScale: 0.04 },
      { key: 'L2piece3', edges: 4, count: 6, scale: 0.08, sidebarScale: 0.07 },
      { key: 'L2piece4', edges: 5, count: 4, scale: 0.12, sidebarScale: 0.11 },
    ];
  }

  /**
   * Level 2 connection rule: all pieces can connect with each other
   */
  canConnectPieces(piece1, piece2) {
    return true;
  }

  /**
   * Level 2 additional win condition:
   * Each piece must be connected to at least one other piece of the same type
   */
  checkAdditionalSolvedConditions() {
    // Check that every piece has at least one connection to a piece of the same type
    for (const piece of this.pieces) {
      const hasSameTypeConnection = piece.connections.some(
        connectedPiece => connectedPiece.pieceType === piece.pieceType
      );
      
      if (!hasSameTypeConnection) {
        return false; // Found a piece without a same-type connection
      }
    }
    
    return true; // All pieces have at least one same-type connection
  }

  /**
   * Level 2 instructions
   */
  getLevelInstructions() {
    return `**Objective:**  You have been tasked with desiging Sydney's public transport network. You must connect light rail, bus, train and metro stops to each other. Each stop requires a certain number of connections and each type of stop must be connected to at least one other stop of the same type.

**How to Play:**
• Click pieces from the sidebar to place them
• Click two pieces to connect them
• Click a connection to remove it
• All pieces can connect with each other
• Connections cannot cross

**Win Condition:**  All pieces placed and fully connected. Each piece must have at least one same-type connection.`;
  }
}
