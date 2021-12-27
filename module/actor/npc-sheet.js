import { TEMPLATES_PATH } from "../constants.js";
import { AnarchyActorSheet } from "./sra-actor-sheet.js";

export class NPCSheet extends AnarchyActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/npc-sheet.hbs`;
  }

}