import { ANARCHY } from "../config.js";
import { Enums } from "../enums.js";
import { ErrorManager } from "../error-manager.js";
import { Weapon } from "./weapon.js";

export class AnarchyItem extends Item {

  static init() {
    Hooks.on("createItem", (item, options, id) => AnarchyItem.onCreateItem(item, options, id));
  }

  static async onCreateItem(item, options, id) {
    if (item.parent && item.isMetatype()) {
      item.parent.removeOtherMetatype(item);
    }
  }

  isMetatype() {
    return this.type == 'metatype';
  }

  isKnowledgeSkill() {
    return this.type == 'skill' && this.data.data.attribute == 'knowledge';
  }

  isGeneralSkill() {
    return this.type == 'skill' && this.data.data.attribute != 'knowledge';
  }



  /* Weapons related methods************* */
  getDamageValue() {
    ErrorManager.checkItemType(this, 'weapon');
    return Weapon.getDamageValue(
      this.data.data.damage,
      this.data.data.strength,
      this.parent?.data.data.attribute.strength.value);
  }


  getDamageCode() {
    ErrorManager.checkItemType(this, 'weapon');
    return Weapon.getDamageCode(
      this.data.data.damage,
      this.data.data.strength,
      this.data.data.monitor);
  }

  getRanges() {
    let ranges = [
      this._getRange('short'),
    ]
    if (this.data.data.range.max != 'short') {
      ranges.push(this._getRange('medium'));
    }
    if (this.data.data.range.max == 'long') {
      ranges.push(this._getRange('long'));
    }
    return ranges
  }

  _getRange(range) {
    return { value: this.data.data.range[range], label: Enums.getFromList(Enums.getEnums().ranges, range) };
  }
}

