import { CHECKBARS } from "../actor/base-actor.js";
import { ErrorManager } from "../error-manager.js";

export class AnarchyBaseItem extends Item {

  static init() {
    Hooks.on("createItem", (item, options, id) => item.onCreateItem(item, options, id));
  }

  async onCreateItem(options, id) {
  }

  constructor(data, context = {}) {
    if (!context.anarchy?.ready) {
      mergeObject(context, { anarchy: { ready: true } });
      const ItemConstructor = game.system.anarchy.itemClasses[data.type];
      if (ItemConstructor) {
        return new ItemConstructor(data, context);
      }
    }
    super(data, context);
  }

  isMetatype() { return false; }

  async switchMonitorCheck(monitor, index, checked) {
    const newValue = index + (checked ? 0 : 1);
    await this.setCounter(monitor, newValue);
  }

  async setCounter(monitor, value) {
    if (CHECKBARS[monitor]) {
      ErrorManager.checkOutOfRange(CHECKBARS[monitor].resource, value, 0, CHECKBARS[monitor].maxForActor(this));
      await this.update({ [`${CHECKBARS[monitor].dataPath}`]: value });
    }
  }

}

