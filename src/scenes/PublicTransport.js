import { BaseLevel } from './BaseLevel.js';

/**
 * PublicTransport - Advanced puzzle with edges 2-5 and same-type connection requirement
 * Each piece must be connected to at least one other piece of the same type
 */
export class PublicTransport extends BaseLevel {
  constructor() {
    super('PublicTransport');
  }

  preload() {
    super.preload(); // Load base level assets (green-tick)
    this.load.image('L2piece1', 'assets/L2P1.PNG');
    this.load.image('L2piece2', 'assets/L2P2.PNG');
    this.load.image('L2piece3', 'assets/L2P3.PNG');
    this.load.image('L2piece4', 'assets/L2P4.PNG');
  }

  /**
   * Define PublicTransport pieces with edges 2-5
   * Total edges: (2*4) + (3*4) + (4*6) + (5*4) = 8 + 12 + 24 + 20 = 64 (even) ✓
   */
  getPieceTypes() {
    return [
      { key: 'L2piece1', edges: 2, count: 4, scale: 0.07, sidebarScale: 0.1 },
      { key: 'L2piece2', edges: 3, count: 4, scale: 0.035, sidebarScale: 0.04 },
      { key: 'L2piece3', edges: 4, count: 6, scale: 0.06, sidebarScale: 0.07 },
      { key: 'L2piece4', edges: 5, count: 4, scale: 0.1, sidebarScale: 0.11 },
    ];
  }

  /**
   * PublicTransport piece labels
   */
  getPieceLabel(pieceKey, edges) {
    const labels = {
      'L2piece1': `Tram: ${edges} routes`,
      'L2piece2': `Bus: ${edges} routes`,
      'L2piece3': `Train: ${edges} routes`,
      'L2piece4': `Metro: ${edges} routes`
    };
    return labels[pieceKey] || `Piece: ${edges} edge${edges !== 1 ? 's' : ''}`;
  }

  /**
   * Override count label position (make it lower)
   */
  getBadgeOffset() {
    return { xOffset: 60, yOffset: -25 };
  }

  getCountLabelOffset() {
    return { xOffset: 65, yOffset: -20 }; // Lower than default
  }

  getLabelYOffset() {
    return 64;
  }

  getTerminology() {
    return {
      piece: 'stop',
      pieces: 'stops',
      connection: 'route',
      connections: 'routes',
    };
  }

  /**
   * PublicTransport: all pieces can connect with each other
   */
  canConnectPieces(piece1, piece2) {
    return true;
  }

  /**
   * PublicTransport additional win condition:
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
   * PublicTransport instructions
   */
  getLevelInstructions() {
    return `**Objective:**  You have been tasked with designing Sydney's public transport network. You must connect tram, bus, train and metro stops to each other. Each stop requires a certain number of routes and each type of stop must be connected to at least one other stop of the same type.

**How to Play:**
• Drag stops from the sidebar onto the map to place them
• Click two stops to connect them with a route
• Click a route to remove it
• All stops can connect with each other
• Routes cannot cross
• Stops cannot overlap each other or be placed on top of routes
• Drag a stop back to the sidebar to remove it

**Win Condition:**  All stops placed and fully connected. Each stop must have at least one same-type connection.`;
  }
}
