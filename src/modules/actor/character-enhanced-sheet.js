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
      width: 780,
      height: 700,
    });
  }
}