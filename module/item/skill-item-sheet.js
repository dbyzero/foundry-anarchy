import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { hbsAttributes, hbsCapacity, hbsItemTypes, hbsShadowampCategory, hbsSkill, hbsSkillAttribute } from "../enums.js";
import { SRABaseItemSheet } from "./base-item-sheet.js";

export class SRASkillItemSheet extends SRABaseItemSheet {

  get template() {
    return `${TEMPLATES_PATH}/item/skill.hbs`;
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
        capacity: hbsCapacity,
        skill: hbsSkill,
        skillattribute: hbsSkillAttribute
      }
    });
    return hbsData;
  }
}
