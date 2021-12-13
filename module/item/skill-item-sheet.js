import { TEMPLATES_PATH } from "../constants.js";
import { skillsAttribute } from "../enums.js";
import { SRABaseItemSheet } from "./base-item-sheet.js";

export class SRASkillSheet extends SRABaseItemSheet {

  get template() {
    return `${TEMPLATES_PATH}/item/skill.hbs`;
  }

  getData(options) {
    let hbsData = super.getData(options);
    hbsData.options.isKnowledge = (this.object.data.data.attribute == 'knowledge');
    return hbsData;
  }


  activateListeners(html) {
    super.activateListeners(html);
  
    html.find('.check-knowledge').click(async event => {
      const checkKnowledge = event.currentTarget.checked;
      const newAttribute = checkKnowledge ? 'knowledge' : (skillsAttribute[this.object.data.data.code] ?? 'agility') ;
      await this.object.update({"data.attribute": newAttribute });
      this.render(true);
    });
  }  
}
