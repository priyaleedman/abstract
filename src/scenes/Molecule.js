import { BaseLevel } from './BaseLevel.js';
import { createCustomRules } from '../helpers/ConnectionRules.js';

/**
 * Molecule - Molecular puzzle with element-specific bonding rules
 * Build caffeine (C₈H₁₀N₄O₂) following chemical bonding rules
 */
export class Molecule extends BaseLevel {
  constructor() {
    super('Molecule');
    
    this.bondingRules = createCustomRules({
      'hydrogen': ['carbon'],
      'oxygen':   ['carbon'],
      'nitrogen': ['carbon'],
      'carbon':   ['hydrogen', 'oxygen', 'nitrogen', 'carbon']
    });
  }

  preload() {
    super.preload();
    this.load.image('hydrogen', 'assets/Hydrogen.PNG');
    this.load.image('oxygen',   'assets/Oxygen.PNG');
    this.load.image('nitrogen', 'assets/Nitrogen.PNG');
    this.load.image('carbon',   'assets/Carbon.PNG');
  }

  /**
   * Caffeine (C₈H₁₀N₄O₂)
   * Hydrogen: 1 bond,  10 atoms
   * Oxygen:   2 bonds,  2 atoms
   * Nitrogen: 3 bonds,  4 atoms
   * Carbon:   4 bonds,  8 atoms
   * Total edge-ends: (1×10) + (2×2) + (3×4) + (4×8) = 58 (even) ✓
   */
  getPieceTypes() {
    return [
      { key: 'hydrogen', edges: 1, count: 10, scale: 0.04, sidebarScale: 0.07 },
      { key: 'oxygen',   edges: 2, count: 2,  scale: 0.04, sidebarScale: 0.07 },
      { key: 'nitrogen', edges: 3, count: 4,  scale: 0.04, sidebarScale: 0.07 },
      { key: 'carbon',   edges: 4, count: 8,  scale: 0.04, sidebarScale: 0.07 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const labels = {
      'hydrogen': `Hydrogen: ${edges} bond`,
      'oxygen':   `Oxygen: ${edges} bonds`,
      'nitrogen': `Nitrogen: ${edges} bonds`,
      'carbon':   `Carbon: ${edges} bonds`
    };
    return labels[pieceKey] || `Piece: ${edges} edge${edges !== 1 ? 's' : ''}`;
  }

  getBadgeOffset() {
    return { xOffset: 26, yOffset: -26 };
  }

  getLabelYOffset() {
    return 45;
  }

  getCountLabelOffset() {
    return { xOffset: 50, yOffset: -25 };
  }

  getTerminology() {
    return {
      piece: 'atom',
      pieces: 'atoms',
      connection: 'bond',
      connections: 'bonds',
    };
  }

  getConnectionRejectionMessage(piece1, piece2) {
    const names = {
      'hydrogen': 'Hydrogen',
      'oxygen':   'Oxygen',
      'nitrogen': 'Nitrogen',
      'carbon':   'Carbon'
    };
    const name1 = names[piece1.pieceType] || 'This atom';
    const name2 = names[piece2.pieceType] || 'this atom';
    return `${name1} cannot bond with ${name2}.`;
  }

  canConnectPieces(piece1, piece2) {
    return this.bondingRules(piece1, piece2);
  }

  getLevelInstructions() {
    return `**Scenario:**
You are a researcher tasked with building a caffeine molecule (C₈H₁₀N₄O₂). Bond hydrogen, carbon, nitrogen and oxygen atoms following the laws of chemistry.

**Bonding rules:**
• Carbon (C) — bonds with everything (hydrogen, oxygen, nitrogen, carbon)
• Hydrogen (H), Oxygen (O), Nitrogen (N) — only bond with carbon

**How to play:**
• Drag atoms from the sidebar onto the workspace to place them
• Click two atoms to create a bond between them
• Click two bonded atoms again to remove the bond
• Only atoms that follow the bonding rules can be connected
• Drag an atom back to the sidebar to remove it

**Planarity:**
• Bonds cannot cross — molecules are flat structures!

**Objective:**
Build a connected caffeine molecule where every atom has exactly the right number of bonds.`;
  }
}
