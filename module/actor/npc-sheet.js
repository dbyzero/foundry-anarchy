import { TEMPLATES_PATH } from "../constants.js";
import { SRABaseCharacterSheet } from "./base-character-sheet.js";

export class SRANPCSheet extends SRABaseCharacterSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/npc-sheet.hbs`;
  }

}