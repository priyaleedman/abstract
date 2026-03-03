import { BaseLevel } from './BaseLevel.js';

/**
 * Airport - Introductory puzzle where the player builds flight routes
 * between airports of different sizes. All airports can connect freely.
 * Includes contextual tutorial hints triggered by user actions.
 */
export class Airport extends BaseLevel {
  constructor() {
    super('Airport');
  }

  preload() {
    super.preload();
    this.load.image('airstrip', 'assets/Airport.PNG');
    this.load.image('regional', 'assets/Airport.PNG');
    this.load.image('national', 'assets/Airport.PNG');
    this.load.image('hub', 'assets/Airport.PNG');
  }

  create(data) {
    this._tutorialStep = 0;
    this._tutorialStarted = false;
    this._tutorialHint = null;
    super.create(data);

    // Skip tutorial if progress was already loaded or instructions were skipped
    if (this.pieces.length > 0 || this.isViewingSolved) {
      this._tutorialStarted = true;
      this._tutorialStep = 99;
    }
  }

  getPieceTypes() {
    return [
      { key: 'airstrip', edges: 1, count: 1, scale: 0.04, sidebarScale: 0.04 },
      { key: 'regional', edges: 2, count: 2, scale: 0.06, sidebarScale: 0.06 },
      { key: 'national', edges: 3, count: 1, scale: 0.08, sidebarScale: 0.07 },
      { key: 'hub',      edges: 4, count: 1, scale: 0.10, sidebarScale: 0.08 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const labels = {
      'airstrip': `Airstrip: ${edges} route`,
      'regional': `Regional: ${edges} routes`,
      'national': `National: ${edges} routes`,
      'hub':      `Hub: ${edges} routes`
    };
    return labels[pieceKey] || `Airport: ${edges} route${edges !== 1 ? 's' : ''}`;
  }

  // Gameplay badge: top-right corner of each piece, scaled proportionally
  // Base piece is airstrip (scale 0.04). Each step up adds ~0.02 scale.
  // xOffset grows by ~20px per scale step; yOffset grows by ~18px per step.
  getBadgeOffset(piece) {
    if (piece && piece.pieceType) {
      const offsets = {
        'airstrip': { xOffset:  60, yOffset: -30 },
        'regional': { xOffset:  80, yOffset: -48 },
        'national': { xOffset:  100, yOffset: -66 },
        'hub':      { xOffset: 120, yOffset: -84 },
      };
      return offsets[piece.pieceType] || { xOffset: 52, yOffset: -30 };
    }
    return { xOffset: 52, yOffset: -30 };
  }

  // Sidebar count badge: top-right of the sidebar image, proportional to sidebarScale.
  // sidebarScales: 0.04 / 0.06 / 0.07 / 0.08 → ratios 1.0 / 1.5 / 1.75 / 2.0
  getCountLabelOffset(type) {
    if (type) {
      const offsets = {
        'airstrip': { xOffset: 60, yOffset: -22 },
        'regional': { xOffset: 75, yOffset: -36 },
        'national': { xOffset: 90, yOffset: -44 },
        'hub':      { xOffset: 100, yOffset: -52 },
      };
      return offsets[type.key] || { xOffset: 60, yOffset: -30 };
    }
    return { xOffset: 60, yOffset: -30 };
  }

  // Sidebar label: how far below the image centre to place the text.
  // Proportional to sidebarScale so larger pieces push the label further down.
  getLabelYOffset(type) {
    if (type) {
      const offsets = {
        'airstrip': 44,
        'regional': 60,
        'national': 70,
        'hub':      80,
      };
      return offsets[type.key] || 55;
    }
    return 55;
  }

  getTerminology() {
    return {
      piece: 'airport',
      pieces: 'airports',
      connection: 'flight route',
      connections: 'flight routes',
    };
  }

  canConnectPieces(piece1, piece2) {
    return true;
  }

  // --- Tutorial hint system ---

  showInstructions() {
    if (!this._tutorialStarted) {
      this._tutorialStarted = true;
      this.showTutorialHint('Drag an airport from the sidebar onto the map to get started!');
      return;
    }
    super.showInstructions();
  }

  saveProgress() {
    super.saveProgress();
  }

}
