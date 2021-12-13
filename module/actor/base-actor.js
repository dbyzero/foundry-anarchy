import { SRA } from "../config.js";
import { actorDescriptionTypeLists } from "../enums.js";
import { Misc } from "../misc.js";

export class SRABaseActor extends Actor {

  prepareData() {
    super.prepareData();
  }

  async createWordlistWord(wordlist, added) {
    this._mutateWordlist(wordlist, values => values.concat([added]));
  }

  async updateWordlistWord(wordlist, previous, updated) {
    this._mutateWordlist(wordlist, values => values.map(it => it == previous ? updated : it));
  }

  async deleteWordlistWord(wordlist, word) {
    this._mutateWordlist(wordlist, values => values.filter(it => it != word));
  }

  async _mutateWordlist(wordlist, mutate = values => values) {
    const listType = actorDescriptionTypeLists[wordlist];
    if (!listType) {
      return;
    }
    let values = Misc.distinct(mutate(this.data.data.description[listType]));
    await this.update({ [`data.description.${listType}`]: values });
  }

}