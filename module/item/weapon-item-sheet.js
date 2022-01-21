import { AttributeActions } from "../attribute-actions.js";
import { BaseItemSheet } from "./base-item-sheet.js";

export class WeaponItemSheet extends BaseItemSheet {

  getData(options) {
    let hbsData = super.getData(options);
    hbsData.ENUMS = mergeObject({ defenses: AttributeActions.getDefenses(), }, hbsData.ENUMS);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.select-weapon-skill').change(async event => {
      const skillCode = event.currentTarget.value;
      const skill = game.system.anarchy.skills.get(skillCode);
      if (skill) {
        await this.object.update({ "data.defense": skill.defense }, { render: false });
      }
    });
  }
}
