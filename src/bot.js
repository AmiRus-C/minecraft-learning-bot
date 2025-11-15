/**
 * Главный файл бота Minecraft
 * Инициализирует все системы и управляет основным цклом поведения
 */

import mineflayer from 'mineflayer';
import { botConfig } from '../config/botConfig.js';
import { PersonalitySystem } from './systems/PersonalitySystem.js';
import { LearningSystem } from './ai/LearningSystem.js';
import { WorldInteractionSystem } from './systems/WorldInteractionSystem.js';
import { ChatSystem } from './systems/ChatSystem.js';
import { Logger } from './utils/Logger.js';
import { BotCLI } from './utils/BotCLI.js';

const logger = new Logger();

class MinecraftBot {
  constructor() {
    this.bot = null;
    this.personalitySystem = null;
    this.learningSystem = null;
    this.worldInteractionSystem = null;
    this.chatSystem = null;
    this.isRunning = false;
    this.mainLoopInterval = null;
    this.tickCount = 0;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 6;
    this.baseReconnectDelay = 3000; // ms
    // Глобальные обработчики ошибок процесса
    process.on('uncaughtException', (err) => {
      logger.error(`UncaughtException: ${err && err.stack ? err.stack : err}`);
      try {
        this.stopMainLoop();
        if (this.learningSystem && typeof this.learningSystem.saveKnowledge === 'function') {
          // Не ждем долго — даём короткую задержку для освобождения файлов
          this.learningSystem.saveKnowledge();
        }
      } catch (e) {
        logger.error(`Ошибка при обработке uncaughtException: ${e && e.message ? e.message : e}`);
      }
      // Попытка корректно завершить процесс
      setTimeout(() => process.exit(1), 1000);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(`UnhandledRejection: ${reason && reason.stack ? reason.stack : reason}`);
    });
  }

  async scheduleReconnect(reason) {
    try {
      // Попытаться сохранить знания перед переподключением (с коротким ожиданием)
      if (this.learningSystem && typeof this.learningSystem.saveKnowledge === 'function') {
        try {
          await Promise.race([
            this.learningSystem.saveKnowledge(),
            new Promise(res => setTimeout(res, 1000))
          ]);
        } catch (e) {
          logger.error(`Ошибка при сохранении знаний перед переподключением: ${e && e.message ? e.message : e}`);
        }
      }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error(`Превышено число попыток переподключения (${this.reconnectAttempts}). Останов.`);
        return;
      }

      const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
      logger.info(`Попытка переподключения #${this.reconnectAttempts + 1} через ${Math.round(delay / 1000)}s (причина: ${reason})`);

      // Увеличить счётчик и попытаться переподключиться
      this.reconnectAttempts += 1;

      setTimeout(async () => {
        try {
          // Очистить старое состояние
          if (this.bot) {
            try { this.bot.quit(); } catch (e) { /* ignore */ }
            this.bot = null;
          }

          await this.initialize();
        } catch (e) {
          logger.error(`Ошибка при попытке переподключения: ${e && e.message ? e.message : e}`);
          // Планируем следующую попытку
          this.scheduleReconnect('reconnect_failed');
        }
      }, delay);
    } catch (e) {
      logger.error(`scheduleReconnect internal error: ${e && e.message ? e.message : e}`);
    }
  }

  /**
   * Инициализировать и запустить бота
   */
  async initialize() {
    try {
      logger.info('Инициализация бота Minecraft...');

      // Создать бота
      this.bot = mineflayer.createBot({
        host: botConfig.connection.host,
        port: botConfig.connection.port,
        username: botConfig.connection.username,
        version: botConfig.connection.version,
        auth: botConfig.connection.auth || 'microsoft', // offline для пиратских серверов
        keepAlive: true,
        checkTimeoutInterval: 60 * 1000,
        noPongTimeout: 20 * 1000
      });

      // Инициализировать системы
      this.personalitySystem = new PersonalitySystem();
      this.learningSystem = new LearningSystem();
      this.worldInteractionSystem = new WorldInteractionSystem(
        this.bot,
        this.learningSystem,
        this.personalitySystem
      );
      this.chatSystem = new ChatSystem(this.personalitySystem);

      // Загрузить личность
      await this.personalitySystem.loadPersonality();
      await this.learningSystem.loadKnowledge();

      // Инициализировать CLI
      this.cli = new BotCLI(this);

      // Регистрировать события
      this.setupEventListeners();

      logger.success('Системы инициализированы');
    } catch (e) {
      logger.error(`Ошибка инициализации: ${e.message}`);
      process.exit(1);
    }
  }

  /**
   * Настроить обработчики событий
   */
  setupEventListeners() {
    // Подключение
    this.bot.on('login', () => {
      logger.success(`Бот подключился как ${this.bot.username}`);
      this.chatSystem.sendChat(this.bot, this.chatSystem.generateGreeting());
      this.personalitySystem.updateEmotion('happiness', 0.2);
      
      // Запустить CLI после успешного подключения
      setTimeout(() => {
        this.cli.start();
      }, 1000);
      
      this.startMainLoop();
    });

    // Ошибка подключения
    this.bot.on('error', err => {
      logger.error(`Ошибка бота: ${err.stack || err.message}`);
      
      // Остановить основной цикл при ошибке
      this.stopMainLoop();
      
      // Попробовать переподключиться при фатальной ошибке
      this.scheduleReconnect(err && err.message ? String(err.message) : 'error');
    });

    // Отключение
    this.bot.on('end', () => {
      logger.warn('Бот отключился (end)');
      
      // Остановить основной цикл
      this.stopMainLoop();
      
      // Подождать перед сохранением, чтобы файлы освободились
      setTimeout(() => {
        this.scheduleReconnect('end');
      }, 500);
    });

    // Если бот был кикнут сервером — получить причину
    this.bot.on('kicked', (reason, loggedIn) => {
      logger.warn(`Бот был кикнут. Причина: ${reason || 'не указана'}, loggedIn=${loggedIn}`);
      this.stopMainLoop();
      this.scheduleReconnect('kicked');
    });

    // Событие close для socket-level
    this.bot.on('close', (hadError) => {
      logger.warn(`Соединение закрыто. hadError=${hadError}`);
      this.stopMainLoop();
      this.scheduleReconnect('close');
    });

    // Когда бот появляется
    this.bot.on('spawn', () => {
      logger.success('Бот появился в мире');
      this.personalitySystem.updateEmotion('excitement', 0.15);
    });

    // Смерть бота
    this.bot.on('death', () => {
      logger.warn('Бот умер');
      this.personalitySystem.updateEmotion('fear', 0.3);
      this.personalitySystem.updateEmotion('frustration', 0.2);
    });

    // Получение сообщения в чате
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      logger.info(`[CHAT] ${username}: ${message}`);
      this.handleChatMessage(username, message);
    });

    // Новая сущность
    this.bot.on('entitySpawned', entity => {
      if (entity.type === 'player' && entity.username !== this.bot.username) {
        logger.info(`Игрок ${entity.username} появился`);
        this.personalitySystem.updateEmotion('curiosity', 0.1);
      } else if (entity.type === 'mob') {
        logger.info(`Моб ${entity.name} появился`);
      }
    });

    // Здоровье изменилось
    this.bot.on('health', () => {
      if (this.bot.health < 5) {
        logger.warn('Здоровье критическое!');
        this.personalitySystem.updateEmotion('fear', 0.2);
      }
    });

    // Сообщение от сервера
    this.bot.on('messagestr', (message) => {
      logger.debug(`Сообщение сервера: ${message}`);
    });
  }

  /**
   * Обработить сообщение в чате
   */
  handleChatMessage(username, message) {
    // Ответить на приветствие
    if (message.toLowerCase().includes('привет')) {
      const responses = [
        'Привет!',
        `Привет, ${username}!`,
        'Здравствуй!'
      ];
      setTimeout(() => {
        this.chatSystem.sendChat(
          this.bot,
          responses[Math.floor(Math.random() * responses.length)]
        );
      }, 500);
    }

    // Ответить на вопрос о статусе
    if (message.toLowerCase().includes('как') || message.toLowerCase().includes('статус')) {
      setTimeout(() => {
        const state = this.worldInteractionSystem.getWorldState();
        this.chatSystem.sendChat(
          this.bot,
          this.chatSystem.generateStatusMessage(state)
        );
      }, 500);
    }

    // Ответить на спасибо
    if (message.toLowerCase().includes('спасибо')) {
      setTimeout(() => {
        this.chatSystem.sendChat(this.bot, 'Всегда пожалуйста!');
      }, 500);
    }

    this.personalitySystem.addMemory({
      type: 'chat_message',
      player: username,
      message: message,
      timestamp: Date.now()
    });
  }

  /**
   * Главный цикл поведения бота
   */
  startMainLoop() {
    this.isRunning = true;
    logger.info('Главный цикл запущен');

    this.mainLoopInterval = setInterval(() => {
      try {
        this.mainLoop();
      } catch (e) {
        logger.error(`Ошибка в главном цикле: ${e.message}`);
      }
    }, 1000); // Один раз в секунду
  }

  /**
   * Остановить главный цикл
   */
  stopMainLoop() {
    if (this.mainLoopInterval) {
      clearInterval(this.mainLoopInterval);
      this.mainLoopInterval = null;
    }
    this.isRunning = false;
  }

  /**
   * Основная логика поведения
   */
  mainLoop() {
    if (!this.isRunning || !this.bot) return;

    try {
      this.tickCount++;

      const state = this.worldInteractionSystem.getWorldState();
      const currentState = JSON.stringify(state);
      const possibleActions = this.getPossibleActions();

      // Выбрать действие на основе обучения
      const action = this.learningSystem.chooseAction(
        currentState,
        possibleActions
      );

      // Выполнить действие и получить награду
      this.executeAction(action, state).then(reward => {
        try {
          // Обновить знания на основе результата
          const newState = JSON.stringify(this.worldInteractionSystem.getWorldState());
          const nextActions = this.getPossibleActions();

          this.learningSystem.recordExperience(
            currentState,
            action,
            reward,
            newState,
            nextActions
          );
        } catch (e) {
          logger.error(`Ошибка при обновлении опыта: ${e.message}`);
        }
      }).catch(err => {
        logger.error(`Ошибка при выполнении действия: ${err && err.message ? err.message : err}`);
      });

      // Периодически отправлять сообщения
      if (this.tickCount % 30 === 0) {
        try {
          this.chatSystem.sendChatWithProbability(
            this.bot,
            this.chatSystem.generateEmotionalMessage(),
            0.2
          );
        } catch (e) {
          // Игнорировать ошибки при отправке сообщений
        }
      }

      // Периодически сохранять данные
      if (this.tickCount % 100 === 0) {
        try {
          this.personalitySystem.savePersonality();
          this.learningSystem.saveKnowledge();
          this.logBotStatus();
        } catch (e) {
          logger.error(`Ошибка при сохранении данных: ${e.message}`);
        }
      }
    } catch (e) {
      logger.error(`Неожиданная ошибка в mainLoop: ${e.message}`);
    }

    // Снизить скорость исследования со временем
    if (this.tickCount % 500 === 0) {
      this.learningSystem.decreaseExploration();
    }

    // Снизить негативные эмоции со временем
    this.personalitySystem.updateEmotion('fear', -0.01);
    this.personalitySystem.updateEmotion('frustration', -0.01);
  }

  /**
   * Получить возможные действия
   */
  getPossibleActions() {
    return [
      'idle',
      'explore',
      'mine_wood',
      'mine_stone',
      'hunt_animal',
      'collect_items',
      'rest',
      'build',
      'climb'
    ];
  }

  /**
   * Выполнить действие
   */
  async executeAction(action, state) {
    let reward = 0;

    try {
      switch (action) {
        case 'explore':
          reward = await this.performExplore();
          break;

        case 'mine_wood':
          reward = await this.performMineResource('oak_log', 'дерево');
          break;

        case 'mine_stone':
          reward = await this.performMineResource('stone', 'камень');
          break;

        case 'hunt_animal':
          reward = await this.performHunt();
          break;

        case 'collect_items':
          reward = await this.performCollectItems();
          break;

        case 'rest':
          reward = await this.performRest();
          break;

        case 'build':
          reward = await this.performBuild();
          break;

        case 'climb':
          reward = await this.performClimb();
          break;

        case 'idle':
        default:
          reward = await this.performIdle();
          break;
      }

      // Добавить бонус если здоровье хорошее
      reward += this.bot.health / 20 * 0.1;
    } catch (e) {
      logger.error(`Ошибка при выполнении действия ${action}: ${e.message}`);
      reward = -0.5;
    }

    return reward;
  }

  /**
   * Исследовать окрестности
   */
  async performExplore() {
    const randomDirection = Math.random() * Math.PI * 2;
    const distance = 10;
    const targetX = this.bot.entity.position.x + Math.cos(randomDirection) * distance;
    const targetZ = this.bot.entity.position.z + Math.sin(randomDirection) * distance;

    // Сформировать позицию и получить блок корректно: в некоторых версиях API
    // функция blockAt находится на объекте bot, а не на bot.world
    const targetPos = {
      x: Math.floor(targetX),
      y: Math.floor(this.bot.entity.position.y),
      z: Math.floor(targetZ)
    };

    let targetBlock = null;
    try {
      if (typeof this.bot.blockAt === 'function') {
        targetBlock = this.bot.blockAt(targetPos);
      } else if (this.bot.world && typeof this.bot.world.getBlock === 'function') {
        targetBlock = this.bot.world.getBlock(targetPos);
      }
    } catch (e) {
      logger.error(`Ошибка при попытке получить блок по позиции: ${e && e.message ? e.message : e}`);
      targetBlock = null;
    }

    if (targetBlock) {
      await this.worldInteractionSystem.moveTo(targetBlock.position);
      this.personalitySystem.updateEmotion('curiosity', 0.1);
      return 0.5;
    }

    return 0.1;
  }

  /**
   * Добывать ресурсы
   */
  async performMineResource(blockType, blockName) {
    const block = this.worldInteractionSystem.findNearestBlock(blockType, 16);

    if (block) {
      await this.worldInteractionSystem.breakBlock(block);
      this.chatSystem.sendChatWithProbability(
        this.bot,
        this.chatSystem.generateActionMessage(blockName),
        0.2
      );
      this.personalitySystem.addFavoriteActivity(`mine_${blockName}`);
      return 1.0;
    }

    return 0;
  }

  /**
   * Охотиться на животных
   */
  async performHunt() {
    const entity = this.worldInteractionSystem.findNearestEntity('cow', 16);

    if (entity) {
      await this.worldInteractionSystem.moveTo(entity.position);
      await this.worldInteractionSystem.attackEntity(entity);
      this.personalitySystem.updateEmotion('excitement', 0.15);
      return 0.8;
    }

    return 0;
  }

  /**
   * Собрать предметы
   */
  async performCollectItems() {
    const count = await this.worldInteractionSystem.collectNearbyItems(16);
    if (count > 0) {
      return count * 0.3;
    }
    return 0;
  }

  /**
   * Отдохнуть
   */
  async performRest() {
    this.worldInteractionSystem.stopMoving();
    this.personalitySystem.updateEmotion('happiness', 0.1);
    this.personalitySystem.updateEmotion('frustration', -0.1);
    return 0.3;
  }

  /**
   * Строить
   */
  async performBuild() {
    const block = this.worldInteractionSystem.findNearestBlock('dirt', 16);
    if (block) {
      await this.worldInteractionSystem.placeBlock(block, 'up');
      this.personalitySystem.addFavoriteActivity('building');
      return 0.7;
    }
    return 0;
  }

  /**
   * Карабкаться
   */
  async performClimb() {
    this.worldInteractionSystem.jump();
    return 0.2;
  }

  /**
   * Бездействие
   */
  async performIdle() {
    this.worldInteractionSystem.stopMoving();
    return 0.05;
  }

  /**
   * Логировать статус бота
   */
  logBotStatus() {
    const personality = this.personalitySystem.getPersonality();
    const stats = this.learningSystem.getStatistics();
    const state = this.worldInteractionSystem.getWorldState();

    logger.info(
      `СТАТУС: Здоровье=${state.health.toFixed(1)}, Голод=${state.food}, ` +
      `Эмоции=${this.personalitySystem.getEmotionalState()}`
    );
    logger.info(
      `ОБУЧЕНИЕ: Состояний=${stats.statesLearned}, Записей=${stats.experiencesRecorded}, ` +
      `Исследование=${(stats.explorationRate * 100).toFixed(1)}%`
    );
  }

  /**
   * Установить личность бота
   */
  setPersonality(config) {
    this.personalitySystem.setPersonality(config);
    logger.info(`Личность установлена: ${config.personality_name}`);
    this.chatSystem.sendChat(
      this.bot,
      `Моё имя теперь ${config.personality_name}. Приятно познакомиться!`
    );
  }

  /**
   * Остановить бота
   */
  stop() {
    this.isRunning = false;
    if (this.mainLoopInterval) {
      clearInterval(this.mainLoopInterval);
    }

    // Сохранить данные перед выходом
    this.personalitySystem.savePersonality();
    this.learningSystem.saveKnowledge();

    this.chatSystem.sendChat(this.bot, this.chatSystem.generateFarewellMessage());

    if (this.bot) {
      this.bot.quit();
    }

    logger.success('Бот остановлен');
  }
}

// Главная функция
async function main() {
  const bot = new MinecraftBot();

  // Установить пользовательскую личность (опционально)
  // Раскомментируйте и отредактируйте для установки своей личности
  /*
  bot.personalitySystem = new PersonalitySystem();
  bot.personalitySystem.setPersonality({
    personality_name: 'Мой Бот',
    personality_description: 'Дружелюбный и любопытный бот',
    speech_style: 'friendly', // friendly, formal, casual, mysterious
    traits: {
      friendliness: 0.8,
      curiosity: 0.9,
      confidence: 0.6,
      cautiousness: 0.3,
      creativity: 0.7
    }
  });
  */

  await bot.initialize();

  // Обработчики завершения программы
  process.on('SIGINT', () => {
    logger.warn('Получен сигнал SIGINT, остановка бота...');
    bot.stop();
    process.exit(0);
  });

  process.on('uncaughtException', (err) => {
    logger.error(`Необработанное исключение: ${err.message}`);
    bot.stop();
    process.exit(1);
  });
}

// Запустить бота
main().catch(err => {
  logger.error(`Критическая ошибка: ${err.message}`);
  process.exit(1);
});
