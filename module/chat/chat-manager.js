import { ANARCHY } from "../config.js";
import { SYSTEM_SCOPE } from "../constants.js";
import { RemoteCall } from "../remotecall.js";


export const PARENT_MESSAGE_ID = 'parent-message-id';
export const MESSAGE_DATA = 'message-data';
export const MESSAGE_CAN_USE_EDGE = 'can-use-edge';
export const MESSAGE_OWNING_ACTOR_ID = 'owning-actor-id';
const REMOVE_CHAT_MESSAGE = 'ChatManager.removeChatMessage';
const CHAT_MANAGER_REMOVE_FAMILY = 'ChatManager.removeChatMessageFamily';

const CHAT_MESSAGE_BUTTON_HANDLERS = [
  { selector: '.anarchy-button.click-edge-reroll', handler: async chatMessage => await ChatManager.edgeReroll(chatMessage) },
  { selector: '.anarchy-button.click-defend-attack', handler: async chatMessage => await ChatManager.defendAttack(chatMessage) },
  { selector: '.anarchy-button.click-apply-attack-damage', handler: async chatMessage => await ChatManager.applyAttack(chatMessage) },
]

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

    const showButtons = ChatManager.hasRight(ChatManager.getChatMessageFromHtml(html));

    CHAT_MESSAGE_BUTTON_HANDLERS.forEach(it => {
      const jQueryButtonSelector = html.find(it.selector);
      if (showButtons) {
        jQueryButtonSelector.show();
        jQueryButtonSelector.click(async event => await it.handler(ChatManager.getChatMessage(event)))
      }
      else {
        jQueryButtonSelector.hide();
      }
    });
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

  static getChatMessageFromHtml(html) {
    const chatMessageId = $(html).closest('.chat-message').attr('data-message-id');
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

  static async setMessageActorId(chatMessage, actor) {
    if (actor) {
      await chatMessage.setFlag(SYSTEM_SCOPE, MESSAGE_OWNING_ACTOR_ID, actor.id);
    }
  }

  static hasRight(chatMessage) {
    const actorId = chatMessage.getFlag(SYSTEM_SCOPE, MESSAGE_OWNING_ACTOR_ID);
    const actor = actorId ? game.actors.get(actorId) : undefined;
    if (actor) {
      return actor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
    }
    return true;
  }
}
