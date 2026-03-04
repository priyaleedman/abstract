import { BaseLevel } from './BaseLevel.js';

const FOOD_WEB_EDGES = new Set([
  'carrot-rabbit',
  'grass-rabbit',
  'grass-mouse',
  'grass-snail',
  'grains-mouse',
  'grains-bird',
  'rabbit-fox',
  'mouse-fox',
  'mouse-owl',
  'snail-mouse',
  'snail-bird',
  'bird-owl',
]);

const DISPLAY_NAMES = {
  'carrot': 'Carrots',
  'grass': 'Grass',
  'grains': 'Grains',
  'rabbit': 'Rabbits',
  'mouse': 'Mice',
  'snail': 'Snails',
  'bird': 'Birds',
  'fox': 'Foxes',
  'owl': 'Owls',
};

export class Forest extends BaseLevel {
  constructor() {
    super('Forest');
  }

  preload() {
    super.preload();
    this.load.image('carrot', 'assets/Carrot.PNG');
    this.load.image('grass', 'assets/Grass.PNG');
    this.load.image('grains', 'assets/Wheat.PNG');
    this.load.image('rabbit', 'assets/Rabbit.PNG');
    this.load.image('mouse', 'assets/Mouse.PNG');
    this.load.image('snail', 'assets/Snail.PNG');
    this.load.image('bird', 'assets/Bird.PNG');
    this.load.image('fox', 'assets/Fox.PNG');
    this.load.image('owl', 'assets/Owl.PNG');
  }

  getPieceTypes() {
    return [
      { key: 'grass',  edges: 3, count: 1, scale: 0.9, sidebarScale: 0.9 },
      { key: 'carrot', edges: 1, count: 1, scale: 2.4, sidebarScale: 2.4 },
      { key: 'grains', edges: 2, count: 1, scale: 0.06, sidebarScale: 0.06 },
      { key: 'rabbit', edges: 3, count: 1, scale: 4.5, sidebarScale: 4.5 },
      { key: 'mouse',  edges: 5, count: 1, scale: 0.05, sidebarScale: 0.05 },
      { key: 'snail',  edges: 3, count: 1, scale: 5, sidebarScale: 5 },
      { key: 'bird',   edges: 3, count: 1, scale: 7, sidebarScale: 7 },
      { key: 'fox',    edges: 2, count: 1, scale: 2.2, sidebarScale: 2.2 },
      { key: 'owl',    edges: 2, count: 1, scale: 0.065, sidebarScale: 0.065 },
    ];
  }

  getPieceLabel(pieceKey, edges) {
    const name = DISPLAY_NAMES[pieceKey] || pieceKey;
    return `${name}: ${edges} link${edges !== 1 ? 's' : ''}`;
  }

  getBadgeOffset() {
    return { xOffset: 50, yOffset: -50 };
  }

  getLabelYOffset() {
    return 52;
  }

  showSidebarCount() {
    return false;
  }

  getTerminology() {
    return {
      piece: 'organism',
      pieces: 'organisms',
      connection: 'link',
      connections: 'links',
    };
  }

  allowEdgeCrossing() {
    return true;
  }

  canConnectPieces(piece1, piece2) {
    const key1 = `${piece1.pieceType}-${piece2.pieceType}`;
    const key2 = `${piece2.pieceType}-${piece1.pieceType}`;
    return FOOD_WEB_EDGES.has(key1) || FOOD_WEB_EDGES.has(key2);
  }

  getConnectionRejectionMessage(piece1, piece2) {
    const n1 = DISPLAY_NAMES[piece1.pieceType] || piece1.pieceType;
    const n2 = DISPLAY_NAMES[piece2.pieceType] || piece2.pieceType;
    return `${n1} and ${n2} are not connected in this food web.`;
  }

  // ── Scrollable sidebar ──────────────────────────────────────────────

  setupSidebar(sidebarX) {
    const total = this.pieceTypes.length;
    const spacing = 140;
    const contentStartY = 100;
    const visibleTop = 50;
    const visibleBottom = 750;
    const visibleHeight = visibleBottom - visibleTop;
    const lastLabelBottom = contentStartY + (total - 1) * spacing + this.getLabelYOffset() + 30;
    const contentHeight = lastLabelBottom;

    this.sidebarCounters = [];
    this.sidebarPieces = [];
    this._scrollItems = [];
    this._scrollOffset = 0;
    this._maxScroll = Math.max(0, contentHeight - visibleHeight);

    const maskGfx = this.make.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(1030, visibleTop, 250, visibleHeight);
    const sidebarMask = maskGfx.createGeometryMask();

    this.pieceTypes.forEach((type, i) => {
      const baseY = contentStartY + spacing * i;

      const piece = this.add.image(sidebarX, baseY, type.key)
        .setScale(type.sidebarScale)
        .setInteractive({ useHandCursor: true, draggable: true })
        .setMask(sidebarMask);

      this.sidebarPieces.push(piece);
      this.input.setDraggable(piece);
      this.sidebarCounters.push(null);

      const labelText = this.getPieceLabel(type.key, type.edges);
      const labelYOff = this.getLabelYOffset(type);
      const label = this.add.text(sidebarX, baseY + labelYOff, labelText, {
        fontSize: '14px', color: '#999999', align: 'center'
      }).setOrigin(0.5, 0).setMask(sidebarMask);

      if (type.count === 0) piece.setTint(0x888888);

      this._scrollItems.push({ obj: piece, baseY });
      this._scrollItems.push({ obj: label, baseY: baseY + labelYOff });

      const baseSidebarScale = type.sidebarScale;
      piece.on('pointerover', () => {
        if (type.count > 0 && !piece._sidebarDragging) {
          piece.setScale(baseSidebarScale * 1.15);
        }
      });
      piece.on('pointerout', () => {
        if (!piece._sidebarDragging) piece.setScale(baseSidebarScale);
      });

      piece._sidebarDragging = false;
      piece._ghostPiece = null;

      piece.on('dragstart', (pointer) => {
        if (type.count <= 0) return;
        piece._sidebarDragging = true;
        this._anyPieceDragging = true;
        const ghost = this.add.image(pointer.x, pointer.y, type.key)
          .setScale(type.scale).setDepth(10).setAlpha(0.7);
        piece._ghostPiece = ghost;
      });

      piece.on('drag', (pointer, dragX, dragY) => {
        if (!piece._sidebarDragging || !piece._ghostPiece) return;
        piece._ghostPiece.x = dragX;
        piece._ghostPiece.y = dragY;
        piece.x = sidebarX;
        piece.y = baseY - this._scrollOffset;
      });

      piece.on('dragend', () => {
        if (!piece._sidebarDragging) return;
        piece._sidebarDragging = false;
        this._anyPieceDragging = false;
        piece.setScale(baseSidebarScale);

        const ghost = piece._ghostPiece;
        piece._ghostPiece = null;
        if (!ghost) return;

        const dropX = ghost.x;
        const dropY = ghost.y;
        ghost.destroy();

        const inGameplay = dropX >= this.gameplayBounds.minX && dropX <= this.gameplayBounds.maxX &&
                           dropY >= this.gameplayBounds.minY && dropY <= this.gameplayBounds.maxY;

        if (inGameplay && type.count > 0) {
          this.spawnPiece(type, dropX, dropY);
          type.count -= 1;
          if (type.count === 0) piece.setTint(0x888888);
          this.saveProgress();
        }
      });
    });

    // Use a DOM-level wheel listener so it doesn't conflict with
    // the Phaser wheel listener used by the instructions overlay.
    this._sidebarWheelHandler = (event) => {
      const rect = this.game.canvas.getBoundingClientRect();
      const scaleX = this.game.canvas.width / rect.width;
      const pointerX = (event.clientX - rect.left) * scaleX;

      if (pointerX >= 1280 - 250 && this._maxScroll > 0) {
        this._scrollOffset = Phaser.Math.Clamp(
          this._scrollOffset + event.deltaY * 0.5, 0, this._maxScroll
        );
        this._scrollItems.forEach(item => {
          item.obj.y = item.baseY - this._scrollOffset;
        });
      }
    };

    this.game.canvas.addEventListener('wheel', this._sidebarWheelHandler);
    this.events.once('shutdown', () => {
      this.game.canvas.removeEventListener('wheel', this._sidebarWheelHandler);
    });
    this.events.once('destroy', () => {
      this.game.canvas.removeEventListener('wheel', this._sidebarWheelHandler);
    });
  }

  // ── Instructions ────────────────────────────────────────────────────

  getLevelInstructions() {
    return `Welcome to the Food Web!

**Scenario:**
In this ecosystem, organisms are connected through feeding relationships. Each link in the web represents a "who eats whom" relationship.

**Who eats what:**
• Rabbits eat carrots and grass
• Snails eat grass
• Mice eat grass, grains, and snails
• Birds eat grains and snails
• Foxes eat rabbits and mice
• Owls eat mice and birds

**How to play:**
• Drag organisms from the sidebar onto the play area
• Click two organisms to create a link between them
• Only organisms with a feeding relationship can be linked
• Click a link to remove it
• Links are allowed to cross each other
• Drag an organism back to the sidebar to remove it
• Scroll the sidebar to see all organisms

**Objective:**
Build the complete food web where every organism has exactly the right number of links.`;
  }
}
