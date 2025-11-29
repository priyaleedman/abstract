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
    // Load info icon
    this.load.image('info-icon', 'assets/info.PNG');
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    // Sidebar setup
    const sidebarWidth = 250;
    const sidebarX = 1280 - sidebarWidth / 2;
    const sidebar = this.add.rectangle(sidebarX, 360, sidebarWidth, 720, 0xf4f4f4);
    sidebar.setStrokeStyle(2, 0xcccccc);

    // Get level-specific piece definitions
    this.pieceTypes = this.getPieceTypes();

    // Initialize game state
    this.pieces = [];
    this.edges = [];
    this.selectedPiece = null;
    this._highlightedPiece = null;
    this.graphics = this.add.graphics().setDepth(0);
    this.clickThreshold = 6;
    this.isViewingSolved = false;

    // Check if level is already solved
    const levelStatus = ProgressManager.getLevelStatus(this.levelKey);
    if (levelStatus === 'solved') {
      this.isViewingSolved = true;
      this.loadSolvedLevel();
      this.showSolvedIndicator(sidebarX);
    } else {
      // Setup sidebar piece buttons (only if not viewing solved)
      this.setupSidebar(sidebarX);
      // Try to load any saved progress
      this.loadProgress();
      // Add Reset button for unsolved levels
      this.addResetButton();
      // Add Info button for unsolved levels
      this.addInfoButton();
      // Show instructions on first entry
      this.showInstructions();
    }

    // Back button
    this.add.text(30, 30, 'Back', { fontSize: '24px', fill: '#007bff' })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('Map'));
  }

  /**
   * Override this method in child classes to define level-specific pieces
   * @returns {Array} Array of piece type definitions
   */
  getPieceTypes() {
    throw new Error('getPieceTypes() must be implemented by child class');
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
    const spacing = 720 / (total + 1);
    this.sidebarCounters = [];

    this.pieceTypes.forEach((type, i) => {
      const y = spacing * (i + 1);
      const piece = this.add.image(sidebarX, y, type.key)
        .setScale(type.sidebarScale)
        .setInteractive();

      const counterText = this.add.text(sidebarX + 60, y + 55, `x${type.count}`, {
        fontSize: '16px',
        color: '#000'
      }).setOrigin(1, 0);
      this.sidebarCounters.push(counterText);

      piece.on('pointerdown', () => {
        if (type.count > 0) {
          this.spawnPiece(type);
          type.count -= 1;
          counterText.setText(`x${type.count}`);
          this.saveProgress(); // Save progress when piece is placed
        }
      });
    });
  }

  spawnPiece(type, spawnX = null, spawnY = null, enableInteraction = true) {
    const x = spawnX !== null ? spawnX : Phaser.Math.Between(200, 1000);
    const y = spawnY !== null ? spawnY : Phaser.Math.Between(100, 600);
    const piece = this.add.image(x, y, type.key)
      .setScale(type.scale);

    // Only make interactive if explicitly enabled AND not viewing solved
    if (enableInteraction && !this.isViewingSolved) {
      piece.setInteractive({ draggable: true });
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
        piece.prevX = piece.x;
        piece.prevY = piece.y;
      });

      piece.on('drag', (pointer, dragX, dragY) => {
        piece._wasDragged = true;
        if (this.wouldCauseIntersection(piece, dragX, dragY)) {
          piece.x = piece.prevX;
          piece.y = piece.prevY;
          return;
        }
        piece.x = dragX;
        piece.y = dragY;
        piece.prevX = dragX;
        piece.prevY = dragY;
        this.redrawEdges();
      });

      piece.on('dragend', () => {
        piece._isDragging = false;
        this.checkSolved();
        // Save progress after each move
        this.saveProgress();
      });
    }

    this.pieces.push(piece);
    return piece;
  }

  handlePieceClick(piece) {
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
      piece.setTint(0x888888);
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
      this.checkSolved();
      this.saveProgress(); // Save progress after removing edge
      return;
    }

    // Check level-specific connection rules
    if (!this.canConnectPieces(a, b)) {
      a.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      return;
    }

    // Prevent new connection if full or intersecting
    if (a.connections.length >= a.edgeCount || b.connections.length >= b.edgeCount || this.edgeWouldIntersectPieces(a, b)) {
      a.clearTint();
      this._highlightedPiece = null;
      this.selectedPiece = null;
      return;
    }

    // Add edge
    this.edges.push({ p1: a, p2: b });
    a.connections.push(b);
    b.connections.push(a);

    a.clearTint();
    this._highlightedPiece = null;
    this.selectedPiece = null;
    this.redrawEdges();
    this.checkSolved();
    this.saveProgress(); // Save progress after adding edge
  }

  edgeWouldIntersectPieces(p1, p2) {
    for (const edge of this.edges) {
      if (edge.p1 === p1 || edge.p2 === p1 || edge.p1 === p2 || edge.p2 === p2) continue;
      if (this.linesIntersect(p1.x, p1.y, p2.x, p2.y, edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y))
        return true;
    }
    return false;
  }

  wouldCauseIntersection(movedPiece, newX, newY) {
    const coords = this.edges.map(e => {
      const x1 = (e.p1 === movedPiece) ? newX : e.p1.x;
      const y1 = (e.p1 === movedPiece) ? newY : e.p1.y;
      const x2 = (e.p2 === movedPiece) ? newX : e.p2.x;
      const y2 = (e.p2 === movedPiece) ? newY : e.p2.y;
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
      this.graphics.beginPath();
      this.graphics.moveTo(edge.p1.x, edge.p1.y);
      this.graphics.lineTo(edge.p2.x, edge.p2.y);
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

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.95).setDepth(5);
    
    // Center aligned text
    this.add.text(640, 320, 'Level Solved!', { 
      fontSize: '40px', 
      color: '#000',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setDepth(6);

    // Return to map button - center aligned
    this.add.text(640, 400, 'Return to Map', { 
      fontSize: '28px', 
      fill: '#007bff',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('Map'))
      .setDepth(6);
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
      // Update sidebar counters
      this.pieceTypes.forEach((type, i) => {
        if (this.sidebarCounters[i]) {
          this.sidebarCounters[i].setText(`x${type.count}`);
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

    // Draw all edges
    this.redrawEdges();
  }

  /**
   * Add Reset button for unsolved levels (left of sidebar)
   */
  addResetButton() {
    const resetButton = this.add.text(1000, 30, 'Reset', { 
      fontSize: '24px', 
      fill: '#007bff' 
    })
      .setInteractive()
      .setOrigin(1, 0);
    
    resetButton.on('pointerdown', () => {
      ProgressManager.clearInProgressLevel(this.levelKey);
      this.scene.restart();
    });
  }

  /**
   * Add Info button for unsolved levels (left of reset button)
   */
  addInfoButton() {
    const infoButton = this.add.image(895, 44, 'info-icon')
      .setScale(0.05)
      .setInteractive()
      .setOrigin(0.5);
    
    infoButton.on('pointerdown', () => {
      this.showInstructions();
    });

    // Add hover effect
    infoButton.on('pointerover', () => {
      infoButton.setScale(0.06);
    });

    infoButton.on('pointerout', () => {
      infoButton.setScale(0.05);
    });
  }

  /**
   * Override this method in child classes to provide level-specific instructions
   * Use **text** to make text bold
   * @returns {string} Level instructions with optional **bold** markers
   */
  getLevelInstructions() {
    return `Complete the puzzle by connecting all pieces.

**Objective:** Create a connected graph where each piece uses all of its available connections.`;
  }

  /**
   * Show the instructions screen
   */
  showInstructions() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.95).setDepth(100);
    
    // Title - moved higher
    this.add.text(640, 120, 'Level Instructions', { 
      fontSize: '32px', 
      color: '#000',
      fontStyle: 'bold',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setDepth(101);

    // Instructions text with bold support - moved higher
    const instructions = this.getLevelInstructions();
    const finalY = this.renderInstructionsText(instructions, 640, 180, 101);

    // Close button - positioned below all instructions
    const closeButton = this.add.text(640, finalY + 40, 'Got it!', { 
      fontSize: '28px', 
      fill: '#007bff',
      align: 'center'
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .setDepth(101);

    closeButton.on('pointerdown', () => {
      overlay.destroy();
      // Destroy all instruction screen elements
      this.children.list.filter(obj => obj.depth === 101).forEach(obj => obj.destroy());
    });
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

        const textObj = this.add.text(currentX, currentY, segment.text, style)
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
   * Show the "Solved" indicator and "Redo level" button
   */
  showSolvedIndicator(sidebarX) {
    // "Redo level" button (right-aligned, same size as Back button) - on top
    const redoButton = this.add.text(1250, 30, 'Redo Level', {
      fontSize: '24px',
      fill: '#007bff'
    })
      .setInteractive()
      .setOrigin(1, 0);

    redoButton.on('pointerdown', () => {
      ProgressManager.clearLevel(this.levelKey);
      this.scene.restart();
    });

    // Create tick first to get its width (slightly larger)
    const tick = this.add.image(0, 82, 'green-tick')
      .setScale(0.025);
    const tickWidth = tick.displayWidth;

    // Position "Solved" text so that text + spacing + tick aligns to right edge - on bottom
    const spacing = 5;
    const solvedText = this.add.text(1250 - tickWidth - spacing, 70, 'Solved', {
      fontSize: '24px',
      color: '#00aa00',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Position tick right after the text
    tick.setPosition(solvedText.x + spacing, 82);
    tick.setOrigin(0, 0.5);
  }
}

