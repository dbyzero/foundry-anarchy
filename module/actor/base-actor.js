import { ANARCHY } from "../config.js";
import { AnarchyRollDialog } from "../dialog/roll-dialog.js";
import { ErrorManager } from "../error-manager.js";

export const CHECKBARS = {
  physical: { dataPath: 'data.monitors.physical.value', maxForActor: actor => actor.data.data.monitors.physical.max, resource: ANARCHY.actor.monitors.physical },
  stun: { dataPath: 'data.monitors.stun.value', maxForActor: actor => actor.data.data.monitors.stun.max, resource: ANARCHY.actor.monitors.stun },
  matrix: { dataPath: 'data.monitors.matrix.value', maxForActor: actor => actor.data.data.monitors.matrix.max, resource: ANARCHY.actor.monitors.matrix },
  armor: { dataPath: 'data.monitors.armor.value', maxForActor: actor => actor.data.data.monitors.armor.max, resource: ANARCHY.actor.monitors.armor },
  anarchy: { dataPath: 'data.counters.anarchy.value', maxForActor: actor => actor.data.data.counters.anarchy.max, resource: ANARCHY.common.anarchy.anarchy },
  edge: { dataPath: 'data.counters.edge.value', maxForActor: actor => actor.data.data.attributes.edge.value, resource: ANARCHY.actor.counters.edge }
}

export class AnarchyBaseActor extends Actor {

  constructor(data, context = {}) {
    if (!context.anarchy?.ready) {
      mergeObject(context, { anarchy: { ready: true } });
      const ActorConstructor = game.system.anarchy.actorClasses[data.type];
      if (ActorConstructor) {
        return new ActorConstructor(data, context);
      }
    }
    super(data, context);
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
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
    // TODO
  }

  getAnarchy() {
    if (!this.hasPlayerOwner) {
      return game.system.anarchy.gmAnarchy.getAnarchy();
    }
    return {
      isGM: !this.hasPlayerOwner,
      value: 0,
      max: 0,
      scene: 0
    }
  }

  getAnarchyValue() {
    // TODO
    return this.getAnarchy().value ?? 0;
  }
  getAnarchyMax() {
    // TODO
    return this.getAnarchy().max ?? 0;
  }

  async spendAnarchy(count) {
    // TODO
  }

  async spendEdge(count) {
    // TODO
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
    return 0;
  }

  async removeOtherMetatype(metatype) {
    // only caharacters have a potential metatype
    const metatypeIds = this.items.filter(it => it.isMetatype()).map(it => it.id);
    this.deleteEmbeddedDocuments("Item", metatypeIds);
  }

  isActorWithOwnerId() { return false; }

  /**
   * @param ownerActor the Actor who becomes the owner of this Actor
   */
  async attachToOwnerActor(ownerActor = undefined) {
    if (this.isActorWithOwnerId()) {
      // TODO: check behavior on tokens
      if (ownerActor?.hasPlayerOwner) {
        // TODO: enforce player to have rights if owner hasPlayer
      }
      await this.update({ 'data.ownerId': ownerActor?.id ?? '' });
    }
  }

  getOwnerActor() {
    if (this.isActorWithOwnerId() && this.data.data.ownerId) {
      return game.actors.get(this.data.data.ownerId);
    }
    return undefined;
  }
}