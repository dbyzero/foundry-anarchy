import { TEMPLATES_PATH } from "../constants.js";
import { CharacterActorSheet } from "./character-actor-sheet.js";

export class NPCCharacterActorSheet extends CharacterActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/npc-sheet.hbs`;
  }

  getData(options) {
    let hbsData = super.getData(options);
    hbsData.options.classes.push('npc-character-sheet');
    return hbsData;
  }
}