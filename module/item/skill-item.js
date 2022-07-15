import { ICONS_PATH } from "../constants.js";
import { AnarchyBaseItem } from "./anarchy-base-item.js";

export class SkillItem extends AnarchyBaseItem {

  static get defaultIcon() {
    return `${ICONS_PATH}/skills/skills.svg`;
  }

  isKnowledgeSkill() {
    return this.system.attribute == 'knowledge';
  }

  isGeneralSkill() {
    return this.system.attribute != 'knowledge';
  }

  prepareShortcut() {
    return {
      img: this.img,
      label: this.system.specialization ? `${this.name}: ${this.system.specialization}` : this.name,
      callback: token => token.actor.rollSkill(this, this.system.specialization),
    };
  }


}