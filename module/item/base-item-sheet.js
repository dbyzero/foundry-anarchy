import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { hbsAreas, hbsAttributes, hbsCapacities, hbsItemTypes, hbsMonitors, hbsRanges, hbsShadowampCategories, hbsSkills } from "../enums.js";

export class SRABaseItemSheet extends ItemSheet {

  get template() {
    return `${TEMPLATES_PATH}/item/${this.object.type}.hbs`;
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
        attributes: hbsAttributes,
        itemTypes: hbsItemTypes,
        capacities: hbsCapacities,
        monitors: hbsMonitors,
        shadowampCategories: hbsShadowampCategories,
        skills: hbsSkills,
        areas: hbsAreas,
        ranges: hbsRanges
      }
    });
    return hbsData;
  }

}
