import { ChatManager } from "../chat/chat-manager.js";
import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { Misc } from "../misc.js";
import { Tokens } from "../token/tokens.js";
import { AnarchyRoll } from "./anarchy-roll.js";
import { ROLL_PARAMETER_CATEGORY } from "./roll-parameters.js";

const HBS_TEMPLATE_CHAT_ANARCHY_ROLL = `${TEMPLATES_PATH}/chat/anarchy-roll.hbs`;

const HBS_CHAT_TEMPLATES = [
  `${TEMPLATES_PATH}/chat/risk-outcome.hbs`,
  `${TEMPLATES_PATH}/chat/edge-reroll-button.hbs`,
  `${TEMPLATES_PATH}/chat/anarchy-roll-title.hbs`,
  `${TEMPLATES_PATH}/chat/parts/actor-image.hbs`,
  `${TEMPLATES_PATH}/chat/parts/generic-parameter.hbs`,
  `${TEMPLATES_PATH}/chat/parts/result-mode-weapon.hbs`,
];

export class RollManager {
  constructor() {
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    await loadTemplates(Misc.distinct(HBS_CHAT_TEMPLATES));
  }

  async roll(rollData) {
    rollData.param = game.system.anarchy.rollParameters.compute(rollData.parameters);
    rollData.param.edge = rollData.parameters.find(it => it.category == ROLL_PARAMETER_CATEGORY.edge && it.used) ? 1 : 0;
    rollData.param.anarchy = rollData.parameters.filter(it => it.flags.isAnarchy && it.used).length;
    rollData.options.canUseEdge = rollData.options.canUseEdge && !rollData.param.edge;

    await rollData.actor.spendAnarchy(rollData.param.anarchy);
    await rollData.actor.spendEdge(rollData.param.edge);
    await this._roll(rollData);
  }

  async edgeReroll(rollData) {
    rollData = RollManager.inflateAnarchyRoll(rollData)
    // TODO: indicate edge was used for reroll
    rollData.options.canUseEdge = false;
    await rollData.actor.spendEdge(1);
    rollData.param[ROLL_PARAMETER_CATEGORY.convergence] = undefined;
    rollData.param[ROLL_PARAMETER_CATEGORY.drain] = undefined;
    await this._roll(rollData)
  }

  async _roll(rollData) {
    rollData.roll = new AnarchyRoll(rollData.param);
    await rollData.roll.evaluate();
    await this._displayRollInChat(rollData);

    await rollData.actor.rollDrain(rollData.param.drain);
    await rollData.actor.rollConvergence(rollData.param.convergence);

    await game.system.anarchy.combatManager.manageCombat(rollData);
  }

  async _displayRollInChat(rollData) {
    const hbsRollData = deepClone(rollData);
    hbsRollData.options.classes = [game.system.anarchy.styles.selectCssClass()];

    const flavor = await renderTemplate(HBS_TEMPLATE_CHAT_ANARCHY_ROLL, hbsRollData);
    const rollMessage = await hbsRollData.roll.toMessage({ flavor: flavor });

    rollData.chatMessageId = rollMessage.id;
    await ChatManager.setMessageData(rollMessage, RollManager.deflateAnarchyRoll(rollData));
    await ChatManager.setMessageCanUseEdge(rollMessage, rollData.options.canUseEdge);
  }

  static deflateAnarchyRoll(rollData) {
    if (rollData) {
      rollData = deepClone(rollData);
      rollData.actor = RollManager._reduceToId(rollData.actor);
      rollData.skill = RollManager._reduceToId(rollData.skill);
      rollData.skill = RollManager._reduceToId(rollData.skill);
      rollData.weapon = RollManager._reduceToId(rollData.weapon);
      rollData.item = RollManager._reduceToId(rollData.item);
      rollData.parameters = RollManager._reduceParameters(rollData.parameters);
      rollData.attackData = undefined;
      rollData.attributes = undefined
      rollData.ANARCHY = undefined;
      rollData.ENUMS = undefined;
    }
    return rollData;
  }

  static inflateAnarchyRoll(rollData) {
    if (rollData) {
      rollData = deepClone(rollData);
      rollData.actor = RollManager._reloadActorFromId(rollData.actor, rollData.tokenId);
      rollData.skill = RollManager._reloadItemFromId(rollData.actor, rollData.skill);
      rollData.item = RollManager._reloadItemFromId(rollData.actor, rollData.item);
      rollData.weapon = RollManager._reloadItemFromId(rollData.actor, rollData.weapon);
      rollData.attributes = rollData.actor.getUsableAttributes(rollData.item);
      rollData.parameters = RollManager._reloadParameters(rollData, rollData.parameters);
      rollData.ANARCHY = ANARCHY;
      rollData.ENUMS = Enums.getEnums();
    }
    return rollData;
  }

  static _reduceToId(document) {
    return document ? { id: document.id } : undefined;
  }

  static _reloadActorFromId(actor, tokenId) {
    const token = Tokens.getToken(tokenId);
    if (token) {
      return token.actor;
    }
    return actor?.id ? game.actors.get(actor.id) : undefined;
  }

  static _reloadItemFromId(actor, item) {
    return actor && item?.id ? actor.items.get(item.id) : undefined;
  }

  static _reduceParameters(parameters) {
    return parameters.filter(it => it.used)
      .map(it => {
        return {
          code: it.code,
          value: it.value,
        }
      });
  }

  static _reloadParameters(rollData, parameters) {
    if (!parameters) {
      return parameters;
    }
    const built = game.system.anarchy.rollParameters.build(rollData);
    return parameters.map(p => {
      const initial = built.find(it => it.code == p.code) ?? {};
      return mergeObject(p, initial, { overwrite: false });
    });
  }

}