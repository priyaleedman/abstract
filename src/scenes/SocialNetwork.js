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
    return `**Scenario:**
Five friends — Alice, Bob, Carol, David, and Ed — are in a social group. Each person has a certain number of close friendships.

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
• Friendships cannot cross — people talk behind each other's backs enough already!
• Drag a person back to the sidebar to remove them

**Objective:**
Build a connected social network where everyone has exactly the right number of friends.`;
  }
}
