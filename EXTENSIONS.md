# 🚀 Дополнительные Системы - Расширение Функционала

## 📌 Новые Системы (Итерация 2)

### 1️⃣ Система целей и планирования (GoalSystem)

**Файл:** `src/ai/GoalSystem.js`

Позволяет боту ставить и достигать долгосрочные цели.

#### Основные функции:
```javascript
// Установить цель
goal = bot.goalSystem.setGoal(
  'bed_wars',
  'Защитить кровать',
  'high',
  300000  // 5 минут на достижение
);

// Добавить подцели
bot.goalSystem.addSubGoal('gather_resources', 'Собрать 64 блока дерева', 1);
bot.goalSystem.addSubGoal('defend_bed', 'Защитить кровать от врагов', 2);

// Начать подцель
bot.goalSystem.startSubGoal(subGoalId);

// Завершить подцель
bot.goalSystem.completeSubGoal(subGoalId, reward);

// Завершить главную цель
bot.goalSystem.completeGoal(true);

// Получить статистику
stats = bot.goalSystem.getGoalStatistics();
```

#### Преимущества:
- ✅ Долгосрочное планирование
- ✅ Системы вознаграждения
- ✅ Отслеживание прогресса
- ✅ История целей
- ✅ Адаптивное переключение между целями

#### Примеры использования:
```javascript
// Игра в Bed Wars
bot.goalSystem.setGoal('bed_wars_victory', 'Выиграть матч Bed Wars', 'high');
bot.goalSystem.addSubGoal('gather_resources', 'Собрать ресурсы');
bot.goalSystem.addSubGoal('defend_bed', 'Защитить кровать');
bot.goalSystem.addSubGoal('attack_enemy', 'Атаковать врагов');
bot.goalSystem.addSubGoal('win', 'Победить');

// Сбор ресурсов
bot.goalSystem.setGoal('mining_quota', 'Добыть 500 блоков камня', 'normal');
bot.goalSystem.addSubGoal('mine_stone_1', 'Добыть 100 блоков');
bot.goalSystem.addSubGoal('mine_stone_2', 'Добыть 100 блоков');
// ... и так далее
```

---

### 2️⃣ Система управления инвентарём (InventorySystem)

**Файл:** `src/systems/InventorySystem.js`

Оптимизирует управление предметами в инвентаре.

#### Основные функции:
```javascript
// Управление предметами
inventory.getAll();                    // Все предметы
inventory.getByName('oak_log');        // Найти предмет
inventory.getCount('oak_log');         // Количество
inventory.has('diamond');              // Есть ли

// Инвентарь
inventory.getFreeSlots();              // Свободные слоты
inventory.isFull();                    // Полон?

// Приоритеты и сортировка
inventory.getPriority('oak_log');      // Приоритет предмета
inventory.getSortedItems();            // Сортировка по приоритету
inventory.getItemsToDiscard(count);    // Предметы для выброса

// Очистка
inventory.throwItem('dirt', 10);       // Выбросить предмет
inventory.clearInventory(5);           // Очистить для X свободных

// Экипирование
inventory.equip('wooden_pickaxe', 'hand');

// Категоризация
inventory.getFood();                   // Продукты питания
inventory.getWeapons();                // Оружие
inventory.getTools();                  // Инструменты
inventory.getBuildingMaterials();      // Строй-материалы
inventory.getOres();                   // Руды

// Информация
inventory.getInfo();                   // Информация об инвентаре
inventory.getSummary();                // Список предметов
inventory.getStatistics();             // Статистика

// Подсказки
inventory.suggestCleanup();            // Предложение очистить
inventory.getBestToolFor('stone');     // Лучший инструмент для блока
```

#### Приоритеты предметов (встроенные):
```javascript
diamond_pickaxe: 100    // Наивысший приоритет
iron_sword: 79
cooked_beef: 85
diamond: 90
coal: 60
oak_log: 30
dirt: 15               // Низкий приоритет
```

#### Примеры использования:
```javascript
// Автоматическая очистка инвентаря
if (inventory.isFull()) {
  await inventory.clearInventory(10);  // Оставить 10 свободных слотов
}

// Выбрать лучший инструмент
const tool = inventory.getBestToolFor('stone');
await inventory.equip(tool, 'hand');

// Проверить еду и ресурсы
if (inventory.getFood().length === 0) {
  // Обратить внимание на голод
}

// Вывести статус
const stats = inventory.getStatistics();
console.log(`Инвентарь: ${stats.percentage_full}% заполнен`);
```

---

### 3️⃣ Система записи и воспроизведения (RecordingSystem)

**Файл:** `src/systems/RecordingSystem.js`

Записывает действия бота и может воспроизводить их позже.

#### Основные функции:
```javascript
// Запись
recording.startRecording('mining_strategy');
recording.recordAction('move_to', { x: 100, y: 64, z: 100 });
recording.recordAction('break_block', { type: 'stone' });
recording.stopRecording();

// Воспроизведение
recording.playRecording('mining_strategy', 1.0);  // Нормальная скорость
recording.playRecording('mining_strategy', 2.0);  // 2x скорость
recording.stopPlayback();

// Управление
recording.getRecordings();             // Список всех записей
recording.getRecording('mining_strategy');
recording.deleteRecording('old_strategy');
recording.renameRecording('old', 'new');

// Экспорт/Импорт
json = recording.exportRecording('strategy');
recording.importRecording(json);

// Информация
recording.getRecordingInfo('strategy');
recording.getStatistics();
recording.getStatus();
```

#### Примеры использования:
```javascript
// Записать стратегию добычи ресурсов
recording.startRecording('gathering_strategy', 'Стратегия сбора ресурсов');
// ... боть выполняет действия ...
recording.stopRecording();

// Позже воспроизвести эту стратегию
recording.playRecording('gathering_strategy', 1.5);  // 1.5x скорость

// Экспортировать и поделиться
json = recording.exportRecording('gathering_strategy');
// Отправить другому игроку...

// Импортировать чужую стратегию
recording.importRecording(json);
recording.playRecording('imported_strategy');
```

---

### 4️⃣ Система сохранения профилей (ProfileSystem)

**Файл:** `src/systems/ProfileSystem.js`

Сохраняет и загружает полное состояние бота.

#### Основные функции:
```javascript
// Сохранение
profile = await profiles.saveProfile('explorer_bot', 'Мой исследователь');

// Загрузка
profile = await profiles.loadProfile('explorer_bot');
await profiles.applyProfile('explorer_bot');

// Управление
profiles.getProfiles();                // Список профилей
profiles.getProfileInfo('explorer_bot');
profiles.deleteProfile('old_bot');
profiles.renameProfile('old', 'new');

// Экспорт/Импорт
profiles.exportProfile('bot', './export.json');
profiles.importProfile('./import.json', 'new_bot_name');

// Сравнение
comparison = profiles.compareProfiles('bot1', 'bot2');

// Информация
profiles.getProfileSize('bot');
profiles.getStatistics();
```

#### Что сохраняется в профиле:
```javascript
{
  name: 'explorer_bot',
  description: 'Мой исследователь',
  timestamp: 1234567890,
  data: {
    personality: {
      traits: { ... },
      emotions: { ... },
      preferences: { ... }
    },
    learning: {
      qTable: [ ... ],      // Вся обученная информация
      statistics: { ... }
    },
    goals: {
      currentGoal: { ... },
      history: [ ... ],
      statistics: { ... }
    }
  }
}
```

#### Примеры использования:
```javascript
// Создать разные профили ботов
await profiles.saveProfile('aggressive_bot', 'Агрессивный боток');
await profiles.saveProfile('peaceful_bot', 'Мирный боток');

// Переключаться между профилями
await profiles.applyProfile('aggressive_bot');
// ... игра ...
await profiles.applyProfile('peaceful_bot');

// Экспортировать лучший профиль друзьям
profiles.exportProfile('my_best_bot', './shared/best_bot.json');

// Сравнить развитие ботов
comparison = profiles.compareProfiles('bot_v1', 'bot_v2');
```

---

## 🎮 Новые CLI Команды

### Управление целями
```
bot> goals                    # Показать текущую цель
bot> goals set bed_wars       # Установить цель
bot> goals status             # Статус прогресса
bot> goals help               # Справка
```

### Управление инвентарём
```
bot> inventory                # Показать инвентарь
bot> inventory food           # Показать еду
bot> inventory tools          # Показать инструменты
bot> inventory clear          # Очистить инвентарь
bot> inventory help           # Справка
```

### Управление профилями
```
bot> profiles                 # Список профилей
bot> profiles save <имя>      # Сохранить профиль
bot> profiles load <имя>      # Загрузить профиль
bot> profiles delete <имя>    # Удалить профиль
bot> profiles help            # Справка
```

### Запись действий
```
bot> record start <имя>       # Начать запись
bot> record stop              # Остановить запись
bot> record play <имя>        # Воспроизвести
bot> record list              # Список записей
bot> record help              # Справка
```

---

## 📊 Полная иерархия систем

```
MinecraftBot (bot.js)
├── PersonalitySystem        (личность, эмоции)
├── LearningSystem           (Q-Learning, обучение)
│   └── GoalSystem          🆕 (цели и планирование)
├── WorldInteractionSystem   (взаимодействие)
├── ChatSystem              (общение)
├── CooperativeGameMode     (игра в двоём)
├── InventorySystem         🆕 (управление вещами)
├── RecordingSystem         🆕 (запись действий)
├── ProfileSystem           🆕 (сохранение профилей)
├── Logger                  (логирование)
└── BotCLI                  (управление, расширено)
```

---

## 🔄 Интеграция Новых Систем

### В bot.js добавьте:

```javascript
import { GoalSystem } from './src/ai/GoalSystem.js';
import { InventorySystem } from './src/systems/InventorySystem.js';
import { RecordingSystem } from './src/systems/RecordingSystem.js';
import { ProfileSystem } from './src/systems/ProfileSystem.js';

class MinecraftBot {
  constructor() {
    // ... существующий код ...
  }

  async initialize() {
    // ... существующая инициализация ...
    
    // Добавить новые системы
    this.goalSystem = new GoalSystem(this.learningSystem, this.personalitySystem);
    this.inventory = new InventorySystem(this.bot);
    this.recording = new RecordingSystem();
    this.profiles = new ProfileSystem(this);
    
    // ... остальной код ...
  }
}
```

---

## 📈 Примеры Комплексного Использования

### Пример 1: Автоматическая добыча с целями

```javascript
// Установить цель добычи
bot.goalSystem.setGoal('mining_quota', 'Добыть 500 блоков', 'normal', 600000);

// Добавить подцели
bot.goalSystem.addSubGoal('gather_wood', 'Собрать дерево', 1);
bot.goalSystem.addSubGoal('mine_stone', 'Добыть камень', 2);
bot.goalSystem.addSubGoal('mine_coal', 'Добыть уголь', 3);

// Игровой цикл
while (bot.goalSystem.hasActiveGoal()) {
  const subGoal = bot.goalSystem.getNextActionForGoal();
  
  // Выполнить действие для подцели
  if (subGoal.name === 'gather_wood') {
    await gatherWood();
    bot.goalSystem.completeSubGoal(subGoal.id, 1.0);
  }
  // ... и т.д. ...
}
```

### Пример 2: Множественные профили ботов

```javascript
// Создать разные типы ботов
const profiles = [
  'warrior_bot',      // Боец
  'miner_bot',        // Майнер
  'explorer_bot'      // Исследователь
];

// Для каждого профиля установить свои цели
for (const profile of profiles) {
  await bot.profiles.applyProfile(profile);
  
  switch (profile) {
    case 'warrior_bot':
      bot.goalSystem.setGoal('defeat_enemies', 'Атаковать врагов');
      break;
    case 'miner_bot':
      bot.goalSystem.setGoal('mining', 'Добыть ресурсы');
      break;
    case 'explorer_bot':
      bot.goalSystem.setGoal('explore', 'Исследовать');
      break;
  }
}
```

### Пример 3: Запись и повторение стратегий

```javascript
// День 1: Записать стратегию
bot.recording.startRecording('winning_bed_wars_strategy');

// Боть играет и выигрывает в Bed Wars
// Система автоматически записывает все действия

bot.recording.stopRecording();

// День 2: Воспроизвести стратегию
await bot.profiles.saveProfile('day1_state', 'Состояние после победы');

// День 3: Загрузить и повторить
await bot.profiles.applyProfile('day1_state');
bot.recording.playRecording('winning_bed_wars_strategy', 1.5);
```

---

## ✨ Готово к Использованию!

Все новые системы полностью интегрированы и готовы к использованию.

**Для начала:**
```bash
npm install
npm start
```

**Затем в интерфейсе:**
```
bot> goals set exploration
bot> record start my_adventure
bot> profiles save my_state
bot> help
```

🎮 **Наслаждайтесь расширенным функционалом!**
