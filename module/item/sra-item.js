import { ErrorManager } from "../error-manager.js";
import { Weapon } from "./weapon.js";

export class SRAItem extends Item {

  static init() {
    Hooks.on("createItem", (item, options, id) => SRAItem.onCreateItem(item, options, id));
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
}

