import { AnarchyBaseItem } from "./anarchy-base-item.js";

export class SkillItem extends AnarchyBaseItem {


  isKnowledgeSkill() {
    return this.data.data.attribute == 'knowledge';
  }

  isGeneralSkill() {
    return this.data.data.attribute != 'knowledge';
  }


}