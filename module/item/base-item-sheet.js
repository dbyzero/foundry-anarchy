import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { hbsAttributes, hbsCapacity, hbsItemTypes, hbsShadowampCategory } from "../enums.js";

export class SRABaseItemSheet extends ItemSheet {

  get template() {
    return `${TEMPLATES_PATH}/item/${this.object.data.type}.hbs`;
  }
  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      config: SRA,
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner,
        isOwned: (this.actor != undefined),
        editable: this.isEditable,
        cssClass: this.isEditable ? "editable" : "locked"
      },
      enums: {
        attribute: hbsAttributes,
        itemTypes: hbsItemTypes,
        shadowampCategory: hbsShadowampCategory,
        capacity: hbsCapacity
      }
    });
    return hbsData;
  }
}
