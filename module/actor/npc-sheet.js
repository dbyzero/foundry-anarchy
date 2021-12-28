import { TEMPLATES_PATH } from "../constants.js";
import { AnarchyActorSheet } from "./anarchy-actor-sheet.js";

export class NPCSheet extends AnarchyActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/npc-sheet.hbs`;
  }

  getData(options) {
    let hbsData = super.getData(options);
    hbsData.options.classes.push('npc-character-sheet');
    return hbsData;
  }
}