/**
 * Утилиты для логирования и отладки
 */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export class Logger {
  constructor(filename = 'bot.log') {
    this.logFile = path.join('./logs', filename);

    // Создать директорию если её нет
    if (!fs.existsSync('./logs')) {
      fs.mkdirSync('./logs');
    }
  }

  /**
   * Логировать информацию
   */
  info(message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const formatted = `[${timestamp}] [INFO] ${message}`;
    console.log(chalk.blue(formatted));
    this._writeToFile(formatted);
  }

  /**
   * Логировать успех
   */
  success(message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const formatted = `[${timestamp}] [SUCCESS] ${message}`;
    console.log(chalk.green(formatted));
    this._writeToFile(formatted);
  }

  /**
   * Логировать предупреждение
   */
  warn(message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const formatted = `[${timestamp}] [WARN] ${message}`;
    console.log(chalk.yellow(formatted));
    this._writeToFile(formatted);
  }

  /**
   * Логировать ошибку
   */
  error(message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const formatted = `[${timestamp}] [ERROR] ${message}`;
    console.log(chalk.red(formatted));
    this._writeToFile(formatted);
  }

  /**
   * Логировать отладку
   */
  debug(message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const formatted = `[${timestamp}] [DEBUG] ${message}`;
    console.log(chalk.gray(formatted));
    this._writeToFile(formatted);
  }

  /**
   * Записать в файл
   */
  _writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n', 'utf8');
    } catch (e) {
      console.error('Error writing to log file:', e);
    }
  }

  /**
   * Очистить логи
   */
  clear() {
    try {
      fs.writeFileSync(this.logFile, '', 'utf8');
    } catch (e) {
      console.error('Error clearing log file:', e);
    }
  }
}

export default Logger;
