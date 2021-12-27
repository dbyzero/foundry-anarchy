import { ANARCHY } from "../config.js";
import { BASE_MONITOR } from "../constants.js";
import { AnarchyRollDialog } from "../dialog/roll-dialog.js";
import { Enums } from "../enums.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";
import { Users } from "../users.js";


const CHECKBARS = {
  physical: { dataPath: 'data.monitors.physical.value', maxForActor: actor => actor.data.data.monitors.physical.max, resource: ANARCHY.actor.monitors.physical },
  stun: { dataPath: 'data.monitors.stun.value', maxForActor: actor => actor.data.data.monitors.stun.max, resource: ANARCHY.actor.monitors.stun },
  armor: { dataPath: 'data.monitors.armor.value', maxForActor: actor => actor.data.data.monitors.armor.max, resource: ANARCHY.actor.monitors.armor },
  anarchy: { dataPath: 'data.counters.anarchy.value', maxForActor: actor => actor.data.data.counters.anarchy.max, resource: ANARCHY.actor.counters.anarchy },
  edge: { dataPath: 'data.counters.edge.value', maxForActor: actor => actor.data.data.attributes.edge.value, resource: ANARCHY.actor.counters.edge }
}


export class AnarchyActor extends Actor {

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
        await this._setAnarchy(checkbar, value);
      }
      else {
        ErrorManager.checkOutOfRange(checkbar.resource, value, 0, checkbar.maxForActor(this));
        await this.update({ [`${checkbar.dataPath}`]: value });
      }
    }
  }

  async _setAnarchy(checkbar, newValue) {
    if (!this.hasPlayerOwner) {
      await game.system.anarchy.gmManager.gmAnarchy.setAnarchy(newValue);
      this.sheet.render(false);
    }
    else {
      const current = this.data.data.counters.anarchy.value;
      ErrorManager.checkOutOfRange(checkbar.resource, newValue, 0, checkbar.maxForActor(this));
      if (!game.user.isGM) {
        Users.blindMessageToGM({
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
        await this._playerGivesAnarchyToGM(current - newValue);
      }
      await this.update({ [`${checkbar.dataPath}`]: newValue });
    }
  }

  async _playerGivesAnarchyToGM(count) {
    if (count > 0) {
      ChatMessage.create({
        user: game.user,
        whisper: ChatMessage.getWhisperRecipients('GM'),
        content: game.i18n.format(ANARCHY.gmManager.gmReceivedAnarchy,
          {
            anarchy: count,
            actor: this.name
          })
      });
      await game.system.anarchy.gmManager.gmAnarchy.addAnarchy(count);
    }
  }

  async npcConsumesAnarchy(count) {
    await game.system.anarchy.gmManager.gmAnarchy.addAnarchy(-count);
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
    return this.hasPlayerOwner ? this.data.data.counters.anarchy.value : game.system.anarchy.gmManager.gmAnarchy.getAnarchy();
  }
  getAnarchyMax() {
    return this.hasPlayerOwner ? this.data.data.counters.anarchy.max : game.system.anarchy.gmManager.gmAnarchy.getAnarchyMax();
  }

  async spendAnarchy(count) {
    if (this.hasPlayerOwner) {
      let current = this.getAnarchy();
      ErrorManager.checkSufficient(ANARCHY.actor.counters.anarchy, count, current);
      await this._playerGivesAnarchyToGM(count);
      await this.update({ 'data.counters.anarchy.value': (current - count) });
    }
    else {
      await this.npcConsumesAnarchy(count);
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