import { ANARCHY } from "../config.js";
import { BaseActorSheet } from "./base-actor-sheet.js";
import { CharacterEssence } from "./character-actor.js";
import { Misc } from "../misc.js";
import { SheetHelper } from "../sheet-helper.js";
import { TEMPLATES_PATH } from "../constants.js";

export class CharacterActorSheet extends BaseActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/character.hbs`;
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      anarchy: {
        player: this.document.hasPlayerOwner,
        value: this.actor.getAnarchy(),
        max: this.actor.getAnarchyMax()
      },
      essence: {
        adjust: CharacterEssence.getAdjust(this.actor.data.data.counters?.essence?.value)
      },
    });
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // cues, dispositions, keywords
    html.find('.click-wordlist-add').click(async event => {
      const wordlist = SheetHelper.getWordList(event);
      const word = game.i18n.localize(ANARCHY.common.newEntry);
      this.actor.createWordlistWord(wordlist, word);
    });

    html.find('.change-wordlist-value').change(async event => {
      const updated = event.currentTarget.value;
      const previous = SheetHelper.getWord(event);
      const wordlist = SheetHelper.getWordList(event);
      await this.actor.updateWordlistWord(wordlist, previous, updated);
    });

    html.find('.click-wordlist-delete').click(async event => {
      const previous = SheetHelper.getWord(event);
      const wordlist = SheetHelper.getWordList(event);
      this.actor.deleteWordlistWord(wordlist, previous);
    });

  }

}