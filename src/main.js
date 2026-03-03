import { Start } from './scenes/Start.js';
import { Map } from './scenes/Map.js';
import { Airport } from './scenes/Airport.js';
import { Settlements } from './scenes/Settlements.js';
import { PublicTransport } from './scenes/PublicTransport.js';
import { Molecule } from './scenes/Molecule.js';
import { SocialNetwork } from './scenes/SocialNetwork.js';

const config = {
  type: Phaser.AUTO,
  title: 'Abstract',
  description: '',
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#ffffff',
  pixelArt: true,
  scene: [
    Start,
    Map,
    Airport,
    SocialNetwork,
    Settlements,
    PublicTransport,
    Molecule
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
};

new Phaser.Game(config);
