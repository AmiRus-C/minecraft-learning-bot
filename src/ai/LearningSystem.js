/**
 * Система обучения бота
 * Реализует простое обучение с подкреплением (Q-learning)
 */

import Database from 'nedb';
import path from 'path';
import fs from 'fs';

export class LearningSystem {
  constructor() {
    // Убедиться, что папка data существует
    const dataDir = path.join('.', 'data');
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch (e) {
      // ignore
    }

    // Удалить temporaryfiles перед созданием БД
    const dbPath = path.join('./data', 'learning.db');
    const tempPath = dbPath + '~';
    try {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          // Попытка снять ограничение доступа и удалить
          try {
            fs.chmodSync(tempPath, 0o666);
            fs.unlinkSync(tempPath);
          } catch (e2) {
            console.error('Could not remove temp DB file (permission):', e2 && e2.message);
          }
        }
      }
    } catch (e) {
      console.error('Could not remove temp DB file:', e && e.message);
    }

    this.db = new Database({
      filename: path.join('./data', 'learning.db'),
      autoload: true
    });

    // Q-таблица: состояние -> действие -> значение
    this.qTable = new Map();

    // История действий и результатов
    this.history = [];

    // Параметры обучения
    this.learningRate = 0.7;
    this.discountFactor = 0.9;
    this.explorationRate = 0.1;

    this.loadKnowledge();
  }

  /**
   * Загрузить знания из базы данных
   */
  loadKnowledge() {
    return new Promise((resolve) => {
      try {
        this.db.find({}, (err, docs) => {
          if (err) {
            console.error('Error loading knowledge:', err);
            return resolve();
          }
          if (docs && docs.length > 0) {
            docs.forEach(doc => {
              this.qTable.set(doc.state, doc.qValues || {});
            });
          }
          resolve();
        });
      } catch (e) {
        console.error('loadKnowledge error:', e);
        resolve();
      }
    });
  }

  /**
   * Сохранить знания
   */
  saveKnowledge() {
    const data = Array.from(this.qTable.entries()).map(([state, qValues]) => ({
      state,
      qValues,
      timestamp: Date.now()
    }));

    return new Promise((resolve) => {
      try {
        const db = this.db;
        const dbPath = path.join('./data', 'learning.db');
        const tempPath = dbPath + '~';

        // Попытаться удалить временный файл перед сохранением
        try {
          if (fs.existsSync(tempPath)) {
            try {
              fs.unlinkSync(tempPath);
            } catch (e) {
              // Попытка снять ограничение доступа и удалить
              try {
                fs.chmodSync(tempPath, 0o666);
                fs.unlinkSync(tempPath);
              } catch (e2) {
                // Игнорировать ошибки при удалении temp файла
              }
            }
          }
        } catch (e) {
          // Игнорировать ошибки
        }

        db.remove({}, { multi: true }, (remErr) => {
          if (remErr) {
            console.error('Error removing old knowledge:', remErr);
            // Попытка компактификации БД
            try { 
              if (db.persistence && typeof db.persistence.compactDatafile === 'function') {
                db.persistence.compactDatafile(); 
              }
            } catch (e) {}
            return resolve();
          }
          
          db.insert(data, (insErr) => {
            if (insErr) {
              console.error('Error inserting knowledge:', insErr);
              // Попытка компактификации БД при ошибке insert
              try { 
                if (db.persistence && typeof db.persistence.compactDatafile === 'function') {
                  db.persistence.compactDatafile(); 
                }
              } catch (e) {}
            }
            resolve();
          });
        });
      } catch (e) {
        console.error('saveKnowledge failed:', e);
        // Попытка компактификации БД при ошибке
        try { 
          const db = this.db;
          if (db.persistence && typeof db.persistence.compactDatafile === 'function') {
            db.persistence.compactDatafile(); 
          }
        } catch (err) {}
        resolve();
      }
    });
  }

  /**
   * Получить значение Q для состояния и действия
   */
  getQValue(state, action) {
    const qValues = this.qTable.get(state) || {};
    return qValues[action] || 0;
  }

  /**
   * Установить значение Q
   */
  setQValue(state, action, value) {
    if (!this.qTable.has(state)) {
      this.qTable.set(state, {});
    }
    const qValues = this.qTable.get(state);
    qValues[action] = value;
  }

  /**
   * Обновить Q-значение (Q-learning)
   */
  updateQValue(state, action, reward, nextState, possibleActions) {
    const currentQ = this.getQValue(state, action);

    // Найти максимальное Q-значение для следующего состояния
    let maxNextQ = 0;
    for (const nextAction of possibleActions) {
      const nextQ = this.getQValue(nextState, nextAction);
      if (nextQ > maxNextQ) {
        maxNextQ = nextQ;
      }
    }

    // Q-learning формула
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    this.setQValue(state, action, newQ);

    return newQ;
  }

  /**
   * Выбрать действие (epsilon-greedy)
   */
  chooseAction(state, possibleActions) {
    if (Math.random() < this.explorationRate) {
      // Случайное действие для исследования
      return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }

    // Выбрать действие с наибольшим Q-значением
    let bestAction = possibleActions[0];
    let bestQ = this.getQValue(state, bestAction);

    for (const action of possibleActions) {
      const q = this.getQValue(state, action);
      if (q > bestQ) {
        bestQ = q;
        bestAction = action;
      }
    }

    return bestAction;
  }

  /**
   * Записать опыт
   */
  recordExperience(state, action, reward, nextState, possibleNextActions) {
    this.history.push({
      state,
      action,
      reward,
      nextState,
      timestamp: Date.now()
    });

    // Обновить Q-значение
    this.updateQValue(state, action, reward, nextState, possibleNextActions);

    // Ограничиваем размер истории
    if (this.history.length > 10000) {
      this.history.shift();
    }
  }

  /**
   * Получить статистику обучения
   */
  getStatistics() {
    const totalStates = this.qTable.size;
    let totalQValue = 0;
    let actionCount = 0;

    for (const qValues of this.qTable.values()) {
      for (const q of Object.values(qValues)) {
        totalQValue += q;
        actionCount++;
      }
    }

    return {
      statesLearned: totalStates,
      averageQValue: actionCount > 0 ? totalQValue / actionCount : 0,
      experiencesRecorded: this.history.length,
      explorationRate: this.explorationRate
    };
  }

  /**
   * Получить изученные действия для состояния
   */
  getLearnedActions(state) {
    const qValues = this.qTable.get(state) || {};
    return Object.entries(qValues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, value]) => ({ action, value }));
  }

  /**
   * Снизить скорость исследования (когда бот учится лучше)
   */
  decreaseExploration(factor = 0.99) {
    this.explorationRate *= factor;
    this.explorationRate = Math.max(0.01, this.explorationRate);
  }

  /**
   * Получить количество изученных состояний
   */
  getKnowledgeSize() {
    return this.qTable.size;
  }
}

export default LearningSystem;