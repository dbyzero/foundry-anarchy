import { ICONS_PATH } from "../constants.js";
import { AnarchyBaseItem } from "./anarchy-base-item.js";

export class SkillItem extends AnarchyBaseItem {

  static get defaultIcon() {
    return `${ICONS_PATH}/skills/skills.svg`;
  }

  isKnowledgeSkill() {
    return this.data.data.attribute == 'knowledge';
  }

  isGeneralSkill() {
    return this.data.data.attribute != 'knowledge';
  }


}