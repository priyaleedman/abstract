import { ProgressManager } from '../helpers/ProgressManager.js';

export class Map extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  preload() {
    // Load images for all levels
    this.load.image('village', 'assets/piece4.png');
    this.load.image('transport', 'assets/L2P2.PNG');
    this.load.image('chemistry', 'assets/molecule.PNG');
    this.load.image('green-tick', 'assets/green-tick.PNG');
    this.load.image('green-background', 'assets/green-background.png');
  }

  create() {
    // ============ TEMPORARY: Auto-mark levels as solved for testing ============
    // TODO: REMOVE THIS BEFORE PRODUCTION!
    // ProgressManager.markLevelSolved('Level1', { pieces: [], edges: [], pieceTypeCounts: [] });
    //ProgressManager.markLevelSolved('Level2', { pieces: [], edges: [], pieceTypeCounts: [] });
    //ProgressManager.markLevelSolved('Level3', { pieces: [], edges: [], pieceTypeCounts: [] });
    // ===========================================================================

    // White background
    this.cameras.main.setBackgroundColor('#ffffff');

    const { centerX, centerY, width } = this.cameras.main;

    // Triangle positioning
    const topY = centerY - 200;
    const bottomY = centerY + 130;
    const horizontalOffset = width * 0.25; // spread for left/right
    const verticalLabelOffset = 140; // how far labels appear below images

    // === Level 1 (Top - Village) ===
    this.createLevelButton('Level1', centerX, topY, 'village', 0.18, verticalLabelOffset, 'Crossroads and cott-edge-s', 0.5, centerX - 10, topY + 50, 2.1);

    // === Level 2 (Bottom Left - Transport, shifted slightly right) ===
    const level2X = centerX - horizontalOffset + 60; // small nudge right
    this.createLevelButton('Level2', level2X, bottomY, 'transport', 0.1, verticalLabelOffset, 'Quicker to bi-cycle', 0.1, level2X + 40, bottomY + 60, 3.3);

    // === Level 3 (Bottom Right - Chemistry) ===
    const level3X = centerX + horizontalOffset;
    this.createLevelButton('Level3', level3X, bottomY, 'chemistry', 0.2, 135, 'Can\'t say no[de] to coffee', 0.5, level3X - 10, bottomY + 30, 1.8, level3X + 120, bottomY - 70);

    // === Back Button ===
    const backButton = this.add.text(30, 30, 'Back', { fontSize: '24px', fill: '#007bff' })
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
   * Create a level button with progress indicators
   */
  createLevelButton(levelKey, x, y, imageKey, imageScale, labelOffsetY, labelText, labelOriginX = 0.5, bgX = null, bgY = null, bgScaleMultiplier = 2.1, tickXOffset = null, tickYOffset = null) {
    const status = ProgressManager.getLevelStatus(levelKey);
    
    // If solved, show green background at 80% transparency
    if (status === 'solved') {
      const greenBg = this.add.image(
        bgX !== null ? bgX : x,
        bgY !== null ? bgY : y,
        'green-background'
      )
        .setScale(imageScale * bgScaleMultiplier)
        .setAlpha(0.4);
      greenBg.setDepth(-1);
    }

    // Level image
    const levelImage = this.add.image(x, y, imageKey)
      .setInteractive({ useHandCursor: true })
      .setScale(imageScale);

    // Level label
    const label = this.add.text(x, y + labelOffsetY, labelText, { fontSize: '24px', color: '#000' })
      .setOrigin(labelOriginX);

    // Hover effect for level buttons
    levelImage.on('pointerover', () => {
      levelImage.setScale(imageScale * 1.1);
      label.setStyle({ fontStyle: 'bold' });
    });
    levelImage.on('pointerout', () => {
      levelImage.setScale(imageScale);
      label.setStyle({ fontStyle: 'normal' });
    });

    // If solved, show smaller green tick more right and up
    if (status === 'solved') {
      const tickOffset = (imageScale * 100); // Approximate offset based on image scale
      const defaultTickX = x + tickOffset + 130;
      const defaultTickY = y - tickOffset - 50;
      const tick = this.add.image(
        tickXOffset !== null ? tickXOffset : defaultTickX, 
        tickYOffset !== null ? tickYOffset : defaultTickY, 
        'green-tick'
      )
        .setScale(0.04) // Smaller tick
        .setOrigin(0.5);
      tick.setDepth(10);
    }

    // Click handler
    levelImage.on('pointerdown', () => this.scene.start(levelKey));
  }
}
