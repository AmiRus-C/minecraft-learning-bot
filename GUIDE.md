# 🎮 Minecraft Learning Bot - Полное Руководство

## 📚 Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Установка](#установка)
3. [Основные концепции](#основные-концепции)
4. [Система личности](#система-личности)
5. [Система обучения](#система-обучения)
6. [Взаимодействие с миром](#взаимодействие-с-миром)
7. [Командная игра](#командная-игра)
8. [Примеры использования](#примеры-использования)
9. [Расширение функционала](#расширение-функционала)
10. [Часто задаваемые вопросы](#часто-задаваемые-вопросы)

---

## 🚀 Быстрый старт

### Установка за 3 шага

```bash
# 1. Перейти в директорию
cd c:\Users\Lenovo\Desktop\FLClient\MinecraftBot

# 2. Установить зависимости
npm install

# 3. Запустить бота
npm start
```

**Требования:**
- Minecraft сервер 1.16.5 на `localhost:25565`
- Node.js 16+

---

## 💾 Установка

Подробная инструкция находится в файле `INSTALLATION.md`.

**Краткая установка:**

```powershell
# Установить зависимости
npm install

# Запустить
npm start

# Или с автоперезагрузкой
npm run dev
```

---

## 🧠 Основные концепции

### Четыре основные системы

```
┌─────────────────────────────────────┐
│        MINECRAFT LEARNING BOT       │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  PersonalitySystem          │   │
│  │  (Личность, эмоции, память) │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  LearningSystem             │   │
│  │  (Q-Learning, обучение)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  WorldInteractionSystem     │   │
│  │  (Движение, атака, добыча)  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ChatSystem                 │   │
│  │  (Общение в чате)           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 👤 Система личности

### Что это?

Система, которая определяет **характер и поведение** вашего бота.

### Компоненты личности

```javascript
{
  // Идентификация
  personality_name: 'Alex',              // Имя бота
  personality_description: 'Исследователь',  // Описание
  
  // Речь
  speech_style: 'friendly',              // Стиль говора
  
  // Черты характера (0-1)
  traits: {
    friendliness: 0.8,    // Дружелюбность
    curiosity: 0.9,       // Любознательность
    confidence: 0.7,      // Уверенность
    cautiousness: 0.4,    // Осторожность
    creativity: 0.7       // Творчество
  },
  
  // Текущее эмоциональное состояние
  emotions: {
    happiness: 0.6,       // Счастье
    frustration: 0.1,     // Раздражение
    excitement: 0.5,      // Возбуждение
    fear: 0.0,            // Страх
    curiosity: 0.7        // Интерес
  }
}
```

### Стили речи

```javascript
// 1. Friendly (дружелюбный)
"Привет! Я так рад начать приключение!"
"Ого! Я только что нашёл дерево!"

// 2. Formal (формальный)
"Добрый день. Я готов приступить к выполнению задач."
"Был обнаружен ресурс: древесина"

// 3. Casual (разговорный)
"Ёй! Давайте начнём!"
"Ооо, дерево! Прикольно!"

// 4. Mysterious (мистический)
"Я пришел из кода... готов ко всему неизведанному..."
"Интересно... я чувствую древесину..."
```

### Установка личности

**Вариант 1: Предустановка**

```javascript
import { applyPreset } from './config/personalityPresets.js';

applyPreset(bot, 'friendlyExplorer');
// Готовые варианты:
// - friendlyExplorer, seriousCommander, cheerfulAssistant
// - mysteriousWanderer, skilledMiner, roboticHelper
// - adventurousHunter, philosopherObserver, merchantTrader, madScientist
```

**Вариант 2: Кастомная личность**

```javascript
bot.setPersonality({
  personality_name: 'Мой Бот',
  personality_description: 'Мой личный помощник',
  speech_style: 'friendly',
  traits: {
    friendliness: 0.8,
    curiosity: 0.7,
    confidence: 0.6,
    cautiousness: 0.5,
    creativity: 0.7
  }
});
```

### Система памяти

Бот помнит все события:

```javascript
// Бот автоматически запоминает:
personality.addMemory({
  type: 'attack',           // Тип события
  target: 'zombie',         // Цель
  position: {x, y, z}       // Позиция
});

personality.addMemory({
  type: 'mined_block',
  block: 'oak_log',
  position: {x, y, z}
});
```

---

## 🧠 Система обучения

### Как это работает?

Бот использует **Q-Learning** - алгоритм обучения с подкреплением:

```
1. ИССЛЕДОВАНИЕ (20% вероятность)
   └─ Бот пробует случайные действия
   └─ Собирает опыт о результатах

2. ОБУЧЕНИЕ (80% вероятность)
   └─ Бот выбирает лучшие действия
   └─ Основано на прошлом опыте (Q-таблица)

3. СОХРАНЕНИЕ
   └─ Знания сохраняются в базу данных
   └─ Сохраняются между сеансами

4. АДАПТАЦИЯ
   └─ Со временем исследование снижается
   └─ Бот становится более эффективным
```

### Состояния и действия

**Состояние** - снимок мира:
```javascript
{
  position: {x, y, z},
  health: 15,
  food: 18,
  nearbyEntities: 3,
  inventory: [...],
  isOnGround: true
}
```

**Действия**, которые бот может выполнить:
```javascript
[
  'idle',              // Ничего не делать
  'explore',           // Исследовать
  'mine_wood',         // Добывать дерево
  'mine_stone',        // Добывать камень
  'hunt_animal',       // Охотиться
  'collect_items',     // Собирать предметы
  'rest',              // Отдыхать
  'build',             // Строить
  'climb'              // Карабкаться
]
```

### Вознаграждения (Rewards)

```javascript
// Боту дают награды за:
+ 1.0  // Успешная добыча ресурса
+ 0.8  // Успешная охота
+ 0.7  // Успешное строительство
+ 0.5  // Исследование нового
+ 0.3  // Отдых (восстановление здоровья)
- 0.5  // Неудача
- 1.0  // Смерть

// На основе этого боть учится выбирать лучшие действия
```

### Проверка прогресса обучения

**Через CLI:**
```
bot> learning
```

**Или в коде:**
```javascript
const stats = bot.learningSystem.getStatistics();
console.log(`Изучено состояний: ${stats.statesLearned}`);
console.log(`Записано опытов: ${stats.experiencesRecorded}`);
console.log(`Скорость исследования: ${stats.explorationRate * 100}%`);
```

---

## 🌍 Взаимодействие с миром

### Движение

```javascript
// Движение к позиции
await worldInteraction.moveTo({x: 100, y: 64, z: 100});

// Остановка
worldInteraction.stopMoving();

// Прыжок
worldInteraction.jump();
```

### Добыча блоков

```javascript
// Найти ближайший блок
const block = worldInteraction.findNearestBlock('oak_log', 16);

// Добыть блок
if (block) {
  await worldInteraction.breakBlock(block);
}

// Автоматическая добыча в цикле
const blocks = worldInteraction.findNearestBlocks('stone', 32);
for (const block of blocks) {
  await worldInteraction.breakBlock(block);
}
```

### Размещение блоков

```javascript
// Найти блок для размещения
const targetBlock = worldInteraction.findNearestBlock('dirt', 16);

// Разместить блок
if (targetBlock) {
  await worldInteraction.placeBlock(targetBlock, 'up');
}
```

### Атака

```javascript
// Найти ближайшую сущность (моб)
const enemy = worldInteraction.findNearestEntity('zombie', 16);

// Атаковать
if (enemy) {
  await worldInteraction.attackEntity(enemy);
}
```

### Сбор предметов

```javascript
// Автоматически собрать близлежащие предметы
const count = await worldInteraction.collectNearbyItems(16);
console.log(`Собрано предметов: ${count}`);
```

### Получение информации о мире

```javascript
const state = worldInteraction.getWorldState();

console.log('Позиция:', state.position);           // {x, y, z}
console.log('Здоровье:', state.health);           // 1-20
console.log('Голод:', state.food);                // 0-20
console.log('Инвентарь:', state.inventory);       // [...]
console.log('На земле:', state.isOnGround);       // true/false
console.log('Рядом сущностей:', state.nearbyEntities);  // число
```

---

## 👥 Командная игра (Режим двоём)

### Активация

```javascript
const coop = new CooperativeGameMode(bot, personality, world, chat);

// Инициировать командную игру
coop.startCooperativeMode('PlayerName');

// Установить цель
coop.setTeamGoal('bed_wars');  // bed_wars, mining, building, exploration
```

### Следование за игроком

```javascript
// Автоматически следовать за игроком
const playerEntity = bot.players['PlayerName']?.entity;
if (playerEntity) {
  await coop.followPlayer(playerEntity);
}
```

### Защита игрока

```javascript
// Защищать игрока от врагов
const enemies = Object.values(bot.entities).filter(e => e.type === 'mob');
await coop.protectPlayer(playerEntity, enemies);

// Бот встанет между игроком и врагом и будет атаковать
```

### Совместная добыча ресурсов

```javascript
// Собрать ресурсы и поделиться
await coop.harvestAndShare('oak_log', playerEntity);

// Бот скажет в чат: "Собрал oak_log! Вот тебе!"
```

### Скоординированная атака

```javascript
// Атаковать врага вместе
const enemies = Object.values(bot.entities).filter(e => e.type === 'mob');
await coop.coordinatedAttack(playerEntity, enemies);

// Боть скажет: "Атакуем вместе!"
```

### Bed Wars стратегия

```javascript
// Получить стратегию для Bed Wars
const strategy = await coop.bedWarsStrategy(playerEntity, botTeam);

// Стратегия включает фазы:
// - early_game: собрать ресурсы, усилиться
// - mid_game: укрепить позицию, расширить
// - late_game: атаковать врагов, защищать кровать
```

### Система помощи

```javascript
// Боть поможет в разных ситуациях
await coop.assistPlayer(playerEntity, 'in_danger');   // В опасности
await coop.assistPlayer(playerEntity, 'low_health');  // Мало здоровья
await coop.assistPlayer(playerEntity, 'lost');        // Потеряться
await coop.assistPlayer(playerEntity, 'surrounded');  // Окружён
```

---

## 📖 Примеры использования

### Пример 1: Простой боток

```javascript
// src/bot.js
async function main() {
  const bot = new MinecraftBot();
  
  // Установить дружелюбную личность
  bot.setPersonality({
    personality_name: 'Helper',
    personality_description: 'Помощник в приключениях',
    speech_style: 'friendly'
  });
  
  await bot.initialize();
}

main().catch(console.error);
```

**Результат:** Боть будет исследовать мир и общаться в дружелюбном тоне.

### Пример 2: Боток для игры в двоём (Bed Wars)

```javascript
// В файле src/bot.js модифицируйте функцию setupEventListeners():

this.bot.on('login', () => {
  logger.success(`Бот подключился как ${this.bot.username}`);
  
  // Включить кооперативный режим
  const coop = new CooperativeGameMode(
    this.bot,
    this.personalitySystem,
    this.worldInteractionSystem,
    this.chatSystem
  );
  
  // Когда игрок присоединится
  this.bot.on('player_joined', (player) => {
    if (player.username !== this.bot.username) {
      coop.startCooperativeMode(player.username);
      coop.setTeamGoal('bed_wars');
      this.chatSystem.sendChat(this.bot, 'Привет! Давайте защищать нашу кровать!');
    }
  });
  
  this.startMainLoop();
});
```

### Пример 3: Исследователь

```javascript
import { applyPreset } from './config/personalityPresets.js';

async function main() {
  const bot = new MinecraftBot();
  await bot.initialize();
  
  // Применить предустановку исследователя
  applyPreset(bot, 'friendlyExplorer');
  
  console.log('Боть начинает исследовать мир!');
}

main();
```

### Пример 4: Серьёзный командир

```javascript
import { applyPreset } from './config/personalityPresets.js';

async function main() {
  const bot = new MinecraftBot();
  await bot.initialize();
  
  // Серьёзный боток для сложных задач
  applyPreset(bot, 'seriousCommander');
  
  // Боть будет говорить формально:
  // "Добрый день. Я готов приступить к выполнению задач."
  // "Был обнаружен ресурс: древесина"
}

main();
```

### Пример 5: Автоматическая добыча ресурсов

```javascript
// Добыватель дерева
async function mineLogs() {
  while (true) {
    const log = worldInteraction.findNearestBlock('oak_log', 32);
    if (log) {
      await worldInteraction.breakBlock(log);
      chatSystem.sendChat(bot, 'Добыл дерево!');
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
```

### Пример 6: Взаимодействие в чате

```javascript
bot.on('chat', (username, message) => {
  if (message.includes('привет')) {
    // Ответить через 500мс
    setTimeout(() => {
      chatSystem.sendChat(bot, `Привет, ${username}!`);
    }, 500);
  }
  
  if (message.includes('помогли')) {
    setTimeout(() => {
      chatSystem.sendChat(bot, 'Всегда пожалуйста!');
    }, 500);
  }
});
```

---

## 🔧 Расширение функционала

### Добавить новое действие

**Шаг 1:** Добавить метод в `WorldInteractionSystem`:

```javascript
async performCustomAction() {
  // Ваша логика
  return true;
}
```

**Шаг 2:** Добавить в список действий в `bot.js`:

```javascript
getPossibleActions() {
  return [
    'idle',
    'explore',
    'mine_wood',
    'custom_action'  // <- Новое действие
  ];
}
```

**Шаг 3:** Добавить обработку в `executeAction()`:

```javascript
case 'custom_action':
  reward = await this.performCustomAction();
  break;
```

### Добавить новый стиль речи

**В `ChatSystem.js`:**

```javascript
this.messageTemplates = {
  // ... существующие
  
  pirate: {
    greeting: [
      "Arr! Добро пожаловать в мой корабль!",
      "Йоу! Готовы к приключениям?"
    ],
    discovery: [
      "Йойо! {item} найден!",
      "Добыча: {item}!"
    ]
  }
};
```

### Создать новую систему

**Пример: Система торговли**

```javascript
// src/systems/TradingSystem.js

export class TradingSystem {
  constructor(bot, inventory) {
    this.bot = bot;
    this.inventory = inventory;
    this.tradeOffers = [];
  }
  
  addTradeOffer(item, price) {
    this.tradeOffers.push({ item, price });
  }
  
  async trade(player, item) {
    // Логика торговли
  }
}
```

---

## ❓ Часто задаваемые вопросы

### В: Как изменить скорость движения бота?

**О:** В `config/botConfig.js`:

```javascript
behavior: {
  walkSpeed: 4.3,    // Увеличить для быстрого хода
  sprintSpeed: 5.6   // Увеличить для быстрого спринта
}
```

### В: Как заставить бота говорить чаще?

**О:** В `ChatSystem.js` измените вероятность:

```javascript
sendChatWithProbability(bot, message, 0.5); // 50% вероятность
```

### В: Как сбросить память бота?

**О:** Удалите файлы базы данных:

```powershell
rm data/personality.db
rm data/learning.db
```

### В: Бот не подключается к серверу?

**О:** Проверьте:
1. Запущен ли Minecraft сервер на `localhost:25565`
2. Правильное ли имя бота (не совпадает с другими)
3. Версия сервера - должна быть 1.16.5

### В: Как включить подробные логи?

**О:** В `config/botConfig.js`:

```javascript
logging: {
  debug: true,  // Подробные логи
  logFile: './logs/bot.log'
}
```

### В: Бот застревает на месте?

**О:** Это нормально - навигация простая. Попробуйте:
1. Плоский мир для тестирования
2. Удалить препятствия вокруг
3. Перезагрузить бота

### В: Как получить статус бота?

**О:** Используйте CLI:

```
bot> status
bot> emotions
bot> learning
```

### В: Можно ли запустить несколько ботов?

**О:** Да, создайте несколько экземпляров с разными юзернеймами:

```javascript
const bot1 = new MinecraftBot();
bot1.bot.username = 'Bot1';

const bot2 = new MinecraftBot();
bot2.bot.username = 'Bot2';
```

### В: Как сделать кастомное сообщение в чате?

**О:** В коде:

```javascript
chatSystem.sendChat(bot, 'Мое пользовательское сообщение!');
```

### В: Бот может читать предметы в инвентаре?

**О:** Да:

```javascript
const inventory = bot.inventory.items();
for (const item of inventory) {
  console.log(`${item.name} x${item.count}`);
}
```

---

## 📞 Помощь

Документация находится в:
- `README.md` - основная документация
- `INSTALLATION.md` - подробная установка
- `QUICKSTART.js` - примеры быстрого старта
- Комментарии в файлах исходного кода

---

## 🎉 Готово к использованию!

Теперь у вас есть полнофункциональный Minecraft Learning Bot!

**Наслаждайтесь!** 🎮
