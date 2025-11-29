import { Start } from './scenes/Start.js';
import { Map } from './scenes/Map.js';
import { Level1 } from './scenes/Level1.js';
import { Level2 } from './scenes/Level2.js';
import { Level3 } from './scenes/Level3.js';

const config = {
  type: Phaser.AUTO,
  title: 'Overlord Rising',
  description: '',
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  pixelArt: true,
  scene: [
    Start,
    Map,
    Level1,
    Level2,
    Level3
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
};

new Phaser.Game(config);
