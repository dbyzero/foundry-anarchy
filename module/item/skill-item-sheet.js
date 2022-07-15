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
        const skillCode = event.currentTarget.value;
        const skill = game.system.anarchy.skills.get(skillCode);
        if (skill) {
          await this.object.update({
            name: game.i18n.localize(skill.labelkey),
            img: skill.icon,
            'system.code': skill.code,
            'system.attribute': skill.attribute,
            'system.hasDrain': skill.hasDrain ? true : false,
            'system.hasConvergence': skill.hasConvergence ? true : false
          });
        }
      }
    });

    html.find('.check-knowledge').click(async event => {
      const checkKnowledge = event.currentTarget.checked;
      const newAttribute = checkKnowledge ? 'knowledge' : game.system.anarchy.skills.get(this.object.system.code)?.attribute ?? '';
      await this.object.update({ 'system.attribute': newAttribute });
      this.render(true);
    });
  }
}
