import { BaseLevel } from './BaseLevel.js';
import { createCustomRules } from '../helpers/ConnectionRules.js';

/**
 * Level3 - Molecular puzzle with element-specific bonding rules
 * Build the N-terminus cysteine of a protein following chemical bonding rules
 */
export class Level3 extends BaseLevel {
  constructor() {
    super('Level3');
    
    // Define molecular bonding rules
    this.bondingRules = createCustomRules({
      'L3piece1': ['L3piece5', 'L3piece4'], // Hydrogen: carbon, nitrogen
      'L3piece2': ['L3piece5'],              // Oxygen: carbon
      'L3piece3': ['L3piece5'],              // Sulfur: carbon
      'L3piece4': ['L3piece5', 'L3piece1'], // Nitrogen: carbon, hydrogen
      'L3piece5': ['L3piece1', 'L3piece2', 'L3piece3', 'L3piece4', 'L3piece5'] // Carbon: everything
    });
  }

  preload() {
    super.preload(); // Load base level assets (green-tick)
    this.load.image('L3piece1', 'assets/L3P1.PNG');
    this.load.image('L3piece2', 'assets/L3P2.PNG');
    this.load.image('L3piece3', 'assets/L3P3.PNG');
    this.load.image('L3piece4', 'assets/L3P4.PNG');
    this.load.image('L3piece5', 'assets/L3P5.PNG');
  }

  /**
   * Define Level 3 specific pieces representing molecular elements
   * L3P1: Hydrogen (1 edge, 17 pieces)
   * L3P2: Oxygen (1 edge, 7 pieces)
   * L3P3: Sulfur (2 edges, 1 piece)
   * L3P4: Nitrogen (3 edges, 12 pieces)
   * L3P5: Carbon (4 edges, 37 pieces)
   * Total edges: (1*17) + (1*7) + (2*1) + (3*12) + (4*37) = 17 + 7 + 2 + 36 + 148 = 210 (even) ✓
   */
  getPieceTypes() {
    return [
      { key: 'L3piece1', edges: 1, count: 17, scale: 0.03, sidebarScale: 0.07 }, // Hydrogen
      { key: 'L3piece2', edges: 1, count: 7, scale: 0.03, sidebarScale: 0.07 },  // Oxygen
      { key: 'L3piece3', edges: 2, count: 1, scale: 0.03, sidebarScale: 0.07 },  // Sulfur
      { key: 'L3piece4', edges: 3, count: 12, scale: 0.03, sidebarScale: 0.07 }, // Nitrogen
      { key: 'L3piece5', edges: 4, count: 37, scale: 0.03, sidebarScale: 0.07 }, // Carbon
    ];
  }

  /**
   * Level 3 piece labels - customize the sidebar labels
   */
  getPieceLabel(pieceKey, edges) {
    const labels = {
      'L3piece1': `Hydrogen: ${edges} bond`,
      'L3piece2': `Oxygen: ${edges} bond`,
      'L3piece3': `Sulfur: ${edges} bonds`,
      'L3piece4': `Nitrogen: ${edges} bonds`,
      'L3piece5': `Carbon: ${edges} bonds`
    };
    return labels[pieceKey] || `Piece: ${edges} edge${edges !== 1 ? 's' : ''}`;
  }

  /**
   * Override label Y offset for Level 3 (pieces are smaller, so bring label closer)
   */
  getLabelYOffset() {
    return 42; // Smaller offset for Level 3's smaller pieces
  }

  /**
   * Override count label position for Level 3 (make it lower)
   */
  getCountLabelOffset() {
    return { xOffset: 55, yOffset: -20 }; // Lower than default
  }

  getTerminology() {
    return {
      piece: 'atom',
      pieces: 'atoms',
      connection: 'bond',
      connections: 'bonds',
    };
  }

  /**
   * Custom rejection message for invalid molecular bonds
   */
  getConnectionRejectionMessage(piece1, piece2) {
    const names = {
      'L3piece1': 'Hydrogen',
      'L3piece2': 'Oxygen',
      'L3piece3': 'Sulfur',
      'L3piece4': 'Nitrogen',
      'L3piece5': 'Carbon'
    };
    const name1 = names[piece1.pieceType] || 'This atom';
    const name2 = names[piece2.pieceType] || 'this atom';
    return `${name1} cannot bond with ${name2}.`;
  }

  /**
   * Level 3 connection rule: elements can only bond according to molecular rules
   * Hydrogen: carbon, nitrogen
   * Oxygen: carbon
   * Sulfur: carbon
   * Nitrogen: carbon, hydrogen
   * Carbon: everything
   */
  canConnectPieces(piece1, piece2) {
    return this.bondingRules(piece1, piece2);
  }

  /**
   * Level 3 instructions
   */
  getLevelInstructions() {
    return `**Objective:**  You are a researcher in a molecular biology lab tasked with building the N-terminus cysteine of a protein. You must correctly bond hydrogen, carbon, nitrogen, oxygen and sulfur atoms following the laws of chemistry.

**How to Play:**
• Drag atoms from the sidebar onto the workspace to place them
• Click two atoms to create a bond between them
• Click a bond to remove it
• Each atom can only bond with specific other elements (see rules below)
• Bonds cannot cross
• Atoms cannot overlap each other or be placed on top of bonds
• Drag an atom back to the sidebar to remove it

**Bonding Rules:**
• Hydrogen (H): bonds with carbon, nitrogen
• Oxygen (O): bonds with carbon
• Sulfur (S): bonds with carbon
• Nitrogen (N): bonds with carbon, hydrogen
• Carbon (C): bonds with everything

**Win Condition:**  All atoms placed and fully connected following the bonding rules.`;
  }
}
