import { ANARCHY } from "../config.js";
import { SYSTEM_SCOPE } from "../constants.js";
import { RemoteCall } from "../remotecall.js";


export const PARENT_MESSAGE_ID = 'parent-message-id';
export const MESSAGE_DATA = 'message-data';
export const MESSAGE_CAN_USE_EDGE = 'can-use-edge';
export const MESSAGE_OWNING_ACTOR = 'owning-actor';
const REMOVE_CHAT_MESSAGE = 'ChatManager.removeChatMessage';
const CHAT_MANAGER_REMOVE_FAMILY = 'ChatManager.removeChatMessageFamily';

const CHAT_MESSAGE_BUTTON_HANDLERS = [
  { selector: '.anarchy-button.click-edge-reroll', controlVisibility: true, handler: async (chatMsg, event) => await ChatManager.edgeReroll(chatMsg) },
  { selector: '.anarchy-button.click-defend-attack', controlVisibility: true, handler: async (chatMsg, event) => await ChatManager.defendAttack(chatMsg) },
  { selector: '.anarchy-button.click-defend-pilot-attack', controlVisibility: true, handler: async (chatMsg, event) => await ChatManager.defendPilotAttack(chatMsg) },
  { selector: '.anarchy-button.click-apply-attack-damage', controlVisibility: true, handler: async (chatMsg, event) => await ChatManager.applyAttack(chatMsg) },
  { selector: 'img.open-actor-sheet', controlVisibility: false, handler: async (chatMsg, event) => await ChatManager.openActorSheet(chatMsg, event) },
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
    const chatMessage = ChatManager.getChatMessageFromHtml(html);
    const showButtons = ChatManager.hasRight(chatMessage);

    CHAT_MESSAGE_BUTTON_HANDLERS.forEach(it => {
      const jQueryButtonSelector = html.find(it.selector);
      if (!it.controlVisibility || showButtons) {
        jQueryButtonSelector.show();
        jQueryButtonSelector.click(async event => await it.handler(ChatManager.getChatMessage(event), event))
      }
      else {
        jQueryButtonSelector.hide();
        jQueryButtonSelector.click(async event => { })
      }
    });
  }

  static async openActorSheet(chatMsg, event) {
    const img = $(event.currentTarget).closest('img.open-actor-sheet');
    const tokenId = img.attr('data-token-id')
    if (tokenId) {
      const token = canvas.tokens.get(tokenId);
      if (token?.actor) {
        token.actor.sheet.render(true)
        return
      }
    }
    const actorId = img.attr('data-actor-id')
    return game.actors.get(actorId)?.sheet.render(true)
  }

  static async edgeReroll(chatMsg) {
    if (ChatManager.getMessageCanUseEdge(chatMsg)) {
      const rollData = ChatManager.getMessageData(chatMsg);
      await game.system.anarchy.rollManager.edgeReroll(rollData);
      ChatManager.removeFamily(chatMsg.id);
    }
    else {
      ui.notifications.info(game.i18n.localize(ANARCHY.common.errors.cannotUseEdgeAnymore));
    }
  }

  static defendAttack(chatMsg) {
    return game.system.anarchy.combatManager.onClickDefendAttack(ChatManager.getMessageData(chatMsg));
  }

  static defendPilotAttack(chatMsg) {
    return game.system.anarchy.combatManager.onClickPilotDefendAttack(ChatManager.getMessageData(chatMsg));
  }

  static applyAttack(chatMsg) {
    return game.system.anarchy.combatManager.onClickApplyAttackDamage(ChatManager.getMessageData(chatMsg));
  }

  static getChatMessage(event) {
    const chatMessageId = $(event.currentTarget).closest('.chat-message').attr('data-message-id');
    return game.messages.get(chatMessageId);
  }

  static getChatMessageFromHtml(html) {
    const chatMessageId = $(html).closest('.chat-message').attr('data-message-id');
    return game.messages.get(chatMessageId);
  }

  static async setParentMessageId(chatMsg, family) {
    await chatMsg.setFlag(SYSTEM_SCOPE, PARENT_MESSAGE_ID, family);
  }

  static getParentMessageId(chatMsg) {
    return chatMsg.getFlag(SYSTEM_SCOPE, PARENT_MESSAGE_ID);
  }
  static getParentMessage(chatMsg) {
    const chatMessageId = ChatManager.getParentMessageId(chatMsg);
    return chatMessageId ? game.messages.get(chatMessageId) : undefined;
  }

  static removeFamily(chatMessageId) {
    if (!RemoteCall.call(CHAT_MANAGER_REMOVE_FAMILY, chatMessageId)) {
      game.messages.filter(m => m.getFlag(SYSTEM_SCOPE, PARENT_MESSAGE_ID) == chatMessageId)
        .forEach(m => m.delete());
      game.messages.get(chatMessageId)?.delete()
    }
  }

  static async setMessageData(chatMsg, data) {
    if (data) {
      await chatMsg.setFlag(SYSTEM_SCOPE, MESSAGE_DATA, JSON.stringify(data));
    }
  }

  static getMessageData(chatMsg) {
    const json = chatMsg.getFlag(SYSTEM_SCOPE, MESSAGE_DATA);
    return json ? JSON.parse(json) : undefined;
  }

  static removeChatMessage(chatMessageId) {
    if (!RemoteCall.call(REMOVE_CHAT_MESSAGE, chatMessageId)) {
      game.messages.get(chatMessageId)?.delete();
    }
  }

  static async setMessageCanUseEdge(chatMsg, canUseEdge) {
    await chatMsg.setFlag(SYSTEM_SCOPE, MESSAGE_CAN_USE_EDGE, canUseEdge);
  }

  static getMessageCanUseEdge(chatMsg) {
    return chatMsg.getFlag(SYSTEM_SCOPE, MESSAGE_CAN_USE_EDGE);
  }

  static async setMessageActor(chatMsg, actor, right = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
    if (actor) {
      await chatMsg.setFlag(SYSTEM_SCOPE, MESSAGE_OWNING_ACTOR, {
        actorId: actor.id,
        tokenId: actor.token?.id,
        right: right
      });
    }
  }

  static hasRight(chatMsg, right = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
    const owningActor = chatMsg.getFlag(SYSTEM_SCOPE, MESSAGE_OWNING_ACTOR);
    if (owningActor) {
      const token = ChatManager.getToken(owningActor.tokenId)
      const actor = token?.actor ?? game.actors.get(owningActor.actorId)
      if (actor) {
        return actor.testUserPermission(game.user, Math.min(owningActor.right, right))
      }
      return true
    }
    return false
  }

  static getToken(tokenId) {
    return tokenId ? game.scenes.map(s => s.tokens.find(it => it.id == tokenId)).find(it => it != undefined) : undefined;
  }
}
