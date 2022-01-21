import { ANARCHY } from "../config.js";
import { BASE_MONITOR, TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { AnarchyBaseActor } from "./base-actor.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";

const HBS_TEMPLATE_ACTOR_DRAIN = `${TEMPLATES_PATH}/chat/actor-drain.hbs`;

const essenceRange = [
  { from: 5, to: 6, adjust: 0 },
  { from: 3, to: 5, adjust: -1 },
  { from: 1, to: 3, adjust: -2 },
  { from: 0, to: 1, adjust: -3 }
]

export class CharacterEssence {
  static getAdjust(essence) {
    return this.getEssenceRange(essence)?.adjust ?? 0;
  }

  static getEssenceRange(essence) {
    return essenceRange.find(r => r.from < essence && essence <= r.to) ?? essenceRange[0];
  }
}

export class CharacterActor extends AnarchyBaseActor {

  static get initiative() {
    return "2d6 + max(@attributes.agility.value, @attributes.logic.value)";
  }

  static reindexWordIds(list) {
    let index = 1;
    list.forEach(it => it.id = (index++));
    return list;
  }

  hasOwnAnarchy() { return this.hasPlayerOwner; }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.data.monitors.physical.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.strength.value, 2)
    this.data.data.monitors.stun.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.willpower.value, 2)
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.strength,
      TEMPLATE.attributes.agility,
      TEMPLATE.attributes.willpower,
      TEMPLATE.attributes.logic,
      TEMPLATE.attributes.charisma,
      TEMPLATE.attributes.edge
    ];
  }

  async createWord(wordType, added) {
    this._mutateWords(wordType, values => values.concat([{ word: added, audio: '' }]));
  }

  async sayWord(wordType, wordId) {
    const wordsToSay = this.getWord(wordType, wordId);
    if (wordsToSay) {
      if (wordsToSay?.audio) {
        // TODO: play audio file
      }
      ChatMessage.create({
        speaker: { alias: this.token?.name ?? this.name },
        content: wordsToSay.word // TODO: improve the tchat content (add the character image)
      });
    }
  }

  getWord(wordType, wordId) {
    return wordType ? this.data.data[wordType].find(it => it.id == wordId) : undefined;
  }

  async editWord(wordType, wordId) {
    // TODO: dialog to edit the word audio
  }

  async updateWord(wordType, wordId, updated) {
    this._appyWordUpdate(wordType, wordId, it => mergeObject(it, { word: updated }, { overwrite: true }));
  }

  async _appyWordUpdate(wordType, wordId, updateFunction) {
    this._mutateWords(wordType, values => values.map(it => it.id == wordId ? updateFunction(it) : it));
  }

  async deleteWord(wordType, deletedId) {
    this._mutateWords(wordType, values => values.filter(it => it.id != deletedId));
  }

  async _mutateWords(wordType, mutate = values => values) {
    if (!wordType) {
      return;
    }
    let newValues = mutate(this.data.data[wordType]);
    CharacterActor.reindexWordIds(newValues);
    await this.update({ [`data.${wordType}`]: newValues });
  }

  getAnarchy() {
    if (this.hasOwnAnarchy()) {
      return {
        value: this.data.data.counters.anarchy.value,
        max: this.data.data.counters.anarchy.max,
        scene: 0
      };
    }
    return super.getAnarchy();
  }

  async spendAnarchy(count) {
    if (count) {
      if (this.hasPlayerOwner) {
        let current = this.getAnarchyValue();
        ErrorManager.checkSufficient(ANARCHY.actor.counters.anarchy, count, current);
        await game.system.anarchy.gmAnarchy.actorGivesAnarchyToGM(this, count);
        await this.update({ 'data.counters.anarchy.value': (current - count) });
      }
      else {
        super.spendAnarchy(count);
      }
    }
  }

  canUseEdge() {
    return true;
  }

  getSkillValue(skillId, specialization = undefined) {
    const skill = this.items.get(skillId);
    const attribute = this.data.data.attributes[skill.data.data.attribute];
    return skill.data.data.value + (attribute?.value ?? 0) + (specialization && skill.data.data.specialization ? 2 : 0);
  }

  getWounds() {
    return Misc.divint(this.data.data.monitors.stun.value, 3)
      + Misc.divint(this.data.data.monitors.physical.value, 3);
  }

  canSetMarks() {
    return this.data.data.capacity == TEMPLATE.capacities.emerged || this.hasCyberdeck();
  }

  hasCyberdeck() {
    return this.items.find(it => it.isCyberdeck());
  }

  async rollDrain(drain) {
    if (drain) {
      const rollDrain = new Roll(`${drain}dgcf=1[${game.i18n.localize(ANARCHY.common.roll.rollTheme.drain)}]`);
      await rollDrain.evaluate({ async: true });
      await this.sufferDrain(rollDrain.total);

      const flavor = await renderTemplate(HBS_TEMPLATE_ACTOR_DRAIN, {
        ANARCHY: ANARCHY,
        actor: this,
        drain: rollDrain.total,
        options: {
          classes: game.system.anarchy.styles.selectCssClass()
        }
      });
      await rollDrain.toMessage({ flavor: flavor });
    }
  }

  async sufferDrain(drain) {
    if (drain != 0) {
      await this.addCounter(TEMPLATE.monitors.stun, drain);
    }
  }

  async rollConvergence(convergence) {
    if (!convergence) {
      return;
    }
    game.system.anarchy.gmConvergence.rollConvergence(this.id, convergence)
  }

}