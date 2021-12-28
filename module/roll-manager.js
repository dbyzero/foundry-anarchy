import { ChatManager } from "./chat/chat-manager.js";
import { ChatRollData } from "./chat/chat-roll-data.js";
import { ANARCHY } from "./config.js";
import { Enums } from "./enums.js";
import { Modifiers } from "./modifiers.js";
import { AnarchyRoll } from "./roll.js";

export class AnarchyRollManager {

  static async roll(rollData) {
    rollData.param = Modifiers.computeRollParameters(rollData);
    await rollData.actor.spendEdge(rollData.param.edge);
    await rollData.actor.spendAnarchy(rollData.param.anarchy);
    await AnarchyRollManager._roll(rollData);
    await ChatManager.displayRollInChat(rollData, true);
  }

  static async edgeReroll(rollData) {
    await rollData.actor.spendEdge(1);
    await AnarchyRollManager._roll(rollData);
    await ChatManager.displayRollInChat(rollData, addJson);
  }

  static async _roll(rollData) {
    rollData.roll = new AnarchyRoll(rollData.param);
    await rollData.roll.evaluate();
  }
}