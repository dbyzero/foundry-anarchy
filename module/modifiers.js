import { SRA } from "./config.js";
import { ANARCHY_DICE_BONUS, SPECIALIZATION_BONUS, TARGET_SUCCESS, TARGET_SUCCESS_EDGE } from "./constants.js";
import { Enums } from "./enums.js";

export class Modifiers {

  static prepareSkillRollData(actor, skill, specialization) {
    const rollData = {
      actor: actor,
      skill: skill,
      attribute: skill?.data.data.attribute,
      specialization: specialization,
      modifiers: Modifiers.build(actor, skill, specialization),
      ENUMS: Enums.getEnums(),
      SRA: SRA,
      title: game.i18n.format(SRA.common.roll.title, {
        name: skill?.name,
        specialization: specialization ? '- ' + specialization : ''
      })
    };
    return rollData;
  }

  static prepareAttributeRollData(actor, attribute, attribute2 = undefined) {
    const rollData = {
      actor: actor,
      attribute: attribute,
      attribute2: attribute2,
      modifiers: Modifiers.build(actor, skill, specialization),
      ENUMS: Enums.getEnums(),
      SRA: SRA
    };
    return rollData;
  }


  static build(actor, skill = undefined, specialization = undefined) {
    return {
      specialization: Modifiers._prepareSpecialization(actor, specialization),
      wounds: Modifiers._prepareWounds(actor, skill),
      other: Modifiers._prepareOther(actor),
      reroll: Modifiers._prepareReroll(actor),
      rerollForced: Modifiers._prepareRerollForced(actor),
      anarchy_disposition: Modifiers._prepareAnarchyDisposition(actor),
      anarchy_risk: Modifiers._prepareAnarchyRisk(actor),
      edge: Modifiers._prepareEdge(actor),
      opponent_reroll: Modifiers._prepareOpponentReroll(actor),
      opponent_reduce: Modifiers._prepareOpponentReduce(actor),
    }
  };

  static computeRollParameters(rollData) {
    return {
      pool: Modifiers.countPool(rollData),
      anarchy: Modifiers.countAnarchy(rollData),
      edge: Modifiers.valueIfUsed(rollData.modifiers.edge),
      target: Modifiers.isUsed(rollData.modifiers.edge) ? TARGET_SUCCESS_EDGE : TARGET_SUCCESS,
      risk: Modifiers.valueIfUsed(rollData.modifiers.anarchy_risk),
      reroll: Modifiers.valueIfUsed(rollData.modifiers.reroll),
      rerollForced: Modifiers.valueIfUsed(rollData.modifiers.rerollForced),
      opponent_reroll: Modifiers.valueIfUsed(rollData.modifiers.opponent_reroll),
      opponent_reduce: Modifiers.valueIfUsed(rollData.modifiers.opponent_reduce),
    }
  }

  static countPool(rollData) {
    return (rollData.actor.data.data.attributes[rollData.attribute].value ?? 0)
      + (rollData.skill?.data.data.value ?? 0)
      + Modifiers.valueIfUsed(rollData.modifiers.specialization)
      + Modifiers.valueIfUsed(rollData.modifiers.wounds)
      + Modifiers.valueIfUsed(rollData.modifiers.other)
      + Modifiers.valueIfUsed(rollData.modifiers.anarchy_disposition);
  }

  static countAnarchy(rollData) {
    return Modifiers.isUsed(rollData.modifiers.anarchy_disposition) ? 1 : 0
      + Modifiers.isUsed(rollData.modifiers.anarchy_risk) ? 1 : 0;
  }

  static isUsed(modifier) {
    return modifier?.used;
  }

  static valueIfUsed(modifier) {
    return Modifiers.isUsed(modifier) ? modifier.value : 0;
  }

  static _prepareAnarchyDisposition(actor) {
    return actor.data.data.counters.anarchy.value <= 0 ? undefined : {
      type: 'anarchy_disposition',
      label: game.i18n.localize(SRA.common.roll.modifiers.anarchy_disposition) + ' (' + actor.data.data.counters.anarchy.value + ')',
      value: ANARCHY_DICE_BONUS,
      category: 'pool',
      isAnarchy: true,
      optional: true,
      used: false
    }
  }
  
  static _prepareAnarchyRisk(actor) {
    return actor.data.data.counters.anarchy.value <= 0 ? undefined : {
      type: 'anarchy_risk',
      label: game.i18n.localize(SRA.common.roll.modifiers.anarchy_risk) + ' (' + actor.data.data.counters.anarchy.value + ')',
      category: 'other',
      isAnarchy: true,
      value: 1,
      optional: true,
      used: false
    }
  }
  
  static _prepareEdge(actor) {
    return actor.data.data.counters.edge.value >= actor.data.data.attributes.edge.value ? undefined : {
      type: 'edge',
      label: game.i18n.localize(SRA.common.roll.modifiers.edge) + ' (' + actor.data.data.counters.edge.value + '/' + actor.data.data.attributes.edge.value + ')',
      category: 'other',
      value: 1,
      optional: true,
      used: false
    }
  }

  static _prepareSpecialization(actor, specialization) {
    return specialization ? {
      type: 'specialization',
      label: game.i18n.localize(SRA.common.roll.modifiers.specialization) + ' ' + specialization,
      category: 'pool',
      optional: true,
      used: true,
      value: SPECIALIZATION_BONUS
    }
      : undefined;
  }

  static _prepareWounds(actor, skill) {
    const wounds = actor.getWounds(skill?.data.data.code);
    return wounds == 0 ? undefined : {
      type: 'wounds',
      label: game.i18n.localize(SRA.common.roll.modifiers.wounds),
      category: 'pool',
      value: wounds,
      optional: true,
      used: true
    }
  }

  static _prepareOther(actor) {
    return {
      type: 'other',
      label: game.i18n.localize(SRA.common.roll.modifiers.other),
      category: 'pool',
      value: 0,
      editable: true,
      used: true
    }
  }

  static _prepareReroll(actor) {
    return {
      type: 'reroll',
      label: game.i18n.localize(SRA.common.roll.modifiers.reroll),
      category: 'reroll',
      value: 0,
      editable: true,
      used: true
    }
  }
  static _prepareRerollForced(actor) {
    return {
      type: 'rerollForced',
      label: game.i18n.localize(SRA.common.roll.modifiers.rerollForced),
      category: 'reroll',
      value: 0,
      editable: true,
      used: true
    }
  }
  static _prepareOpponentReroll(actor) {
    return {
      type: 'opponent_reroll',
      label: game.i18n.localize(SRA.common.roll.modifiers.opponent_reroll),
      category: 'opponent',
      value: 0,
      editable: true,
      used: true
    }
    
  }
  static _prepareOpponentReduce(actor) {
    return {
      type: 'opponent_reduce',
      label: game.i18n.localize(SRA.common.roll.modifiers.opponent_reduce),
      category: 'opponent',
      value: 0,
      editable: true,
      used: true
    }

  }

}