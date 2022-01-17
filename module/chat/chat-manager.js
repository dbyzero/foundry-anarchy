import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { ANARCHY_HOOKS } from "../hooks-manager.js";
import { RemoteCall } from "../remotecall.js";
import { RollManager } from "../roll/roll-manager.js";

const REMOVE_CHAT_MESSAGE = 'ChatManager.removeChatMessage';
const HBS_CHAT_TEMPLATES = [
  `${TEMPLATES_PATH}/chat/roll-modifier.hbs`,
  `${TEMPLATES_PATH}/chat/risk-outcome.hbs`,
  `${TEMPLATES_PATH}/chat/edge-reroll-button.hbs`,
  `${TEMPLATES_PATH}/chat/parts/actor-image.hbs`,
  `${TEMPLATES_PATH}/chat/parts/title-mode-attribute.hbs`,
  `${TEMPLATES_PATH}/chat/parts/title-mode-skill.hbs`,
  `${TEMPLATES_PATH}/chat/parts/title-mode-weapon.hbs`,
  `${TEMPLATES_PATH}/chat/parts/pool-mode-attribute.hbs`,
  `${TEMPLATES_PATH}/chat/parts/pool-mode-skill.hbs`,
  `${TEMPLATES_PATH}/chat/parts/pool-mode-weapon.hbs`,
  `${TEMPLATES_PATH}/chat/parts/result-mode-weapon.hbs`,
  `${TEMPLATES_PATH}/chat/actor-drain.hbs`,
];

export class ChatManager {

  static async init() {
    Hooks.on("renderChatMessage", async (app, html, msg) => await ChatManager.onRenderChatMessage(app, html, msg));

    RemoteCall.register(REMOVE_CHAT_MESSAGE, {
      callback: data => ChatManager.removeChatMessage(data),
      condition: user => user.isGM
    });

    Hooks.on(ANARCHY_HOOKS.GET_HANDLEPAR_PARTIALS, list => HBS_CHAT_TEMPLATES.forEach(it => list.push(it)));
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

    const flavor = await renderTemplate(`${TEMPLATES_PATH}/chat/anarchy-roll.hbs`, rollData);
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

  static async displayDrainInChat(actor, rollDrain) {

    const flavor = await renderTemplate(`${TEMPLATES_PATH}/chat/actor-drain.hbs`, {
      ANARCHY: ANARCHY,
      actor: actor,
      drain: rollDrain.total,
      options: {
        classes: game.system.anarchy.styles.selectCssClass()
      }
    });
    await rollDrain.toMessage({ flavor: flavor });
  }
}
