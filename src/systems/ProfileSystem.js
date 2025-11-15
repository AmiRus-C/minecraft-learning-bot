/**
 * Система сохранения и загрузки профилей ботов
 * Позволяет сохранять и восстанавливать полное состояние бота
 */

import fs from 'fs';
import path from 'path';

export class ProfileSystem {
  constructor(bot) {
    this.bot = bot;
    this.profilesDir = './data/profiles';

    // Создать директорию профилей если её нет
    if (!fs.existsSync(this.profilesDir)) {
      fs.mkdirSync(this.profilesDir, { recursive: true });
    }
  }

  /**
   * Сохранить текущее состояние бота как профиль
   */
  async saveProfile(profileName, description = '') {
    const profile = {
      name: profileName,
      description,
      timestamp: Date.now(),
      version: '1.0',
      data: {
        personality: this.bot.personalitySystem.getPersonality(),
        learning: {
          qTable: Array.from(this.bot.learningSystem.qTable.entries()),
          statistics: this.bot.learningSystem.getStatistics()
        },
        goals: null, // Будет добавлено если система целей присутствует
        chatHistory: []
      }
    };

    // Если есть система целей
    if (this.bot.goalSystem) {
      profile.data.goals = {
        currentGoal: this.bot.goalSystem.currentGoal,
        history: this.bot.goalSystem.goalHistory,
        statistics: this.bot.goalSystem.getGoalStatistics()
      };
    }

    const filePath = path.join(this.profilesDir, `${profileName}.json`);

    return new Promise((resolve, reject) => {
      fs.writeFile(
        filePath,
        JSON.stringify(profile, null, 2),
        'utf8',
        (err) => {
          if (err) {
            console.error(`Ошибка сохранения профиля: ${err.message}`);
            reject(err);
          } else {
            console.log(`✓ Профиль сохранён: ${profileName}`);
            resolve(profile);
          }
        }
      );
    });
  }

  /**
   * Загрузить профиль
   */
  async loadProfile(profileName) {
    const filePath = path.join(this.profilesDir, `${profileName}.json`);

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Ошибка загрузки профиля: ${err.message}`);
          reject(err);
        } else {
          try {
            const profile = JSON.parse(data);
            console.log(`✓ Профиль загружен: ${profileName}`);
            resolve(profile);
          } catch (e) {
            reject(new Error(`Ошибка парсинга профиля: ${e.message}`));
          }
        }
      });
    });
  }

  /**
   * Применить профиль (восстановить состояние)
   */
  async applyProfile(profileName) {
    const profile = await this.loadProfile(profileName);

    // Восстановить личность
    this.bot.personalitySystem.setPersonality(profile.data.personality);

    // Восстановить обучение
    if (profile.data.learning.qTable) {
      this.bot.learningSystem.qTable = new Map(profile.data.learning.qTable);
    }

    // Восстановить цели если есть
    if (profile.data.goals && this.bot.goalSystem) {
      this.bot.goalSystem.currentGoal = profile.data.goals.currentGoal;
      this.bot.goalSystem.goalHistory = profile.data.goals.history;
    }

    console.log(`✓ Профиль применён: ${profileName}`);
    return profile;
  }

  /**
   * Получить список всех профилей
   */
  getProfiles() {
    try {
      const files = fs.readdirSync(this.profilesDir);
      const profiles = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.profilesDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const profile = JSON.parse(data);

          profiles.push({
            name: profile.name,
            description: profile.description,
            created: new Date(profile.timestamp),
            version: profile.version
          });
        }
      }

      return profiles;
    } catch (e) {
      console.error(`Ошибка получения списка профилей: ${e.message}`);
      return [];
    }
  }

  /**
   * Удалить профиль
   */
  deleteProfile(profileName) {
    const filePath = path.join(this.profilesDir, `${profileName}.json`);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✓ Профиль удалён: ${profileName}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Ошибка удаления профиля: ${e.message}`);
      return false;
    }
  }

  /**
   * Переименовать профиль
   */
  renameProfile(oldName, newName) {
    const oldPath = path.join(this.profilesDir, `${oldName}.json`);
    const newPath = path.join(this.profilesDir, `${newName}.json`);

    try {
      if (fs.existsSync(oldPath)) {
        const data = fs.readFileSync(oldPath, 'utf8');
        const profile = JSON.parse(data);
        profile.name = newName;

        fs.writeFileSync(newPath, JSON.stringify(profile, null, 2), 'utf8');
        fs.unlinkSync(oldPath);

        console.log(`✓ Профиль переименован: ${oldName} → ${newName}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Ошибка переименования профиля: ${e.message}`);
      return false;
    }
  }

  /**
   * Экспортировать профиль (полная копия)
   */
  exportProfile(profileName, exportPath) {
    const filePath = path.join(this.profilesDir, `${profileName}.json`);

    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(exportPath, data, 'utf8');
        console.log(`✓ Профиль экспортирован: ${exportPath}`);
        return true;
      }
      return false;
    } catch (e) {
      console.error(`Ошибка экспорта профиля: ${e.message}`);
      return false;
    }
  }

  /**
   * Импортировать профиль
   */
  importProfile(importPath, newName = null) {
    try {
      if (!fs.existsSync(importPath)) {
        throw new Error('Файл не найден');
      }

      const data = fs.readFileSync(importPath, 'utf8');
      const profile = JSON.parse(data);

      if (newName) {
        profile.name = newName;
      }

      const filePath = path.join(this.profilesDir, `${profile.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf8');

      console.log(`✓ Профиль импортирован: ${profile.name}`);
      return profile;
    } catch (e) {
      console.error(`Ошибка импорта профиля: ${e.message}`);
      return null;
    }
  }

  /**
   * Получить информацию о профиле
   */
  getProfileInfo(profileName) {
    try {
      const profile = fs.readFileSync(
        path.join(this.profilesDir, `${profileName}.json`),
        'utf8'
      );
      return JSON.parse(profile);
    } catch (e) {
      console.error(`Ошибка получения информации: ${e.message}`);
      return null;
    }
  }

  /**
   * Сравнить два профиля
   */
  compareProfiles(profileName1, profileName2) {
    const profile1 = this.getProfileInfo(profileName1);
    const profile2 = this.getProfileInfo(profileName2);

    if (!profile1 || !profile2) {
      return null;
    }

    const comparison = {
      profile1: profileName1,
      profile2: profileName2,
      personality_similarity: this.calculateSimilarity(
        profile1.data.personality.traits,
        profile2.data.personality.traits
      ),
      learning_difference: Math.abs(
        profile1.data.learning.statistics.averageQValue -
        profile2.data.learning.statistics.averageQValue
      ),
      time_difference: Math.abs(profile1.timestamp - profile2.timestamp)
    };

    return comparison;
  }

  /**
   * Вспомогательная функция для вычисления сходства
   */
  calculateSimilarity(obj1, obj2) {
    let diff = 0;
    let count = 0;

    for (const key in obj1) {
      if (obj2[key] !== undefined) {
        diff += Math.abs(obj1[key] - obj2[key]);
        count++;
      }
    }

    return count > 0 ? (1 - (diff / count)).toFixed(2) : 0;
  }

  /**
   * Получить размер профиля
   */
  getProfileSize(profileName) {
    try {
      const filePath = path.join(this.profilesDir, `${profileName}.json`);
      const stats = fs.statSync(filePath);
      return (stats.size / 1024).toFixed(2) + ' KB';
    } catch (e) {
      return 'N/A';
    }
  }

  /**
   * Получить статистику всех профилей
   */
  getStatistics() {
    const profiles = this.getProfiles();

    if (profiles.length === 0) {
      return {
        total_profiles: 0,
        oldest: null,
        newest: null,
        total_size: '0 KB'
      };
    }

    const timestamps = profiles.map(p => new Date(p.created).getTime());
    let totalSize = 0;

    try {
      const files = fs.readdirSync(this.profilesDir);
      for (const file of files) {
        const filePath = path.join(this.profilesDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    } catch (e) {
      // Игнорировать ошибки размера
    }

    return {
      total_profiles: profiles.length,
      oldest: new Date(Math.min(...timestamps)),
      newest: new Date(Math.max(...timestamps)),
      total_size: (totalSize / 1024).toFixed(2) + ' KB'
    };
  }
}

export default ProfileSystem;
