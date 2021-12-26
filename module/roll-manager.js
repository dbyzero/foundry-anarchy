import { ChatRollData } from "./chat/chat-roll-data.js";
import { SRA } from "./config.js";
import { Enums } from "./enums.js";
import { Modifiers } from "./modifiers.js";
import { SRARoll } from "./roll.js";

export class SRARollManager {

  static async roll(rollData) {
    rollData.param = Modifiers.computeRollParameters(rollData);
    await rollData.actor.spendEdge(rollData.param.edge);
    await rollData.actor.spendAnarchy(rollData.param.anarchy);

    await SRARollManager._rollAndChat(rollData, true);
  }

  static async edgeReroll(rollData) {
    await rollData.actor.spendEdge(1);
    await SRARollManager._rollAndChat(rollData,);
  }

  static async _rollAndChat(rollData, addJson = false) {
    rollData.roll = new SRARoll(rollData.param);
    await rollData.roll.evaluate();

    if (addJson) {
      rollData.json = ChatRollData.rollDataToJSON(rollData);
    }

    rollData.SRA = SRA;
    rollData.ENUMS = Enums.getEnums();

    const flavor = await renderTemplate(`systems/shadowrun-anarchy/templates/chat/${rollData.mode}-roll.hbs`, rollData);
    const message = await rollData.roll.toMessage({ flavor: flavor }, { create: false });

    ChatMessage.create(message);
  }

}