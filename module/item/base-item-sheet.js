import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";

export class SRAItemSheet extends ItemSheet {

  get title() {
    return game.i18n.localize(SRA.itemType.singular[this.item.type]) + ': ' + this.item.name;
  }

  get template() {
    return `${TEMPLATES_PATH}/item/${this.object.type}.hbs`;
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner,
        isOwned: (this.actor != undefined),
        editable: this.isEditable,
        cssClass: this.isEditable ? "editable" : "locked"
      },
      ENUMS: Enums.getEnums(),
      SRA: SRA
    });
    return hbsData;
  }

}
