import { BaseItemSheet } from "./base-item-sheet.js";

export class SkillItemSheet extends BaseItemSheet {

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.select-skill-code').change(async event => {
      const skillCode = event.currentTarget.value;
      const skill = game.system.anarchy.skills.get(skillCode);
      if (skill) {
        const updates = {
          img: skill.icon,
          'system.code': skill.code,
          'system.attribute': skill.attribute,
          'system.hasDrain': skill.hasDrain ? true : false,
          'system.hasConvergence': skill.hasConvergence ? true : false
        }
        if (skill.code != 'knowledge') {
          updates.name = game.i18n.localize(skill.labelkey)
        }
        await this.object.update(updates)
      }
    })
  }
}
