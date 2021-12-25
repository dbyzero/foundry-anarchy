import { TEMPLATES_PATH } from "../constants.js";
import { SRAActorSheet } from "./sra-actor-sheet.js";

export class NPCSheet extends SRAActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/npc-sheet.hbs`;
  }

}