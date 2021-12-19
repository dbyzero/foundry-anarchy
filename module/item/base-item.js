import { SRA } from "../config.js";
import { Enums } from "../enums.js";

export class SRABaseItem extends Item {

  static init() {
    Hooks.on("createItem", (item, options, id) => SRABaseItem.onCreateItem(item, options, id));
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
}
