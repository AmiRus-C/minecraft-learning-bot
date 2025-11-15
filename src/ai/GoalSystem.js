/**
 * Система целей и планирования
 * Позволяет боту ставить и достигать цели
 */

import Database from 'nedb';
import path from 'path';

export class GoalSystem {
  constructor(learningSystem, personalitySystem) {
    this.learningSystem = learningSystem;
    this.personalitySystem = personalitySystem;

    this.db = new Database({
      filename: path.join('./data', 'goals.db'),
      autoload: true
    });

    this.currentGoal = null;
    this.goalHistory = [];
    this.subGoals = [];

    this.loadGoals();
  }

  /**
   * Загрузить цели из БД
   */
  loadGoals() {
    return new Promise((resolve) => {
      this.db.find({}, (err, docs) => {
        if (docs) {
          this.goalHistory = docs.filter(d => d.type === 'history');
          this.subGoals = docs.filter(d => d.type === 'subgoal');
        }
        resolve();
      });
    });
  }

  /**
   * Сохранить цели
   */
  saveGoal(goal) {
    return new Promise((resolve) => {
      this.db.insert({
        ...goal,
        timestamp: Date.now()
      }, () => {
        resolve();
      });
    });
  }

  /**
   * Установить главную цель
   */
  setGoal(goalName, description, priority = 'normal', estimatedTime = 300000) {
    this.currentGoal = {
      name: goalName,
      description,
      priority,           // high, normal, low
      status: 'active',   // active, paused, completed, failed
      progress: 0,        // 0-100%
      startTime: Date.now(),
      estimatedTime,      // в миллисекундах
      subGoals: [],
      rewards: 0,
      attempts: 0
    };

    this.personalitySystem.addMemory({
      type: 'goal_set',
      goal: goalName,
      priority
    });

    this.saveGoal({
      type: 'history',
      ...this.currentGoal
    });

    return this.currentGoal;
  }

  /**
   * Добавить подцель
   */
  addSubGoal(subGoalName, description, order = 0) {
    const subGoal = {
      id: Date.now(),
      name: subGoalName,
      description,
      order,
      status: 'pending', // pending, in_progress, completed
      startTime: null,
      endTime: null,
      reward: 0
    };

    if (this.currentGoal) {
      this.currentGoal.subGoals.push(subGoal);
      this.subGoals.push(subGoal);
    }

    return subGoal;
  }

  /**
   * Начать подцель
   */
  startSubGoal(subGoalId) {
    const subGoal = this.subGoals.find(sg => sg.id === subGoalId);
    if (subGoal) {
      subGoal.status = 'in_progress';
      subGoal.startTime = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Завершить подцель
   */
  completeSubGoal(subGoalId, reward = 1.0) {
    const subGoal = this.subGoals.find(sg => sg.id === subGoalId);
    if (subGoal) {
      subGoal.status = 'completed';
      subGoal.endTime = Date.now();
      subGoal.reward = reward;

      // Обновить прогресс главной цели
      if (this.currentGoal) {
        const completedCount = this.currentGoal.subGoals.filter(
          sg => sg.status === 'completed'
        ).length;
        this.currentGoal.progress = Math.round(
          (completedCount / this.currentGoal.subGoals.length) * 100
        );
        this.currentGoal.rewards += reward;
      }

      return true;
    }
    return false;
  }

  /**
   * Завершить главную цель
   */
  completeGoal(success = true) {
    if (!this.currentGoal) return false;

    const elapsed = Date.now() - this.currentGoal.startTime;
    const timeEfficiency = Math.max(0, 1 - (elapsed / this.currentGoal.estimatedTime));

    this.currentGoal.status = success ? 'completed' : 'failed';
    this.currentGoal.endTime = Date.now();
    this.currentGoal.timeEfficiency = timeEfficiency;

    // Добавить награду за эффективность
    if (success && timeEfficiency > 0.5) {
      this.currentGoal.rewards += 1.0;
    }

    this.personalitySystem.addMemory({
      type: 'goal_completed',
      goal: this.currentGoal.name,
      success,
      rewards: this.currentGoal.rewards
    });

    // Переместить в историю
    this.goalHistory.push(this.currentGoal);
    this.saveGoal({
      type: 'history',
      ...this.currentGoal
    });

    const completedGoal = this.currentGoal;
    this.currentGoal = null;

    return completedGoal;
  }

  /**
   * Отказаться от цели
   */
  abandonGoal(reason = 'unknown') {
    if (!this.currentGoal) return false;

    this.currentGoal.status = 'abandoned';
    this.currentGoal.reason = reason;

    this.personalitySystem.updateEmotion('frustration', 0.2);
    this.personalitySystem.addMemory({
      type: 'goal_abandoned',
      goal: this.currentGoal.name,
      reason
    });

    const abandonedGoal = this.currentGoal;
    this.goalHistory.push(abandonedGoal);
    this.currentGoal = null;

    return abandonedGoal;
  }

  /**
   * Получить актуальное действие для достижения цели
   */
  getNextActionForGoal() {
    if (!this.currentGoal) return null;

    // Найти первую незавершённую подцель
    const activeSubGoal = this.currentGoal.subGoals.find(
      sg => sg.status !== 'completed'
    );

    if (!activeSubGoal) {
      return null;
    }

    if (activeSubGoal.status === 'pending') {
      this.startSubGoal(activeSubGoal.id);
    }

    return activeSubGoal;
  }

  /**
   * Получить план достижения цели
   */
  getPlan() {
    if (!this.currentGoal) return null;

    return {
      mainGoal: {
        name: this.currentGoal.name,
        description: this.currentGoal.description,
        priority: this.currentGoal.priority,
        progress: this.currentGoal.progress
      },
      subGoals: this.currentGoal.subGoals.map(sg => ({
        name: sg.name,
        status: sg.status,
        order: sg.order
      })),
      estimatedCompletion: new Date(
        this.currentGoal.startTime + this.currentGoal.estimatedTime
      ),
      reward: this.currentGoal.rewards
    };
  }

  /**
   * Получить историю целей
   */
  getGoalHistory(limit = 10) {
    return this.goalHistory.slice(-limit).map(goal => ({
      name: goal.name,
      status: goal.status,
      progress: goal.progress,
      rewards: goal.rewards,
      duration: goal.endTime ? goal.endTime - goal.startTime : null
    }));
  }

  /**
   * Получить статистику целей
   */
  getGoalStatistics() {
    const completed = this.goalHistory.filter(g => g.status === 'completed').length;
    const failed = this.goalHistory.filter(g => g.status === 'failed').length;
    const abandoned = this.goalHistory.filter(g => g.status === 'abandoned').length;
    const totalRewards = this.goalHistory.reduce((sum, g) => sum + (g.rewards || 0), 0);

    return {
      totalGoals: this.goalHistory.length,
      completed,
      failed,
      abandoned,
      successRate: this.goalHistory.length > 0
        ? (completed / this.goalHistory.length * 100).toFixed(1) + '%'
        : 'N/A',
      totalRewards: totalRewards.toFixed(2),
      currentGoal: this.currentGoal?.name || 'None'
    };
  }

  /**
   * Проверить, есть ли активная цель
   */
  hasActiveGoal() {
    return this.currentGoal !== null && this.currentGoal.status === 'active';
  }
}

export default GoalSystem;
