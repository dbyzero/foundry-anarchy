import { ANARCHY } from "./config.js";
import { ANARCHY_DICE_BONUS, SPECIALIZATION_BONUS, TARGET_SUCCESS, TARGET_SUCCESS_EDGE } from "./constants.js";

export class Modifiers {

  static actorModifiers(actor, skill = undefined, specialization = undefined, weapon = undefined, glitch = 0) {
    return {
      wounds: Modifiers._prepareWounds(actor),
      other: Modifiers._prepareOther(actor),
      reroll: Modifiers._prepareReroll(actor),
      rerollForced: Modifiers._prepareRerollForced(actor),
      anarchyDisposition: Modifiers._prepareAnarchyDisposition(actor),
      anarchyRisk: Modifiers._prepareAnarchyRisk(actor),
      glitch: Modifiers._prepareGlitch(actor, glitch),
      edge: Modifiers._prepareEdge(actor),
      opponentRerollForced: Modifiers._prepareOpponentReroll(actor),
      opponentReduce: Modifiers._prepareOpponentReduce(actor),
    }
  };

  static weaponModifiers(weapon) {
    return {
      range: Modifiers._prepareRange(weapon),
    }
  };

  static skillModifiers(actor, specialization = undefined) {
    return {
      specialization: Modifiers._prepareSpecialization(actor, specialization)
    }
  };

  static computeRollParameters(rollData) {
    return {
      pool: Modifiers.countPool(rollData),
      anarchy: Modifiers.countAnarchy(rollData),
      edge: Modifiers.valueIfUsed(rollData.modifiers.edge),
      target: Modifiers.isUsed(rollData.modifiers.edge) ? TARGET_SUCCESS_EDGE : TARGET_SUCCESS,
      risk: Modifiers.valueIfUsed(rollData.modifiers.anarchyRisk),
      glitch: Modifiers.valueIfUsed(rollData.modifiers.glitch),
      reroll: Modifiers.valueIfUsed(rollData.modifiers.reroll),
      rerollForced: Modifiers.valueIfUsed(rollData.modifiers.rerollForced),
      opponentRerollForced: Modifiers.valueIfUsed(rollData.modifiers.opponentRerollForced),
      opponentReduce: Modifiers.valueIfUsed(rollData.modifiers.opponentReduce),
    }
  }

  static countPool(rollData) {
    return rollData.actor.getAttributeValue(rollData.attribute, rollData.item)
      + (rollData.skill?.data.data.value ?? 0)
      + rollData.actor.getAttributeValue(rollData.attribute2, rollData.item)
      + Modifiers.valueIfUsed(rollData.modifiers.specialization)
      + Modifiers.valueIfUsed(rollData.modifiers.wounds)
      + Modifiers.valueIfUsed(rollData.modifiers.range)
      + Modifiers.valueIfUsed(rollData.modifiers.other)
      + Modifiers.valueIfUsed(rollData.modifiers.anarchyDisposition);
  }

  static countAnarchy(rollData) {
    return Modifiers.isUsed(rollData.modifiers.anarchyDisposition) ? 1 : 0
      + Modifiers.isUsed(rollData.modifiers.anarchyRisk) ? 1 : 0;
  }

  static isUsed(modifier) {
    return modifier?.used;
  }

  static valueIfUsed(modifier) {
    return Modifiers.isUsed(modifier) ? modifier.value : 0;
  }

  static _prepareAnarchyDisposition(actor) {
    const anarchy = actor.getAnarchyValue();
    return anarchy <= 0 ? undefined : {
      type: 'anarchyDisposition',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.anarchyDisposition) + ' (' + anarchy + ')',
      value: ANARCHY_DICE_BONUS,
      category: 'pool',
      isAnarchy: true,
      optional: true,
      used: false
    }
  }

  static _prepareAnarchyRisk(actor) {
    const anarchy = actor.getAnarchyValue();
    return anarchy <= 0 ? undefined : {
      type: 'anarchyRisk',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.anarchyRisk) + ' (' + anarchy + ')',
      category: 'other',
      isAnarchy: true,
      value: 1,
      optional: true,
      used: false
    }
  }

  static _prepareGlitch(actor, glitch) {
    const wounds = actor.getWounds();
    return {
      type: 'glitch',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.glitch),
      category: 'other',
      isAnarchy: false,
      value: (wounds != 0 ? 1 : 0) + glitch ?? 0, // TODO: separate wound glitch from others?
      optional: glitch == 0,
      editable: true,
      used: wounds != 0 || glitch > 0
    }
  }

  static _prepareEdge(actor) {
    if ((actor.data.data.counters?.edge?.value ?? 0) <= 0) {
      return undefined;
    }
    return {
      type: 'edge',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.edge) + ' (' + actor.data.data.counters.edge.value + '/' + actor.data.data.attributes.edge.value + ')',
      category: 'other',
      value: 1,
      optional: true,
      used: false
    }
  }

  static _prepareSpecialization(actor, specialization) {
    return specialization ? {
      type: 'specialization',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.specialization) + ' ' + specialization,
      category: 'pool',
      optional: true,
      used: true,
      value: SPECIALIZATION_BONUS
    }
      : undefined;
  }

  static _prepareWounds(actor) {
    const wounds = actor.getWounds();
    return wounds <= 0 ? undefined : {
      type: 'wounds',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.wounds),
      category: 'pool',
      value: - wounds,
      optional: true,
      used: true
    }
  }
  static _prepareRange(weapon) {
    if (!weapon) {
      return undefined;
    }
    const ranges = weapon.getRanges();
    return {
      type: 'range',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.range),
      options: ranges,
      category: 'pool',
      value: ranges[0].value,
      selectedLabel: game.i18n.localize(ranges[0].label),
      editable: true,
      used: true
    }
  }

  static _prepareOther(actor) {
    return {
      type: 'other',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.other),
      category: 'pool',
      value: 0,
      editable: true,
      used: true
    }
  }

  static _prepareReroll(actor) {
    return {
      type: 'reroll',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.reroll),
      category: 'reroll',
      value: 0,
      editable: true,
      used: true
    }
  }
  static _prepareRerollForced(actor) {
    return {
      type: 'rerollForced',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.rerollForced),
      category: 'reroll',
      value: 0,
      editable: true,
      used: true
    }
  }
  static _prepareOpponentReroll(actor) {
    return {
      type: 'opponentRerollForced',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.opponentRerollForced),
      category: 'opponent',
      value: 0,
      editable: true,
      used: true
    }

  }
  static _prepareOpponentReduce(actor) {
    return {
      type: 'opponentReduce',
      label: game.i18n.localize(ANARCHY.common.roll.modifiers.opponentReduce),
      category: 'opponent',
      value: 0,
      editable: true,
      used: true
    }

  }

}