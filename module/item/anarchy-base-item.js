import { Checkbars } from "../common/checkbars.js";
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

  async rollAttribute(attribute) {
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

  async createModifier(modifier = {}) {
    modifier = mergeObject(modifier, {
      group: 'roll',
      effect: 'pool',
      category: 'skill',
      subCategory: '',
      value: 0,
      condition: ''
    });
    this._mutateModifiers(values => values.concat([modifier]));
  }

  async deleteModifier(modifierId) {
    await this._mutateModifiers(modifiers => modifiers.filter(it => it.id != modifierId));
  }

  async changeModifierSelection(modifierId, select, value) {
    let impact = this._computeModifierImpact(select, value);

    this._applyModifierUpdate(modifierId, impact);
  }

  _computeModifierImpact(select, value) {
    switch (select) {
      case 'group': return m => {
        if (m.group != value) {
          m.group = value;
          m.effect = '';
          m.category = '';
          m.subCategory = '';
        }
      };
      case 'effect': return m => m.effect = value;
      case 'category': return m => {
        if (m.category != value) {
          m.category = value;
          m.subCategory = '';
        }
      };
      case 'subCategory': return m => m.subCategory = value;
    }
    return m => { };
  }

  async changeModifierValue(modifierId, value) {
    this._applyModifierUpdate(modifierId, m => m.value = Number(value));
  }

  async changeModifierCondition(modifierId, value) {
    this._applyModifierUpdate(modifierId, m => m.condition = value);
  }

  async _applyModifierUpdate(id, updateFunction = m => { }) {
    await this._mutateModifiers(values => values.map(it => {
      if (it.id == id) {
        updateFunction(it);
      }
      return it;
    }));
  }

  async _mutateModifiers(mutation = values => values) {
    const modifiers = mutation(this.data.data.modifiers);
    Misc.reindexIds(modifiers);
    await this.update({ 'data.modifiers': modifiers });
  }

  prepateShortcut() {
    return undefined;
  }
}

