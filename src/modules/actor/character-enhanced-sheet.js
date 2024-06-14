import { TEMPLATES_PATH } from "../constants.js";
import { CharacterNPCSheet } from "./character-npc-sheet.js";
import "../../styles/character-enhanced-sheet.scss";

export class CharacterEnhancedSheet extends CharacterNPCSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/character-enhanced.hbs`;
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 800,
      height: 700,
    });
  }
  activateListeners(html) {
    super.activateListeners(html);

    const actorClass = `#CharacterEnhancedSheet-Actor-${this.actor._id}`;

    $(`${actorClass} .click-section`).on("click", function() {
      const sectionClass = ($(this).data('class'));
      const sectionClassName = `${actorClass} .${sectionClass}`;
      const jqueryElement = $(sectionClassName);
      jqueryElement.toggleClass('closed');
      localStorage.setItem(sectionClassName, jqueryElement.hasClass('closed') ? 'closed' : null);
    });
  }
}