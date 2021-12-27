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

    await AnarchyRollManager._rollAndChat(rollData, true);
  }

  static async edgeReroll(rollData) {
    await rollData.actor.spendEdge(1);
    await AnarchyRollManager._rollAndChat(rollData,);
  }

  static async _rollAndChat(rollData, addJson = false) {
    rollData.roll = new AnarchyRoll(rollData.param);
    await rollData.roll.evaluate();

    if (addJson) {
      rollData.json = ChatRollData.rollDataToJSON(rollData);
    }

    rollData.ANARCHY = ANARCHY;
    rollData.ENUMS = Enums.getEnums();

    const flavor = await renderTemplate(`systems/anarchy/templates/chat/${rollData.mode}-roll.hbs`, rollData);
    const message = await rollData.roll.toMessage({ flavor: flavor }, { create: false });

    ChatMessage.create(message);
  }

}