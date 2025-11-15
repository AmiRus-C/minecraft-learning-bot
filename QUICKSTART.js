/**
 * Быстрый старт бота
 * Этот файл помогает быстро начать работу с ботом и применять различные конфигурации
 */

import { PersonalitySystem } from './src/systems/PersonalitySystem.js';
import { LearningSystem } from './src/ai/LearningSystem.js';
import { WorldInteractionSystem } from './src/systems/WorldInteractionSystem.js';
import { ChatSystem } from './src/systems/ChatSystem.js';
import { CooperativeGameMode } from './src/systems/CooperativeGameMode.js';
import { personalityExamples, applyPreset } from './config/personalityPresets.js';

/**
 * БЫСТРЫЕ ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
 * 
 * Раскомментируйте нужный вариант в файле src/bot.js
 */

// ============================================================
// ПРИМЕР 1: Бот с предустановленной личностью
// ============================================================
export async function startBotWithPreset(bot, presetName) {
  // Применить предустановку
  applyPreset(bot, presetName);
  
  console.log(`✓ Бот запущен с личностью: ${presetName}`);
}

// ============================================================
// ПРИМЕР 2: Полностью кастомизированная личность
// ============================================================
export async function startBotWithCustomPersonality(bot) {
  bot.setPersonality({
    personality_name: 'Ваше_Имя',  // Измените здесь
    personality_description: 'Описание вашего бота',  // И здесь
    speech_style: 'friendly',  // friendly, formal, casual, mysterious
    
    traits: {
      friendliness: 0.7,       // 0 = холодный, 1 = очень дружелюбный
      curiosity: 0.8,          // 0 = унылый, 1 = очень любопытный
      confidence: 0.6,         // 0 = неуверенный, 1 = очень уверенный
      cautiousness: 0.5,       // 0 = рискованный, 1 = осторожный
      creativity: 0.7          // 0 = скучный, 1 = очень творческий
    }
  });

  console.log('✓ Бот начинает работу с кастомной личностью');
}

// ============================================================
// ПРИМЕР 3: Режим игры в двоём (Bed Wars)
// ============================================================
export async function startCoopGameMode(bot) {
  const cooperative = new CooperativeGameMode(
    bot.bot,
    bot.personalitySystem,
    bot.worldInteractionSystem,
    bot.chatSystem
  );

  // Когда игрок подключится, инициировать режим команды
  bot.bot.on('player_joined', (player) => {
    if (player.username !== bot.bot.username) {
      console.log(`${player.username} присоединился! Стартую кооперативный режим.`);
      
      cooperative.startCooperativeMode(player.username);
      cooperative.setTeamGoal('bed_wars');
      
      // Следовать за игроком
      const followInterval = setInterval(() => {
        const player = bot.bot.players[player.username]?.entity;
        if (player) {
          cooperative.followPlayer(player);
        }
      }, 1000);
    }
  });

  console.log('✓ Режим кооперативной игры активирован');
  return cooperative;
}

// ============================================================
// ПРИМЕР 4: Автоматическое обучение
// ============================================================
export async function enableAutoLearning(bot) {
  console.log('✓ Система автоматического обучения активирована');
  console.log('  Бот будет:');
  console.log('  - Исследовать мир (20% действий)');
  console.log('  - Учиться на результатах (80% действий)');
  console.log('  - Сохранять знания между сеансами');
  console.log('  - Развивать предпочтения и эмоции');
  
  // Отслеживать прогресс обучения
  const learningInterval = setInterval(() => {
    const stats = bot.learningSystem.getStatistics();
    console.log(
      `📚 Обучение: ${stats.statesLearned} состояний, ` +
      `${stats.experiencesRecorded} опытов, ` +
      `исследование: ${(stats.explorationRate * 100).toFixed(1)}%`
    );
  }, 30000); // Каждые 30 секунд
}

// ============================================================
// ПРИМЕР 5: Полный стартовый скрипт
// ============================================================
export const startupScripts = {
  /**
   * Минималистичный стартап
   */
  minimal: {
    name: 'Минимальная конфигурация',
    description: 'Базовый бот без специфических особенностей',
    setup: (bot) => {
      console.log('🤖 Стартап: Минимальная конфигурация');
      applyPreset(bot, 'friendlyExplorer');
    }
  },

  /**
   * Полнофункциональный стартап
   */
  fullFeatures: {
    name: 'Полные функции',
    description: 'Все системы включены: обучение, кооперативная игра, логирование',
    setup: async (bot) => {
      console.log('🤖 Стартап: Полные функции');
      
      // Установить личность
      applyPreset(bot, 'friendlyExplorer');
      
      // Включить обучение
      await enableAutoLearning(bot);
      
      // Включить кооперативный режим
      // await startCoopGameMode(bot);  // Раскомментируйте если нужно
      
      console.log('✅ Все системы готовы к работе!');
    }
  },

  /**
   * Режим разработки
   */
  development: {
    name: 'Разработка',
    description: 'Подробное логирование и отладка',
    setup: (bot) => {
      console.log('🤖 Стартап: Режим разработки');
      
      applyPreset(bot, 'seriousCommander');
      
      // Увеличить вывод отладки
      const logInterval = setInterval(() => {
        const state = bot.worldInteractionSystem.getWorldState();
        const personality = bot.personalitySystem.getPersonality();
        const learning = bot.learningSystem.getStatistics();
        
        console.log('\n--- ОТЛАДОЧНАЯ ИНФОРМАЦИЯ ---');
        console.log('Позиция:', state.position);
        console.log('Здоровье:', state.health);
        console.log('Эмоции:', personality.emotions);
        console.log('Обучение:', learning);
        console.log('------------------------------\n');
      }, 10000);
      
      console.log('✅ Режим разработки активирован');
    }
  },

  /**
   * Режим командной игры
   */
  teamplay: {
    name: 'Командная игра',
    description: 'Оптимизирован для игры с реальным игроком',
    setup: async (bot) => {
      console.log('🤖 Стартап: Командная игра');
      
      applyPreset(bot, 'cheerfulAssistant');
      
      // Включить кооперативный режим
      await startCoopGameMode(bot);
      
      console.log('✅ Командный режим активирован');
      console.log('Когда игрок присоединится, бот будет помогать в игре');
    }
  },

  /**
   * Исследователь
   */
  explorer: {
    name: 'Исследователь',
    description: 'Бот максимально исследует мир',
    setup: (bot) => {
      console.log('🤖 Стартап: Исследователь');
      
      applyPreset(bot, 'friendlyExplorer');
      
      // Немного увеличить curiosity
      bot.personalitySystem.personality.traits.curiosity = 0.99;
      
      console.log('✅ Режим исследования активирован');
      console.log('Бот будет максимально исследовать окружающий мир');
    }
  }
};

// ============================================================
// ФУНКЦИЯ ДЛЯ БЫСТРОГО ВЫБОРА СТАРТАПА
// ============================================================
export async function selectStartup(bot, scriptName = 'fullFeatures') {
  const script = startupScripts[scriptName];
  
  if (!script) {
    console.log('❌ Неизвестный стартап. Доступные:');
    console.log(Object.entries(startupScripts).map(
      ([name, info]) => `  • ${name}: ${info.description}`
    ).join('\n'));
    return false;
  }

  console.log(`\n🚀 Запуск: ${script.name}`);
  console.log(`📝 ${script.description}\n`);
  
  await script.setup(bot);
  return true;
}

// ============================================================
// СПРАВКА ПО КОМАНДАМ
// ============================================================
export function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          MINECRAFT LEARNING BOT - БЫСТРЫЙ СТАРТ            ║
╚════════════════════════════════════════════════════════════╝

📚 ДОСТУПНЫЕ ЛИЧНОСТИ:
  • friendlyExplorer   - Дружелюбный исследователь
  • seriousCommander   - Серьёзный командир
  • cheerfulAssistant  - Весёлый помощник
  • mysteriousWanderer - Мистический странник
  • skilledMiner       - Опытный майнер
  • roboticHelper      - Робот-помощник
  • adventurousHunter  - Авантюрист-охотник
  • philosopherObserver- Философ-наблюдатель
  • merchantTrader     - Торговец-предприниматель
  • madScientist       - Безумный учёный

🎮 ДОСТУПНЫЕ СТАРТАПЫ:
  • minimal        - Базовая конфигурация
  • fullFeatures   - Все системы включены
  • development    - Режим разработки с отладкой
  • teamplay       - Оптимизирован для игры в двоём
  • explorer       - Максимальное исследование

🗣️ СТИЛИ РЕЧИ:
  • friendly   - Дружелюбный
  • formal     - Формальный
  • casual     - Разговорный
  • mysterious - Загадочный

⚙️ ЧЕРТЫ ХАРАКТЕРА (0-1):
  • friendliness   - Дружелюбность
  • curiosity      - Любознательность
  • confidence     - Уверенность
  • cautiousness   - Осторожность
  • creativity     - Творчество

📖 КАК ИСПОЛЬЗОВАТЬ:

1. Минимальный стартап:
   npm start

2. С кастомной личностью (отредактируйте src/bot.js):
   await startBotWithCustomPersonality(bot);

3. Режим команды (для игры в двоём):
   await startCoopGameMode(bot);

4. С выбранным стартапом:
   await selectStartup(bot, 'teamplay');

💡 ПРИМЕРЫ:

   // Бот-исследователь
   applyPreset(bot, 'friendlyExplorer');

   // Серьёзный командир
   applyPreset(bot, 'seriousCommander');

   // Игра в двоём
   const coop = await startCoopGameMode(bot);
   coop.setTeamGoal('bed_wars');

🎯 СОВЕТЫ:

   • Запустите сервер Minecraft 1.16.5
   • Убедитесь, что он запущен на localhost:25565
   • Можно изменить в config/botConfig.js
   • Все данные сохраняются в папке data/
   • Логи смотрите в logs/bot.log

═══════════════════════════════════════════════════════════════
  `);
}

export default {
  startBotWithPreset,
  startBotWithCustomPersonality,
  startCoopGameMode,
  enableAutoLearning,
  selectStartup,
  printHelp,
  startupScripts
};
