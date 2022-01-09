import { ANARCHY } from "../config.js";
import { RollDialog } from "../dialog/roll-dialog.js";
import { BASE_MONITOR } from "../constants.js";
import { AnarchyBaseActor, CHECKBARS } from "./base-actor.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";
import { AnarchyUsers } from "../users.js";

const essenceRange = [
  { from: 5, to: 6, adjust: 0 },
  { from: 3, to: 5, adjust: -1 },
  { from: 1, to: 3, adjust: -2 },
  { from: 0, to: 1, adjust: -3 }
]
export class CharacterEssence {
  static getAdjust(essence) {
    return this.getRangeDetails(essence)?.adjust ?? 0;
  }

  static getRangeDetails(essence) {
    return essenceRange.find(r => r.from < essence && essence <= r.to) ?? essenceRange[0];
  }
}

export class CharacterActor extends AnarchyBaseActor {

  static reindexWordIds(list) {
    let index = 1;
    list.forEach(it => it.id = (index++));
    return list;
  }

  constructor(data, context = {}) {
    super(data, context);
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.data.monitors.physical.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.strength.value, 2)
    this.data.data.monitors.stun.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.willpower.value, 2)
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
        content: wordsToSay.word
      });
    }
  }

  getWord(wordType, wordId) {
    return wordType ? this.data.data[wordType].find(it => it.id == wordId) : undefined;
  }

  async editWord(wordType, wordId) {
    // const listType = Enums.getActorWordTypePlural(wordType);
    // if (!listType) {
    //   return;
    // }
    //  const updateFunction = it => mergeObject(it, { word: updated }, { overwrite: true })
    //  this._appyWordUpdate(wordType, previous,it => mergeObject(it, { word: updated }, { overwrite: true }));
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

  async setAnarchy(newValue) {
    if (this.hasPlayerOwner) {
      const current = this.data.data.counters.anarchy.value;
      ErrorManager.checkOutOfRange(CHECKBARS.anarchy.resource, newValue, 0, CHECKBARS.anarchy.maxForActor(this));
      if (!game.user.isGM) {
        AnarchyUsers.blindMessageToGM({
          from: game.user.id,
          content: game.i18n.format(ANARCHY.gmManager.playerChangedAnarchy,
            {
              user: game.user.name,
              actor: this.name,
              from: current,
              to: newValue
            })
        });
      }
      if (newValue < current) {
        await game.system.anarchy.gmManager.gmAnarchy.actorGivesAnarchyToGM(this, current - newValue);
      }
      await this.update({ [`${CHECKBARS.anarchy.dataPath}`]: newValue });
    }
    else {
      super.setAnarchy(newValue);
    }
  }

  async skillRoll(skill, specialization) {
    const rollData = RollDialog.prepareSkillRollData(this, skill, specialization);
    await this._roll(rollData);
  }

  async attributeRoll(attribute, attribute2 = undefined, attributeAction = undefined) {
    const rollData = RollDialog.prepareAttributeRollData(this, attribute, attribute2, attributeAction);
    await this._roll(rollData);
  }

  async weaponRoll(weapon) {
    const skill = this.items.find(it => it.type == 'skill' && it.data.data.code === weapon.data.data.skill);
    const rollData = RollDialog.prepareWeaponRollData(this, skill, weapon);
    await this._roll(rollData);
  }

  async _roll(rollData) {
    const dialog = await RollDialog.create(rollData);
    dialog.render(true);
  }

  getAnarchy() {
    if (this.hasPlayerOwner) {
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
        ErrorManager.checkSufficient(ANARCHY.common.anarchy.anarchy, count, current);
        await game.system.anarchy.gmManager.gmAnarchy.actorGivesAnarchyToGM(this, count);
        await this.update({ 'data.counters.anarchy.value': (current - count) });
      }
      else {
        super.spendAnarchy(count);
      }
    }
  }

  async spendEdge(count) {
    if (count) {
      let current = this.data.data.counters.edge.value;
      ErrorManager.checkSufficient(ANARCHY.actor.counters.edge, count, current);
      await this.update({ 'data.counters.edge.value': (current - count) });
    }
  }

  getAttributeValue(attribute) {
    const selected = this.data.data.attributes[attribute];
    return selected ? selected.value : `?`;
  }

  getSkillValue(skillId, specialization = undefined) {
    const skill = this.items.get(skillId);
    const attribute = this.data.data.attributes[skill.data.data.attribute];
    return skill.data.data.value + attribute.value + (specialization && skill.data.data.specialization ? 2 : 0);
  }

  getWounds(skillCode) {
    // TODO: for matrix skill, should use the matrix condition monitor of the cyberdeck

    return -Misc.divint(this.data.data.monitors.stun.value, 3)
      - Misc.divint(this.data.data.monitors.physical.value, 3);
  }

  async removeOtherMetatype(metatype) {
    const metatypeIds = this.items.filter(it => it.isMetatype())
      .filter(it => it.id != metatype.id)
      .map(it => it.id);
    this.deleteEmbeddedDocuments("Item", metatypeIds);
  }
}