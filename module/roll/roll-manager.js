import { ChatManager } from "../chat/chat-manager.js";
import { Modifiers } from "../modifiers.js";
import { AnarchyRoll } from "./anarchy-roll.js";

export class RollManager {

  static init() {

  }

  constructor() {

  }


  static async roll(rollData) {
    rollData.param = Modifiers.computeRollParameters(rollData);
    await rollData.actor.spendEdge(rollData.param.edge);
    await rollData.actor.spendAnarchy(rollData.param.anarchy);
    rollData.canEdgeRoll = rollData.param.edge == 0;
    RollManager._roll(rollData)
  }

  static async edgeReroll(rollData) {
    rollData.canEdgeRoll = false;
    await rollData.actor.spendEdge(1);
    RollManager._roll(rollData)
  }

  static async _roll(rollData) {
    rollData.roll = new AnarchyRoll(rollData.param);
    await rollData.roll.evaluate();
    ChatManager.displayRollInChat(rollData, rollData.canEdgeRoll)
  }



  static rollDataToJSON(rollData) {
    const chatRollData = {
      mode: rollData.mode,
      actor: RollManager._reduceToId(rollData.actor),
      skill: RollManager._reduceToId(rollData.skill),
      weapon: RollManager._reduceToId(rollData.weapon),
      attribute: rollData.attribute,
      attribute2: rollData.attribute2,
      attributeAction: rollData.attributeAction,
      specialization: rollData.specialization,
      modifiers: RollManager._reduceModifiers(rollData.modifiers),
      param: rollData.param
    }
    return JSON.stringify(chatRollData);
  }

  static rollDataFromJSON(jsonRollData) {
    const rollData = JSON.parse(jsonRollData);
    rollData.actor = RollManager._reloadActorFromId(rollData.actor);
    rollData.skill = RollManager._reloadItemFromId(rollData.actor, rollData.skill);
    rollData.weapon = RollManager._reloadItemFromId(rollData.actor, rollData.weapon);
    return rollData;
  }

  static _reduceToId(document) {
    return document ? { id: document.id } : undefined;
  }

  static _reloadActorFromId(actor) {
    return actor?.id ? game.actors.get(actor.id) : undefined;
  }

  static _reloadItemFromId(actor, item) {
    return actor && item?.id ? actor.items.get(item.id) : undefined;
  }

  static _reduceModifiers(modifiers) {
    const reduced = {}
    Object.entries(modifiers)
      .forEach(kv => {
        if (kv[1]?.used) {
          reduced[kv[0]] = RollManager._reducedModifier(kv[1]);
        }
      });
    return reduced;
  }

  static _reducedModifier(modifier) {
    return {
      type: modifier.type,
      label: modifier.label,
      labelkey: modifier.labelkey,
      category: modifier.category,
      isAnarchy: modifier.isAnarchy,
      value: modifier.value,
      used: modifier.used,
      selectedLabel: modifier.selectedLabel
    };
  }
}