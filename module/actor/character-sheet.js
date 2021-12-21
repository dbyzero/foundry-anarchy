import { TEMPLATES_PATH } from "../constants.js";
import { SRABaseCharacterSheet } from "./base-character-sheet.js";

export class SRACharacterSheet extends SRABaseCharacterSheet{

  get template() {
    return `${TEMPLATES_PATH}/actor/character.hbs`;
  }
}