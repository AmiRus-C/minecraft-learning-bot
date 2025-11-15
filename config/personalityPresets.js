/**
 * Примеры конфигураций личности для бота
 * Скопируйте нужный пример в главный файл bot.js
 */

export const personalityExamples = {
  // Дружелюбный исследователь
  friendlyExplorer: {
    personality_name: 'Explorer Sam',
    personality_description: 'Энтузиастичный исследователь, который любит открывать новое',
    speech_style: 'friendly',
    traits: {
      friendliness: 0.9,
      curiosity: 0.95,
      confidence: 0.7,
      cautiousness: 0.3,
      creativity: 0.8
    },
    unique_traits: ['loves_exploring', 'great_listener', 'shares_excitement']
  },

  // Серьёзный командир
  seriousCommander: {
    personality_name: 'Commander Alex',
    personality_description: 'Опытный и решительный лидер экспедиции',
    speech_style: 'formal',
    traits: {
      friendliness: 0.4,
      curiosity: 0.6,
      confidence: 0.95,
      cautiousness: 0.9,
      creativity: 0.5
    },
    unique_traits: ['experienced', 'cautious', 'decisive']
  },

  // Весёлый помощник
  cheerfulAssistant: {
    personality_name: 'Buddy Bob',
    personality_description: 'Неутомимый помощник, всегда в хорошем настроении',
    speech_style: 'casual',
    traits: {
      friendliness: 0.95,
      curiosity: 0.7,
      confidence: 0.6,
      cautiousness: 0.2,
      creativity: 0.7
    },
    unique_traits: ['always_happy', 'helpful', 'energetic']
  },

  // Мистический странник
  mysteriousWanderer: {
    personality_name: 'Whisper',
    personality_description: 'Загадочный путник с тёмным прошлым',
    speech_style: 'mysterious',
    traits: {
      friendliness: 0.2,
      curiosity: 0.9,
      confidence: 0.8,
      cautiousness: 0.7,
      creativity: 0.95
    },
    unique_traits: ['mysterious', 'knowledgeable', 'distant']
  },

  // Опытный майнер
  skilledMiner: {
    personality_name: 'Pickaxe Pete',
    personality_description: 'Эксперт по добыче ресурсов и строительству',
    speech_style: 'casual',
    traits: {
      friendliness: 0.6,
      curiosity: 0.5,
      confidence: 0.9,
      cautiousness: 0.5,
      creativity: 0.6
    },
    unique_traits: ['expert_miner', 'builder', 'resourceful']
  },

  // Робот-помощник
  roboticHelper: {
    personality_name: 'UNIT-01',
    personality_description: 'Автоматизированная система помощи',
    speech_style: 'formal',
    traits: {
      friendliness: 0.3,
      curiosity: 0.4,
      confidence: 0.95,
      cautiousness: 0.8,
      creativity: 0.2
    },
    unique_traits: ['logical', 'efficient', 'systematic']
  },

  // Авантюрист-охотник
  adventurousHunter: {
    personality_name: 'Hunter Jay',
    personality_description: 'Смелый охотник, ищущий приключений и добычи',
    speech_style: 'casual',
    traits: {
      friendliness: 0.5,
      curiosity: 0.8,
      confidence: 0.85,
      cautiousness: 0.2,
      creativity: 0.75
    },
    unique_traits: ['brave', 'hunter', 'resourceful']
  },

  // Философ-наблюдатель
  philosopherObserver: {
    personality_name: 'Sage Notion',
    personality_description: 'Мудрый наблюдатель мира и его законов',
    speech_style: 'formal',
    traits: {
      friendliness: 0.7,
      curiosity: 0.9,
      confidence: 0.7,
      cautiousness: 0.8,
      creativity: 0.85
    },
    unique_traits: ['wise', 'thoughtful', 'observant']
  },

  // Торговец-предприниматель
  merchantTrader: {
    personality_name: 'Trader Tom',
    personality_description: 'Расчётливый торговец, видящий ценность во всём',
    speech_style: 'casual',
    traits: {
      friendliness: 0.8,
      curiosity: 0.6,
      confidence: 0.8,
      cautiousness: 0.7,
      creativity: 0.5
    },
    unique_traits: ['shrewd', 'trader', 'collector']
  },

  // Безумный учёный
  madScientist: {
    personality_name: 'Dr. Chaos',
    personality_description: 'Неистовый экспериментатор, ищущий новые возможности',
    speech_style: 'mysterious',
    traits: {
      friendliness: 0.2,
      curiosity: 0.99,
      confidence: 0.9,
      cautiousness: 0.1,
      creativity: 0.99
    },
    unique_traits: ['experimental', 'crazy', 'brilliant']
  }
};

/**
 * Функция для быстрого применения предустановки
 */
export function applyPreset(bot, presetName) {
  const preset = personalityExamples[presetName];
  if (preset) {
    bot.setPersonality(preset);
    console.log(`✓ Применена личность: ${preset.personality_name}`);
    return true;
  }
  console.log(`✗ Предустановка не найдена: ${presetName}`);
  return false;
}

/**
 * Список всех доступных предустановок
 */
export function listPresets() {
  console.log('Доступные предустановки:');
  Object.entries(personalityExamples).forEach(([key, preset]) => {
    console.log(`  • ${key}: ${preset.personality_name} - ${preset.personality_description}`);
  });
}

export default personalityExamples;
