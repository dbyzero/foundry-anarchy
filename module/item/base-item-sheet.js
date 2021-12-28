import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";

export class AnarchyItemSheet extends ItemSheet {

  get title() {
    return game.i18n.localize(ANARCHY.itemType.singular[this.item.type]) + ': ' + this.item.name;
  }

  get template() {
    return `${TEMPLATES_PATH}/item/${this.object.type}.hbs`;
  }

  getData(options) {
    let cssClass = game.system.anarchy.styles.selectCssClass(this.itrm.data.data.style);
    cssClass += ' ' + (this.isEditable ? "editable" : "locked");

    let hbsData = mergeObject(
      super.getData(options), {
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner,
        isOwned: (this.actor != undefined),
        editable: this.isEditable,
        cssClass: cssClass
      },
      ENUMS: Enums.getEnums(),
      ANARCHY: ANARCHY
    });
    return hbsData;
  }

}
