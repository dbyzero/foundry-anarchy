import { ANARCHY } from "../config.js";
import { AnarchyRollDialog } from "../dialog/roll-dialog.js";
import { BASE_MONITOR } from "../constants.js";
import { AnarchyBaseActor, CHECKBARS } from "./base-actor.js";
import { Enums } from "../enums.js";
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
    let values = Misc.distinct(mutate(this.data.data[listType]));
    await this.update({ [`data.${listType}`]: values });
  }

  async setCounter(monitor, value) {
    const checkbar = CHECKBARS[monitor];
    if (checkbar) {
      if (monitor == 'anarchy') {
        await this.setAnarchy(checkbar, value);
      }
      else {
        ErrorManager.checkOutOfRange(checkbar.resource, value, 0, checkbar.maxForActor(this));
        await this.update({ [`${checkbar.dataPath}`]: value });
      }
    }
  }

  async setAnarchy(checkbar, newValue) {
    if (!this.hasPlayerOwner) {
      await game.system.anarchy.gmManager.gmAnarchy.setAnarchy(newValue);
      this.sheet.render(false);
    }
    else {
      const current = this.data.data.counters.anarchy.value;
      ErrorManager.checkOutOfRange(checkbar.resource, newValue, 0, checkbar.maxForActor(this));
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
      await this.update({ [`${checkbar.dataPath}`]: newValue });
    }
  }

  async skillRoll(skill, specialization) {
    const rollData = AnarchyRollDialog.prepareSkillRollData(this, skill, specialization);
    await this._roll(rollData);
  }

  async attributeRoll(attribute, attribute2 = undefined, attributeAction = undefined) {
    const rollData = AnarchyRollDialog.prepareAttributeRollData(this, attribute, attribute2, attributeAction);
    await this._roll(rollData);
  }

  async weaponRoll(weapon) {
    const skill = this.items.find(it => it.type == 'skill' && it.data.data.code === weapon.data.data.skill);
    const rollData = AnarchyRollDialog.prepareWeaponRollData(this, skill, weapon);
    await this._roll(rollData);
  }

  async _roll(rollData) {
    const dialog = await AnarchyRollDialog.create(rollData);
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
        await game.system.anarchy.gmManager.gmAnarchy.npcConsumesAnarchy(this, count);
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