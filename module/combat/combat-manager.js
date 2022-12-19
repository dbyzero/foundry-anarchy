import { ActorDamageManager } from "../actor/actor-damage.js";
import { ChatManager } from "../chat/chat-manager.js";
import { ANARCHY } from "../config.js";
import { ANARCHY_SYSTEM, TEMPLATES_PATH } from "../constants.js";
import { RollManager } from "../roll/roll-manager.js";


const TEMPLATE_INFORM_DEFENDER = `${TEMPLATES_PATH}/combat/inform-defender.hbs`;


export class CombatManager {

  async manageCombat(roll) {

    switch (roll.mode) {
      case ANARCHY_SYSTEM.rollType.weapon:
        if (!roll.targeting || roll.roll.total == 0) {
          return;
        }
        roll.targeting.targetedTokenIds?.forEach(async defenderTokenId =>
          await this.onAttack(defenderTokenId, roll)
        );
        break;
      case ANARCHY_SYSTEM.rollType.defense:
        // notify attacker about the defense
        await this.onDefense(roll);
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

    const attack = {
      attackerTokenId: attackerTokenId,
      defenderTokenId: defenderTokenId,
      attackRoll: RollManager.deflateAnarchyRoll(attackRoll),
      defenseRoll: RollManager.deflateAnarchyRoll(defenseRoll),
      attack: {
        isHit: attackRoll.roll.total > 0 && attackRoll.roll.total >= (defenseRoll?.roll.total ?? 0),
        defense: attackRoll.weapon.getDefense(),
        success: Math.max(0, attackRoll.roll.total - (defenseRoll?.roll.total ?? 0)),
        damage: attackRoll.weapon.getDamage(),
      },
    }

    const html = await renderTemplate(TEMPLATE_INFORM_DEFENDER, mergeObject(
      {
        ANARCHY: ANARCHY,
        options: { classes: [game.system.anarchy.styles.selectCssClass()] },
        attacker: this.getTokenActor(attack.attackerTokenId),
        defender: defender,
        weapon: attack.attackRoll.weapon
      },
      attack));
    const notifyMessage = await ChatMessage.create({
      user: game.user.id,
      whisper: defender.getAllowedUserIds(),
      content: html
    });
    attack.choiceChatMessageId = notifyMessage.id;
    await ChatManager.setMessageData(notifyMessage, attack);
    // parent message is the defense, or else the attack: the last roll made.
    // When defense is made, the attack can't be touched anymore
    await ChatManager.setParentMessageId(notifyMessage,
      attack.defenseRoll?.chatMessageId ?? attack.attackRoll.chatMessageId);
  }

  async onDefense(roll) {
    this._preventObsoleteChoices(roll);

    const attackRoll = RollManager.inflateAnarchyRoll(roll.attackRoll);
    await this.displayDefenseChoice(roll.tokenId, attackRoll, roll);
  }

  _preventObsoleteChoices(roll) {
    const defenseChoiceChatMessage = game.messages.get(roll.choiceChatMessageId);
    if (defenseChoiceChatMessage) {
      // prevent edge on attack, remove the previous defense message
      const attackChatMessage = ChatManager.getParentMessage(defenseChoiceChatMessage);
      ChatManager.setMessageCanUseEdge(attackChatMessage, false);
      ChatManager.removeChatMessage(roll.choiceChatMessageId);
    }
  }

  async onClickDefendAttack(attack) {
    const defender = this.getTokenActor(attack.defenderTokenId);
    await defender.rollDefense(attack);
  }

  async onClickApplyAttackDamage(attack) {
    const attacker = this.getTokenActor(attack.attackerTokenId);
    const defender = this.getTokenActor(attack.defenderTokenId);
    const attackRoll = RollManager.inflateAnarchyRoll(attack.attackRoll);
    await ActorDamageManager.sufferDamage(defender,
      attack.attack.damage.monitor,
      attack.attack.damage.value,
      attack.attack.success,
      attack.attack.damage.noArmor,
      attacker,
      attackRoll.weapon);
    this._preventObsoleteChoices(attack);
  }

  getTokenActor(tokenId) {
    return game.scenes.current.tokens.get(tokenId)?.actor;
  }
}
