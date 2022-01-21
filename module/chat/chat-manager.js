import { ANARCHY } from "../config.js";
import { SYSTEM_SCOPE } from "../constants.js";
import { RemoteCall } from "../remotecall.js";


export const PARENT_MESSAGE_ID = 'parent-message-id';
export const MESSAGE_DATA = 'message-data';
export const MESSAGE_CAN_USE_EDGE = 'can-use-edge';
const REMOVE_CHAT_MESSAGE = 'ChatManager.removeChatMessage';
const CHAT_MANAGER_REMOVE_FAMILY = 'ChatManager.removeChatMessageFamily';

export class ChatManager {

  static async init() {
    Hooks.on("renderChatMessage", async (app, html, msg) => await ChatManager.onRenderChatMessage(app, html, msg));

    RemoteCall.register(CHAT_MANAGER_REMOVE_FAMILY, {
      callback: data => this.removeFamily(data),
      condition: user => user.isGM
    });

    RemoteCall.register(REMOVE_CHAT_MESSAGE, {
      callback: data => ChatManager.removeChatMessage(data),
      condition: user => user.isGM
    });
  }

  static async onRenderChatMessage(app, html, msg) {

    html.find('.anarchy-button.click-edge-reroll').click(async event => {
      const chatMessage = ChatManager.getChatMessage(event);
      await ChatManager.edgeReroll(chatMessage);
    });

    html.find('.anarchy-button.click-defend-attack').click(async event => {
      const chatMessage = ChatManager.getChatMessage(event);
      await ChatManager.defendAttack(chatMessage);
    });

    html.find('.anarchy-button.click-apply-attack-damage').click(async event => {
      const chatMessage = ChatManager.getChatMessage(event);
      await ChatManager.applyAttack(chatMessage);
    });

    // Support for other buttons here?
  }

  static async edgeReroll(chatMessage) {
    if (ChatManager.getMessageCanUseEdge(chatMessage)) {

      const rollData = ChatManager.getMessageData(chatMessage);
      await game.system.anarchy.rollManager.edgeReroll(rollData);
      ChatManager.removeFamily(chatMessage.id);
    }
    else {
      ui.notifications.info(game.i18n.localize(ANARCHY.common.errors.cannotUseEdgeAnymore));
    }
  }

  static defendAttack(chatMessage) {
    return game.system.anarchy.combatManager.onClickDefendAttack(ChatManager.getMessageData(chatMessage));
  }

  static applyAttack(chatMessage) {
    return game.system.anarchy.combatManager.onClickApplyAttackDamage(ChatManager.getMessageData(chatMessage));
  }

  static getChatMessage(event) {
    const chatMessageId = $(event.currentTarget).closest('.chat-message').attr('data-message-id');
    return game.messages.get(chatMessageId);
  }

  static async setParentMessageId(chatMessage, family) {
    await chatMessage.setFlag(SYSTEM_SCOPE, PARENT_MESSAGE_ID, family);
  }

  static getParentMessageId(chatMessage) {
    return chatMessage.getFlag(SYSTEM_SCOPE, PARENT_MESSAGE_ID);
  }
  static getParentMessage(chatMessage) {
    const chatMessageId = ChatManager.getParentMessageId(chatMessage);
    return chatMessageId ? game.messages.get(chatMessageId) : undefined;
  }

  static removeFamily(chatMessageId) {
    if (!RemoteCall.call(CHAT_MANAGER_REMOVE_FAMILY, chatMessageId)) {
      game.messages.filter(m => m.getFlag(SYSTEM_SCOPE, PARENT_MESSAGE_ID) == chatMessageId)
        .forEach(m => m.delete());
      game.messages.get(chatMessageId)?.delete()
    }
  }

  static async setMessageData(chatMessage, data) {
    if (data) {
      await chatMessage.setFlag(SYSTEM_SCOPE, MESSAGE_DATA, JSON.stringify(data));
    }
  }

  static getMessageData(chatMessage) {
    const json = chatMessage.getFlag(SYSTEM_SCOPE, MESSAGE_DATA);
    return json ? JSON.parse(json) : undefined;
  }

  static removeChatMessage(chatMessageId) {
    if (!RemoteCall.call(REMOVE_CHAT_MESSAGE, chatMessageId)) {
      game.messages.get(chatMessageId)?.delete();
    }
  }

  static async setMessageCanUseEdge(chatMessage, canUseEdge) {
    await chatMessage.setFlag(SYSTEM_SCOPE, MESSAGE_CAN_USE_EDGE, canUseEdge);
  }

  static getMessageCanUseEdge(chatMessage) {
    return chatMessage.getFlag(SYSTEM_SCOPE, MESSAGE_CAN_USE_EDGE);
  }

}
