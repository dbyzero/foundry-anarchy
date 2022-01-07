import { ChatManager } from "./chat/chat-manager.js";
import { Modifiers } from "./modifiers.js";
import { AnarchyRoll } from "./anarchy-roll.js";

export class AnarchyRollManager {

  static async roll(rollData) {
    rollData.param = Modifiers.computeRollParameters(rollData);
    await rollData.actor.spendEdge(rollData.param.edge);
    await rollData.actor.spendAnarchy(rollData.param.anarchy);
    rollData.canEdgeRoll = rollData.param.edge != 0;
    AnarchyRollManager._roll(rollData)
  }

  static async edgeReroll(rollData) {
    rollData.canEdgeRoll = false;
    await rollData.actor.spendEdge(1);
    AnarchyRollManager._roll(rollData)
  }

  static async _roll(rollData) {
    rollData.roll = new AnarchyRoll(rollData.param);
    await rollData.roll.evaluate();
    ChatManager.displayRollInChat(rollData, rollData.canEdgeRoll)
  }

}