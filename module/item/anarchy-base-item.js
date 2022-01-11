import { CHECKBARS } from "../actor/base-actor.js";
import { AttributeActions } from "../attribute-actions.js";
import { RollDialog } from "../dialog/roll-dialog.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";

export class AnarchyBaseItem extends Item {

  static init() {
    Hooks.on("createItem", (item, options, id) => item.onCreateItem(options, id));
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
    data.img = this.defaultIcon;
  }

  get defaultIcon() {
    return undefined;
  }

  getAttributeActions() {
    const attributes = Misc.distinct((this.parent?.getAttributes() ?? []).concat(this.getAttributes()).concat([[undefined]]));
    return AttributeActions.all(it => attributes.includes(it.attribute) && attributes.includes(it.attribute2));
  }

  getAttributes() {
    return [];
  }

  getAttributeValue(attribute) {
    if (this.data.data.attributes) {
      return this.data.data.attributes[attribute]?.value ?? 0;
    }
    return 0;
  }

  isActive() {
    return this.data.data.equiped && !this.data.data.active;

  }

  isMetatype() { return false; }

  async attributeRoll(attribute, attribute2 = undefined, attributeAction = undefined) {
    if (this.parent) {
      await RollDialog.itemAttributeRoll(this, attribute);
    }
  }

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

