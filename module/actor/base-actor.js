import { AttributeActions } from "../attribute-actions.js";
import { Checkbars } from "../common/checkbars.js";
import { ANARCHY } from "../config.js";
import { BASE_MONITOR, TEMPLATE } from "../constants.js";
import { Enums } from "../enums.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";
import { Modifiers } from "../modifiers/modifiers.js";
import { RollDialog } from "../roll/roll-dialog.js";
import { ActorDamageManager } from "./actor-damage.js";

export class AnarchyBaseActor extends Actor {

  constructor(docData, context = {}) {
    if (!context.anarchy?.ready) {
      mergeObject(context, { anarchy: { ready: true } });
      const ActorConstructor = game.system.anarchy.actorClasses[docData.type];
      if (ActorConstructor) {
        if (!docData.img) {
          docData.img = ActorConstructor.defaultIcon;
        }
        return new ActorConstructor(docData, context);
      }
    }
    super(docData, context);
  }

  static get initiative() {
    return "2d6 + @modifiers.initiative";
  }

  static get defaultIcon() {
    return undefined;
  }

  getAllowedUserIds(permission = CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) {
    const allowedUsers = game.users.filter(user => this.testUserPermission(user, permission));
    return allowedUsers.map(it => it.id);
  }

  isCharacter() { return this.type == 'character'; }

  hasOwnAnarchy() { return false; }
  hasGMAnarchy() { return !this.hasPlayerOwner; }
  hasMatrixMonitor() { return false; }

  prepareData() {
    super.prepareData();
    this.cleanupFavorites();
  }

  getMatrixMonitor() {
    if (this.hasMatrixMonitor()) {
      return this.system.monitors.matrix;
    }
    return {
      canMark: true,
      marks: [],
      value: 0,
      max: 0,
      resistance: 0
    };
  }

  async setMatrixMonitorValue(value) {
    await this.update({ 'system.monitors.matrix.value': value });
  }

  _getMonitorMax(attribute) {
    const attributeValue = this.getAttributeValue(attribute);
    return attributeValue == 0 ? 0 : (BASE_MONITOR + Misc.divup(attributeValue, 2));
  }

  prepareDerivedData() {
    this.system.modifiers = {
      initiative: Modifiers.sumModifiers(this.items, 'other', 'initiative')
    };
    Object.entries(this.system.monitors).forEach(kv => {
      kv[1].maxBonus = Modifiers.sumMonitorModifiers(this.items, kv[0], 'max');
      kv[1].resistanceBonus = Modifiers.sumMonitorModifiers(this.items, kv[0], 'resistance');
    });
    Object.entries(this.system.attributes).forEach(kv => {
      kv[1].total = this.getAttributeValue(kv[0]);
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
    let value = 0;
    if (attribute) {
      if (this.getAttributes().includes(attribute)) {
        value = this.system.attributes[attribute].value;
      }
      else if (!item) {
        const candidateItems = this.items.filter(item => item.isActive() && item.getAttributes().includes(attribute));
        value = Math.max(candidateItems.map(it => it.getAttributeValue(attribute) ?? 0));
      }
      else if (this.isEmerged() && attribute == TEMPLATE.attributes.firewall) {
        return this.getAttributeValue(TEMPLATE.attributes.logic);
      }
      else {
        value = item?.getAttributeValue(attribute) ?? 0;
      }
      value += Modifiers.sumModifiers(this.items, 'attribute', attribute);
    }
    return value;
  }

  getDamageMonitor(damageType) {
    switch (damageType) {
      case TEMPLATE.monitors.matrix:
      case TEMPLATE.monitors.marks:
        return damageType;
    }
    return undefined;
  }

  async applyArmorDamage(damageType, damage = 0) {
    switch (damageType) {
      case TEMPLATE.monitors.physical:
      case TEMPLATE.monitors.stun:
        await ActorDamageManager.damageToArmor(this, damage);
    }
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
      attackerTokenId: game.scenes.current?.tokens.find(it => it.actor?.id == this.id)?.id,
      targetedTokenIds: weapon.validateTargets(this)?.map(it => it.id)
    }
    const skill = this.items.find(it => weapon.isWeaponSkill(it));
    await RollDialog.rollWeapon(this, skill, weapon, targeting);
  }

  async rollDefense(attack) {
    const defense = attack.attack.defense;
    const action = AttributeActions.getActorDefense(this, defense);
    await RollDialog.rollDefense(this, action, attack);
  }

  async rollDrain(drain) {
  }

  async rollConvergence(convergence) {
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

  getCyberdeck() {
    return undefined;
  }

  canReceiveMarks() {
    return this.system.monitors?.matrix?.canMark;
  }

  isEmerged() {
    return false;
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
    const sceneAnarchy = Modifiers.sumModifiers(this.items, 'other', 'sceneAnarchy');
    if (sceneAnarchy > 0) {
      await Checkbars.setCounter(this, TEMPLATE.monitors.sceneAnarchy, sceneAnarchy);
    }
  }

  async onLeaveCombat() {
    await Checkbars.setCounter(this, TEMPLATE.monitors.sceneAnarchy, 0);
  }

  getCelebrityValue() { return 0; }
  getCredibilityValue() { return 0; }
  getRumorValue() { return 0; }

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

  async spendCredibility(count) {
    await Checkbars.addCounter(this, TEMPLATE.counters.social.credibility, - count);
  }
  async spendRumor(count) {
    await Checkbars.addCounter(this, TEMPLATE.counters.social.rumor, - count);
  }

  async spendAnarchy(count) {
    if (count && !this.hasPlayerOwner) {
      await game.system.anarchy.gmAnarchy.npcConsumesAnarchy(this, count);
    }
  }

  getRemainingEdge() {
    return this.system.counters?.edge?.value ?? 0
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
        actor: this.name,
        actorType: game.i18n.localize(ANARCHY.actorType[this.type])
      });
      ui.notifications.warn(message)
      throw ANARCHY.common.errors.noEdgeForActor + message;
    }
    await Checkbars.addCounter(this, TEMPLATE.counters.edge, - count);
  }

  getSkillValue(skillId, specialization = undefined) {
    const skill = this.items.get(skillId);
    const attribute = this.getAttributeValue(skill.system.attribute);
    return skill.system.value + attribute + (specialization && skill.system.specialization ? 2 : 0);
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
      const created = await Actor.createDocuments([cloneTmp]);
      actorToAttach = created[0];
    }
    await actorToAttach.update({ 'system.ownerId': ownerActor?.id ?? '' });
    ownerActor?.render();
    this.render();
  }

  getOwnerActor() {
    if (this.system.ownerId) {
      return game.actors.get(this.system.ownerId);
    }
    return undefined;
  }

  getOwnedActors() {
    return game.actors.filter(it => it.system.ownerId == this.id);
  }


  hasFavorite(type, id) {
    const search = AnarchyBaseActor._prepareFavorite(type, id);
    return this.system.favorites.find(it => AnarchyBaseActor._isSameFavorite(search, it)) ? true : false;
  }

  static _prepareFavorite(type, id) {
    return { type: type, id: id };
  }

  static _isSameFavorite(f1, f2) {
    return f1.id == f2.id && f1.type == f2.type;
  }

  async switchFavorite(setFavorite, type, id) {
    const favorite = AnarchyBaseActor._prepareFavorite(type, id);
    const newFavorites = this.system.favorites.filter(it => !AnarchyBaseActor._isSameFavorite(favorite, it));
    if (setFavorite) {
      newFavorites.push(favorite);
    }
    this.update({ 'system.favorites': newFavorites })
  }

  async cleanupFavorites() {
    const newFavorites = this.computeShortcuts().filter(f => !f.callback);
    if (newFavorites.length < this.system.favorites) {
      this.update({ 'system.favorites': newFavorites })
    }
  }

  getShortcuts() {
    return this.computeShortcuts().filter(s => s.label && s.callback);
  }

  computeShortcuts() {
    return this.system.favorites.map(f => this.getShortcut(f.type, f.id));
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