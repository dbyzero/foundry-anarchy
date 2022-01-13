import { AttributeActions } from "../attribute-actions.js";
import { Checkbars } from "../common/checkbars.js";
import { RollDialog } from "../dialog/roll-dialog.js";

export class AnarchyBaseActor extends Actor {

  constructor(data, context = {}) {
    if (!context.anarchy?.ready) {
      mergeObject(context, { anarchy: { ready: true } });
      const ActorConstructor = game.system.anarchy.actorClasses[data.type];
      if (ActorConstructor) {
        if (!data.img) {
          data.img = ActorConstructor.defaultIcon;
        }
        return new ActorConstructor(data, context);
      }
    }
    super(data, context);
  }

  static get defaultIcon() {
    return undefined;
  }

  isCharacter() { return this.type == 'character'; }

  hasOwnAnarchy() { return false; }
  hasGMAnarchy() { return !this.hasPlayerOwner; }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }

  getAttributeActions() {
    const attributes = [undefined].concat(this.getAttributes());
    return AttributeActions.all(it => attributes.includes(it.attribute) && attributes.includes(it.attribute2));
  }

  getAttributes() {
    return [undefined];
  }

  getAttributeValue(attribute, item = undefined) {
    if (attribute) {
      if (this.getAttributes().includes(attribute)) {
        return this.data.data.attributes[attribute].value;
      }
      if (!item) {
        item = this.items.find(item => item.isActive() && item.getAttributes().includes(attribute));
      }
      return item?.getAttributeValue(attribute) ?? 0;
    }
    return 0;
  }

  async skillRoll(skill, specialization) {
    await RollDialog.actorSkillRoll(this, skill, specialization);
  }

  async attributeRoll(attribute, attribute2 = undefined, attributeAction = undefined) {
    await RollDialog.actorAttributeRoll(this, attribute, attribute2, attributeAction);
  }

  async weaponRoll(weapon) {
    const skill = this.items.find(it => weapon.isWeaponSkill(it));
    await RollDialog.actorWeaponRoll(this, skill, weapon);
  }

  async switchMonitorCheck(monitor, index, checked, sourceActorId = undefined) {
    await Checkbars.switchMonitorCheck(this, monitor, index, checked, sourceActorId);
  }

  async setCounter(monitor, value, sourceActorId = undefined) {
    await Checkbars.setCounter(this, monitor, value, sourceActorId);
  }

  canSetMarks() {
    return false;
  }

  canReceiveMarks() {
    return this.data.data.monitors?.matrix?.canMark;
  }

  async switchActorMarksCheck(index, checked, sourceActorId) {
    await Checkbars.switchMonitorCheck(this, 'marks', index, checked, sourceActorId);
  }

  async addActorMark(sourceActorId) {
    await Checkbars.addActorMark(this, sourceActorId);
  }

  getActorMarks(sourceActorId) {
    return Checkbars.getActorMarks(this, sourceActorId)?.marks;

  }


  getAnarchy() {
    if (this.hasGMAnarchy()) {
      return game.system.anarchy.gmAnarchy.getAnarchy();
    }
    return {
      isGM: false,
      value: 0,
      max: 0,
      scene: 0
    }
  }

  getAnarchyValue() {
    return this.getAnarchy().value ?? 0;
  }

  async spendAnarchy(count) {
    if (count && !this.hasPlayerOwner) {
      await game.system.anarchy.gmAnarchy.npcConsumesAnarchy(this, count);
    }
  }

  async spendEdge(count) {
    if (count > 0) {
      throw 'No edge for selected actor';
    }
  }

  getSkillValue(skillId, specialization = undefined) {
    const skill = this.items.get(skillId);
    const attribute = this.getAttributeValue(skill.data.data.attribute);
    return skill.data.data.value + (attribute?.value ?? 0) + (specialization && skill.data.data.specialization ? 2 : 0);
  }

  getWounds() {
    return 0;
  }

  async removeOtherMetatype(metatype) {
    const metatypeIds = this.items.filter(it => it.isMetatype() && it.id != metatype?.id)
      .map(it => it.id);
    this.deleteEmbeddedDocuments("Item", metatypeIds);
  }

  /**
   * @param ownerActor the Actor who becomes the owner of this Actor
   */
  async attachToOwnerActor(ownerActor = undefined, attachOrCopy = 'attach') {
    if (ownerActor?.id == this.id) {
      return;
    }
    if (ownerActor?.hasPlayerOwner) {
      // TODO: enforce player to have rights if owner hasPlayer
    }
    let actorToAttach = this;
    if (attachOrCopy == 'copy') {
      const cloneTmp = this.clone();
      const created = await Actor.createDocuments([cloneTmp.data]);
      actorToAttach = created[0];
    }
    await actorToAttach.update({ 'data.ownerId': ownerActor?.id ?? '' });
    ownerActor?.render();
    this.render();
  }

  getOwnerActor() {
    if (this.data.data.ownerId) {
      return game.actors.get(this.data.data.ownerId);
    }
    return undefined;
  }

  getOwnedActors() {
    return game.actors.filter(it => it.data.data.ownerId == this.id);
  }

}