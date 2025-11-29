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
    // White background
    this.cameras.main.setBackgroundColor('#ffffff');

    const { centerX, centerY, width } = this.cameras.main;

    // Triangle positioning
    const topY = centerY - 200;
    const bottomY = centerY + 130;
    const horizontalOffset = width * 0.25; // spread for left/right
    const verticalLabelOffset = 140; // how far labels appear below images

    // === Level 1 (Top - Village) ===
    this.createLevelButton('Level1', centerX, topY, 'village', 0.18, verticalLabelOffset, 'Level 1', 0.5, centerX - 10, topY + 30);

    // === Level 2 (Bottom Left - Transport, shifted slightly right) ===
    const level2X = centerX - horizontalOffset + 60; // small nudge right
    this.createLevelButton('Level2', level2X, bottomY, 'transport', 0.1, verticalLabelOffset, 'Level 2', 0.1);

    // === Level 3 (Bottom Right - Chemistry) ===
    const level3X = centerX + horizontalOffset;
    this.createLevelButton('Level3', level3X, bottomY, 'chemistry', 0.2, 135, 'Level 3');

    // === Back Button ===
    const backButton = this.add.text(50, 50, 'Back', { fontSize: '20px', color: '#007BFF' })
      .setInteractive()
      .setOrigin(0, 0);
    backButton.on('pointerdown', () => this.scene.start('Start'));
  }

  /**
   * Create a level button with progress indicators
   */
  createLevelButton(levelKey, x, y, imageKey, imageScale, labelOffsetY, labelText, labelOriginX = 0.5, bgX = null, bgY = null) {
    const status = ProgressManager.getLevelStatus(levelKey);
    
    // If solved, show green background at 80% transparency
    if (status === 'solved') {
      const greenBg = this.add.image(
        bgX !== null ? bgX : x,
        bgY !== null ? bgY : y,
        'green-background'
      )
        .setScale(imageScale * 2.1)
        .setAlpha(0.4);
      greenBg.setDepth(-1);
    }

    // Level image
    const levelImage = this.add.image(x, y, imageKey)
      .setInteractive()
      .setScale(imageScale);

    // Level label
    this.add.text(x, y + labelOffsetY, labelText, { fontSize: '24px', color: '#000' })
      .setOrigin(labelOriginX);

    // If solved, show smaller green tick more right and up
    if (status === 'solved') {
      const tickOffset = (imageScale * 100); // Approximate offset based on image scale
      const tick = this.add.image(x + tickOffset + 130, y - tickOffset - 50, 'green-tick')
        .setScale(0.04) // Smaller tick
        .setOrigin(0.5);
      tick.setDepth(10);
    }

    // Click handler
    levelImage.on('pointerdown', () => this.scene.start(levelKey));
  }
}
