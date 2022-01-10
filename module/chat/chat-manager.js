import { ANARCHY } from "../config.js";
import { Enums } from "../enums.js";
import { HOOK_GET_HANDLEPAR_PARTIALS } from "../handlebars-manager.js";
import { RemoteCall } from "../remotecall.js";
import { RollManager } from "../roll/roll-manager.js";

const REMOVE_CHAT_MESSAGE = 'ChatManager.removeChatMessage';
const HBS_CHAT_TEMPLATES = [
  'systems/anarchy/templates/chat/roll-modifier.hbs',
  'systems/anarchy/templates/chat/risk-outcome.hbs',
  'systems/anarchy/templates/chat/edge-reroll-button.hbs',
  'systems/anarchy/templates/chat/parts/actor-image.hbs',
  'systems/anarchy/templates/chat/parts/title-mode-attribute.hbs',
  'systems/anarchy/templates/chat/parts/title-mode-skill.hbs',
  'systems/anarchy/templates/chat/parts/title-mode-weapon.hbs',
  'systems/anarchy/templates/chat/parts/pool-mode-attribute.hbs',
  'systems/anarchy/templates/chat/parts/pool-mode-skill.hbs',
  'systems/anarchy/templates/chat/parts/pool-mode-weapon.hbs',
  'systems/anarchy/templates/chat/parts/result-mode-weapon.hbs',
];

export class ChatManager {

  static async init() {
    Hooks.on("renderChatMessage", async (app, html, msg) => await ChatManager.onRenderChatMessage(app, html, msg));

    RemoteCall.register(REMOVE_CHAT_MESSAGE, {
      callback: data => ChatManager.removeChatMessage(data),
      condition: user => user.isGM
    });

    Hooks.on(HOOK_GET_HANDLEPAR_PARTIALS, list => HBS_CHAT_TEMPLATES.forEach(it => list.push(it)));
  }


  static async displayRollInChat(rollData, addJson = false) {
    if (addJson) {
      rollData.json = RollManager.rollDataToJSON(rollData);
    }

    rollData.ANARCHY = ANARCHY;
    rollData.ENUMS = Enums.getEnums();
    rollData.options = rollData.options ?? {};
    rollData.options.classes = rollData.options.classes ?? [];
    rollData.options.classes.push(game.system.anarchy.styles.selectCssClass());

    const flavor = await renderTemplate('systems/anarchy/templates/chat/anarchy-roll.hbs', rollData);
    await rollData.roll.toMessage({ flavor: flavor });
  }

  static async onRenderChatMessage(app, html, msg) {
    html.find(".click-edge-reroll").click(async event => {
      const messageId = $(event.currentTarget).closest('.chat-message').attr('data-message-id');
      const json = $(event.currentTarget).attr('data-json');
      const rollData = RollManager.rollDataFromJSON(json);
      // TODO: indicate edge was used for reroll
      await RollManager.edgeReroll(rollData);
      ChatManager.removeChatMessage(messageId);
    });
  }

  static removeChatMessage(messageId) {
    if (!RemoteCall.call(REMOVE_CHAT_MESSAGE, messageId)) {
      game.messages.get(messageId)?.delete();
    }
  }
}
