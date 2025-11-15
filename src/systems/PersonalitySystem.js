/**
 * Система личности бота
 * Управляет характером, эмоциями и поведением персонажа
 */

import Database from 'nedb';
import path from 'path';

export class PersonalitySystem {
  constructor() {
    // База данных для хранения личности
    this.db = new Database({
      filename: path.join('./data', 'personality.db'),
      autoload: true
    });

    this.personality = {
      // Основные черты характера
      traits: {
        friendliness: 0.5,      // Дружелюбность (0-1)
        curiosity: 0.7,         // Любознательность
        confidence: 0.5,        // Уверенность
        cautiousness: 0.4,      // Осторожность
        creativity: 0.6         // Творчество
      },

      // Эмоциональное состояние
      emotions: {
        happiness: 0.5,         // Счастье
        frustration: 0,         // Раздражение
        excitement: 0.3,        // Возбуждение
        fear: 0,                // Страх
        curiosity: 0.7          // Интерес
      },

      // Предпочтения
      preferences: {
        favoriteActivities: [],
        dislikedActivities: [],
        favoriteLocations: []
      },

      // Личные качества
      personality_name: 'Default AI',
      personality_description: 'A curious and helpful minecraft bot',
      speech_style: 'friendly',  // friendly, formal, casual, mysterious
      unique_traits: []
    };

    this.loadPersonality();
  }

  /**
   * Загрузить личность из базы данных
   */
  loadPersonality() {
    return new Promise((resolve) => {
      this.db.findOne({}, (err, doc) => {
        if (doc) {
          this.personality = { ...this.personality, ...doc };
        }
        resolve(this.personality);
      });
    });
  }

  /**
   * Сохранить личность в базу данных
   */
  savePersonality() {
    return new Promise((resolve) => {
      try {
        const db = this.db;
        db.update({}, this.personality, { upsert: true }, (err) => {
          if (err) {
            console.error('Error saving personality:', err);
            // Попытка компактификации
            try {
              if (db.persistence && typeof db.persistence.compactDatafile === 'function') {
                db.persistence.compactDatafile();
              }
            } catch (e) {}
          }
          resolve();
        });
      } catch (e) {
        console.error('savePersonality failed:', e);
        resolve();
      }
    });
  }

  /**
   * Установить параметры личности
   */
  setPersonality(personalityConfig) {
    this.personality = {
      ...this.personality,
      ...personalityConfig
    };
    this.savePersonality();
  }

  /**
   * Обновить эмоцию
   */
  updateEmotion(emotion, delta, maxValue = 1) {
    if (this.personality.emotions[emotion] !== undefined) {
      this.personality.emotions[emotion] = Math.max(
        0,
        Math.min(maxValue, this.personality.emotions[emotion] + delta)
      );
    }
  }

  /**
   * Обновить черту характера
   */
  updateTrait(trait, delta, maxValue = 1) {
    if (this.personality.traits[trait] !== undefined) {
      this.personality.traits[trait] = Math.max(
        0,
        Math.min(maxValue, this.personality.traits[trait] + delta)
      );
    }
  }

  /**
   * Добавить событие в историю
   */
  addMemory(memory) {
    this.personality.memories = this.personality.memories || [];
    this.personality.memories.push({
      ...memory,
      timestamp: Date.now()
    });

    // Ограничиваем размер памяти
    if (this.personality.memories.length > 1000) {
      this.personality.memories.shift();
    }

    this.savePersonality();
  }

  /**
   * Добавить любимое действие
   */
  addFavoriteActivity(activity) {
    if (!this.personality.preferences.favoriteActivities.includes(activity)) {
      this.personality.preferences.favoriteActivities.push(activity);
      this.savePersonality();
    }
  }

  /**
   * Добавить нелюбимое действие
   */
  addDislikedActivity(activity) {
    if (!this.personality.preferences.dislikedActivities.includes(activity)) {
      this.personality.preferences.dislikedActivities.push(activity);
      this.savePersonality();
    }
  }

  /**
   * Получить описание текущего эмоционального состояния
   */
  getEmotionalState() {
    const emotions = this.personality.emotions;
    const entries = Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);

    return entries.map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(0)}%`).join(', ');
  }

  /**
   * Получить всю личность
   */
  getPersonality() {
    return { ...this.personality };
  }

  /**
   * Нужно ли боту отдохнуть?
   */
  needsRest() {
    const frustration = this.personality.emotions.frustration;
    const happiness = this.personality.emotions.happiness;
    return frustration > 0.7 || happiness < 0.2;
  }

  /**
   * Получить вероятность исследования нового
   */
  getExplorationProbability() {
    const curiosity = this.personality.traits.curiosity;
    const confidence = this.personality.traits.confidence;
    return (curiosity + confidence) / 2 * 0.3;
  }
}

export default PersonalitySystem;
