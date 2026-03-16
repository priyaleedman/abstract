import { BaseLevel } from './BaseLevel.js';

/**
 * PublicTransport - Puzzle where footpaths connect different types of transit stops.
 * No two stops of the same type may be directly connected (proper 4-colouring).
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
   * Total edges: (2*3) + (3*3) + (4*4) + (5*3) = 6 + 9 + 16 + 15 = 46 (even) ✓
   */
  getPieceTypes() {
    return [
      { key: 'L2piece1', edges: 2, count: 3, scale: 0.09, sidebarScale: 0.1 },
      { key: 'L2piece2', edges: 3, count: 3, scale: 0.037, sidebarScale: 0.04 },
      { key: 'L2piece3', edges: 4, count: 4, scale: 0.07, sidebarScale: 0.07 },
      { key: 'L2piece4', edges: 5, count: 3, scale: 0.115, sidebarScale: 0.11 },
    ];
  }

  /**
   * PublicTransport piece labels
   */
  getPieceLabel(pieceKey, edges) {
    const labels = {
      'L2piece1': `Tram: ${edges} footpaths`,
      'L2piece2': `Bus: ${edges} footpaths`,
      'L2piece3': `Train: ${edges} footpaths`,
      'L2piece4': `Metro: ${edges} footpaths`
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
      connection: 'footpath',
      connections: 'footpaths',
    };
  }

  /**
   * PublicTransport: only different-type stops can be connected
   */
  canConnectPieces(piece1, piece2) {
    return piece1.pieceType !== piece2.pieceType;
  }

  getConnectionRejectionMessage(piece1, piece2) {
    const names = {
      'L2piece1': 'Tram',
      'L2piece2': 'Bus',
      'L2piece3': 'Train',
      'L2piece4': 'Metro'
    };
    const name = names[piece1.pieceType] || 'stop';
    return `Two ${name.toLowerCase()} stops can't be connected — there's already a ${name.toLowerCase()} running between them!`;
  }

  /**
   * PublicTransport instructions
   */
  getLevelInstructions() {
    return `**Scenario:**
Sydney's public transport network needs footpaths connecting its various transit stops so that commuters can walk between different services. Each stop needs a certain number of footpaths depending on how busy it is.

**Stop types:**
• Tram — 2 footpaths
• Bus — 3 footpaths
• Train — 4 footpaths
• Metro — 5 footpaths

**Special rule:**
Footpaths can only connect stops of different types. There's no point building a footpath between two train stops when there's already a train running between them!

**How to play:**
• Drag stops from the sidebar onto the map to place them
• Click two stops to connect them with a footpath
• Click two connected stops again to remove the footpath
• Footpaths cannot cross — no tangled walkways!
• Drag a stop back to the sidebar to remove it

**Objective:**
Build a connected network of footpaths where every stop has the right number of connections and no two stops of the same type are directly linked.`;
  }
}
