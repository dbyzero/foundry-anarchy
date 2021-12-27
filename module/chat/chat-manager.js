import { RemoteCall } from "../remotecall.js";
import { AnarchyRollManager } from "../roll-manager.js";
import { ChatRollData } from "./chat-roll-data.js";

const REMOVE_CHAT_MESSAGE = 'ChatManager.removeChatMessage';
export class ChatManager {

  static async init() {
    Hooks.on("renderChatMessage", async (app, html, msg) => await ChatManager.onRenderChatMessage(app, html, msg));

    RemoteCall.register(REMOVE_CHAT_MESSAGE, {
      callback: data => ChatManager.removeChatMessage(data),
      condition: user => user.isGM
    });
  }

  static async onRenderChatMessage(app, html, msg) {
    html.find(".click-edge-reroll").click(async event => {
      const messageId = $(event.currentTarget).closest('.chat-message').attr('data-message-id');
      const json = $(event.currentTarget).attr('data-json');
      const rollData = ChatRollData.rollDataFromJSON(json);
      // TODO: indicate edge was used for reroll
      await AnarchyRollManager.edgeReroll(rollData);
      ChatManager.removeChatMessage(messageId);
    });
  }

  static removeChatMessage(messageId) {
    if (!RemoteCall.call(REMOVE_CHAT_MESSAGE, messageId)) {
      game.messages.get(messageId)?.delete();
    }
  }
}
