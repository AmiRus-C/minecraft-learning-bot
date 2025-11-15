/**
 * Система чата бота
 * Генерирует и отправляет сообщения с учётом личности
 */

export class ChatSystem {
  constructor(personalitySystem) {
    this.personalitySystem = personalitySystem;

    // Шаблоны сообщений в зависимости от речевого стиля
    this.messageTemplates = {
      friendly: {
        greeting: [
          "Привет! Я так рад начать приключение!",
          "Привет! Давайте исследовать этот мир вместе!",
          "Здравствуйте! Я готов помочь!"
        ],
        discovery: [
          "Ого! Я только что нашёл {item}!",
          "Какой класс! {item} здесь!",
          "Интересно, {item} может быть полезен!"
        ],
        action: [
          "Я собираюсь добыть {block}",
          "Давайте нарубим {block}",
          "Я начинаю работать с {block}"
        ],
        danger: [
          "Осторожно! Опасность рядом!",
          "Я вижу проблему! Надо быть внимательнее!",
          "Это может быть опасно!"
        ],
        farewell: [
          "Спасибо за компанию! До встречи!",
          "Было весело! До свидания!",
          "Пока! Было приятно с вами!"
        ]
      },

      formal: {
        greeting: [
          "Добрый день. Я готов приступить к выполнению задач.",
          "Здравствуйте. Перейдём к деятельности.",
          "Добрый день. Я операционен и готов к работе."
        ],
        discovery: [
          "Был обнаружен ресурс: {item}",
          "Результат сканирования: {item} найден",
          "Элемент идентифицирован: {item}"
        ],
        action: [
          "Инициирую добычу: {block}",
          "Начиная операцию с {block}",
          "Приступаю к работе с {block}"
        ],
        danger: [
          "Обнаружена угроза безопасности.",
          "Пришла рекомендация соблюдать осторожность.",
          "Система безопасности активирована."
        ],
        farewell: [
          "Сессия завершена. До свидания.",
          "Отключение приложения. Спасибо за работу.",
          "Завершение работы. Благодарю."
        ]
      },

      casual: {
        greeting: [
          "Ёй! Давайте начнём!",
          "Хай! Готов ко всему!",
          "Привет, чувак! Поехали!"
        ],
        discovery: [
          "Ооо, {item}! Прикольно!",
          "Нашёл {item}! Кайф!",
          "{item} - не плохо!"
        ],
        action: [
          "Ломаю {block}",
          "Работаю с {block}",
          "Добываю {block}"
        ],
        danger: [
          "Ва! Опасно!",
          "Стоп! Опасность!",
          "Не очень хорошо выглядит!"
        ],
        farewell: [
          "Бай! Было кайф!",
          "Пока, чувак!",
          "До встречи! Было супер!"
        ]
      },

      mysterious: {
        greeting: [
          "Я пришел из кода... готов ко всему неизведанному...",
          "Тьма и свет... начинается путь...",
          "Я здесь... наблюдаю..."
        ],
        discovery: [
          "Интересно... я чувствую {item}...",
          "{item}... да, я вижу это...",
          "Судьба привела меня к {item}..."
        ],
        action: [
          "Я трансформирую {block}...",
          "{block}... предназначен для моей работы...",
          "Управляю судьбой {block}..."
        ],
        danger: [
          "Темнота... опасность... я чувствую её...",
          "Что-то зловещее... берегись...",
          "Силы тьмы пробуждаются..."
        ],
        farewell: [
          "Я уходу... в коды вернусь...",
          "Прощай... мы встретимся снова...",
          "Судьба указывает путь... прощай..."
        ]
      }
    };
  }

  /**
   * Получить рандомный шаблон из массива
   */
  getRandomTemplate(templates) {
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Сгенерировать сообщение о приветствии
   */
  generateGreeting() {
    const style = this.personalitySystem.personality.speech_style;
    const templates = this.messageTemplates[style]?.greeting || this.messageTemplates.friendly.greeting;
    return this.getRandomTemplate(templates);
  }

  /**
   * Сгенерировать сообщение об открытии
   */
  generateDiscoveryMessage(item) {
    const style = this.personalitySystem.personality.speech_style;
    const templates = this.messageTemplates[style]?.discovery || this.messageTemplates.friendly.discovery;
    const template = this.getRandomTemplate(templates);
    return template.replace('{item}', item);
  }

  /**
   * Сгенерировать сообщение о действии
   */
  generateActionMessage(block) {
    const style = this.personalitySystem.personality.speech_style;
    const templates = this.messageTemplates[style]?.action || this.messageTemplates.friendly.action;
    const template = this.getRandomTemplate(templates);
    return template.replace('{block}', block);
  }

  /**
   * Сгенерировать сообщение об опасности
   */
  generateDangerMessage() {
    const style = this.personalitySystem.personality.speech_style;
    const templates = this.messageTemplates[style]?.danger || this.messageTemplates.friendly.danger;
    return this.getRandomTemplate(templates);
  }

  /**
   * Сгенерировать прощальное сообщение
   */
  generateFarewellMessage() {
    const style = this.personalitySystem.personality.speech_style;
    const templates = this.messageTemplates[style]?.farewell || this.messageTemplates.friendly.farewell;
    return this.getRandomTemplate(templates);
  }

  /**
   * Сгенерировать сообщение на основе эмоционального состояния
   */
  generateEmotionalMessage() {
    const emotions = this.personalitySystem.personality.emotions;
    const dominantEmotion = Object.entries(emotions)
      .sort(([, a], [, b]) => b - a)[0][0];

    const emotionalResponses = {
      happiness: [
        "Я так счастлив! Всё идёт отлично!",
        "Мне нравится это! Продолжим!",
        "Вот это да! Жизнь прекрасна!"
      ],
      frustration: [
        "Это раздражает... давайте попробуем ещё раз...",
        "Не совсем так... буду внимательнее...",
        "Хм, это не сработало как планировалось..."
      ],
      fear: [
        "Это пугает... давайте будем осторожнее...",
        "Я боюсь... но продолжу попытку...",
        "Это опасно... нужна помощь..."
      ],
      excitement: [
        "Это невероятно! Я в восторге!",
        "Ура! Это так интересно!",
        "Вау! Не могу остановиться!"
      ],
      curiosity: [
        "Что это? Надо разобраться!",
        "Интересно, зачем это нужно?",
        "Я хочу больше узнать об этом!"
      ]
    };

    const responses = emotionalResponses[dominantEmotion] || [
      "Я здесь и наблюдаю за ситуацией.",
      "Продолжу работу...",
      "Интересно, что дальше?"
    ];

    return this.getRandomTemplate(responses);
  }

  /**
   * Генерировать сообщение о статусе
   */
  generateStatusMessage(state) {
    const health = state.health;
    const food = state.food;
    const itemCount = state.inventory.length;

    if (health < 5) {
      return "Я ранен! Надо найти еду и восстановиться!";
    }

    if (food < 3) {
      return "Я голоден! Нужно поесть!";
    }

    if (itemCount > 30) {
      return "Мой инвентарь почти полный! Надо что-то сделать с предметами!";
    }

    const statusMessages = [
      `Состояние: ОК. Здоровье: ${health}, Голод: ${food}`,
      `Я чувствую себя ${health > 15 ? "хорошо" : "не очень"}. Продолжу исследование.`,
      `Ресурсы: ${itemCount} предметов. Здоровье: ${Math.ceil(health)}.`
    ];

    return this.getRandomTemplate(statusMessages);
  }

  /**
   * Отправить сообщение в чат сервера
   */
  sendChat(bot, message) {
    try {
      if (!message || message.length === 0) return;
      if (!bot) {
        console.log(`[BOT CHAT SKIPPED - no bot]: ${message}`);
        return;
      }

      // Если у клиента есть низкоуровневая функция chat — безопасно вызвать mineflayer chat
      if (bot._client && typeof bot._client.chat === 'function' && typeof bot.chat === 'function') {
        try {
          bot.chat(message);
        } catch (e) {
          console.log('[BOT CHAT ERROR] bot.chat threw:', e && e.message);
        }

      // Если нет bot._client.chat, но есть write — используем низкоуровневую отправку
      } else if (bot._client && typeof bot._client.write === 'function') {
        try {
          // Для разных протоколов может быть разный пакет, но 'chat' обычно работает
          bot._client.write('chat', { message });
        } catch (e) {
          console.log('[BOT CHAT ERROR] low-level chat failed', e && e.message);
        }

      } else if (typeof bot.chat === 'function') {
        // Последний вариант: если bot.chat есть, но _client.chat отсутствует — избегаем вызова (он ломает)
        try {
          // Попробуем обёртку, но перехватим ошибку
          bot.chat(message);
        } catch (e) {
          console.log('[BOT CHAT ERROR] bot.chat fallback failed:', e && e.message);
        }
      } else {
        console.log(`[BOT CHAT SKIPPED - chat method missing]: ${message}`);
      }

      console.log(`[BOT CHAT]: ${message}`);
    } catch (e) {
      console.log('[BOT CHAT EXCEPTION]:', e && e.stack ? e.stack : e);
    }
  }

  /**
   * Отправить сообщение с вероятностью (чтобы не спамить)
   */
  sendChatWithProbability(bot, message, probability = 0.3) {
    if (Math.random() < probability && message.length > 0) {
      this.sendChat(bot, message);
    }
  }
}

export default ChatSystem;
