import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { hbsAttributes, hbsCapacity, hbsItemTypes, hbsShadowampCategory, hbsSkill, hbsSkillAttribute } from "../enums.js";

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
        attribute: hbsAttributes,
        itemTypes: hbsItemTypes,
        shadowampCategory: hbsShadowampCategory,
        capacity: hbsCapacity,
        skill: hbsSkill,
        skillattribute: hbsSkillAttribute
      }
    });
    if (this.object.data.type == 'skill') {
      hbsData.options.isKnowledge = (this.object.data.data.attribute == 'knowledge');
    }

    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);
  
    html.find('.check-knowledge').click(async event => {
      const checkKnowledge = event.currentTarget.checked;
      const newAttribute = checkKnowledge ? 'knowledge' : (SRA.skillattribute[this.object.data.data.code] ?? 'agility') ;
      await this.object.update({"data.attribute": newAttribute });
      this.render(true);
    });
  }
}
