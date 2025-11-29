/**
 * ProgressManager - Handles saving and loading user progress via localStorage
 */

const STORAGE_KEY = 'thesis_game_progress';

export class ProgressManager {
  /**
   * Get the current progress data
   * @returns {Object} Progress data with level states and saved solutions
   */
  static getProgress() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        levels: {}
      };
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse progress data:', e);
      return { levels: {} };
    }
  }

  /**
   * Save progress data
   * @param {Object} progress - Progress data to save
   */
  static saveProgress(progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  /**
   * Get the status of a specific level
   * @param {string} levelKey - Level identifier (e.g. 'Level1', 'Level2')
   * @returns {string} Status: 'solved', 'unsolved', or 'locked'
   */
  static getLevelStatus(levelKey) {
    const progress = this.getProgress();
    return progress.levels[levelKey]?.status || 'unsolved';
  }

  /**
   * Mark a level as solved and save the solution
   * @param {string} levelKey - Level identifier
   * @param {Object} solutionData - Data about the solved level (pieces, edges)
   */
  static markLevelSolved(levelKey, solutionData) {
    const progress = this.getProgress();
    if (!progress.levels[levelKey]) {
      progress.levels[levelKey] = {};
    }
    progress.levels[levelKey].status = 'solved';
    progress.levels[levelKey].solution = solutionData;
    progress.levels[levelKey].solvedAt = Date.now();
    this.saveProgress(progress);
  }

  /**
   * Get the saved solution for a level
   * @param {string} levelKey - Level identifier
   * @returns {Object|null} Solution data or null if not solved
   */
  static getLevelSolution(levelKey) {
    const progress = this.getProgress();
    return progress.levels[levelKey]?.solution || null;
  }

  /**
   * Clear progress for a specific level (for redoing)
   * @param {string} levelKey - Level identifier
   */
  static clearLevel(levelKey) {
    const progress = this.getProgress();
    if (progress.levels[levelKey]) {
      delete progress.levels[levelKey];
      this.saveProgress(progress);
    }
  }

  /**
   * Lock a level
   * @param {string} levelKey - Level identifier
   */
  static lockLevel(levelKey) {
    const progress = this.getProgress();
    if (!progress.levels[levelKey]) {
      progress.levels[levelKey] = {};
    }
    progress.levels[levelKey].status = 'locked';
    this.saveProgress(progress);
  }

  /**
   * Unlock a level
   * @param {string} levelKey - Level identifier
   */
  static unlockLevel(levelKey) {
    const progress = this.getProgress();
    if (!progress.levels[levelKey]) {
      progress.levels[levelKey] = {};
    }
    if (progress.levels[levelKey].status === 'locked') {
      progress.levels[levelKey].status = 'unsolved';
      this.saveProgress(progress);
    }
  }

  /**
   * Save in-progress level data (for unsolved levels)
   * @param {string} levelKey - Level identifier
   * @param {Object} progressData - Current level state (pieces, edges, counts)
   */
  static saveInProgressLevel(levelKey, progressData) {
    const progress = this.getProgress();
    if (!progress.levels[levelKey]) {
      progress.levels[levelKey] = {};
    }
    progress.levels[levelKey].inProgress = progressData;
    progress.levels[levelKey].lastPlayed = Date.now();
    this.saveProgress(progress);
  }

  /**
   * Get in-progress level data
   * @param {string} levelKey - Level identifier
   * @returns {Object|null} In-progress data or null
   */
  static getInProgressLevel(levelKey) {
    const progress = this.getProgress();
    return progress.levels[levelKey]?.inProgress || null;
  }

  /**
   * Clear in-progress data for a level (for reset)
   * @param {string} levelKey - Level identifier
   */
  static clearInProgressLevel(levelKey) {
    const progress = this.getProgress();
    if (progress.levels[levelKey]?.inProgress) {
      delete progress.levels[levelKey].inProgress;
      this.saveProgress(progress);
    }
  }

  /**
   * Reset all progress (for debugging or reset feature)
   */
  static resetAllProgress() {
    localStorage.removeItem(STORAGE_KEY);
  }
}

