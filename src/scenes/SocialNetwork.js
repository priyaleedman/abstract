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

  getLevelInstructions() {
    return `Welcome to the Social Network!

**Scenario:**
Five friends — Alice, Bob, Carol, David, and Ed — are in a social group. Each person has a certain number of friends.

**Your task:**
Reconstruct their social network by placing each person on the board and connecting friends together.

**Clues:**
• Alice has 2 friends
• Bob has 3 friends
• Carol has 2 friends
• David has 1 friend
• Ed has 2 friends

**How to play:**
• Drag each person from the sidebar onto the play area
• Click two people to create a friendship between them
• Click a friendship to remove it
• Friendships cannot cross each other
• Drag a person back to the sidebar to remove them

**Objective:**
Create a connected social network where everyone has exactly the right number of friends.`;
  }
}
