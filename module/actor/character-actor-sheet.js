import { ANARCHY } from "../config.js";
import { AnarchyBaseActorSheet } from "./base-actor-sheet.js";
import { CharacterEssence } from "./character-actor.js";
import { SheetHelper } from "../sheet-helper.js";
import { TEMPLATES_PATH } from "../constants.js";

export class CharacterActorSheet extends AnarchyBaseActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/character.hbs`;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 720,
      height: 700
    });
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      essence: {
        adjust: CharacterEssence.getAdjust(this.actor.data.data.counters?.essence?.value)
      },
    });
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // cues, dispositions, keywords
    html.find('.click-word-add').click(async event => {
      const wordType = SheetHelper.getWordType(event);
      const word = game.i18n.localize(ANARCHY.common.newEntry);
      this.actor.createWord(wordType, word);
    });

    html.find('.click-word-say').click(async event => {
      const wordType = SheetHelper.getWordType(event);
      const word = SheetHelper.getWordId(event);;
      this.actor.sayWord(wordType, word);
    });

    /* When adding audio to cues, the edit will be used
    // html.find('.click-word-edit').click(async event => {
    //   const wordType = SheetHelper.getWordType(event);
    //   const word = game.i18n.localize(ANARCHY.common.newEntry);
    //   this.actor.editWord(wordType, word);
    // });
    */

    html.find('.change-word-value').change(async event => {
      const updated = event.currentTarget.value;
      const wordId = SheetHelper.getWordId(event);
      const wordType = SheetHelper.getWordType(event);
      await this.actor.updateWord(wordType, wordId, updated);
    });

    html.find('.click-word-delete').click(async event => {
      const deletedId = SheetHelper.getWordId(event);
      const wordType = SheetHelper.getWordType(event);
      this.actor.deleteWord(wordType, deletedId);
    });
  }

}