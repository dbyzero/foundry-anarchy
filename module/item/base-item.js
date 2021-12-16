import { SRA } from "../config.js";
import { Enums } from "../enums.js";

export class SRABaseItem extends Item {

  static init() {
    Hooks.on("preUpdateItem", (item, change, options, id) => SRABaseItem.onPreUpdateItem(item, change, options, id));
    Hooks.on("createItem", (item, options, id) => SRABaseItem.onCreateItem(item, options, id));
  }

  static async onPreUpdateItem(item, change, options, id) {
    if (item.isSkillGeneral()) {
      SRABaseItem.forceGeneralSkillName(change);
    }
  }

  static forceGeneralSkillName(change) {
    if (change.data?.code) {
      change.name = game.i18n.localize(SRA.skill[change.data.code]);
      change.data.attribute = Enums.getSkillAttribute(change.data.code);
    }
  }

  static async onCreateItem(item, options, id) {
    if (item.parent && item.isMetatype()) {
      item.parent.removeOtherMetatype(item);
    }
  }

  isMetatype() {
    return this.type == 'metatype';
  }

  isSkillKnowledge() {
    return this.type == 'skill' && this.data.data.attribute == 'knowledge';
  }

  isSkillGeneral() {
    return this.type == 'skill' && this.data.data.attribute != 'knowledge';
  }
}