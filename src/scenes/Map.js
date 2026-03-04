import { ProgressManager } from '../helpers/ProgressManager.js';

export class Map extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  preload() {
    this.load.image('village', 'assets/piece4.png');
    this.load.image('transport', 'assets/L2P2.PNG');
    this.load.image('chemistry', 'assets/molecule.PNG');
    this.load.image('green-tick', 'assets/green-tick.PNG');
    this.load.image('green-background', 'assets/green-background.png');
    this.load.image('apple', 'assets/apple.png');
    this.load.image('airport', 'assets/Airport.PNG');
    this.load.image('alice-icon', 'assets/Alice.PNG');
    this.load.image('powertower', 'assets/PowerTower.PNG');
    this.load.image('snail-icon', 'assets/Snail.PNG');
    this.load.image('city-icon', 'assets/City.PNG');
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    const { width, height } = this.cameras.main;
    const centerX = width / 2;

    // Determine which levels are unlocked: first 3 unsolved in order
    const unlockOrder = [
      'Airport', 'SocialNetwork', 'PowerGrid', 'Forest',
      'Cities', 'Settlements', 'PublicTransport', 'Molecule'
    ];
    const unlockedKeys = new Set();
    let unsolvedCount = 0;
    for (const key of unlockOrder) {
      const status = ProgressManager.getLevelStatus(key);
      if (status === 'solved') {
        unlockedKeys.add(key);
      } else if (unsolvedCount < 3) {
        unlockedKeys.add(key);
        unsolvedCount++;
      }
    }

    // === Row 1 — Easy levels (top, y ≈ 130) ===
    const row1Y = 130;
    const row1Spacing = width / 4;

    this.createLevelButton({
      levelKey: 'Airport', x: row1Spacing, y: row1Y,
      imageKey: 'airport', imageScale: 0.08,
      label: 'Clear for take-off!',
      labelOffsetY: 85, locked: !unlockedKeys.has('Airport'),
      bgScale: 2.8, bgOffsetX: 15, bgOffsetY: 25,
      tickOffsetX: 110, tickOffsetY: -40
    });

    this.createLevelButton({
      levelKey: 'SocialNetwork', x: centerX, y: row1Y,
      imageKey: 'alice-icon', imageScale: 0.38,
      label: 'It\'s who you know',
      labelOffsetY: 85, locked: !unlockedKeys.has('SocialNetwork'),
      bgScale: 0.6, bgOffsetX: 10, bgOffsetY: 25,
      tickOffsetX: 70, tickOffsetY: -40
    });

    this.createLevelButton({
      levelKey: 'PowerGrid', x: width - row1Spacing, y: row1Y,
      imageKey: 'powertower', imageScale: 0.07,
      label: 'Watt a connection!', labelOffsetY: 80,
      bgScale: 3, bgOffsetY: 30, tickOffsetX: 60,
      locked: !unlockedKeys.has('PowerGrid')
    });

    // === Row 2 — Easy levels (middle, y ≈ 330) ===
    const row2Y = 330;
    const row2Offset = width / 3;

    this.createLevelButton({
      levelKey: 'Forest', x: row2Offset, y: row2Y,
      imageKey: 'snail-icon', imageScale: 8,
      label: 'Leaf no node unturned',
      labelOffsetY: 75, locked: !unlockedKeys.has('Forest'),
      bgScale: 0.028, bgOffsetY: 20,
      tickOffsetX: 70, tickOffsetY: -40
    });

    this.createLevelButton({
      levelKey: 'Cities', x: width - row2Offset, y: row2Y,
      imageKey: 'city-icon', imageScale: 0.16,
      label: 'Highway to the\ngraph zone',
      labelOffsetY: 75, locked: !unlockedKeys.has('Cities'),
      bgScale: 1.4, bgOffsetY: 50,
      tickOffsetX: 65, tickOffsetY: -25
    });

    // === Row 3 — Hard levels (bottom, y ≈ 555) ===
    const row3Y = 555;
    const row3Spacing = width / 4;

    this.createLevelButton({
      levelKey: 'Settlements', x: row3Spacing - 30, y: row3Y,
      imageKey: 'village', imageScale: 0.10,
      label: 'Crossroads and\ncott-edge-s',
      labelOffsetY: 75, locked: !unlockedKeys.has('Settlements'),
      bgScale: 2.4, bgOffsetX: -5, bgOffsetY: 20,
      tickOffsetX: 90, tickOffsetY: -50
    });

    this.createLevelButton({
      levelKey: 'PublicTransport', x: centerX, y: row3Y - 25,
      imageKey: 'transport', imageScale: 0.05,
      label: 'Quicker to bi-cycle',
      labelOffsetY: 80, locked: !unlockedKeys.has('PublicTransport'),
      bgScale: 4.2, bgOffsetX: 20, bgOffsetY: 35,
      tickOffsetX: 90, tickOffsetY: -32
    });

    this.createLevelButton({
      levelKey: 'Molecule', x: width - row3Spacing + 30, y: row3Y,
      imageKey: 'chemistry', imageScale: 0.11,
      label: "Can't say no[de]\nto coffee",
      labelOffsetY: 70, locked: !unlockedKeys.has('Molecule'),
      bgScale: 2, bgOffsetX: -10, bgOffsetY: 15,
      tickOffsetX: 70, tickOffsetY: -40
    });

    // === Back Button ===
    const backButton = this.add.text(30, 30, 'Back', {
      fontSize: '24px', fill: '#007bff'
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0, 0.5);
    backButton.on('pointerover', () => {
      backButton.setScale(1.08);
      backButton.setStyle({ fontStyle: 'bold' });
    });
    backButton.on('pointerout', () => {
      backButton.setScale(1);
      backButton.setStyle({ fontStyle: 'normal' });
    });
    backButton.on('pointerdown', () => this.scene.start('Start'));
  }

  /**
   * Create a level button with progress indicators.
   * @param {Object} opts
   * @param {string} opts.levelKey - Scene key
   * @param {number} opts.x - X position
   * @param {number} opts.y - Y position
   * @param {string} opts.imageKey - Preloaded image key
   * @param {number} opts.imageScale - Display scale for the image
   * @param {string} opts.label - Text shown beneath the image
   * @param {boolean} [opts.placeholder] - If true, shows "Coming Soon" on click
   * @param {boolean} [opts.locked] - If true, level is greyed out and non-interactive
   * @param {number} [opts.bgScale] - Green background scale multiplier (relative to imageScale)
   * @param {number} [opts.bgOffsetX] - Green background X offset from image center
   * @param {number} [opts.bgOffsetY] - Green background Y offset from image center
   * @param {number} [opts.labelOffsetY] - Y offset for label below image (default 55)
   * @param {number} [opts.tickOffsetX] - Green tick X offset from image center
   * @param {number} [opts.tickOffsetY] - Green tick Y offset from image center
   */
  createLevelButton(opts) {
    const {
      levelKey, x, y, imageKey, imageScale, label,
      placeholder = false, locked = false, labelOffsetY = 55,
      bgScale = 2.1, bgOffsetX = 0, bgOffsetY = 0,
      tickOffsetX = 80, tickOffsetY = -40
    } = opts;

    const status = ProgressManager.getLevelStatus(levelKey);

    if (status === 'solved') {
      this.add.image(x + bgOffsetX, y + bgOffsetY, 'green-background')
        .setScale(imageScale * bgScale)
        .setAlpha(0.4)
        .setDepth(-1);
    }

    const levelImage = this.add.image(x, y, imageKey)
      .setScale(imageScale);

    const labelText = this.add.text(x, y + labelOffsetY, label, {
      fontSize: '16px', color: '#666666', align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0);

    if (locked) {
      levelImage.setTint(0x555555).setAlpha(0.98);
      labelText.setVisible(false);
      return;
    }

    levelImage.setInteractive({ useHandCursor: true });

    levelImage.on('pointerover', () => {
      levelImage.setScale(imageScale * 1.1);
      labelText.setStyle({ fontStyle: 'bold' });
    });
    levelImage.on('pointerout', () => {
      levelImage.setScale(imageScale);
      labelText.setStyle({ fontStyle: 'normal' });
    });

    if (status === 'solved') {
      this.add.image(x + tickOffsetX, y + tickOffsetY, 'green-tick')
        .setScale(0.04)
        .setOrigin(0.5)
        .setDepth(10);
    }

    if (placeholder) {
      levelImage.on('pointerdown', () => this.showComingSoon(x, y));
    } else {
      levelImage.on('pointerdown', () => this.scene.start(levelKey));
    }
  }

  showComingSoon(x, y) {
    if (this._comingSoon) {
      this._comingSoon.bg.destroy();
      this._comingSoon.text.destroy();
      if (this._comingSoon.timer) this._comingSoon.timer.remove();
    }

    const text = this.add.text(x, y - 60, 'Coming Soon!', {
      fontSize: '18px', color: '#555', fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5).setDepth(50);

    const bg = this.add.rectangle(x, y - 60, text.width + 24, text.height + 12, 0xf0f0f0)
      .setStrokeStyle(1, 0xcccccc).setDepth(49);

    this._comingSoon = { bg, text };
    this._comingSoon.timer = this.time.delayedCall(1500, () => {
      bg.destroy();
      text.destroy();
      this._comingSoon = null;
    });
  }
}
