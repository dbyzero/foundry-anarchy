import { ChatManager } from "../chat/chat-manager.js";
import { Modifiers } from "../modifiers.js";
import { AnarchyRoll } from "./anarchy-roll.js";
import { ROLL_PARAMETER_CATEGORY } from "./roll-parameters.js";


export class RollManager {

  static async roll(rollData) {
    rollData.param = game.system.anarchy.rollParameters.compute(rollData.parameters);

    rollData.param.edge = rollData.parameters.find(it => it.category == ROLL_PARAMETER_CATEGORY.edge && it.used) ? 1 : 0;
    rollData.param.anarchy = rollData.parameters.filter(it => it.flags.isAnarchy && it.used).length;

    await rollData.actor.spendAnarchy(rollData.param.anarchy);
    await rollData.actor.spendEdge(rollData.param.edge);
    rollData.canEdgeRoll = !rollData.param.edge;
    RollManager._roll(rollData);
  }

  static async edgeReroll(rollData) {
    rollData.canEdgeRoll = false;
    await rollData.actor.spendEdge(1);
    rollData.param[ROLL_PARAMETER_CATEGORY.convergence] = undefined;
    rollData.param[ROLL_PARAMETER_CATEGORY.drain] = undefined;
    RollManager._roll(rollData)
  }

  static async _roll(rollData) {
    rollData.roll = new AnarchyRoll(rollData.param);
    await rollData.roll.evaluate();
    await ChatManager.displayRollInChat(rollData, rollData.canEdgeRoll)
    await rollData.actor.rollDrain(rollData.param.drain);
    await rollData.actor.rollConvergence(rollData.param.convergence);
  }

  static rollDataToJSON(rollData) {
    const chatRollData = {
      mode: rollData.mode,
      actor: RollManager._reduceToId(rollData.actor),
      skill: RollManager._reduceToId(rollData.skill),
      weapon: RollManager._reduceToId(rollData.weapon),
      item: RollManager._reduceToId(rollData.item),
      attribute1: rollData.attribute1,
      attribute2: rollData.attribute2,
      attributeAction: rollData.attributeAction,
      specialization: rollData.specialization,
      parameters: RollManager._reduceParameters(rollData.parameters),
      param: rollData.param
    }
    return JSON.stringify(chatRollData);
  }

  static rollDataFromJSON(jsonRollData) {
    const rollData = JSON.parse(jsonRollData);
    rollData.actor = RollManager._reloadActorFromId(rollData.actor);
    rollData.skill = RollManager._reloadItemFromId(rollData.actor, rollData.skill);
    rollData.item = RollManager._reloadItemFromId(rollData.actor, rollData.item);
    rollData.weapon = RollManager._reloadItemFromId(rollData.actor, rollData.weapon);
    rollData.attributes = rollData.actor.getActorItemAttributes(rollData.item);
    rollData.parameters = RollManager._reloadParameters(rollData, rollData.parameters);
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

  static _reduceParameters(parameters) {
    return parameters.filter(it => it.used)
      .map(it => {
        return {
          code: it.code,
          value: it.value,
        }
      });
  }

  static _reloadParameters(rollData, parameters) {
    if (!parameters) {
      return parameters;
    }
    const built = game.system.anarchy.rollParameters.build(rollData);
    return parameters.map(p => {
      const initial = built.find(it => it.code == p.code) ?? {};
      return mergeObject(p, initial, { overwrite: false });
    });
  }
}