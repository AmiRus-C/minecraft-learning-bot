/**
 * Система двойного игрока (для игры в двоём)
 * Этот модуль позволяет боту взаимодействовать с реальным игроком
 */

export class CooperativeGameMode {
  constructor(bot, personalitySystem, worldInteractionSystem, chatSystem) {
    this.bot = bot;
    this.personalitySystem = personalitySystem;
    this.worldInteractionSystem = worldInteractionSystem;
    this.chatSystem = chatSystem;

    this.playerTarget = null;
    this.teamGoal = null;
    this.teamMembers = [];
    this.coordinationMessages = {
      meeting: [
        'Давайте встретимся!',
        'Где ты? Я иду к тебе!',
        'Видимся на встречу!'
      ],
      following: [
        'Я иду за тобой!',
        'Следую за тобой!',
        'Идёмте вместе!'
      ],
      help: [
        'Нужна помощь?',
        'Помогу тебе!',
        'Что делать?'
      ],
      warning: [
        'Опасность! Осторожнее!',
        'Смотри, враг!',
        'Внимание, атака!'
      ],
      success: [
        'Отлично! Мы справились!',
        'Успех! Хорошая работа!',
        'Мы сделали это!'
      ],
      strategy: [
        'Может быть, раздели на группы?',
        'Давайте координировать действия',
        'Нужен план!'
      ]
    };
  }

  /**
   * Инициировать режим игры в двоём
   */
  startCooperativeMode(playerName) {
    this.playerTarget = playerName;
    this.teamMembers = [this.bot.username, playerName];
    this.chatSystem.sendChat(
      this.bot,
      `Привет, ${playerName}! Давайте работать в команде!`
    );
    this.personalitySystem.updateEmotion('happiness', 0.3);
    this.personalitySystem.updateEmotion('excitement', 0.4);
  }

  /**
   * Установить общую цель
   */
  setTeamGoal(goal) {
    this.teamGoal = {
      name: goal,
      startTime: Date.now(),
      progress: 0,
      completed: false,
      steps: []
    };

    const goalMessages = {
      'bed_wars': 'Играем в Bed Wars! Защищаем нашу кровать!',
      'mining': 'Добываем ресурсы вместе!',
      'building': 'Строим что-то крутое!',
      'exploration': 'Исследуем мир вместе!',
      'hunting': 'Охотимся вместе!',
      'farming': 'Выращиваем урожай!'
    };

    const message = goalMessages[goal] || `Цель: ${goal}`;
    this.chatSystem.sendChat(this.bot, message);
  }

  /**
   * Следовать за игроком
   */
  async followPlayer(playerEntity) {
    if (!playerEntity) return false;

    // Держать дистанцию 2-3 блока
    const distance = this.bot.entity.position.distanceTo(playerEntity.position);

    if (distance > 3) {
      await this.worldInteractionSystem.moveTo(playerEntity.position);
      this.personalitySystem.updateEmotion('excitement', 0.1);
    } else if (distance > 10) {
      // Слишком далеко - спринт
      this.bot.setControlState('sprint', true);
      await new Promise(r => setTimeout(r, 1000));
      this.bot.setControlState('sprint', false);
    }

    return true;
  }

  /**
   * Защищать игрока
   */
  async protectPlayer(playerEntity, enemies) {
    if (!playerEntity || !enemies || enemies.length === 0) return false;

    // Атаковать врага, ближайшего к игроку
    let closestEnemy = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      const distToPlayer = playerEntity.position.distanceTo(enemy.position);
      if (distToPlayer < closestDistance) {
        closestDistance = distToPlayer;
        closestEnemy = enemy;
      }
    }

    if (closestEnemy) {
      // Встать между игроком и врагом
      const direction = playerEntity.position.minus(closestEnemy.position).normalize();
      const defendPos = playerEntity.position.plus(direction.scale(1.5));

      await this.worldInteractionSystem.moveTo(defendPos);
      await this.worldInteractionSystem.attackEntity(closestEnemy);
      
      this.chatSystem.sendChat(this.bot, this.getRandomMessage('warning'));
      this.personalitySystem.updateEmotion('excitement', 0.3);

      return true;
    }

    return false;
  }

  /**
   * Собрать ресурсы и поделиться
   */
  async harvestAndShare(resourceType, playerEntity) {
    const block = this.worldInteractionSystem.findNearestBlock(resourceType, 32);

    if (!block) return false;

    // Движение к блоку
    await this.worldInteractionSystem.moveTo(block.position);

    // Добыча нескольких блоков
    for (let i = 0; i < 5; i++) {
      const nearBlock = this.worldInteractionSystem.findNearestBlock(resourceType, 5);
      if (nearBlock) {
        await this.worldInteractionSystem.breakBlock(nearBlock);
        await new Promise(r => setTimeout(r, 200));
      }
    }

    // Сообщить игроку
    this.chatSystem.sendChat(this.bot, `Собрал ${resourceType}! Вот тебе!`);
    this.personalitySystem.addMemory({
      type: 'team_action',
      action: 'shared_resources',
      resource: resourceType,
      partner: playerEntity?.username || 'unknown'
    });

    return true;
  }

  /**
   * Bed Wars стратегия
   */
  async bedWarsStrategy(playerEntity, botTeam) {
    const strategy = {
      phases: [
        {
          name: 'early_game',
          duration: 300000, // 5 минут
          objectives: [
            'Собрать золото и железо',
            'Усилить броню',
            'Подготовить защиту'
          ]
        },
        {
          name: 'mid_game',
          duration: 600000, // 10 минут
          objectives: [
            'Укрепить позицию',
            'Расширить территорию',
            'Подготовиться к атаке'
          ]
        },
        {
          name: 'late_game',
          duration: Infinity,
          objectives: [
            'Атаковать другие команды',
            'Защищать кровать',
            'Уничтожить враги кровати'
          ]
        }
      ],

      tacticsAssignment: {
        aggressive: 'Я буду атаковать врагов!',
        defensive: 'Я буду защищать нашу базу!',
        resource_gather: 'Я собираю ресурсы!',
        support: 'Я поддерживаю тебя!'
      },

      emergencyProtocols: [
        'Враг у кровати! Защищаю!',
        'Кровать атакуется! Помогаю!',
        'Критическая ситуация! Приду на помощь!'
      ]
    };

    return strategy;
  }

  /**
   * Скоординированная атака
   */
  async coordinatedAttack(playerEntity, enemies) {
    if (!playerEntity || !enemies || enemies.length === 0) return false;

    // Атаковать одного врага вместе
    const targetEnemy = enemies[0];

    // Сообщить о координации
    this.chatSystem.sendChat(this.bot, 'Атакуем вместе!');

    // Синхронизировать атаки
    for (let i = 0; i < 5; i++) {
      await this.worldInteractionSystem.attackEntity(targetEnemy);
      await new Promise(r => setTimeout(r, 100));
    }

    this.personalitySystem.updateEmotion('excitement', 0.5);
    return true;
  }

  /**
   * Координированное строительство
   */
  async buildTogether(playerEntity, buildPlan) {
    this.chatSystem.sendChat(this.bot, 'Давайте строить вместе!');

    // Следовать плану строительства
    for (const step of buildPlan) {
      const block = this.worldInteractionSystem.findNearestBlock(step.type, 16);
      if (block) {
        await this.worldInteractionSystem.placeBlock(block, step.direction);
        await new Promise(r => setTimeout(r, 300));
      }
    }

    this.chatSystem.sendChat(this.bot, 'Готово! Хорошая работа!');
    this.personalitySystem.updateEmotion('happiness', 0.4);
  }

  /**
   * Система помощи
   */
  async assistPlayer(playerEntity, situationType) {
    const responses = {
      'in_danger': async () => {
        await this.protectPlayer(playerEntity, []);
        this.chatSystem.sendChat(this.bot, this.getRandomMessage('help'));
      },
      'low_health': async () => {
        // Предложить еду
        if (this.bot.inventory.items().some(item => item.name.includes('food'))) {
          this.chatSystem.sendChat(this.bot, 'Вот еда для восстановления!');
        }
      },
      'lost': async () => {
        await this.followPlayer(playerEntity);
        this.chatSystem.sendChat(this.bot, 'Пойдём отсюда вместе!');
      },
      'surrounded': async () => {
        this.chatSystem.sendChat(this.bot, this.getRandomMessage('warning'));
        await this.followPlayer(playerEntity);
      }
    };

    const handler = responses[situationType];
    if (handler) {
      await handler();
      return true;
    }

    return false;
  }

  /**
   * Рандомное сообщение из набора
   */
  getRandomMessage(category) {
    const messages = this.coordinationMessages[category];
    if (messages && messages.length > 0) {
      return messages[Math.floor(Math.random() * messages.length)];
    }
    return 'Готов помочь!';
  }

  /**
   * Получить статус команды
   */
  getTeamStatus() {
    return {
      members: this.teamMembers,
      goal: this.teamGoal?.name || 'Нет цели',
      progress: this.teamGoal?.progress || 0,
      completed: this.teamGoal?.completed || false,
      botMood: this.personalitySystem.getEmotionalState()
    };
  }

  /**
   * Завершить командную игру
   */
  endCooperativeMode(success = true) {
    if (success) {
      this.chatSystem.sendChat(this.bot, this.getRandomMessage('success'));
      this.personalitySystem.updateEmotion('happiness', 0.5);
    } else {
      this.chatSystem.sendChat(this.bot, 'Не получилось в этот раз. Попробуем ещё!');
      this.personalitySystem.updateEmotion('frustration', 0.2);
    }

    this.playerTarget = null;
    this.teamGoal = null;
    this.teamMembers = [];

    this.personalitySystem.addMemory({
      type: 'cooperative_game_session',
      success,
      timestamp: Date.now()
    });
  }
}

export default CooperativeGameMode;
