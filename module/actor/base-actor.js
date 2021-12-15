import { SRA } from "../config.js";
import { SRASkillRoll } from "../dialog/skill-roll.js";
import { Enums } from "../enums.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";
import { Modifiers } from "../modifiers.js";
import { SRARoll } from "../roll.js";


const CHECKBARS = {
  physical: { value: 'data.monitors.physical.value', maxForActor: actor => actor.data.data.monitors.physical.max, resource: SRA.actor.monitors.physical },
  stun: { value: 'data.monitors.stun.value', maxForActor: actor => actor.data.data.monitors.stun.max, resource: SRA.actor.monitors.stun },
  armor: { value: 'data.monitors.armor.value', maxForActor: actor => actor.data.data.monitors.armor.max, resource: SRA.actor.monitors.armor },
  anarchy: { value: 'data.counters.anarchy.value', maxForActor: actor => actor.data.data.counters.anarchy.max, resource: SRA.actor.counters.anarchy },
  edge: { value: 'data.counters.edge.value', maxForActor: actor => actor.data.data.attributes.edge.value, resource: SRA.actor.counters.edge }
}

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
    const listType = Enums.getActorDescriptionType(wordlist);
    if (!listType) {
      return;
    }
    let values = Misc.distinct(mutate(this.data.data.description[listType]));
    await this.update({ [`data.description.${listType}`]: values });
  }

  async setCounter(monitor, index, checked) {
    const checkbar = CHECKBARS[monitor];
    if (checkbar) {
      const newValue = index + (checked ? 0 : 1);
      const max = checkbar.maxForActor(this);
      ErrorManager.checkOutOfRange(checkbar.resource, newValue, 0, checkbar.maxForActor(this));
      await this.update({ [`${checkbar.value}`]: newValue });
    }
  }

  async skillRoll(skill, specialization) {
    const rollData = Modifiers.prepareSkillRollData(this, skill, specialization);
    const dialog = await SRASkillRoll.create(rollData, async r => this.onSkillRoll(r));
    dialog.render(true);
  }

  async onSkillRoll(rollData) {
    console.log('onSkillRoll', rollData);

    rollData.param = Modifiers.computeRollParameters(rollData);
    await this.spendEdge(rollData.param.edge);
    await this.spendAnarchy(rollData.param.anarchy);
    this.rollToChat(rollData);
  }

  async rollToChat(rollData) {
    const target = rollData.param.edge > 0 ? 4 : 5;
    const roll = SRARoll.create(rollData.param);
    await roll.evaluate();
    await roll.toMessage({ flavor: rollData.title + ' ' + roll.total });
    //TODO: use SRARoll
  }

  async spendAnarchy(count) {
    let value = this.data.data.counters.anarchy.value;
    if (count > value) {
      throw ErrorManager.insufficient(SRA.actor.counters.anarchy, count, value);
    }
    await this.update({ 'data.counters.anarchy.value': (value - count) });
  }

  async spendEdge(spend = true) {
    if (spend) {
      let current = this.data.data.counters.edge.value;
      let available = this.data.data.attributes.edge.value - current;
      if (current >= available) {
        throw ErrorManager.insufficient(SRA.actor.counters.edge, 1, available);
      }
      await this.update({ 'data.counters.edge.value': (current + 1) });
    }
  }

  getWounds(skillCode) {
    // TODO
    return 0;
  }

}