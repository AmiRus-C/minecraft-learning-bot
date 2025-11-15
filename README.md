# Minecraft Learning Bot

**Версия:** 0.0.1  
**Автор:** [AmiRus-C](https://github.com/AmiRus-C) (Nicshuz_)

Продвинутый бот для Minecraft версии 1.16.5 с возможностью самообучения, использованием личности и взаимодействием с миром.

## Особенности

### 🤖 Система Личности
- **Полностью настраиваемая личность** - имя, описание, черты характера
- **4 стиля речи** - дружелюбный, формальный, разговорный, мистический
- **Система эмоций** - счастье, страх, возбуждение, любопытство, раздражение
- **Память о событиях** - бот помнит свой опыт
- **Развивающиеся предпочтения** - любимые и нелюбимые действия

### 🧠 Система Обучения
- **Q-Learning** - алгоритм обучения с подкреплением
- **Адаптивное исследование** - бот начинает с исследования, переходя к эксплуатации знаний
- **Persisting Knowledge** - всё выученное сохраняется между сеансами
- **Статистика обучения** - отслеживание прогресса

### 🌍 Взаимодействие с Миром
- **Движение и навигация** - бот может ходить по миру
- **Атака** - взаимодействие с мобами
- **Добыча блоков** - сбор ресурсов
- **Размещение блоков** - строительство
- **Сбор предметов** - авто-сбор выпавших предметов

### 💬 Система Чата
- **Динамические сообщения** - ответы зависят от личности бота
- **Эмоциональное общение** - сообщения отражают настроение
- **Реактивное поведение** - ответы на сообщения игроков
- **Статус-репорты** - информирование о состоянии

## Установка

### Требования
- Node.js 16 или выше
- Minecraft Server версии 1.16.5 (рекомендуется локальный сервер)

### Шаги установки

```bash
# Перейти в директорию проекта
cd MinecraftBot

# Установить зависимости
npm install

# Убедитесь, что Minecraft сервер запущен на localhost:25565
# Для локального сервера: java -Xmx1024M -Xms1024M -jar server.jar nogui
```

## Использование

### Базовый запуск

```bash
npm start
```

### Запуск в режиме разработки (автоперезагрузка)

```bash
npm run dev
```

## Конфигурация

### Настройка подключения

Отредактируйте `config/botConfig.js`:

```javascript
export const botConfig = {
  connection: {
    host: 'localhost',        // IP сервера
    port: 25565,              // Порт сервера
    username: 'MinecraftAI',   // Имя бота
    version: '1.16.5'         // Версия Minecraft
  }
};
```

### Установка личности

Отредактируйте `src/bot.js` (в функции `main()`):

```javascript
bot.setPersonality({
  personality_name: 'Alex',  // Имя бота
  personality_description: 'Опытный исследователь',
  speech_style: 'friendly',   // Стиль речи
  traits: {
    friendliness: 0.8,   // Дружелюбность (0-1)
    curiosity: 0.9,      // Любознательность
    confidence: 0.7,     // Уверенность
    cautiousness: 0.4,   // Осторожность
    creativity: 0.6      // Творчество
  }
});
```

#### Доступные стили речи:
- **friendly** - дружелюбный, энтузиастичный
- **formal** - формальный, профессиональный
- **casual** - разговорный, непринуждённый
- **mysterious** - загадочный, мистический

## Структура проекта

```
MinecraftBot/
├── src/
│   ├── bot.js                    # Главный файл бота
│   ├── systems/
│   │   ├── PersonalitySystem.js  # Управление личностью
│   │   ├── ChatSystem.js         # Система общения
│   │   └── WorldInteractionSystem.js  # Взаимодействие с миром
│   ├── ai/
│   │   └── LearningSystem.js     # Q-Learning алгоритм
│   └── utils/
│       └── Logger.js             # Логирование
├── config/
│   └── botConfig.js              # Конфигурация
├── data/
│   ├── personality.db            # БД личности
│   └── learning.db               # БД знаний
├── logs/
│   └── bot.log                   # Файл логов
└── package.json
```

## Ключевые компоненты

### PersonalitySystem
Управляет личностью, эмоциями и памятью бота.

```javascript
const personality = new PersonalitySystem();
personality.updateEmotion('happiness', 0.1);  // Увеличить счастье на 10%
personality.addMemory({ type: 'event', ... }); // Сохранить событие
personality.addFavoriteActivity('mining');     // Добавить любимое действие
```

### LearningSystem
Реализует обучение с подкреплением.

```javascript
const learning = new LearningSystem();
const action = learning.chooseAction(state, possibleActions);
learning.recordExperience(state, action, reward, nextState, nextActions);
```

### WorldInteractionSystem
Управляет взаимодействием с миром.

```javascript
const world = new WorldInteractionSystem(bot, learning, personality);
await world.moveTo(target);
await world.attackEntity(entity);
await world.breakBlock(block);
const state = world.getWorldState();
```

### ChatSystem
Генерирует сообщения в чате.

```javascript
const chat = new ChatSystem(personality);
chat.sendChat(bot, chat.generateGreeting());
chat.sendChat(bot, chat.generateEmotionalMessage());
```

## Логирование

Все события логируются в `logs/bot.log` и в консоль:

```
[10:30:45] [INFO] Инициализация бота Minecraft...
[10:30:46] [SUCCESS] Системы инициализированы
[10:30:47] [SUCCESS] Бот подключился как MinecraftAI
[10:31:00] [INFO] [CHAT] Player: Привет!
```

## Развитие навыков

Бот **автоматически обучается** во время игры:

1. **Исследование** (20% случайных действий) - бот пробует новые действия
2. **Обучение** (80% лучших действий) - использует изученные стратегии
3. **Сохранение** - периодически сохраняет знания в БД
4. **Адаптация** - со временем уменьшает исследование, становясь более эффективным

## Команды в чате

Игроки могут взаимодействовать с ботом в чате:

```
/say Привет!        → Бот ответит приветствием
/say как дела?      → Бот сообщит статус
/say спасибо        → Бот выразит признательность
```

## Примеры использования

### Пример 1: Создание дружелюбного бота

```javascript
bot.setPersonality({
  personality_name: 'Friendly Alex',
  personality_description: 'Очень дружелюбный помощник',
  speech_style: 'friendly',
  traits: {
    friendliness: 0.95,
    curiosity: 0.7,
    confidence: 0.5,
    cautiousness: 0.6,
    creativity: 0.5
  }
});
```

### Пример 2: Создание серьёзного бота

```javascript
bot.setPersonality({
  personality_name: 'Commander',
  personality_description: 'Опытный командир экспедиции',
  speech_style: 'formal',
  traits: {
    friendliness: 0.3,
    curiosity: 0.8,
    confidence: 0.95,
    cautiousness: 0.8,
    creativity: 0.4
  }
});
```

## Отладка

### Включить режим отладки

В `config/botConfig.js`:
```javascript
logging: {
  debug: true,
  logFile: './logs/bot.log'
}
```

### Проверить статус бота

Бот выводит полный статус каждые 100 тиков (100 секунд):
```
СТАТУС: Здоровье=20.0, Голод=20, Эмоции=happiness: 55%, excitement: 45%
ОБУЧЕНИЕ: Состояний=45, Записей=892, Исследование=8.5%
```

## Ограничения и известные проблемы

1. **Навигация** - простой алгоритм, может застревать на препятствиях
2. **Боевые навыки** - базовая система атаки
3. **Строительство** - простая логика размещения блоков
4. **Память** - ограничена 1000 записями для производительности

## Возможные улучшения

- [ ] Улучшенная навигация с поиском пути
- [ ] Система целей и планирования
- [ ] Работа в команде с другими ботами
- [ ] Система создания рецептов
- [ ] Более сложное боевое мастерство
- [ ] Взаимодействие с интерфейсом (сундуки, верстаки)
- [ ] Спавнинг у кровати
- [ ] Система торговли

## Лицензия

MIT  
Авторское право (c) 2025 [AmiRus-C](https://github.com/AmiRus-C) (Nicshuz_)

## Поддержка и профиль

Если у вас есть вопросы или предложения:
- Посетите профиль автора: https://github.com/AmiRus-C
- Никнейм: `Nicshuz_`
- Пожалуйста, создавайте issue в репозитории

---

**Наслаждайтесь игрой с вашим ботом! 🎮**
