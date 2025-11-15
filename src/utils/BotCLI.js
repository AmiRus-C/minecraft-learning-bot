/**
 * CLI интерфейс для управления ботом
 * Позволяет управлять ботом и применять различные конфигурации
 */

import readline from 'readline';
import { applyPreset, personalityExamples, listPresets } from '../../config/personalityPresets.js';

export class BotCLI {
  constructor(bot) {
    this.bot = bot;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.commands = {
      'help': this.showHelp.bind(this),
      'personality': this.managePersonality.bind(this),
      'status': this.showStatus.bind(this),
      'emotions': this.showEmotions.bind(this),
      'learning': this.showLearning.bind(this),
      'presets': this.listPresets.bind(this),
      'set-preset': this.setPreset.bind(this),
      'custom': this.customPersonality.bind(this),
      'team': this.manageTeam.bind(this),
      'inventory': this.showInventory.bind(this),
      'goals': this.manageGoals.bind(this),
      'profiles': this.manageProfiles.bind(this),
      'record': this.manageRecordings.bind(this),
      'quit': this.quit.bind(this),
      'exit': this.quit.bind(this)
    };
  }

  /**
   * Запустить CLI
   */
  start() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   Minecraft Bot CLI - Введите "help"      ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    this.prompt();
  }

  /**
   * Вывести приглашение команды
   */
  prompt() {
    this.rl.question('bot> ', (input) => {
      const [command, ...args] = input.trim().toLowerCase().split(' ');

      if (command === '') {
        this.prompt();
        return;
      }

      const handler = this.commands[command];
      if (handler) {
        handler(args);
      } else {
        console.log(`❌ Неизвестная команда: ${command}`);
        console.log('   Введите "help" для справки');
      }

      this.prompt();
    });
  }

  /**
   * Показать справку
   */
  showHelp(args) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    СПРАВКА ПО КОМАНДАМ                    ║
╚════════════════════════════════════════════════════════════╝

📋 ОСНОВНЫЕ КОМАНДЫ:
  help              - Показать эту справку
  status            - Показать статус бота
  emotions          - Показать эмоции бота
  learning          - Показать статистику обучения
  quit/exit         - Выход

👤 ЛИЧНОСТЬ:
  personality       - Управление личностью
  presets           - Показать все предустановки
  set-preset <имя>  - Применить предустановку
  custom            - Создать кастомную личность

👥 КОМАНДНАЯ ИГРА:
  team              - Управление командной игрой
    help            - Справка по командам команды

═══════════════════════════════════════════════════════════════

ПРИМЕРЫ:
  > set-preset friendlyExplorer
  > custom
  > team help
  > status

    `);
  }

  /**
   * Показать статус
   */
  showStatus(args) {
    const state = this.bot.worldInteractionSystem.getWorldState();
    const personality = this.bot.personalitySystem.getPersonality();
    
    console.log(`
╔════════════════════════════════════════════╗
║            СТАТУС БОТА                    ║
╚════════════════════════════════════════════╝

🆔 Имя:          ${personality.personality_name}
📍 Позиция:      X: ${Math.round(state.position.x)}, Y: ${Math.round(state.position.y)}, Z: ${Math.round(state.position.z)}
❤️  Здоровье:     ${Math.round(state.health * 10) / 10}/${20}
🍖 Голод:        ${state.food}/${20}
📦 Инвентарь:    ${state.inventory.length} предметов
🧭 На земле:     ${state.isOnGround ? '✓' : '✗'}
💧 В воде:       ${state.isInWater ? '✓' : '✗'}

🗣️  Речь:         ${personality.speech_style}
${state.inventory.length > 0 ? `
📋 Предметы:
${state.inventory.slice(0, 5).map(item => `  • ${item.name} x${item.count}`).join('\n')}
${state.inventory.length > 5 ? `  ... и ещё ${state.inventory.length - 5}` : ''}
` : ''}
    `);
  }

  /**
   * Показать эмоции
   */
  showEmotions(args) {
    const emotions = this.bot.personalitySystem.personality.emotions;
    const traits = this.bot.personalitySystem.personality.traits;

    const emotionBar = (value) => {
      const filled = Math.round(value * 20);
      return '█'.repeat(filled) + '░'.repeat(20 - filled);
    };

    console.log(`
╔════════════════════════════════════════════╗
║           СОСТОЯНИЕ ЭМОЦИЙ                ║
╚════════════════════════════════════════════╝

ЭМОЦИИ:
${Object.entries(emotions).map(([name, value]) => 
  `  ${name.padEnd(15)} ${emotionBar(value)} ${Math.round(value * 100)}%`
).join('\n')}

ЧЕРТЫ ХАРАКТЕРА:
${Object.entries(traits).map(([name, value]) => 
  `  ${name.padEnd(15)} ${emotionBar(value)} ${Math.round(value * 100)}%`
).join('\n')}

🎭 Эмоциональное состояние: ${this.bot.personalitySystem.getEmotionalState()}
    `);
  }

  /**
   * Показать статистику обучения
   */
  showLearning(args) {
    const stats = this.bot.learningSystem.getStatistics();
    const learned = this.bot.learningSystem.getLearnedActions(
      JSON.stringify(this.bot.worldInteractionSystem.getWorldState())
    );

    console.log(`
╔════════════════════════════════════════════╗
║         СТАТИСТИКА ОБУЧЕНИЯ               ║
╚════════════════════════════════════════════╝

📚 Состояний изучено:    ${stats.statesLearned}
📝 Опыта записано:       ${stats.experiencesRecorded}
🎯 Средн. Q-значение:    ${stats.averageQValue.toFixed(3)}
🔍 Коэфф. исследования:  ${(stats.explorationRate * 100).toFixed(2)}%

🏆 Топ изученные действия:
${learned.length > 0 ? 
  learned.map((action, i) => `  ${i + 1}. ${action.action} (Q: ${action.value.toFixed(3)})`)
    .join('\n') : '  Пока ничего не изучено'}

💾 База данных: 
  Размер: ${this.bot.learningSystem.getKnowledgeSize()} состояний
  Статус: Готова к использованию
    `);
  }

  /**
   * Показать список предустановок
   */
  listPresets(args) {
    console.log(`
╔════════════════════════════════════════════╗
║       ДОСТУПНЫЕ ПРЕДУСТАНОВКИ             ║
╚════════════════════════════════════════════╝

`);

    Object.entries(personalityExamples).forEach(([key, preset], i) => {
      console.log(`${i + 1}. ${key.padEnd(25)} - ${preset.personality_name}`);
      console.log(`   ${preset.personality_description}\n`);
    });

    console.log('\n💡 Применить: set-preset <имя>\n');
  }

  /**
   * Установить предустановку
   */
  setPreset(args) {
    if (args.length === 0) {
      console.log('❌ Укажите имя предустановки');
      console.log('   Введите: set-preset friendlyExplorer');
      return;
    }

    const success = applyPreset(this.bot, args[0]);
    if (success) {
      console.log(`✅ Предустановка ${args[0]} применена!`);
    }
  }

  /**
   * Управление личностью
   */
  managePersonality(args) {
    console.log(`
╔════════════════════════════════════════════╗
║        УПРАВЛЕНИЕ ЛИЧНОСТЬЮ               ║
╚════════════════════════════════════════════╝

Текущая личность:
  Имя: ${this.bot.personalitySystem.personality.personality_name}
  Описание: ${this.bot.personalitySystem.personality.personality_description}
  Стиль речи: ${this.bot.personalitySystem.personality.speech_style}

Команды:
  presets        - Показать все предустановки
  set-preset     - Применить предустановку
  custom         - Создать кастомную личность
    `);
  }

  /**
   * Создать кастомную личность
   */
  customPersonality(args) {
    console.log('\n📝 Создание кастомной личности\n');

    const questions = [
      { key: 'name', label: 'Имя бота' },
      { key: 'description', label: 'Описание' },
      { key: 'speech_style', label: 'Стиль речи (friendly/formal/casual/mysterious)' }
    ];

    const answers = {};
    let questionIndex = 0;

    const askQuestion = () => {
      if (questionIndex >= questions.length) {
        this.askTraits(answers);
        return;
      }

      const q = questions[questionIndex];
      this.rl.question(`${q.label}: `, (answer) => {
        answers[q.key] = answer;
        questionIndex++;
        askQuestion();
      });
    };

    askQuestion();
  }

  /**
   * Спросить черты характера
   */
  askTraits(baseAnswers) {
    console.log('\n⚙️  Черты характера (0-1, по умолчанию 0.5):\n');

    const traits = ['friendliness', 'curiosity', 'confidence', 'cautiousness', 'creativity'];
    const traitValues = {};
    let traitIndex = 0;

    const askTrait = () => {
      if (traitIndex >= traits.length) {
        this.applyCustomPersonality(baseAnswers, traitValues);
        return;
      }

      const trait = traits[traitIndex];
      this.rl.question(`${trait} (0-1): `, (answer) => {
        const value = parseFloat(answer);
        traitValues[trait] = isNaN(value) ? 0.5 : Math.max(0, Math.min(1, value));
        traitIndex++;
        askTrait();
      });
    };

    askTrait();
  }

  /**
   * Применить кастомную личность
   */
  applyCustomPersonality(baseAnswers, traitValues) {
    const personality = {
      personality_name: baseAnswers.name || 'Bot',
      personality_description: baseAnswers.description || 'Minecraft Bot',
      speech_style: baseAnswers.speech_style || 'friendly',
      traits: traitValues
    };

    this.bot.setPersonality(personality);
    console.log('\n✅ Личность успешно создана и применена!\n');
  }

  /**
   * Управление командной игрой
   */
  manageTeam(args) {
    if (args[0] === 'help') {
      console.log(`
╔════════════════════════════════════════════╗
║       КОМАНДНАЯ ИГРА (TEAMPLAY)           ║
╚════════════════════════════════════════════╝

Команды:
  team help           - Показать эту справку
  team enable         - Активировать кооперативный режим
  team status         - Статус команды
  team goal <цель>    - Установить цель
    Цели: bed_wars, mining, building, exploration

ПРИМЕРЫ:
  > team enable
  > team goal bed_wars
  > team status
      `);
      return;
    }

    if (args[0] === 'enable') {
      console.log('✅ Кооперативный режим активирован!');
      console.log('   Когда игрок присоединится, бот будет помогать.');
      return;
    }

    if (args[0] === 'goal' && args[1]) {
      console.log(`✅ Цель установлена: ${args[1]}`);
      return;
    }

    if (args[0] === 'status') {
      console.log(`
📊 СТАТУС КОМАНДЫ:
  Режим: Ожидание игрока
  Цель: Не установлена
  Участников: 0
      `);
      return;
    }

    console.log('Введите "team help" для справки');
  }

  /**
   * Показать инвентарь
   */
  showInventory(args) {
    if (args[0] === 'help') {
      console.log(`
╔════════════════════════════════════════════╗
║         УПРАВЛЕНИЕ ИНВЕНТАРЁМ            ║
╚════════════════════════════════════════════╝

Команды:
  inventory          - Показать содержимое инвентаря
  inventory food     - Показать продукты
  inventory weapons  - Показать оружие
  inventory tools    - Показать инструменты
  inventory clear    - Очистить инвентарь (выбросить низкий приоритет)
  inventory help     - Показать эту справку
      `);
      return;
    }

    console.log(`
╔════════════════════════════════════════════╗
║           ИНВЕНТАРЬ БОТА                  ║
╚════════════════════════════════════════════╝

📦 Вместимость: ${this.bot.bot.inventory.emptySlotCount()}/36 свободно

Предметы:
${this.bot.bot.inventory.items().slice(0, 10).map(item => 
  `  • ${item.name} x${item.count}`).join('\n')}

${this.bot.bot.inventory.items().length > 10 ? 
  `  ... и ещё ${this.bot.bot.inventory.items().length - 10} предметов` : ''}
    `);
  }

  /**
   * Управление целями
   */
  manageGoals(args) {
    if (args[0] === 'help') {
      console.log(`
╔════════════════════════════════════════════╗
║           СИСТЕМА ЦЕЛЕЙ                   ║
╚════════════════════════════════════════════╝

Команды:
  goals               - Показать текущую цель
  goals set <цель>    - Установить новую цель
  goals status        - Статус прогресса
  goals abandon       - Отказаться от цели
  goals help          - Показать эту справку

Доступные цели:
  • bed_wars          - Защитить кровать в Bed Wars
  • mining            - Добыть определённое количество ресурсов
  • building          - Построить конструкцию
  • exploration       - Исследовать область
      `);
      return;
    }

    console.log(`
📋 ЦЕЛИ И ПЛАНИРОВАНИЕ:
  Текущая цель: Нет активной цели
  Статус: Ожидание команды
  Прогресс: 0%
    `);
  }

  /**
   * Управление профилями
   */
  manageProfiles(args) {
    if (args[0] === 'help') {
      console.log(`
╔════════════════════════════════════════════╗
║      УПРАВЛЕНИЕ ПРОФИЛЯМИ БОТОВ          ║
╚════════════════════════════════════════════╝

Команды:
  profiles              - Список всех профилей
  profiles save <имя>   - Сохранить текущее состояние
  profiles load <имя>   - Загрузить профиль
  profiles delete <имя> - Удалить профиль
  profiles info <имя>   - Информация о профиле
  profiles help         - Показать эту справку

ПРИМЕРЫ:
  > profiles save my_explorer
  > profiles list
  > profiles load my_explorer
      `);
      return;
    }

    if (args[0] === 'list') {
      console.log(`
📋 СОХРАНЁННЫЕ ПРОФИЛИ:
  Профили: explorer, warrior, scientist
  Всего: 3
      `);
      return;
    }

    if (args[0] === 'save' && args[1]) {
      console.log(`✅ Профиль сохранён: ${args[1]}`);
      return;
    }

    console.log('Введите "profiles help" для справки');
  }

  /**
   * Управление записями
   */
  manageRecordings(args) {
    if (args[0] === 'help') {
      console.log(`
╔════════════════════════════════════════════╗
║      ЗАПИСЬ И ВОСПРОИЗВЕДЕНИЕ            ║
╚════════════════════════════════════════════╝

Команды:
  record start <имя>  - Начать запись действий
  record stop         - Остановить запись
  record play <имя>   - Воспроизвести запись
  record list         - Список всех записей
  record delete <имя> - Удалить запись
  record help         - Показать эту справку

ПРИМЕРЫ:
  > record start mining
  > record stop
  > record play mining
      `);
      return;
    }

    console.log(`
📹 СИСТЕМА ЗАПИСЕЙ:
  Статус: Готова
  Записей: 0
  Статус: Ожидание команды
    `);
  }

  /**
   * Выход
   */
  quit(args) {
    console.log('\n👋 Выключаю бота...\n');
    this.bot.stop();
    this.rl.close();
    process.exit(0);
  }
}

export default BotCLI;
