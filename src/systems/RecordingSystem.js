/**
 * Система записи и воспроизведения действий
 * Позволяет боту записывать свои действия и воспроизводить их позже
 */

import Database from 'nedb';
import path from 'path';

export class RecordingSystem {
  constructor() {
    this.db = new Database({
      filename: path.join('./data', 'recordings.db'),
      autoload: true
    });

    this.isRecording = false;
    this.isPlaying = false;
    this.currentRecording = [];
    this.recordingName = null;
    this.recordingStartTime = null;
    this.recordings = new Map();

    this.loadRecordings();
  }

  /**
   * Загрузить записи из БД
   */
  loadRecordings() {
    return new Promise((resolve) => {
      this.db.find({}, (err, docs) => {
        if (docs) {
          docs.forEach(doc => {
            this.recordings.set(doc.name, doc);
          });
        }
        resolve();
      });
    });
  }

  /**
   * Начать запись
   */
  startRecording(name, description = '') {
    if (this.isRecording) {
      console.warn('Уже идёт запись');
      return false;
    }

    this.isRecording = true;
    this.recordingName = name;
    this.currentRecording = [];
    this.recordingStartTime = Date.now();

    console.log(`📹 Начало записи: ${name}`);
    return true;
  }

  /**
   * Остановить запись
   */
  stopRecording() {
    if (!this.isRecording) {
      console.warn('Запись не идёт');
      return false;
    }

    this.isRecording = false;
    const duration = Date.now() - this.recordingStartTime;

    const recording = {
      name: this.recordingName,
      duration,
      actions: this.currentRecording,
      timestamp: this.recordingStartTime,
      actionCount: this.currentRecording.length
    };

    this.recordings.set(this.recordingName, recording);

    // Сохранить в БД
    this.db.update(
      { name: this.recordingName },
      recording,
      { upsert: true },
      () => {}
    );

    console.log(`📹 Запись завершена: ${this.recordingName} (${this.currentRecording.length} действий)`);
    return recording;
  }

  /**
   * Записать действие
   */
  recordAction(action, params = {}) {
    if (!this.isRecording) return false;

    const actionRecord = {
      type: action,
      params,
      timestamp: Date.now() - this.recordingStartTime, // Относительное время
      sequenceNumber: this.currentRecording.length
    };

    this.currentRecording.push(actionRecord);
    return true;
  }

  /**
   * Получить список всех записей
   */
  getRecordings() {
    return Array.from(this.recordings.values()).map(r => ({
      name: r.name,
      duration: r.duration,
      actionCount: r.actionCount,
      created: new Date(r.timestamp)
    }));
  }

  /**
   * Получить запись по имени
   */
  getRecording(name) {
    return this.recordings.get(name);
  }

  /**
   * Воспроизвести запись
   */
  async playRecording(name, speed = 1.0) {
    const recording = this.getRecording(name);
    if (!recording) {
      console.error(`Запись не найдена: ${name}`);
      return false;
    }

    if (this.isPlaying) {
      console.warn('Уже идёт воспроизведение');
      return false;
    }

    this.isPlaying = true;
    console.log(`▶️ Воспроизведение: ${name} (скорость: ${speed}x)`);

    const startTime = Date.now();

    for (const action of recording.actions) {
      if (!this.isPlaying) break;

      // Ожидание правильного времени для действия
      const actionTime = action.timestamp / speed;
      const elapsedTime = Date.now() - startTime;
      const waitTime = actionTime - elapsedTime;

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Выполнить действие
      await this.executeRecordedAction(action);
    }

    this.isPlaying = false;
    console.log(`✓ Воспроизведение завершено: ${name}`);
    return true;
  }

  /**
   * Выполнить записанное действие
   */
  async executeRecordedAction(action) {
    // Это метод-заглушка, переопределяется при использовании
    console.log(`Выполнение: ${action.type}`, action.params);
    return true;
  }

  /**
   * Остановить воспроизведение
   */
  stopPlayback() {
    if (this.isPlaying) {
      this.isPlaying = false;
      console.log('⏹️ Воспроизведение остановлено');
      return true;
    }
    return false;
  }

  /**
   * Удалить запись
   */
  deleteRecording(name) {
    if (!this.recordings.has(name)) {
      return false;
    }

    this.recordings.delete(name);
    this.db.remove({ name }, {}, () => {});

    console.log(`🗑️ Запись удалена: ${name}`);
    return true;
  }

  /**
   * Переименовать запись
   */
  renameRecording(oldName, newName) {
    const recording = this.getRecording(oldName);
    if (!recording) {
      return false;
    }

    this.recordings.delete(oldName);
    recording.name = newName;
    this.recordings.set(newName, recording);

    this.db.remove({ name: oldName }, {}, () => {});
    this.db.insert(recording, () => {});

    return true;
  }

  /**
   * Экспортировать запись (JSON)
   */
  exportRecording(name) {
    const recording = this.getRecording(name);
    if (!recording) {
      return null;
    }

    return JSON.stringify(recording, null, 2);
  }

  /**
   * Импортировать запись (JSON)
   */
  importRecording(jsonString) {
    try {
      const recording = JSON.parse(jsonString);
      if (!recording.name || !recording.actions) {
        throw new Error('Неверный формат записи');
      }

      this.recordings.set(recording.name, recording);
      this.db.insert(recording, () => {});

      console.log(`✓ Запись импортирована: ${recording.name}`);
      return true;
    } catch (e) {
      console.error(`Ошибка импорта: ${e.message}`);
      return false;
    }
  }

  /**
   * Получить информацию о записи
   */
  getRecordingInfo(name) {
    const recording = this.getRecording(name);
    if (!recording) {
      return null;
    }

    return {
      name: recording.name,
      duration: recording.duration,
      actionCount: recording.actionCount,
      created: new Date(recording.timestamp),
      actions: recording.actions.map((a, i) => ({
        sequence: i + 1,
        type: a.type,
        params: a.params,
        time: `${(a.timestamp / 1000).toFixed(2)}s`
      }))
    };
  }

  /**
   * Получить статистику записей
   */
  getStatistics() {
    const recordings = Array.from(this.recordings.values());

    if (recordings.length === 0) {
      return {
        total_recordings: 0,
        total_duration: 0,
        total_actions: 0,
        average_actions_per_recording: 0
      };
    }

    const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
    const totalActions = recordings.reduce((sum, r) => sum + r.actionCount, 0);

    return {
      total_recordings: recordings.length,
      total_duration: totalDuration,
      total_actions: totalActions,
      average_duration: (totalDuration / recordings.length).toFixed(0),
      average_actions_per_recording: (totalActions / recordings.length).toFixed(0)
    };
  }

  /**
   * Проверить статус записи
   */
  getStatus() {
    return {
      recording: this.isRecording,
      playing: this.isPlaying,
      current_recording: this.recordingName,
      total_recordings: this.recordings.size,
      current_actions: this.currentRecording.length
    };
  }
}

export default RecordingSystem;
