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
    this.load.image('airstrip', 'assets/Airport1.PNG');
    this.load.image('regional', 'assets/Airport2.PNG');
    this.load.image('national', 'assets/Airport3.PNG');
    this.load.image('hub', 'assets/Airport4.PNG');
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
      { key: 'airstrip', edges: 1, count: 1, scale: 0.1, sidebarScale: 0.09 },
      { key: 'regional', edges: 2, count: 2, scale: 0.09, sidebarScale: 0.08 },
      { key: 'national', edges: 3, count: 1, scale: 0.09, sidebarScale: 0.07 },
      { key: 'hub',      edges: 4, count: 1, scale: 0.08, sidebarScale: 0.07 },
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

  getTerminology() {
    return {
      piece: 'airport',
      pieces: 'airports',
      connection: 'flight route',
      connections: 'flight routes',
    };
  }

  getBadgeOffset() {
    return { xOffset: -70, yOffset: -40 };
  }

  getCountLabelOffset() {
    return { xOffset: 75, yOffset: -30 };
  }

  getLabelYOffset() {
    return 55;
  }

  usePixelPerfectHit() {
    return false;
  }

}
