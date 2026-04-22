import { ProgressManager } from '../helpers/ProgressManager.js';

/**
 * BaseLevel - Common functionality for all puzzle levels
 * Handles piece spawning, dragging, edge connections, and graph validation
 */
export class BaseLevel extends Phaser.Scene {
  constructor(sceneKey) {
    super(sceneKey);
    this.levelKey = sceneKey;
  }

  preload() {
    // Load green tick for solved indicator
    this.load.image('green-tick', 'assets/green-tick.PNG');
  }

  create(data) {
    this.cameras.main.setBackgroundColor('#ffffff');

    // Sidebar setup
    const sidebarWidth = 250;
    const sidebarX = 1280 - sidebarWidth / 2;
    const sidebar = this.add.rectangle(sidebarX, 360, sidebarWidth, 720, 0xf4f4f4);
    sidebar.setStrokeStyle(2, 0xcccccc);

    // Nav bar setup - slightly lighter shade than sidebar, stops at sidebar
    this.navBarHeight = 60;
    const navBarWidth = 1280 - sidebarWidth;
    const navBar = this.add.rectangle(navBarWidth / 2, this.navBarHeight / 2, navBarWidth, this.navBarHeight, 0xf8f8f8);
    navBar.setStrokeStyle(2, 0xcccccc);

    // Store gameplay boundaries
    this.gameplayBounds = {
      minX: 50,
      maxX: 1280 - sidebarWidth - 50,
      minY: this.navBarHeight + 50,
      maxY: 670
    };

    // Store sidebar boundaries for piece removal
    this.sidebarBounds = {
      minX: 1280 - sidebarWidth,
      maxX: 1280,
      minY: 0,
      maxY: 720
    };

    // Store nav bar boundaries
    this.navBarBounds = {
      minX: 0,
      maxX: navBarWidth,
      minY: 0,
      maxY: this.navBarHeight
    };

    // Get level-specific piece definitions
    this.pieceTypes = this.getPieceTypes();

    // Initialize game state
    this.pieces = [];
    this.edges = [];
    this.selectedPiece = null;
    this._highlightedPiece = null;
    this.graphics = this.add.graphics().setDepth(0);
    this.clickThreshold = 10;
    this.input.dragDistanceThreshold = this.clickThreshold;
    this._anyPieceDragging = false;
    this.isViewingSolved = false;

    // Check if we should skip instructions (from reset or data parameter)
    const skipInstructions = data && data.skipInstructions;

    // Check if level is already solved
    const levelStatus = ProgressManager.getLevelStatus(this.levelKey);
    if (levelStatus === 'solved') {
      this.isViewingSolved = true;
      // Set all piece counts to 0 for solved level sidebar
      this.pieceTypes.forEach(type => {
        type.count = 0;
      });
      // Setup sidebar with greyed out pieces
      this.setupSidebar(sidebarX);
      this.loadSolvedLevel();
      this.showSolvedIndicator(sidebarX);
      this.addBackButton(); // Add back button in nav bar
    } else {
      // Setup sidebar piece buttons (only if not viewing solved)
      this.setupSidebar(sidebarX);
      // Try to load any saved progress
      this.loadProgress();
      // Add buttons in nav bar
      this.addBackButton();
      this.addInfoButton();
      this.addResetButton();
      // Show instructions on first entry (unless skipped)
      if (!skipInstructions) {
        this.showInstructions();
      }
    }
  }

  /**
   * Override this method in child classes to define level-specific pieces
   * @returns {Array} Array of piece type definitions
   */
  getPieceTypes() {
    throw new Error('getPieceTypes() must be implemented by child class');
  }

  /**
   * Override this method in child classes to define custom piece labels
   * @param {string} pieceKey - The piece type key
   * @param {number} edges - Number of edges for this piece
   * @returns {string} Label text to display under the piece
   */
  getPieceLabel(pieceKey, edges) {
    // Default implementation - can be overridden in child classes
    return `Piece: ${edges} edge${edges !== 1 ? 's' : ''}`;
  }

  /**
   * Override to return a display name for a piece (e.g. "Alice" instead of "this person")
   */
  getPieceName(pieceKey) {
    return null;
  }

  /**
   * Override this method in child classes to customize label positioning
   * @returns {number} Y offset for the label below the piece
   */
  getLabelYOffset() {
    return 60; // Default offset
  }

  /**
   * Override this method in child classes to customize label X positioning
   * @returns {number} X offset for the label (relative to sidebarX)
   */
  getLabelXOffset() {
    return 0; // Default offset (centered)
  }

  /**
   * Override this method in child classes to customize piece count position
   * @returns {Object} Object with xOffset and yOffset for the count label
   */
  getCountLabelOffset() {
    return { xOffset: 65, yOffset: -35 }; // Default offset
  }

  /**
   * Override this method in child classes to customize badge position
   * @returns {Object} Object with xOffset and yOffset for the remaining-edges badge
   */
  getBadgeOffset() {
    return { xOffset: 40, yOffset: -40 };
  }

  /**
   * Override to customise the tint applied to sidebar pieces when their count reaches 0.
   * @returns {number} Hex colour used as the depletion tint
   */
  getDepletedTint() {
    return 0x888888;
  }

  /**
   * Override to disable pixel-perfect hit testing for specific piece types.
   * When false, the entire image bounds (including transparent pixels) are clickable.
   * @param {string} pieceKey
   * @returns {boolean} Whether to use pixel-perfect hit testing, default true
   */
  usePixelPerfectHit(pieceKey) {
    return true;
  }

  /**
   * Override in child classes to shift the edge anchor point for specific piece types.
   * Return {x, y} offsets relative to the piece's position.
   * @param {Phaser.GameObjects.Image} piece
   * @returns {{ x: number, y: number }}
   */
  getEdgeAnchorOffset(piece) {
    return { x: 0, y: 0 };
  }

  /**
   * Get the actual edge connection point for a piece, accounting for anchor offsets.
   */
  getEdgeAnchor(piece) {
    const offset = this.getEdgeAnchorOffset(piece);
    return { x: piece.x + offset.x, y: piece.y + offset.y };
  }

  /**
   * Override this method in child classes to hide the "x N" piece count badge
   * in the sidebar (useful when each piece type has only one instance).
   * @returns {boolean} Whether to show the count label next to each sidebar piece
   */
  showSidebarCount() {
    return true;
  }

  /**
   * Override this method in child classes to customize terminology
   * @returns {Object} Mapping of generic terms to level-specific terms
   */
  getTerminology() {
    return {
      piece: 'piece',
      pieces: 'pieces',
      connection: 'connection',
      connections: 'connections',
    };
  }

  /**
   * Override this method in child classes to provide a custom message
   * when two pieces can't connect due to level-specific rules.
   * @param {Phaser.GameObjects.Image} piece1 
   * @param {Phaser.GameObjects.Image} piece2 
   * @returns {string} Custom rejection message
   */
  getConnectionRejectionMessage(piece1, piece2) {
    const t = this.getTerminology();
    return `These ${t.pieces} cannot be connected.`;
  }

  /**
   * Override this method in child classes to allow edges to cross
   * @returns {boolean} Whether edges are allowed to cross each other
   */
  allowEdgeCrossing() {
    return false;
  }

  /**
   * Override this method in child classes to define connection rules
   * @param {Phaser.GameObjects.Image} piece1 
   * @param {Phaser.GameObjects.Image} piece2 
   * @returns {boolean} Whether these pieces can connect
   */
  canConnectPieces(piece1, piece2) {
    // Default: all pieces can connect
    return true;
  }

  setupSidebar(sidebarX) {
    const total = this.pieceTypes.length;
    const topPadding = 120; // Reduced top padding
    const bottomPadding = 120; // Reduced bottom padding
    const availableHeight = 720 - topPadding - bottomPadding;
    const spacing = total > 1 ? availableHeight / (total - 1) : 0;
    this.sidebarCounters = [];
    this.sidebarPieces = []; // Store references to sidebar pieces

    this.pieceTypes.forEach((type, i) => {
      const y = topPadding + (spacing * i);
      const piece = this.add.image(sidebarX, y, type.key)
        .setScale(type.sidebarScale)
        .setInteractive(this.usePixelPerfectHit(type.key)
          ? { pixelPerfect: true, alphaTolerance: 128, useHandCursor: true, draggable: true }
          : { useHandCursor: true, draggable: true });

      this.sidebarPieces.push(piece); // Store reference
      this.input.setDraggable(piece);

      // Counter text - hidden when showSidebarCount() returns false
      const countOffset = this.getCountLabelOffset(type);
      let counterText = null;
      if (this.showSidebarCount()) {
        counterText = this.add.text(sidebarX + countOffset.xOffset, y + countOffset.yOffset, `x${type.count}`, {
          fontSize: '16px',
          color: '#000'
        }).setOrigin(0.5, 0.5);
      }
      this.sidebarCounters.push(counterText);

      // Label under piece with name and edge count
      const pieceLabel = this.getPieceLabel ? this.getPieceLabel(type.key, type.edges) : `Piece ${i + 1}: ${type.edges} edge${type.edges !== 1 ? 's' : ''}`;
      const labelYOffset = this.getLabelYOffset(type);
      const labelXOffset = this.getLabelXOffset();
      this.add.text(sidebarX + labelXOffset, y + labelYOffset, pieceLabel, {
        fontSize: '14px',
        color: '#999999',
        align: 'center'
      }).setOrigin(0.5, 0);

      // Grey out and disable piece if count is already 0 (e.g., when viewing solved level)
      if (type.count === 0) {
        piece.setTint(this.getDepletedTint());
        piece.disableInteractive();
      }

      // Hover effect for sidebar pieces and counter
      const baseSidebarScale = type.sidebarScale;
      const counterBaseX = counterText ? counterText.x : 0;
      const counterBaseY = counterText ? counterText.y : 0;
      piece.on('pointerover', () => {
        if (type.count > 0 && !piece._sidebarDragging) {
          piece.setScale(baseSidebarScale * 1.15);
          if (counterText) counterText.setPosition(counterBaseX + 5, counterBaseY - 5);
        }
      });
      piece.on('pointerout', () => {
        if (!piece._sidebarDragging) {
          piece.setScale(baseSidebarScale);
          if (counterText) counterText.setPosition(counterBaseX, counterBaseY);
        }
      });

      // Track the ghost piece being dragged from sidebar
      piece._sidebarDragging = false;
      piece._ghostPiece = null;

      piece.on('dragstart', (pointer) => {
        if (type.count <= 0) return;
        piece._sidebarDragging = true;
        this._anyPieceDragging = true;

        // Create a ghost piece that follows the pointer
        const ghost = this.add.image(pointer.x, pointer.y, type.key)
          .setScale(type.scale)
          .setDepth(10)
          .setAlpha(0.7);
        piece._ghostPiece = ghost;
      });

      piece.on('drag', (pointer, dragX, dragY) => {
        if (!piece._sidebarDragging || !piece._ghostPiece) return;
        // Move the ghost, keep the sidebar piece in place
        piece._ghostPiece.x = dragX;
        piece._ghostPiece.y = dragY;
        // Reset sidebar piece position so it doesn't move
        piece.x = sidebarX;
        piece.y = y;
      });

      piece.on('dragend', (pointer) => {
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

        // Only place if dropped inside gameplay area
        const inGameplay = dropX >= this.gameplayBounds.minX && dropX <= this.gameplayBounds.maxX &&
                           dropY >= this.gameplayBounds.minY && dropY <= this.gameplayBounds.maxY;

        if (inGameplay && type.count > 0) {
          // Check if drop location overlaps an existing piece
          const minDist = this.getMinPiecePlacementDistance();
          const overlapping = this.pieces.some(other => {
            const dx = dropX - other.x;
            const dy = dropY - other.y;
            return Math.sqrt(dx * dx + dy * dy) < minDist;
          });
          if (overlapping) {
            const t = this.getTerminology();
            this.showNotification(`${t.pieces.charAt(0).toUpperCase() + t.pieces.slice(1)} cannot overlap each other.`);
            this._sidebarDropBlocked = true;
            this.time.delayedCall(100, () => { this._sidebarDropBlocked = false; });
            return;
          }
          this.spawnPiece(type, dropX, dropY);
          type.count -= 1;
          if (counterText) counterText.setText(`x${type.count}`);
          if (type.count === 0) {
            piece.setTint(this.getDepletedTint());
            piece.disableInteractive();
          }
          this.saveProgress();
        }
      });
    });
  }

  spawnPiece(type, spawnX = null, spawnY = null, enableInteraction = true) {
    // Use gameplay bounds for random spawning
    const x = spawnX !== null ? spawnX : Phaser.Math.Between(this.gameplayBounds.minX + 100, this.gameplayBounds.maxX - 100);
    const y = spawnY !== null ? spawnY : Phaser.Math.Between(this.gameplayBounds.minY + 50, this.gameplayBounds.maxY - 50);
    const piece = this.add.image(x, y, type.key)
      .setScale(type.scale);

    // Only make interactive if explicitly enabled AND not viewing solved
    if (enableInteraction && !this.isViewingSolved) {
      piece.setInteractive(this.usePixelPerfectHit(type.key)
        ? { pixelPerfect: true, alphaTolerance: 128, draggable: true, useHandCursor: true }
        : { draggable: true, useHandCursor: true });
    }

    piece.edgeCount = type.edges;
    piece.pieceType = type.key; // Store piece type for connection rules
    piece.connections = [];
    piece.prevX = x;
    piece.prevY = y;
    piece._isDragging = false;
    piece._wasDragged = false;
    piece._pointerDownPos = null;

    piece.setDepth(1);

    if (enableInteraction && !this.isViewingSolved) {
      this.input.setDraggable(piece);

      // Hover effect for gameplay pieces (disabled while any piece is being dragged)
      const baseScale = type.scale;
      piece.on('pointerover', () => {
        if (!this._anyPieceDragging) {
          piece.setScale(baseScale * 1.12);
        }
      });
      piece.on('pointerout', () => {
        if (!piece._isDragging) {
          piece.setScale(baseScale);
        }
      });

      piece.on('pointerdown', (pointer) => {
        piece._pointerDownPos = { x: pointer.x, y: pointer.y };
        piece._wasDragged = false;
      });

      piece.on('pointerup', () => {
        if (!piece._isDragging && !piece._wasDragged) {
          this.handlePieceClick(piece);
        }
      });

      piece.on('dragstart', () => {
        piece._isDragging = true;
        this._anyPieceDragging = true;
        piece._dragStartX = piece.x;
        piece._dragStartY = piece.y;
        piece.prevX = piece.x;
        piece.prevY = piece.y;
        piece.setDepth(5);
        if (piece._badge) {
          piece._badge.setDepth(6);
          piece._badgeText.setDepth(6);
        }
      });

      piece.on('drag', (pointer, dragX, dragY) => {
        piece._wasDragged = true;
        
        const inSidebar = dragX >= this.sidebarBounds.minX;
        
        // Always prevent entering the nav bar
        dragY = Math.max(this.gameplayBounds.minY, dragY);
        
        if (!inSidebar) {
          dragX = Math.max(this.gameplayBounds.minX, Math.min(dragX, this.gameplayBounds.maxX));
          dragY = Math.min(dragY, this.gameplayBounds.maxY);
          
          if (!this.allowEdgeCrossing() && this.wouldCauseIntersection(piece, dragX, dragY)) {
            piece.x = piece.prevX;
            piece.y = piece.prevY;
            return;
          }
        }
        
        piece.x = dragX;
        piece.y = dragY;
        piece.prevX = dragX;
        piece.prevY = dragY;
        this.redrawEdges();
        this.updateBadge(piece);
      });

      piece.on('dragend', () => {
        piece._isDragging = false;
        this._anyPieceDragging = false;
        piece.setScale(baseScale);
        piece.setDepth(1);
        if (piece._badge) {
          piece._badge.setDepth(3);
          piece._badgeText.setDepth(3);
        }
        
        // Check if piece was dropped in the sidebar (removal area)
        if (this.isPieceInRemovalArea(piece)) {
          this.removePiece(piece);
        } else if (this.isOverlappingOtherPiece(piece)) {
          const t = this.getTerminology();
          piece.x = piece._dragStartX;
          piece.y = piece._dragStartY;
          piece.prevX = piece._dragStartX;
          piece.prevY = piece._dragStartY;
          this.redrawEdges();
          this.updateBadge(piece);
          this.showNotification(`${t.pieces.charAt(0).toUpperCase() + t.pieces.slice(1)} cannot overlap each other.`);
        } else if (this.isOverlappingEdge(piece)) {
          const t = this.getTerminology();
          piece.x = piece._dragStartX;
          piece.y = piece._dragStartY;
          piece.prevX = piece._dragStartX;
          piece.prevY = piece._dragStartY;
          this.redrawEdges();
          this.updateBadge(piece);
          this.showNotification(`A ${t.piece} cannot be placed on top of a ${t.connection}.`);
        } else {
          this.checkSolved();
        }
        
        // Save progress after each move
        this.saveProgress();
      });
    }

    this.pieces.push(piece);

    if (enableInteraction && !this.isViewingSolved) {
      this.createBadge(piece);
    }

    this.onPiecePlaced(piece);

    return piece;
  }

  createBadge(piece) {
    const remaining = piece.edgeCount - piece.connections.length;
    const { xOffset, yOffset } = this.getBadgeOffset(piece);
    const radius = 12;

    const bg = this.add.circle(piece.x + xOffset, piece.y + yOffset, radius, 0xaaaaaa, 0.85)
      .setDepth(3);
    const text = this.add.text(piece.x + xOffset, piece.y + yOffset, `${remaining}`, {
      fontSize: '13px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setDepth(3);

    const visible = remaining > 0;
    bg.setVisible(visible);
    text.setVisible(visible);

    piece._badge = bg;
    piece._badgeText = text;
  }

  updateBadge(piece) {
    if (!piece._badge) return;
    const remaining = piece.edgeCount - piece.connections.length;
    const { xOffset, yOffset } = this.getBadgeOffset(piece);

    piece._badge.setPosition(piece.x + xOffset, piece.y + yOffset);
    piece._badgeText.setPosition(piece.x + xOffset, piece.y + yOffset);

    if (remaining > 0) {
      piece._badge.setVisible(true);
      piece._badgeText.setText(`${remaining}`);
      piece._badgeText.setVisible(true);
    } else {
      piece._badge.setVisible(false);
      piece._badgeText.setVisible(false);
    }
  }

  /**
   * Check if a piece is in a removal area (sidebar only)
   */
  isPieceInRemovalArea(piece) {
    return piece.x >= this.sidebarBounds.minX &&
           piece.x <= this.sidebarBounds.maxX &&
           piece.y >= this.sidebarBounds.minY &&
           piece.y <= this.sidebarBounds.maxY;
  }

  /**
   * Remove a piece from the game and return it to the sidebar
   */
  removePiece(piece) {
    // Find the piece type
    const pieceType = this.pieceTypes.find(t => t.key === piece.pieceType);
    if (!pieceType) return;

    // Remove all edges connected to this piece
    const connectedPieces = [...piece.connections];
    connectedPieces.forEach(otherPiece => {
      this.edges = this.edges.filter(e => 
        !((e.p1 === piece && e.p2 === otherPiece) || 
          (e.p1 === otherPiece && e.p2 === piece))
      );
      otherPiece.connections = otherPiece.connections.filter(p => p !== piece);
      this.updateBadge(otherPiece);
    });

    // Remove piece from pieces array
    const pieceIndex = this.pieces.indexOf(piece);
    if (pieceIndex > -1) {
      this.pieces.splice(pieceIndex, 1);
    }

    // Increment the count for this piece type
    pieceType.count += 1;

    // Update sidebar counter
    const typeIndex = this.pieceTypes.indexOf(pieceType);
    if (this.sidebarCounters[typeIndex]) {
      this.sidebarCounters[typeIndex].setText(`x${pieceType.count}`);
    }

    // Re-enable sidebar piece if count is now > 0
    if (pieceType.count > 0 && this.sidebarPieces && this.sidebarPieces[typeIndex]) {
      this.sidebarPieces[typeIndex].clearTint();
      this.sidebarPieces[typeIndex].setInteractive(this.usePixelPerfectHit(pieceType.key)
        ? { pixelPerfect: true, alphaTolerance: 128, useHandCursor: true, draggable: true }
        : { useHandCursor: true, draggable: true });
    }

    // Destroy badge and piece
    if (piece._badge) {
      piece._badge.destroy();
      piece._badgeText.destroy();
      piece._badge = null;
      piece._badgeText = null;
    }
    piece.destroy();

    // Redraw edges
    this.redrawEdges();
  }

  handlePieceClick(piece) {
    // Ignore clicks caused by a blocked sidebar drop
    if (this._sidebarDropBlocked) return;

    // Don't allow interactions when viewing solved level
    if (this.isViewingSolved) {
      return;
    }

    // Toggle selection if clicked again
    if (this._highlightedPiece === piece) {
      piece.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      return;
    }

    // No current selection → select this piece
    if (!this._highlightedPiece) {
      piece.setTint(this.getDepletedTint());
      this._highlightedPiece = piece;
      this.selectedPiece = piece;
      return;
    }

    const a = this.selectedPiece;
    const b = piece;

    // Edge already exists → remove
    const existingIndex = this.edges.findIndex(e =>
      (e.p1 === a && e.p2 === b) || (e.p1 === b && e.p2 === a)
    );

    if (existingIndex !== -1) {
      const edge = this.edges.splice(existingIndex, 1)[0];
      edge.p1.connections = edge.p1.connections.filter(n => n !== edge.p2);
      edge.p2.connections = edge.p2.connections.filter(n => n !== edge.p1);

      a.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      this.redrawEdges();
      this.updateBadge(a);
      this.updateBadge(b);
      this.checkSolved();
      this.saveProgress();
      return;
    }

    // Check level-specific connection rules
    if (!this.canConnectPieces(a, b)) {
      this.showNotification(this.getConnectionRejectionMessage(a, b));
      a.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      return;
    }

    const t = this.getTerminology();

    // Check if either piece is at max connections
    if (a.connections.length >= a.edgeCount || b.connections.length >= b.edgeCount) {
      const fullPiece = a.connections.length >= a.edgeCount ? a : b;
      const pieceName = this.getPieceName(fullPiece.pieceType);
      const pieceDesc = pieceName || `This ${t.piece}`;
      const pronoun = pieceName ? 'their' : 'its';
      this.showNotification(`${pieceDesc} already has ${pronoun} maximum number of ${t.connections} (${fullPiece.edgeCount}).`);
      a.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      return;
    }

    // Check if connection would cross existing connections
    if (!this.allowEdgeCrossing() && this.edgeWouldIntersectPieces(a, b)) {
      this.showNotification(`${t.connections.charAt(0).toUpperCase() + t.connections.slice(1)} cannot cross each other.`);
      a.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      return;
    }

    // Add edge
    this.edges.push({ p1: a, p2: b });
    a.connections.push(b);
    b.connections.push(a);
    this.onEdgeCreated(a, b);

    a.clearTint();
    this._highlightedPiece = null;
    this.selectedPiece = null;
    this.redrawEdges();
    this.updateBadge(a);
    this.updateBadge(b);
    this.checkSolved();
    this.saveProgress();
  }

  /**
   * Show a temporary notification popup at the top of the gameplay area
   */
  showNotification(message) {
    // Remove existing notification if present
    if (this._notification) {
      this._notification.bg.destroy();
      this._notification.text.destroy();
      if (this._notification.timer) {
        this._notification.timer.remove();
      }
    }

    const centerX = this.gameplayBounds 
      ? (this.gameplayBounds.minX + this.gameplayBounds.maxX) / 2 
      : 540;

    const text = this.add.text(centerX, 92, message, {
      fontSize: '18px',
      color: '#000',
      align: 'center',
      wordWrap: { width: 500 }
    }).setOrigin(0.5, 0.5).setDepth(50);

    const padding = 16;
    const bg = this.add.rectangle(
      centerX, 92,
      text.width + padding * 2,
      text.height + padding,
      0xf8d7da
    ).setStrokeStyle(1, 0xf5c6cb).setDepth(49);

    this._notification = { bg, text };

    this._notification.timer = this.time.delayedCall(2500, () => {
      bg.destroy();
      text.destroy();
      this._notification = null;
    });
  }

  /**
   * Check if a piece overlaps any other piece based on display size
   */
  isOverlappingOtherPiece(piece) {
    const minDist = 60;
    for (const other of this.pieces) {
      if (other === piece) continue;
      const dx = piece.x - other.x;
      const dy = piece.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) return true;
    }
    return false;
  }

  /**
   * Check if a piece overlaps any edge it's not connected to
   */
  isOverlappingEdge(piece) {
    const threshold = 15;
    for (const edge of this.edges) {
      if (edge.p1 === piece || edge.p2 === piece) continue;
      const ea1 = this.getEdgeAnchor(edge.p1);
      const ea2 = this.getEdgeAnchor(edge.p2);
      const dist = this.pointToSegmentDistance(
        piece.x, piece.y,
        ea1.x, ea1.y,
        ea2.x, ea2.y
      );
      if (dist < threshold) return true;
    }
    return false;
  }

  /**
   * Calculate the distance from a point to a line segment
   */
  pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  }

  edgeWouldIntersectPieces(p1, p2) {
    const a1 = this.getEdgeAnchor(p1);
    const a2 = this.getEdgeAnchor(p2);
    for (const edge of this.edges) {
      if (edge.p1 === p1 || edge.p2 === p1 || edge.p1 === p2 || edge.p2 === p2) continue;
      const ea1 = this.getEdgeAnchor(edge.p1);
      const ea2 = this.getEdgeAnchor(edge.p2);
      if (this.linesIntersect(a1.x, a1.y, a2.x, a2.y, ea1.x, ea1.y, ea2.x, ea2.y))
        return true;
    }
    return false;
  }

  wouldCauseIntersection(movedPiece, newX, newY) {
    const movedOffset = this.getEdgeAnchorOffset(movedPiece);
    const coords = this.edges.map(e => {
      let x1, y1, x2, y2;
      if (e.p1 === movedPiece) {
        x1 = newX + movedOffset.x; y1 = newY + movedOffset.y;
      } else {
        const a = this.getEdgeAnchor(e.p1); x1 = a.x; y1 = a.y;
      }
      if (e.p2 === movedPiece) {
        x2 = newX + movedOffset.x; y2 = newY + movedOffset.y;
      } else {
        const a = this.getEdgeAnchor(e.p2); x2 = a.x; y2 = a.y;
      }
      return { e, x1, y1, x2, y2 };
    });

    for (let i = 0; i < coords.length; i++) {
      for (let j = i + 1; j < coords.length; j++) {
        const ea = coords[i].e, eb = coords[j].e;
        if (ea.p1 === eb.p1 || ea.p1 === eb.p2 || ea.p2 === eb.p1 || ea.p2 === eb.p2) continue;
        if (this.linesIntersect(coords[i].x1, coords[i].y1, coords[i].x2, coords[i].y2,
                                coords[j].x1, coords[j].y1, coords[j].x2, coords[j].y2))
          return true;
      }
    }
    return false;
  }

  linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (det === 0) return false;
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / det;
    const u = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / det;
    return t > 0 && t < 1 && u > 0 && u < 1;
  }

  redrawEdges() {
    this.graphics.clear();
    this.graphics.lineStyle(2, 0x000000);
    for (const edge of this.edges) {
      const a1 = this.getEdgeAnchor(edge.p1);
      const a2 = this.getEdgeAnchor(edge.p2);
      this.graphics.beginPath();
      this.graphics.moveTo(a1.x, a1.y);
      this.graphics.lineTo(a2.x, a2.y);
      this.graphics.strokePath();
    }
  }

  checkSolved() {
    const allPlaced = this.pieceTypes.every(t => t.count === 0);
    const allConnectedPoints = this.pieces.every(p => p.connections.length === p.edgeCount);
    if (!allPlaced || !allConnectedPoints) return;
    if (!this.isGraphConnected()) return;
    if (!this.checkAdditionalSolvedConditions()) return;
    this.showSolvedScreen();
  }

  /**
   * Override this method in child classes to add custom win conditions
   * @returns {boolean} Whether additional conditions are met
   */
  checkAdditionalSolvedConditions() {
    // Default: no additional conditions
    return true;
  }

  /** Minimum distance (px) between placed pieces — override in subclasses to adjust */
  getMinPiecePlacementDistance() { return 60; }

  /** Called after a piece is placed on the board from the sidebar */
  onPiecePlaced(piece) {}

  /** Called after an edge is created between two pieces */
  onEdgeCreated(piece1, piece2) {}

  isGraphConnected() {
    if (this.pieces.length === 0) return false;
    const adj = new Map(this.pieces.map(p => [p, new Set(p.connections)]));
    const visited = new Set();
    const queue = [this.pieces[0]];
    visited.add(this.pieces[0]);

    while (queue.length > 0) {
      const node = queue.shift();
      for (const n of adj.get(node)) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
    return visited.size === this.pieces.length;
  }

  showSolvedScreen() {
    // Save the solution
    const solutionData = this.serializeSolution();
    ProgressManager.markLevelSolved(this.levelKey, solutionData);

    // Disable all gameplay input while overlay is shown
    this.input.enabled = false;

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.95).setDepth(5);
    // Re-enable input only for the overlay itself
    overlay.setInteractive();
    
    // Center aligned text
    this.add.text(640, 280, 'Level Solved!', { 
      fontSize: '40px', 
      color: '#000',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setDepth(6);

    // Re-enable input for buttons only
    this.input.enabled = true;

    // View solved level button - center aligned
    const viewSolvedBtn = this.add.text(640, 360, 'View Solved Level', { 
      fontSize: '28px', 
      fill: '#007bff',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.restart())
      .setDepth(6);
    this.addTextHover(viewSolvedBtn);

    // Return to map button - center aligned
    const returnBtn = this.add.text(640, 410, 'Return to Map', { 
      fontSize: '28px', 
      fill: '#007bff',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Map'))
      .setDepth(6);
    this.addTextHover(returnBtn);

    // Block clicks from passing through to gameplay elements below
    overlay.on('pointerdown', () => {});
  }

  /**
   * Serialize the current solution for saving
   */
  serializeSolution() {
    const piecesData = this.pieces.map((piece, index) => ({
      index: index,
      x: piece.x,
      y: piece.y,
      pieceType: piece.pieceType,
      edgeCount: piece.edgeCount,
      scale: piece.scaleX
    }));

    const edgesData = this.edges.map(edge => ({
      p1Index: this.pieces.indexOf(edge.p1),
      p2Index: this.pieces.indexOf(edge.p2)
    }));

    // Also save piece counts from sidebar
    const pieceTypeCounts = this.pieceTypes.map(type => ({
      key: type.key,
      count: type.count
    }));

    return {
      pieces: piecesData,
      edges: edgesData,
      pieceTypeCounts: pieceTypeCounts
    };
  }

  /**
   * Save current progress (for unsolved levels)
   */
  saveProgress() {
    if (this.isViewingSolved) return;
    
    const progressData = this.serializeSolution();
    ProgressManager.saveInProgressLevel(this.levelKey, progressData);
  }

  /**
   * Load saved progress (for unsolved levels)
   */
  loadProgress() {
    const progress = ProgressManager.getInProgressLevel(this.levelKey);
    if (!progress) return;

    // Restore piece type counts
    if (progress.pieceTypeCounts) {
      progress.pieceTypeCounts.forEach(savedType => {
        const type = this.pieceTypes.find(t => t.key === savedType.key);
        if (type) {
          type.count = savedType.count;
        }
      });
      // Update sidebar counters and grey out pieces if count is 0
      this.pieceTypes.forEach((type, i) => {
        if (this.sidebarCounters[i]) {
          this.sidebarCounters[i].setText(`x${type.count}`);
        }
        // Grey out and disable sidebar piece if count is 0
        if (type.count === 0 && this.sidebarPieces && this.sidebarPieces[i]) {
          this.sidebarPieces[i].setTint(this.getDepletedTint());
          this.sidebarPieces[i].disableInteractive();
        }
      });
    }

    // Spawn all pieces from saved progress
    progress.pieces.forEach(pieceData => {
      const pieceTypeDef = this.pieceTypes.find(t => t.key === pieceData.pieceType);
      if (pieceTypeDef) {
        const piece = this.spawnPiece(pieceTypeDef, pieceData.x, pieceData.y, true);
        piece.setScale(pieceData.scale);
      }
    });

    // Recreate edges
    progress.edges.forEach(edgeData => {
      const p1 = this.pieces[edgeData.p1Index];
      const p2 = this.pieces[edgeData.p2Index];
      if (p1 && p2) {
        this.edges.push({ p1, p2 });
        p1.connections.push(p2);
        p2.connections.push(p1);
      }
    });

    // Draw all edges and update badges to reflect loaded connections
    this.redrawEdges();
    this.pieces.forEach(p => this.updateBadge(p));
  }

  /**
   * Add Back button in nav bar
   */
  addBackButton() {
    const btn = this.add.text(30, this.navBarHeight / 2, 'Back', { 
      fontSize: '24px', 
      fill: '#007bff' 
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0, 0.5)
      .on('pointerdown', () => this.scene.start('Map'));
    this.addTextHover(btn);
  }

  /**
   * Add Info button in nav bar (center-left area)
   */
  addInfoButton() {
    const navBarCenterY = this.navBarHeight / 2;
    const btn = this.add.text(860, navBarCenterY, 'Info', { 
      fontSize: '24px', 
      fill: '#007bff' 
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5)
      .on('pointerdown', () => {
        this.showInstructions();
      });
    this.addTextHover(btn);
  }

  /**
   * Add Reset button in nav bar (center area)
   */
  addResetButton() {
    const navBarCenterY = this.navBarHeight / 2;
    const resetButton = this.add.text(960, navBarCenterY, 'Reset', { 
      fontSize: '24px', 
      fill: '#007bff' 
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5);
    this.addTextHover(resetButton);
    
    resetButton.on('pointerdown', () => {
      ProgressManager.clearInProgressLevel(this.levelKey);
      // Restart with flag to skip instructions
      this.scene.restart({ skipInstructions: true });
    });
  }

  /**
   * Add hover effect to a text button (underline + slight scale)
   */
  addTextHover(textObj) {
    const originalScale = textObj.scaleX;
    textObj.on('pointerover', () => {
      textObj.setScale(originalScale * 1.08);
      textObj.setStyle({ fontStyle: 'bold' });
    });
    textObj.on('pointerout', () => {
      textObj.setScale(originalScale);
      textObj.setStyle({ fontStyle: 'normal' });
    });
  }

  /**
   * Override this method in child classes to provide level-specific instructions
   * Use **text** to make text bold
   * @returns {string} Level instructions with optional **bold** markers
   */
  getLevelInstructions() {
    const t = this.getTerminology();
    return `**Scenario:**
Connect all ${t.pieces} into a single network.

**How to play:**
• Drag ${t.pieces} from the sidebar onto the play area to place them
• Click two ${t.pieces} to create a ${t.connection} between them
• Click two connected ${t.pieces} again to remove the ${t.connection}
• Drag a ${t.piece} back to the sidebar to remove it

**Planarity:**
• ${t.connections.charAt(0).toUpperCase() + t.connections.slice(1)} cannot cross

**Objective:**
Build a connected network where each ${t.piece} has exactly the right number of ${t.connections}.`;
  }

  /**
   * Show the instructions screen (scrollable if content is too long)
   */
  showInstructions() {
    // Disable all gameplay input while instructions are shown
    this.input.enabled = false;

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.95)
      .setDepth(100)
      .setInteractive(); // Block clicks reaching gameplay below
    
    // Re-enable input for overlay buttons
    this.input.enabled = true;

    const titleY = 60;
    const contentTopY = 100;
    const maxContentHeight = 720 * 0.8; // 80% of viewport height
    const buttonAreaHeight = 70;
    const availableHeight = maxContentHeight - (contentTopY - titleY) - buttonAreaHeight;
    const buttonY = titleY + maxContentHeight - 20;

    // Title
    this.add.text(640, titleY, 'Level Instructions', { 
      fontSize: '32px', 
      color: '#000',
      fontStyle: 'bold',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setDepth(101);

    // Render instructions into a container so we can measure and scroll
    const instructions = this.getLevelInstructions();
    const contentContainer = this.add.container(0, 0).setDepth(101);
    const contentHeight = this.renderInstructionsIntoContainer(instructions, 640, 0, contentContainer);

    const needsScroll = contentHeight > availableHeight;

    if (needsScroll) {
      // Create a mask to clip the scrollable area
      const maskShape = this.make.graphics({ x: 0, y: 0 });
      maskShape.fillStyle(0xffffff);
      maskShape.fillRect(640 - 500, contentTopY, 1000, availableHeight);
      const mask = maskShape.createGeometryMask();
      contentContainer.setMask(mask);
      contentContainer.y = contentTopY;

      // Scroll state
      let scrollY = 0;
      const minScroll = -(contentHeight - availableHeight);
      const maxScroll = 0;

      // Scroll indicator
      const scrollHint = this.add.text(640, contentTopY + availableHeight + 8, '↓ Scroll for more ↓', {
        fontSize: '14px',
        color: '#999999',
        align: 'center'
      }).setOrigin(0.5, 0).setDepth(101);
      contentContainer._scrollHint = scrollHint;

      // Mouse wheel scrolling
      this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
        scrollY -= deltaY * 0.5;
        scrollY = Phaser.Math.Clamp(scrollY, minScroll, maxScroll);
        contentContainer.y = contentTopY + scrollY;

        // Hide hint when at bottom, show when not
        const atBottom = scrollY <= minScroll;
        scrollHint.setVisible(!atBottom);
      });

      // Store references for cleanup
      contentContainer._maskShape = maskShape;
      contentContainer._scrollCleanup = () => {
        this.input.off('wheel');
        maskShape.destroy();
      };
    } else {
      contentContainer.y = contentTopY;
    }

    // Close button - fixed at bottom
    const closeButton = this.add.text(640, buttonY, 'Got it!', { 
      fontSize: '28px', 
      fill: '#007bff',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);
    this.addTextHover(closeButton);

    closeButton.on('pointerdown', () => {
      // Clean up scroll listeners if any
      if (contentContainer._scrollCleanup) {
        contentContainer._scrollCleanup();
      }
      if (contentContainer._scrollHint) {
        contentContainer._scrollHint.destroy();
      }
      overlay.destroy();
      contentContainer.destroy();
      // Destroy all remaining instruction screen elements
      this.children.list.filter(obj => obj.depth === 101).forEach(obj => obj.destroy());
    });

    // Block stray clicks
    overlay.on('pointerdown', () => {});
  }

  /**
   * Render instructions text into a container (for scrollable support)
   * @returns {number} Total content height
   */
  renderInstructionsIntoContainer(text, x, startY, container) {
    const lines = text.split('\n');
    let currentY = startY;
    const maxWidth = 900;
    const baseLineSpacing = 8;

    lines.forEach(line => {
      if (line.trim() === '') {
        currentY += 15;
        return;
      }

      const segments = [];
      let currentText = '';
      let isBold = false;
      let i = 0;

      while (i < line.length) {
        if (line[i] === '*' && line[i + 1] === '*') {
          if (currentText) {
            segments.push({ text: currentText, bold: isBold });
            currentText = '';
          }
          isBold = !isBold;
          i += 2;
        } else {
          currentText += line[i];
          i++;
        }
      }
      if (currentText) {
        segments.push({ text: currentText, bold: isBold });
      }

      let currentX = x - maxWidth / 2;
      let maxHeight = 0;
      const lineObjects = [];

      segments.forEach(segment => {
        const style = {
          fontSize: '20px',
          color: '#000',
          align: 'left',
          wordWrap: { width: maxWidth, useAdvancedWrap: true }
        };
        if (segment.bold) {
          style.fontStyle = 'bold';
        }

        let displayText = segment.text;
        if (displayText.endsWith(' ')) displayText = displayText.slice(0, -1) + '\u00A0';
        if (displayText.startsWith(' ')) displayText = '\u00A0' + displayText.slice(1);

        const textObj = this.add.text(currentX, currentY, displayText, style)
          .setOrigin(0, 0);
        container.add(textObj);

        lineObjects.push(textObj);
        currentX += textObj.width;
        maxHeight = Math.max(maxHeight, textObj.height);
      });

      const totalWidth = lineObjects.reduce((sum, obj) => sum + obj.width, 0);
      const offsetX = (maxWidth - totalWidth) / 2;
      lineObjects.forEach(obj => {
        obj.x += offsetX;
      });

      currentY += maxHeight + baseLineSpacing;
    });

    return currentY - startY;
  }

  /**
   * Render text with bold support using **text** syntax
   * @param {string} text - Text with **bold** markers
   * @param {number} x - X position (center)
   * @param {number} y - Y position (top)
   * @param {number} depth - Display depth
   * @returns {number} Final Y position after all text
   */
  renderInstructionsText(text, x, y, depth) {
    const lines = text.split('\n');
    let currentY = y;
    const maxWidth = 900;
    const baseLineSpacing = 8;

    lines.forEach(line => {
      if (line.trim() === '') {
        currentY += 15;
        return;
      }

      // Parse line for **bold** segments
      const segments = [];
      let currentText = '';
      let isBold = false;
      let i = 0;

      while (i < line.length) {
        if (line[i] === '*' && line[i + 1] === '*') {
          if (currentText) {
            segments.push({ text: currentText, bold: isBold });
            currentText = '';
          }
          isBold = !isBold;
          i += 2;
        } else {
          currentText += line[i];
          i++;
        }
      }

      if (currentText) {
        segments.push({ text: currentText, bold: isBold });
      }

      // Render segments on the same line
      let currentX = x - maxWidth / 2; // Start from left edge
      let maxHeight = 0;
      const lineObjects = [];

      segments.forEach(segment => {
        const style = {
          fontSize: '20px',
          color: '#000',
          align: 'left',
          wordWrap: { width: maxWidth, useAdvancedWrap: true }
        };

        if (segment.bold) {
          style.fontStyle = 'bold';
        }

        let displayText = segment.text;
        if (displayText.endsWith(' ')) displayText = displayText.slice(0, -1) + '\u00A0';
        if (displayText.startsWith(' ')) displayText = '\u00A0' + displayText.slice(1);

        const textObj = this.add.text(currentX, currentY, displayText, style)
          .setOrigin(0, 0)
          .setDepth(depth);

        lineObjects.push(textObj);
        currentX += textObj.width;
        maxHeight = Math.max(maxHeight, textObj.height);
      });

      // Center the line horizontally
      const totalWidth = lineObjects.reduce((sum, obj) => sum + obj.width, 0);
      const offsetX = (maxWidth - totalWidth) / 2;
      lineObjects.forEach(obj => {
        obj.x += offsetX;
      });

      currentY += maxHeight + baseLineSpacing;
    });

    return currentY;
  }

  /**
   * Load and display a previously solved level
   */
  loadSolvedLevel() {
    const solution = ProgressManager.getLevelSolution(this.levelKey);
    if (!solution) {
      console.error('No solution found for level:', this.levelKey);
      return;
    }

    // Spawn all pieces from the saved solution (non-interactive)
    solution.pieces.forEach(pieceData => {
      const pieceTypeDef = this.pieceTypes.find(t => t.key === pieceData.pieceType);
      if (pieceTypeDef) {
        const piece = this.spawnPiece(pieceTypeDef, pieceData.x, pieceData.y, false);
        piece.setScale(pieceData.scale);
      }
    });

    // Recreate edges
    solution.edges.forEach(edgeData => {
      const p1 = this.pieces[edgeData.p1Index];
      const p2 = this.pieces[edgeData.p2Index];
      if (p1 && p2) {
        this.edges.push({ p1, p2 });
        p1.connections.push(p2);
        p2.connections.push(p1);
      }
    });

    // Draw all edges
    this.redrawEdges();
  }

  /**
   * Show the "Solved" indicator and "Redo level" button in nav bar
   */
  showSolvedIndicator(sidebarX) {
    const navBarCenterY = this.navBarHeight / 2;

    // Create tick first to get its width
    const tick = this.add.image(0, navBarCenterY, 'green-tick')
      .setScale(0.025);
    const tickWidth = tick.displayWidth;

    // "Solved" text with tick at Info button position (860)
    const spacing = 5;
    const solvedTextX = 800;
    const solvedText = this.add.text(solvedTextX - tickWidth / 2 - spacing, navBarCenterY, 'Solved', {
      fontSize: '24px',
      color: '#00aa00',
      fontStyle: 'bold'
    }).setOrigin(1, 0.5);

    // Position tick right after the text, centered vertically
    tick.setPosition(solvedText.x + spacing, navBarCenterY);
    tick.setOrigin(0, 0.5);

    // "Redo level" button at Reset button position (960)
    const redoButton = this.add.text(920, navBarCenterY, 'Redo Level', {
      fontSize: '24px',
      fill: '#007bff'
    })
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5);
    this.addTextHover(redoButton);

    redoButton.on('pointerdown', () => {
      ProgressManager.clearLevel(this.levelKey);
      this.scene.restart();
    });
  }
}

