/**
 * ConnectionRules - Reusable connection rule patterns for puzzle levels
 * These helper functions can be used in the canConnectPieces() method of any level
 */

/**
 * Allow all pieces to connect with each other (no restrictions)
 */
export const allowAll = (piece1, piece2) => {
  return true;
};

/**
 * Prevent pieces with the same edge count from connecting
 * Example: A piece with 2 edges cannot connect to another piece with 2 edges
 */
export const differentEdgesOnly = (piece1, piece2) => {
  return piece1.edgeCount !== piece2.edgeCount;
};

/**
 * Only allow pieces with adjacent edge counts to connect
 * Example: 1-edge can connect to 2-edge, 2-edge to 1-edge or 3-edge, etc.
 */
export const adjacentEdgesOnly = (piece1, piece2) => {
  const diff = Math.abs(piece1.edgeCount - piece2.edgeCount);
  return diff === 1;
};

/**
 * Pieces with fewer edges can only connect to pieces with more edges
 * Creates a hierarchical connection pattern
 */
export const hierarchicalConnections = (piece1, piece2) => {
  const minEdges = Math.min(piece1.edgeCount, piece2.edgeCount);
  const maxEdges = Math.max(piece1.edgeCount, piece2.edgeCount);
  return maxEdges > minEdges;
};

/**
 * Create custom rules based on specific piece type keys
 * @param {Object} rules - Mapping of piece keys to allowed connection keys
 * @returns {Function} A connection rule function
 * 
 * Example usage:
 * const myRules = createCustomRules({
 *   'piece1': ['piece2', 'piece3'],
 *   'piece2': ['piece1', 'piece4'],
 *   'piece3': ['piece1', 'piece4'],
 *   'piece4': ['piece2', 'piece3'],
 * });
 */
export const createCustomRules = (rules) => {
  return (piece1, piece2) => {
    const allowedForPiece1 = rules[piece1.pieceType] || [];
    const allowedForPiece2 = rules[piece2.pieceType] || [];
    
    return allowedForPiece1.includes(piece2.pieceType) || 
           allowedForPiece2.includes(piece1.pieceType);
  };
};

/**
 * Combine multiple connection rules with AND logic (all must be true)
 * @param {...Function} rules - Connection rule functions to combine
 * @returns {Function} Combined connection rule function
 * 
 * Example usage:
 * canConnectPieces(piece1, piece2) {
 *   return combineRulesAnd(differentEdgesOnly, hierarchicalConnections)(piece1, piece2);
 * }
 */
export const combineRulesAnd = (...rules) => {
  return (piece1, piece2) => {
    return rules.every(rule => rule(piece1, piece2));
  };
};

/**
 * Combine multiple connection rules with OR logic (at least one must be true)
 * @param {...Function} rules - Connection rule functions to combine
 * @returns {Function} Combined connection rule function
 * 
 * Example usage:
 * canConnectPieces(piece1, piece2) {
 *   return combineRulesOr(differentEdgesOnly, allowSameType)(piece1, piece2);
 * }
 */
export const combineRulesOr = (...rules) => {
  return (piece1, piece2) => {
    return rules.some(rule => rule(piece1, piece2));
  };
};

/**
 * Allow connections only between pieces of specific edge counts
 * @param {Array<number>} edgeCounts - Array of allowed edge count pairs
 * @returns {Function} A connection rule function
 * 
 * Example usage:
 * const myRule = allowSpecificEdgePairs([[1, 2], [2, 3], [3, 4]]);
 * // Allows: 1<->2, 2<->3, 3<->4 connections
 */
export const allowSpecificEdgePairs = (edgePairs) => {
  return (piece1, piece2) => {
    return edgePairs.some(([a, b]) => 
      (piece1.edgeCount === a && piece2.edgeCount === b) ||
      (piece1.edgeCount === b && piece2.edgeCount === a)
    );
  };
};

