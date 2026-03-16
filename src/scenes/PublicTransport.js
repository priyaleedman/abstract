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
   * Total edges: (2*3) + (3*3) + (4*5) + (5*3) = 6 + 9 + 20 + 15 = 50 (even) ✓
   */
  getPieceTypes() {
    return [
      { key: 'L2piece1', edges: 2, count: 3, scale: 0.09, sidebarScale: 0.1 },
      { key: 'L2piece2', edges: 3, count: 3, scale: 0.037, sidebarScale: 0.04 },
      { key: 'L2piece3', edges: 4, count: 5, scale: 0.07, sidebarScale: 0.07 },
      { key: 'L2piece4', edges: 5, count: 3, scale: 0.115, sidebarScale: 0.11 },
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
  getBadgeOffset(piece) {
    if (piece && piece.pieceType === 'L2piece2') {
      return { xOffset: 60, yOffset: -25 };
    } else if (piece && piece.pieceType === 'L2piece1') {
      return { xOffset: 45, yOffset: -20 };
    }
    return { xOffset: 48, yOffset: -23 };
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
    return `**Scenario:**
You have been tasked with designing Sydney's public transport network. Connect tram, bus, train and metro stops into a single transport network.

**Stop types:**
• Tram — 2 routes
• Bus — 3 routes
• Train — 4 routes
• Metro — 5 routes

**Special rule:**
Each stop must be connected to at least one other stop of the **same type**. For example, every tram stop must link to at least one other tram stop.

**How to play:**
• Drag stops from the sidebar onto the map to place them
• Click two stops to connect them with a route
• Click two connected stops again to remove the route
• Routes cannot cross — no tangled transit lines!
• Drag a stop back to the sidebar to remove it

**Objective:**
Build a connected transport network where every stop has the right number of routes and is linked to at least one stop of the same type.`;
  }
}
