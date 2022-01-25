import { MESSAGE_DATA, PARENT_MESSAGE_ID, ChatManager } from "../chat/chat-manager.js";
import { ANARCHY } from "../config.js";
import { ANARCHY_SYSTEM, SYSTEM_SCOPE, TEMPLATES_PATH } from "../constants.js";
import { RollManager } from "../roll/roll-manager.js";


const TEMPLATE_INFORM_DEFENDER = `${TEMPLATES_PATH}/combat/inform-defender.hbs`;
const TEMPLATE_NOTIFY_DEFENSE = `${TEMPLATES_PATH}/combat/notify-defense.hbs`;

export class CombatManager {

  async manageCombat(rollData) {

    switch (rollData.mode) {
      case ANARCHY_SYSTEM.rollType.weapon:
        if (!rollData.targeting || rollData.roll.total == 0) {
          return;
        }
        rollData.targeting.targetedTokenIds?.forEach(async defenderTokenId =>
          await this.onAttack(defenderTokenId, rollData)
        );
        break;
      case ANARCHY_SYSTEM.rollType.defense:
        // notify attacker about the defense
        await this.onDefense(rollData);
        break;

    }
  }

  async onAttack(defenderTokenId, attackRoll) {
    const attackerTokenId = attackRoll.targeting?.attackerTokenId;
    if (!(defenderTokenId && attackerTokenId)) {
      return;
    }
    await this.displayDefenseChoice(defenderTokenId, attackRoll);
  }

  async displayDefenseChoice(defenderTokenId, attackRoll, defenseRoll = undefined) {
    const attackerTokenId = attackRoll.targeting?.attackerTokenId;
    const defender = this.getTokenActor(defenderTokenId)

    const attackData = {
      attackerTokenId: attackerTokenId,
      defenderTokenId: defenderTokenId,
      attackRoll: RollManager.deflateAnarchyRoll(attackRoll),
      defenseRoll: RollManager.deflateAnarchyRoll(defenseRoll),
      attack: {
        defense: attackRoll.weapon.getDefense(),
        success: Math.max(0, attackRoll.roll.total - (defenseRoll?.roll.total ?? 0)),
        damage: attackRoll.weapon.getDamage(),
      },
    }

    const html = await renderTemplate(TEMPLATE_INFORM_DEFENDER, mergeObject(
      {
        ANARCHY: ANARCHY,
        options: { classes: [game.system.anarchy.styles.selectCssClass()] },
        attacker: this.getTokenActor(attackData.attackerTokenId),
        defender: defender,
        weapon: attackData.attackRoll.weapon
      },
      attackData));
    const notifyMessage = await ChatMessage.create({
      user: game.user.id,
      whisper: defender.getAllowedUserIds(),
      content: html
    });
    attackData.choiceChatMessageId = notifyMessage.id;
    await ChatManager.setMessageData(notifyMessage, attackData);
    // parent message is the defense, or else the attack: the last roll made.
    // When defense is made, the attack can't be touched anymore
    await ChatManager.setParentMessageId(notifyMessage,
      attackData.defenseRoll?.chatMessageId ?? attackData.attackRoll.chatMessageId);
  }

  async onDefense(rollData) {
    this._preventObsoleteChoices(rollData);

    const attackRoll = RollManager.inflateAnarchyRoll(rollData.attackRoll);
    await this.displayDefenseChoice(rollData.tokenId, attackRoll, rollData);
  }

  _preventObsoleteChoices(rollData) {
    const defenseChoiceChatMessage = game.messages.get(rollData.choiceChatMessageId);
    if (defenseChoiceChatMessage) {
      // prevent edge on attack, remove the previous defense message
      const attackChatMessage = ChatManager.getParentMessage(defenseChoiceChatMessage);
      ChatManager.setMessageCanUseEdge(attackChatMessage, false);
      ChatManager.removeChatMessage(rollData.choiceChatMessageId);
    }
  }

  async onClickDefendAttack(attackData) {
    const defender = this.getTokenActor(attackData.defenderTokenId);
    await defender.rollDefense(attackData);
  }

  async onClickApplyAttackDamage(attackData) {
    const attacker = this.getTokenActor(attackData.attackerTokenId);
    const defender = this.getTokenActor(attackData.defenderTokenId);
    await defender.applyDamage(
      attackData.attack.damage.monitor,
      attackData.attack.damage.value,
      attackData.attack.success,
      !attackData.attack.damage.noArmor,
      attacker);
    this._preventObsoleteChoices(attackData);
  }

  getTokenActor(tokenId) {
    return game.scenes.current.tokens.get(tokenId)?.actor;
  }
}
