/**
 * Система управления инвентарём
 * Управляет предметами, сортировкой, и оптимизацией хранения
 */

export class InventorySystem {
  constructor(bot) {
    this.bot = bot;
    this.inventory = bot.inventory;

    // Приоритеты предметов (чем выше число, тем важнее)
    this.itemPriority = {
      'diamond_pickaxe': 100,
      'diamond_sword': 99,
      'diamond_axe': 98,
      'iron_pickaxe': 80,
      'iron_sword': 79,
      'wooden_pickaxe': 50,
      'wooden_sword': 49,
      'diamond': 90,
      'iron_ingot': 70,
      'gold_ingot': 65,
      'coal': 60,
      'stick': 40,
      'wooden_plank': 35,
      'oak_log': 30,
      'cobblestone': 20,
      'dirt': 15,
      'bread': 80,
      'apple': 75,
      'cooked_beef': 85,
      'cooked_chicken': 83
    };

    // Максимальное количество предметов по типам
    this.itemLimits = {
      'oak_log': 64,
      'cobblestone': 64,
      'dirt': 32,
      'coal': 64,
      'wooden_plank': 64,
      'stick': 64
    };
  }

  /**
   * Получить все предметы в инвентаре
   */
  getAll() {
    return this.inventory.items();
  }

  /**
   * Получить предмет по имени
   */
  getByName(itemName) {
    return this.inventory.items().find(item => item.name === itemName);
  }

  /**
   * Получить количество предмета
   */
  getCount(itemName) {
    const item = this.getByName(itemName);
    return item ? item.count : 0;
  }

  /**
   * Проверить, есть ли предмет
   */
  has(itemName) {
    return this.getCount(itemName) > 0;
  }

  /**
   * Получить свободное место в инвентаре
   */
  getFreeSlots() {
    return this.inventory.emptySlotCount();
  }

  /**
   * Инвентарь полон?
   */
  isFull() {
    return this.getFreeSlots() === 0;
  }

  /**
   * Получить приоритет предмета
   */
  getPriority(itemName) {
    return this.itemPriority[itemName] || 0;
  }

  /**
   * Отсортировать предметы по приоритету
   */
  getSortedItems() {
    return this.getAll().sort((a, b) => {
      return this.getPriority(b.name) - this.getPriority(a.name);
    });
  }

  /**
   * Найти предметы для удаления (низкий приоритет)
   */
  getItemsToDiscard(count = 1) {
    const sorted = this.getSortedItems();
    const items = [];

    for (let i = sorted.length - 1; i >= 0 && items.length < count; i--) {
      const item = sorted[i];
      // Не выбрасывать инструменты и еду
      if (!item.name.includes('pickaxe') &&
          !item.name.includes('sword') &&
          !item.name.includes('food') &&
          !item.name.includes('apple') &&
          !item.name.includes('bread')) {
        items.push(item);
      }
    }

    return items;
  }

  /**
   * Выбросить предмет
   */
  async throwItem(itemName, count = 1) {
    const item = this.getByName(itemName);
    if (!item) return false;

    try {
      await this.inventory.drop(item.type, null, count);
      return true;
    } catch (e) {
      console.error(`Error throwing item: ${e.message}`);
      return false;
    }
  }

  /**
   * Очистить инвентарь (выбросить низкий приоритет)
   */
  async clearInventory(keepFree = 5) {
    while (this.getFreeSlots() < keepFree) {
      const items = this.getItemsToDiscard(1);
      if (items.length === 0) break;

      await this.throwItem(items[0].name, 1);
      await new Promise(r => setTimeout(r, 100));
    }

    return this.getFreeSlots();
  }

  /**
   * Экипировать предмет
   */
  async equip(itemName, destination = 'hand') {
    const item = this.getByName(itemName);
    if (!item) return false;

    try {
      await this.inventory.equip(item, destination);
      return true;
    } catch (e) {
      console.error(`Error equipping item: ${e.message}`);
      return false;
    }
  }

  /**
   * Получить информацию об инвентаре
   */
  getInfo() {
    const items = this.getAll();
    const totalSlots = 36; // Основной инвентарь

    return {
      items: items.length,
      used: totalSlots - this.getFreeSlots(),
      free: this.getFreeSlots(),
      total: totalSlots,
      percentage: ((totalSlots - this.getFreeSlots()) / totalSlots * 100).toFixed(1),
      isFull: this.isFull()
    };
  }

  /**
   * Получить список предметов с количеством
   */
  getSummary() {
    return this.getAll().map(item => ({
      name: item.name,
      count: item.count,
      priority: this.getPriority(item.name)
    }));
  }

  /**
   * Найти лучший инструмент для блока
   */
  getBestToolFor(blockName) {
    const tools = {
      'diamond_pickaxe': ['diamond', 'obsidian', 'iron_ore', 'stone'],
      'iron_pickaxe': ['stone', 'iron_ore', 'coal_ore', 'lapis_ore'],
      'wooden_pickaxe': ['dirt', 'sand', 'gravel', 'oak_log'],
      'diamond_axe': ['oak_log', 'birch_log', 'spruce_log'],
      'iron_axe': ['oak_log', 'birch_log'],
      'wooden_axe': ['oak_log']
    };

    for (const [tool, blocks] of Object.entries(tools)) {
      if (blocks.includes(blockName) && this.has(tool)) {
        return tool;
      }
    }

    return null;
  }

  /**
   * Получить продукты питания
   */
  getFood() {
    return this.getAll().filter(item =>
      item.name.includes('food') ||
      item.name.includes('apple') ||
      item.name.includes('bread') ||
      item.name.includes('beef') ||
      item.name.includes('chicken') ||
      item.name.includes('pork') ||
      item.name.includes('mutton')
    );
  }

  /**
   * Есть ли еда?
   */
  hasFood() {
    return this.getFood().length > 0;
  }

  /**
   * Получить оружие
   */
  getWeapons() {
    return this.getAll().filter(item =>
      item.name.includes('sword') ||
      item.name.includes('axe') ||
      item.name.includes('bow')
    );
  }

  /**
   * Получить инструменты
   */
  getTools() {
    return this.getAll().filter(item =>
      item.name.includes('pickaxe') ||
      item.name.includes('shovel') ||
      item.name.includes('hoe')
    );
  }

  /**
   * Получить строительные материалы
   */
  getBuildingMaterials() {
    const materialTypes = [
      'log', 'plank', 'stone', 'dirt', 'sand', 'gravel',
      'wool', 'concrete', 'brick', 'oak', 'birch', 'spruce'
    ];

    return this.getAll().filter(item =>
      materialTypes.some(type => item.name.includes(type))
    );
  }

  /**
   * Получить руды и ресурсы
   */
  getOres() {
    const oreTypes = [
      'diamond', 'iron', 'coal', 'gold', 'lapis', 'redstone',
      'copper', 'emerald'
    ];

    return this.getAll().filter(item =>
      oreTypes.some(type => item.name.includes(type))
    );
  }

  /**
   * Получить статистику инвентаря
   */
  getStatistics() {
    const items = this.getAll();
    const food = this.getFood();
    const weapons = this.getWeapons();
    const tools = this.getTools();
    const materials = this.getBuildingMaterials();
    const ores = this.getOres();

    return {
      total_items: items.length,
      total_slots_used: 36 - this.getFreeSlots(),
      free_slots: this.getFreeSlots(),
      percentage_full: ((36 - this.getFreeSlots()) / 36 * 100).toFixed(1),
      food_items: food.length,
      weapons: weapons.length,
      tools: tools.length,
      materials: materials.length,
      ores: ores.length,
      is_full: this.isFull()
    };
  }

  /**
   * Предложить освободить место
   */
  suggestCleanup() {
    const info = this.getInfo();
    if (info.free < 5) {
      return {
        suggestion: 'Инвентарь почти полный',
        action: 'Выбросить предметы низкого приоритета',
        items_to_remove: this.getItemsToDiscard(3)
      };
    }
    return null;
  }
}

export default InventorySystem;
