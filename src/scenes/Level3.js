import { BaseLevel } from './BaseLevel.js';
// Import connection rule helpers (uncomment to use)
// import { 
//   allowAll, 
//   differentEdgesOnly, 
//   adjacentEdgesOnly,
//   hierarchicalConnections,
//   createCustomRules,
//   combineRulesAnd,
//   combineRulesOr,
//   allowSpecificEdgePairs
// } from '../helpers/ConnectionRules.js';

/**
 * Level3 - Advanced puzzle with restricted piece connections
 * Example: Only certain piece types can connect with each other
 */
export class Level3 extends BaseLevel {
  constructor() {
    super('Level3');
  }

  preload() {
    super.preload(); // Load base level assets (green-tick)
    // Load Level 3 specific assets here
    // Example:
    // this.load.image('L3piece1', 'assets/L3P1.PNG');
    // this.load.image('L3piece2', 'assets/L3P2.PNG');
    // etc.
  }

  /**
   * Define Level 3 specific pieces
   */
  getPieceTypes() {
    return [
      // Example piece definitions
      // Adjust counts, scales, and edge counts as needed
      // { key: 'L3piece1', edges: 1, count: 3, scale: 0.06, sidebarScale: 0.07 },
      // { key: 'L3piece2', edges: 2, count: 4, scale: 0.06, sidebarScale: 0.07 },
      // { key: 'L3piece3', edges: 3, count: 5, scale: 0.06, sidebarScale: 0.07 },
      // { key: 'L3piece4', edges: 4, count: 3, scale: 0.06, sidebarScale: 0.07 },
    ];
  }

  /**
   * Level 3 connection rule: restricted connections based on piece types
   * Override this method to define custom connection rules
   */
  canConnectPieces(piece1, piece2) {
    // ===== EXAMPLE 1: Use a pre-built connection rule =====
    // Uncomment to use different edge counts only
    // return differentEdgesOnly(piece1, piece2);
    
    // ===== EXAMPLE 2: Use adjacent edges only =====
    // Only allows pieces with edge counts that differ by 1
    // return adjacentEdgesOnly(piece1, piece2);
    
    // ===== EXAMPLE 3: Use hierarchical connections =====
    // Pieces with fewer edges can only connect to pieces with more edges
    // return hierarchicalConnections(piece1, piece2);
    
    // ===== EXAMPLE 4: Custom rules based on piece type keys =====
    // const myRules = createCustomRules({
    //   'L3piece1': ['L3piece2', 'L3piece3'],
    //   'L3piece2': ['L3piece1', 'L3piece4'],
    //   'L3piece3': ['L3piece1', 'L3piece4'],
    //   'L3piece4': ['L3piece2', 'L3piece3'],
    // });
    // return myRules(piece1, piece2);
    
    // ===== EXAMPLE 5: Combine multiple rules =====
    // Both rules must be true (AND logic)
    // return combineRulesAnd(differentEdgesOnly, adjacentEdgesOnly)(piece1, piece2);
    
    // ===== EXAMPLE 6: Allow specific edge pairs =====
    // Only allow 1<->2, 2<->3, and 3<->4 connections
    // return allowSpecificEdgePairs([[1, 2], [2, 3], [3, 4]])(piece1, piece2);
    
    // ===== EXAMPLE 7: Manual custom logic =====
    // Write your own logic directly
    // if (piece1.edgeCount === 1 && piece2.edgeCount === 1) {
    //   return false; // Pieces with 1 edge cannot connect to each other
    // }
    // return true;

    // Default: allow all connections (replace with your custom logic)
    return true;
  }

  /**
   * Optional: Override checkSolved if you need custom win conditions
   * For example, require a specific graph structure or pattern
   */
  // checkSolved() {
  //   const allPlaced = this.pieceTypes.every(t => t.count === 0);
  //   const allConnectedPoints = this.pieces.every(p => p.connections.length === p.edgeCount);
  //   if (!allPlaced || !allConnectedPoints) return;
  //   if (!this.isGraphConnected()) return;
  //   
  //   // Add custom win condition here
  //   // Example: Check if the graph forms a specific pattern
  //   // if (!this.hasSpecificPattern()) return;
  //   
  //   this.showSolvedScreen();
  // }
}
