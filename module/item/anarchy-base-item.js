import { Checkbars } from "../common/checkbars.js";
import { AttributeActions } from "../attribute-actions.js";
import { Misc } from "../misc.js";
import { TEMPLATE } from "../constants.js";
import { RollDialog } from "../roll/roll-dialog.js";

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
        if (!data.img) {
          data.img = ItemConstructor.defaultIcon;
        }
        return new ItemConstructor(data, context);
      }
    }
    super(data, context);
  }

  static get defaultIcon() {
    return undefined;
  }

  getAttributes() {
    return [];
  }

  getUsableAttributes() {
    return this.isActive() ? this.getAttributes() : []
  }

  getAttributeValue(attribute) {
    if (this.data.data.attributes) {
      return this.data.data.attributes[attribute]?.value ?? 0;
    }
    return 0;
  }

  hasOwnAnarchy() { return false; }
  hasGMAnarchy() { return false; }

  isMetatype() { return this.type == TEMPLATE.itemType.metatype; }
  isCyberdeck() { return this.type == TEMPLATE.itemType.cyberdeck; }

  isActive() { return this.data.data.equiped && !this.data.data.inactive; }

  canReceiveMarks() { return this.data.data.monitors?.matrix?.canMark; }

  async rollAttribute(attribute, attribute2 = undefined, attributeAction = undefined) {
    if (this.parent) {
      await RollDialog.itemAttributeRoll(this, attribute);
    }
  }

  async switchMonitorCheck(monitor, index, checked, sourceActorId = undefined) {
    await Checkbars.switchMonitorCheck(this, monitor, index, checked, sourceActorId);
  }

  async setCounter(monitor, value) {
    await Checkbars.setCounter(this, monitor, value);
  }

  async switchActorMarksCheck(index, checked, sourceActorId) {
    await Checkbars.switchMonitorCheck(this, 'marks', index, checked, sourceActorId);
  }

  async addActorMark(sourceActorId) {
    await Checkbars.addActorMark(this, sourceActorId);
  }

}

