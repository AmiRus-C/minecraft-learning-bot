/**
 * Система взаимодействия с миром Minecraft
 * Управляет движением, атакой, сбором ресурсов и строительством
 */

export class WorldInteractionSystem {
  constructor(bot, learningSystem, personalitySystem) {
    this.bot = bot;
    this.learningSystem = learningSystem;
    this.personalitySystem = personalitySystem;

    this.targetEntity = null;
    this.targetBlock = null;
    this.isMoving = false;
  }

  /**
   * Движение к целевому блоку или сущности
   */
  async moveTo(target) {
    if (!target || !this.bot || !this.bot.entity) return false;

    try {
      this.isMoving = true;

  const targetPos = target.position || target;
  if (!targetPos) return false;
  const distance = this.bot.entity.position.distanceTo(targetPos);

      if (distance < 2) {
        this.isMoving = false;
        return true;
      }

      // Используем простой алгоритм движения
      const dx = targetPos.x - this.bot.entity.position.x;
      const dz = targetPos.z - this.bot.entity.position.z;
      const dy = targetPos.y - this.bot.entity.position.y;

      // Поворот в сторону цели
      const angle = Math.atan2(-dx, -dz);
      this.bot.look(angle, 0);

      // Движение
      if (Math.abs(dx) > 0.5 || Math.abs(dz) > 0.5) {
        this.bot.setControlState('forward', true);
      }

      // Прыжок если нужно подняться
      if (dy > 0.5 && dy < 2) {
        this.bot.setControlState('jump', true);
      }

      this.isMoving = false;
      return true;
    } catch (e) {
      console.error('Error moving:', e);
      return false;
    }
  }

  /**
   * Остановить движение
   */
  stopMoving() {
    if (!this.bot) return;
    try {
      this.bot.setControlState('forward', false);
      this.bot.setControlState('jump', false);
    } catch (e) {
      // ignore errors when disconnected
    }
    this.isMoving = false;
  }

  /**
   * Атаковать сущность
   */
  async attackEntity(entity) {
    if (!entity || !this.bot || !this.bot.entity) return false;

    try {
      this.targetEntity = entity;

      // Повернуться к сущности
  if (!entity.position) return false;
  const direction = entity.position.minus(this.bot.entity.position).normalize();
      const angle = Math.atan2(-direction.x, -direction.z);
      this.bot.look(angle, 0);

      // Атаковать
      await this.bot.attack(entity);

      // Обновить эмоции
      this.personalitySystem.updateEmotion('excitement', 0.1);
      this.personalitySystem.addMemory({
        type: 'attack',
        target: entity.type,
        position: entity.position
      });

      return true;
    } catch (e) {
      console.error('Error attacking:', e);
      return false;
    }
  }

  /**
   * Разместить блок
   */
  async placeBlock(targetBlock, direction) {
    if (!targetBlock || !this.bot || !this.bot.entity) return false;

    try {
      // Повернуться к блоку
  if (!targetBlock.position) return false;
  const vec = targetBlock.position.minus(this.bot.entity.position).normalize();
      const angle = Math.atan2(-vec.x, -vec.z);
      this.bot.look(angle, -Math.atan2(vec.y, vec.xz.norm()));

      // Выбрать нужный блок из инвентаря
      const block = this.bot.inventory.items().find(
        item => item.name.includes('block') || item.name.includes('wood')
      );

      if (!block) {
        console.log('No blocks to place');
        return false;
      }

      await this.bot.equip(block, 'hand');
      await this.bot.placeBlock(targetBlock, new Vec3(0, 1, 0));

      this.personalitySystem.addMemory({
        type: 'placed_block',
        block: targetBlock.name,
        position: targetBlock.position
      });

      return true;
    } catch (e) {
      console.error('Error placing block:', e);
      return false;
    }
  }

  /**
   * Собрать блок
   */
  async breakBlock(block) {
    if (!block || !this.bot || !this.bot.entity) return false;

    try {
      this.targetBlock = block;

      // Повернуться к блоку
  if (!block.position) return false;
  const vec = block.position.minus(this.bot.entity.position).normalize();
      const angle = Math.atan2(-vec.x, -vec.z);
      this.bot.look(angle, -Math.atan2(vec.y, vec.xz.norm()));

      // Копать блок
      await this.bot.dig(block);

      this.personalitySystem.updateEmotion('excitement', 0.05);
      this.personalitySystem.addMemory({
        type: 'mined_block',
        block: block.name,
        position: block.position
      });

      return true;
    } catch (e) {
      console.error('Error breaking block:', e);
      return false;
    }
  }

  /**
   * Найти ближайший блок по типу
   */
  findNearestBlock(blockType, range = 32) {
    if (!this.bot || !this.bot.world) return null;
    try {
      const blocks = this.bot.world.findBlocks({
        matching: blockType,
        maxDistance: range,
        count: 1
      });

      return blocks.length > 0 ? this.bot.world.getBlock(blocks[0]) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Найти ближайшую сущность
   */
  findNearestEntity(type = null, range = 16) {
    if (!this.bot || !this.bot.entity) return null;
    let entities = Object.values(this.bot.entities)
      .filter(e => e && e.type !== 'player' && e.position && e.position.distanceTo(this.bot.entity.position) < range);

    if (type) {
      entities = entities.filter(e => e.name === type);
    }

    return entities.length > 0 ? entities[0] : null;
  }

  /**
   * Собрать предметы вокруг себя
   */
  async collectNearbyItems(range = 16) {
    if (!this.bot || !this.bot.entity) return 0;
    const items = Object.values(this.bot.entities)
      .filter(e => e && e.type === 'object' && e.position && e.position.distanceTo(this.bot.entity.position) < range);

    for (const item of items.slice(0, 5)) {
      await this.moveTo(item.position);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return items.length;
  }

  /**
   * Использовать предмет в руке
   */
  async useItem() {
    try {
      if (!this.bot) return false;
      const item = this.bot.heldItem;
      if (item) {
        this.bot.activateItem(false);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error using item:', e);
      return false;
    }
  }

  /**
   * Получить текущее состояние мира вокруг бота
   */
  getWorldState() {
    try {
      if (!this.bot || !this.bot.entity) {
        return {
          position: null,
          velocity: { x: 0, y: 0, z: 0 },
          health: 0,
          food: 0,
          inventory: [],
          nearbyEntities: 0,
          isOnGround: false,
          isInWater: false
        };
      }

      const nearby = Object.values(this.bot.entities).filter(
        e => e && e.position && e.position.distanceTo(this.bot.entity.position) < 16
      ).length;

      const block = this.bot.world && this.bot.world.getBlock(this.bot.entity.position);

      const state = {
        position: this.bot.entity.position,
        velocity: this.bot.entity.velocity,
        health: this.bot.health,
        food: this.bot.food,
        inventory: (this.bot.inventory && this.bot.inventory.items().map(i => ({ name: i.name, count: i.count }))) || [],
        nearbyEntities: nearby,
        isOnGround: !!this.bot.entity.onGround,
        isInWater: !!(block && block.liquid)
      };

      return state;
    } catch (e) {
      console.error('Error getting world state:', e);
      return {
        position: null,
        velocity: { x: 0, y: 0, z: 0 },
        health: 0,
        food: 0,
        inventory: [],
        nearbyEntities: 0,
        isOnGround: false,
        isInWater: false
      };
    }
  }

  /**
   * Проверить, безопасно ли движение в направлении
   */
  isSafeToMove(direction) {
    try {
      if (!this.bot || !this.bot.entity) return false;
      const nextPos = this.bot.entity.position.plus(direction);
      const blockBelow = this.bot.world && this.bot.world.getBlock(nextPos.offset(0, -1, 0));

      if (!blockBelow || blockBelow.diggable === false) {
        return false;
      }

      // Проверить, есть ли опасные блоки
      const blockAhead = this.bot.world && this.bot.world.getBlock(nextPos);
      if (blockAhead && blockAhead.liquid) {
        return false; // В этой версии не плывём
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Прыгнуть
   */
  jump() {
    this.bot.setControlState('jump', true);
    setTimeout(() => {
      this.bot.setControlState('jump', false);
    }, 100);
  }
}

export default WorldInteractionSystem;
