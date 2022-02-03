import { AttributeActions } from "../attribute-actions.js";
import { Checkbars } from "../common/checkbars.js";
import { ANARCHY } from "../config.js";
import { TEMPLATE } from "../constants.js";
import { Enums } from "../enums.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";
import { Modifiers } from "../modifiers/modifiers.js";
import { RollDialog } from "../roll/roll-dialog.js";

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

  static get initiative() {
    return "2d6";
  }

  static get defaultIcon() {
    return undefined;
  }

  getAllowedUserIds(permission = 3) {
    return Object.entries(this.data.permission)
      .filter(kv => kv[0] != 'default' && kv[1] >= permission)
      .map(kv => kv[0]);
  }

  isCharacter() { return this.type == 'character'; }

  hasOwnAnarchy() { return false; }
  hasGMAnarchy() { return !this.hasPlayerOwner; }

  prepareData() {
    super.prepareData();
    this.cleanupFavorites();
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    Object.entries(this.data.data.monitors).forEach(kv => {
      kv[1].maxBonus = Modifiers.computeMonitorModifiers(this.items, kv[0], 'max');
      kv[1].resistanceBonus = Modifiers.computeMonitorModifiers(this.items, kv[0], 'resistance');
    });
  }

  getAttributeActions() {
    return AttributeActions.getActorActions(this);
  }

  getAttributes() {
    return [undefined];
  }

  getUsableAttributes(item = undefined) {
    const itemsAttributes = (item ? [item] : this.items)
      .map(it => it.getUsableAttributes())
      .reduce((a, b) => a.concat(b), [])
    const usableAttributes = Misc.distinct(this.getAttributes().concat(itemsAttributes));
    usableAttributes.sort(Misc.ascendingBySortedArray(Enums.sortedAttributeKeys));
    return usableAttributes;
  }

  getAttributeValue(attribute, item = undefined) {
    if (attribute) {
      if (this.getAttributes().includes(attribute)) {
        return this.data.data.attributes[attribute].value;
      }
      if (!item) {
        const candidateItems = this.items.filter(item => item.isActive() && item.getAttributes().includes(attribute));
        return Math.max(candidateItems.map(it => it.getAttributeValue(attribute) ?? 0));
      }
      return item?.getAttributeValue(attribute) ?? 0;
    }
    return 0;
  }

  async rollAttribute(attribute) {
    await RollDialog.rollAttribute(this, attribute);
  }

  async rollAttributeAction(code) {
    const action = AttributeActions.getActorAction(this, code);
    await RollDialog.rollAttributeAction(this, action);
  }

  async rollSkill(skill, specialization) {
    await RollDialog.rollSkill(this, skill, specialization);
  }

  async rollWeapon(weapon) {
    ErrorManager.checkWeaponDefense(weapon, this);
    const targeting = {
      attackerTokenId: game.scenes.current.tokens.find(it => it.actor?.id == this.id)?.id,
      targetedTokenIds: weapon.validateTargets(this)?.map(it => it.id)
    }
    const skill = this.items.find(it => weapon.isWeaponSkill(it));
    await RollDialog.rollWeapon(this, skill, weapon, targeting);
  }

  async rollDefense(attackData) {
    const defense = attackData.attack.defense;
    const action = AttributeActions.getActorDefense(this, defense);
    await RollDialog.rollDefense(this, action, attackData);
  }

  async rollDrain(drain) {
  }

  async rollConvergence(convergence) {
  }

  async applyDamage(monitor, value, success, useArmor, actor) {
    if (monitor == TEMPLATE.monitors.marks) {
      await Checkbars.addCounter(this, TEMPLATE.monitors.marks, 1, actor.id);
    }
    else {
      value += success - Checkbars.resistance(this, monitor);
      if (Checkbars.useArmor(monitor) && useArmor) {
        value -= await this.applyArmorDamage(value);
      }
      if (value > 0) {
        await Checkbars.addCounter(this, monitor, value);
      }
    }
    return value;
  }

  async applyArmorDamage(value) {
    const armorMax = Checkbars.max(this, TEMPLATE.monitors.armor);
    const armor = Checkbars.getCounterValue(this, TEMPLATE.monitors.armor);
    const armorDmg = Math.min(armorMax - armor, value);
    await Checkbars.addCounter(this, TEMPLATE.monitors.armor, armorDmg);
    return armorDmg;
  }

  async switchMonitorCheck(monitor, index, checked, sourceActorId = undefined) {
    await Checkbars.switchMonitorCheck(this, monitor, index, checked, sourceActorId);
  }

  async addCounter(monitor, value, sourceActorId = undefined) {
    await Checkbars.addCounter(this, monitor, value, sourceActorId);
  }

  async setCounter(monitor, value, sourceActorId = undefined) {
    await Checkbars.setCounter(this, monitor, value, sourceActorId);
  }

  canSetMarks() {
    return false;
  }

  hasCyberdeck() {
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

  async onEnterCombat() {
    const sceneAnarchy = Modifiers.computeSum(this.items, 'other', 'sceneAnarchy');
    if (sceneAnarchy > 0) {
      await Checkbars.setCounter(this, TEMPLATE.monitors.sceneAnarchy, sceneAnarchy);
    }
  }

  async onLeaveCombat() {
    await Checkbars.setCounter(this, TEMPLATE.monitors.sceneAnarchy, 0);
  }

  getAnarchy() {
    const anarchy = this.hasGMAnarchy()
      ? game.system.anarchy.gmAnarchy.getAnarchy()
      : {
        isGM: false,
        value: 0,
        max: 0,
      };
    anarchy.scene = this.getAnarchyScene()
    return anarchy;
  }

  getAnarchyScene() {
    return 0;
  }

  getAnarchyValue() {
    return this.getAnarchy().value ?? 0;
  }

  async spendAnarchy(count) {
    if (count && !this.hasPlayerOwner) {
      await game.system.anarchy.gmAnarchy.npcConsumesAnarchy(this, count);
    }
  }

  getRemainingEdge() {
    return this.data.data.counters?.edge?.value ?? 0
  }

  canUseEdge() {
    return this.getAttributes().includes(TEMPLATE.attributes.edge);
  }

  async spendEdge(count) {
    if (count == 0) {
      return;
    }
    if (!this.canUseEdge()) {
      const message = game.i18n.localize(ANARCHY.common.errors.noEdgeForActor, {
        actorName: this.name,
        actorType: game.i18n.localize(ANARCHY.actorType[this.type])
      });
      ui.notifications.warn(message)
      throw ANARCHY.common.errors.noEdgeForActor + message;
    }
    let current = this.data.data.counters.edge.value;
    ErrorManager.checkSufficient(ANARCHY.actor.counters.edge, count, current);
    await this.update({ 'data.counters.edge.value': (current - count) });
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


  hasFavorite(type, id) {
    const search = AnarchyBaseActor._prepareFavorite(type, id);
    return this.data.data.favorites.find(it => AnarchyBaseActor._isSameFavorite(search, it)) ? true : false;
  }

  static _prepareFavorite(type, id) {
    return { type: type, id: id };
  }

  static _isSameFavorite(f1, f2) {
    return f1.id == f2.id && f1.type == f2.type;
  }

  async switchFavorite(setFavorite, type, id) {
    const favorite = AnarchyBaseActor._prepareFavorite(type, id);
    const newFavorites = this.data.data.favorites.filter(it => !AnarchyBaseActor._isSameFavorite(favorite, it));
    if (setFavorite) {
      newFavorites.push(favorite);
    }
    this.update({ 'data.favorites': newFavorites })
  }

  async cleanupFavorites() {
    const newFavorites = this.computeShortcuts().filter(f => !f.callback);
    if (newFavorites.length < this.data.data.favorites) {
      this.update({ 'data.favorites': newFavorites })
    }
  }

  getShortcuts() {
    return this.computeShortcuts().filter(s => s.label && s.callback);
  }

  computeShortcuts() {
    return this.data.data.favorites.map(f => this.getShortcut(f.type, f.id));
  }

  getShortcut(type, id) {
    const favorite = AnarchyBaseActor._prepareFavorite(type, id);
    if (type == 'attributeAction') {
      const shortcut = AttributeActions.prepareShortcut(this, id);
      if (shortcut) {
        return mergeObject(shortcut, favorite);
      }
    }
    else if (Object.values(TEMPLATE.itemType).includes(type)) {
      const shortcut = this.items.get(id)?.prepareShortcut();
      if (shortcut) {
        return mergeObject(shortcut, favorite);
      }
    }
    return favorite;
  }

}