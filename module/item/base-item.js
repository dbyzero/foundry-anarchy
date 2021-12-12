import { SRA } from "../config.js";

export class SRABaseItem extends Item {

  static init() {
    Hooks.on("preUpdateItem", (item, change, options, id) => SRABaseItem.onPreUpdateItem(item, change, options, id));
  }

  static async onPreUpdateItem(item, change, options, id) {
    if (item.type == 'skill' && item.data.data.attribute != 'knowledge') {
      if (change.data.code) {
        change.name = game.i18n.localize(SRA.skill[change.data.code]);
        change.data.attribute = SRA.skillattribute[change.data.code];
      }
    }
  }

}