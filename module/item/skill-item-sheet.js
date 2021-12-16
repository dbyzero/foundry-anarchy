import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { SRABaseItemSheet } from "./base-item-sheet.js";

export class SRASkillSheet extends SRABaseItemSheet {

  get template() {
    return `${TEMPLATES_PATH}/item/skill.hbs`;
  }

  getData(options) {
    let hbsData = super.getData(options);
    hbsData.options.isKnowledge = this.object.isSkillKnowledge();
    return hbsData;
  }


  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('.select-skill-code').change(async event => {
      if (this.object.isSkillGeneral()) {
        const code = event.currentTarget.value;
        if (code && SRA.skill[code]){
          const newName = game.i18n.localize(SRA.skill[code]);
          await this.object.update({"name": newName });
        }
      }
    });
    html.find('.check-knowledge').click(async event => {
      const checkKnowledge = event.currentTarget.checked;
      const newAttribute = checkKnowledge ? 'knowledge' : Enums.getSkillAttribute(this.object.data.data.code);
      await this.object.update({"data.attribute": newAttribute });
      this.render(true);
    });
  }  
}
