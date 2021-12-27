import { TEMPLATES_PATH } from "../constants.js";
import { AnarchyActorSheet } from "./anarchy-actor-sheet.js";

export class CharacterSheet extends AnarchyActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/character.hbs`;
  }
}