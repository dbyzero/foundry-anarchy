import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { BaseItemSheet } from "./base-item-sheet.js";

export class SkillItemSheet extends BaseItemSheet {

  getData(options) {
    let hbsData = super.getData(options);
    hbsData.options.isKnowledge = this.object.isKnowledgeSkill();
    return hbsData;
  }


  activateListeners(html) {
    super.activateListeners(html);

    html.find('.select-skill-code').change(async event => {
      if (this.object.isGeneralSkill()) {
        const newSkillCode = event.currentTarget.value;
        if (newSkillCode && ANARCHY.skill[newSkillCode]) {
          const newName = game.i18n.localize(ANARCHY.skill[newSkillCode]);
          await this.object.update({
            "name": newName,
            "data.code": newSkillCode,
            "data.attribute": Enums.getSkillAttribute(newSkillCode)
          });
        }
      }
    });

    html.find('.check-knowledge').click(async event => {
      const checkKnowledge = event.currentTarget.checked;
      const newAttribute = checkKnowledge ? 'knowledge' : Enums.getSkillAttribute(this.object.data.data.code);
      await this.object.update({ "data.attribute": newAttribute });
      this.render(true);
    });
  }
}
