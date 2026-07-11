/**
 Конфигурация бота Minecraft
 Здесь указываются все основные параметры подключения и поведения
 */

export const botConfig = {
  // Подключение к серверу
  connection: {
    host: 'localhost',
    port: HERE_YOUR_PORT,
    username: 'MinecraftAI',
    version: '1.16.5',
    auth: 'offline' // Пиратский сервер (offline-mode)
  },

  // Параметры поведения
  behavior: {
    // Максимальное расстояние для взаимодействия с блоками
    interactionRange: 5.5,
    // Максимальная высота, на которую может прыгать бот
    maxJumpHeight: 1.5,
    // Скорость движения
    walkSpeed: 4.3,
    // Скорость спринта
    sprintSpeed: 5.6
  },

  // Параметры памяти
  memory: {
    // Максимальное количество записей в памяти
    maxMemorySize: 2000,
    // Время жизни памяти (в миллисекундах)
    memoryExpiration: 24 * 60 * 60 * 1000 // 24 часа
  },

  // Параметры обучения
  learning: {
    // Вероятность экспериментирования с новыми действиями
    explorationRate: 0.1,
    // Коэффициент обучения
    learningRate: 0.7,
    // Фактор дисконтирования будущих вознаграждений
    discountFactor: 0.9
  },

  // Логирование
  logging: {
    debug: false, // отключить trace warnings (слишком шумно для Aternos)
    logFile: './logs/bot.log'
  }
};

export default botConfig;
