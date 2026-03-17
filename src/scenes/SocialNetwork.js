import { BaseLevel } from './BaseLevel.js';

export class SocialNetwork extends BaseLevel {
  constructor() {
    super('SocialNetwork');
  }

  preload() {
    super.preload();
    this.load.image('alice', 'assets/Alice.PNG');
    this.load.image('bob', 'assets/Bob.PNG');
    this.load.image('carol', 'assets/Carol.PNG');
    this.load.image('david', 'assets/David.PNG');
    this.load.image('ed', 'assets/Ed.PNG');
  }

  getPieceTypes() {
    return [
      { key: 'alice', edges: 2, count: 1, scale: 0.3, sidebarScale: 0.22 },
      { key: 'bob',   edges: 3, count: 1, scale: 0.3, sidebarScale: 0.22 },
      { key: 'carol', edges: 2, count: 1, scale: 0.3, sidebarScale: 0.22 },
      { key: 'david',  edges: 1, count: 1, scale: 0.3, sidebarScale: 0.22 },
      { key: 'ed',    edges: 2, count: 1, scale: 0.3, sidebarScale: 0.22 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const names = {
      'alice': 'Alice',
      'bob': 'Bob',
      'carol': 'Carol',
      'david': 'David',
      'ed': 'Ed'
    };
    const name = names[pieceKey] || pieceKey;
    return `${name}: ${edges} friend${edges !== 1 ? 's' : ''}`;
  }

  getPieceName(pieceKey) {
    const names = { alice: 'Alice', bob: 'Bob', carol: 'Carol', david: 'David', ed: 'Ed' };
    return names[pieceKey] || pieceKey;
  }

  getBadgeOffset(piece) {
    return { xOffset: 45, yOffset: -60 };
  }

  getCountLabelOffset(type) {
    return { xOffset: 90, yOffset: -50 };
  }

  getLabelYOffset(type) {
    return 48;
  }

  showSidebarCount() {
    return false;
  }

  getTerminology() {
    return {
      piece: 'person',
      pieces: 'people',
      connection: 'friendship',
      connections: 'friendships',
    };
  }

  canConnectPieces(piece1, piece2) {
    return true;
  }

  allowEdgeCrossing() {
    return true;
  }

  create(data) {
    // Must initialise hint state BEFORE super.create() because loadProgress()
    // calls spawnPiece() → onPiecePlaced() which reads _hintDismissed.
    this._hintDismissed = {
      drag: localStorage.getItem('hint_drag_dismissed') === 'true',
      connect: localStorage.getItem('hint_connect_dismissed') === 'true',
    };
    this._restoringProgress = true;
    super.create(data);
    this._restoringProgress = false;

    // Show first hint after a short delay if not already dismissed
    // and no pieces were restored from saved progress
    if (!this._hintDismissed.drag && !this.isViewingSolved && this.pieces.length === 0) {
      this.time.delayedCall(500, () => this.showHint('Try dragging a person from the sidebar to place them on the board.'));
    }
  }

  showHint(message) {
    this.dismissHint();
    const centerX = this.gameplayBounds
      ? (this.gameplayBounds.minX + this.gameplayBounds.maxX) / 2
      : 540;
    const text = this.add.text(centerX, 92, message, {
      fontSize: '18px', color: '#000', align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5, 0.5).setDepth(50);
    const padding = 16;
    const bg = this.add.rectangle(centerX, 92,
      text.width + padding * 2, text.height + padding,
      0xd4edda
    ).setStrokeStyle(1, 0xc3e6cb).setDepth(49);
    this._hint = { bg, text };
  }

  dismissHint() {
    if (this._hint) {
      this._hint.bg.destroy();
      this._hint.text.destroy();
      this._hint = null;
    }
  }

  onPiecePlaced(piece) {
    if (this._restoringProgress) return;
    if (!this._hintDismissed.drag) {
      this._hintDismissed.drag = true;
      localStorage.setItem('hint_drag_dismissed', 'true');
      this.dismissHint();
    }
    // Show connect hint once there are 2+ pieces on the board
    if (!this._hintDismissed.connect && this.pieces.length >= 2) {
      this.showHint('Now click two people to create a friendship between them.');
    }
  }

  onEdgeCreated(piece1, piece2) {
    if (!this._hintDismissed.connect) {
      this._hintDismissed.connect = true;
      localStorage.setItem('hint_connect_dismissed', 'true');
      this.dismissHint();
    }
  }

  getLevelInstructions() {
    return `**Scenario:**
You have just moved to a new town and are trying to figure out who is friends with whom. Five people — Alice, Bob, Carol, David, and Ed — are in a social group, and each person has a certain number of close friendships. Can you piece together the social network?

**Friendships:**
• Alice — 2 friends
• Bob — 3 friends
• Carol — 2 friends
• David — 1 friend
• Ed — 2 friends

**How to play:**
• Drag people from the sidebar onto the play area
• Click two people to create a friendship between them
• Click two connected people again to remove the friendship
• Drag a person back to the sidebar to remove them

**Objective:**
Build a connected social network where everyone has exactly the right number of friends.`;
  }
}
