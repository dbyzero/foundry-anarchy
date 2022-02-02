import { ANARCHY } from "../config.js";
import { ANARCHY_SYSTEM, LOG_HEAD, TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { ANARCHY_HOOKS, HooksManager } from "../hooks-manager.js";
import { Misc } from "../misc.js";
import { Modifiers } from "../modifiers/modifiers.js";

export const ROLL_PARAMETER_CATEGORY = {
  title: 'title',
  pool: 'pool',
  reroll: 'reroll',
  rerollForced: 'rerollForced',
  glitch: 'glitch',
  drain: 'drain',
  convergence: 'convergence',
  edge: 'edge',
  risk: 'risk',
  opponentPool: 'opponentPool',
  opponentReroll: 'opponentReroll'
}

const DEFAULT_ROLL_PARAMETERS = [
  // attribute1
  {
    code: 'attribute1',
    options: {
      flags: {},
      order: 1, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/select-attribute.hbs`,
    },
    condition: context => Object.values(ANARCHY_SYSTEM.rollType).includes(context.mode),
    factory: context => {
      const attribute = context.attribute1 ?? context.skill?.data.data.attribute ?? '';
      return {
        labelkey: ANARCHY.attributes[attribute],
        value: context.actor.getAttributeValue(attribute, context.activeItem),
        flags: { editable: context.skill },
        selected: attribute,
        choices: Enums.getAttributes(it => context.attributes.includes(it))
      }
    }
  },

  // attribute2
  {
    code: 'attribute2',
    options: {
      order: 1, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/select-attribute.hbs`,
    },
    condition: context => [ANARCHY_SYSTEM.rollType.attribute, ANARCHY_SYSTEM.rollType.attributeAction, ANARCHY_SYSTEM.rollType.defense].includes(context.mode),
    factory: context => {
      return {
        flags: { editable: ANARCHY_SYSTEM.rollType.attribute == context.mode },
        labelkey: ANARCHY.attributes[context.attribute2],
        value: context.actor.getAttributeValue(context.attribute2, context.activeItem),
        selected: context.attribute2,
        choices: Enums.getAttributes(it => context.attributes.includes(it))
      };
    }
  },

  // skill
  {
    code: 'skill',
    options: {
      flags: {},
      order: 3, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    condition: context => ['skill', 'weapon'].includes(context.mode),
    factory: context => {
      return {
        label: context.skill?.name,
        value: context.skill?.data.data.value ?? 0,
      };
    }
  },
  // specialization
  {
    code: 'specialization',
    options: {
      flags: { optional: true, },
      order: 4, category: ROLL_PARAMETER_CATEGORY.pool,
      value: 2,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
    },
    condition: context => (context.mode == 'skill' && context.specialization)
      || (context.mode == 'weapon' && context.skill?.data.data.specialization),
    factory: context => {
      return {
        label: context.specialization ?? context.skill.data.data.specialization,
        used: context.specialization,
      }
    }
  },
  // modifiers bonus
  {
    code: 'poolModifiers',
    options: {
      flags: { editable: true, },
      labelkey: ANARCHY.common.roll.modifiers.poolModifiers,
      order: 5, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    factory: context => RollParameters.computeRollModifiers('pool', context)
  },
  // wounds
  {
    code: 'wounds',
    options: {
      flags: { optional: true, },
      order: 10, category: ROLL_PARAMETER_CATEGORY.pool,
      labelkey: ANARCHY.common.roll.modifiers.wounds,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    condition: context => context.actor.getWounds(),
    onChecked: (p, checked) => {
      p.value = checked ? - p.wounds : 0
      p.used = checked
    },
    factory: context => {
      const wounds = context.actor.getWounds();
      return {
        wounds: wounds,
        value: - wounds,
        used: true,
      }
    }
  },
  // other modifiers
  {
    code: 'other',
    options: {
      flags: { editable: true },
      order: 25, category: ROLL_PARAMETER_CATEGORY.pool,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.other,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    }
  },
  // Drain
  {
    code: 'drain',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 40, category: ROLL_PARAMETER_CATEGORY.drain,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.drain,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    condition: context => (context.mode == 'skill' || context.mode == 'weapon') && context.skill?.data.data.hasDrain
  },
  // convergence
  {
    code: 'convergence',
    options: {
      flags: { optional: true, used: true, hideParameter: true },
      order: 40, category: ROLL_PARAMETER_CATEGORY.convergence,
      value: 1,
      labelkey: ANARCHY.common.roll.modifiers.convergence,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    condition: context => (context.mode == 'skill' || context.mode == 'weapon') && context.skill?.data.data.hasConvergence
  },
  // glitch
  {
    code: 'glitch',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 50, category: ROLL_PARAMETER_CATEGORY.glitch,
      labelkey: ANARCHY.common.roll.modifiers.glitch,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: `${TEMPLATES_PATH}/chat/parts/glitch.hbs`,
    },
    factory: context => {
      const wounds = context.actor.getWounds();
      return {
        value: (wounds == 0 ? 0 : 1) + (context.glitch ?? 0),
      }
    }
  },
  // rerolls
  {
    code: 'reroll',
    options: {
      flags: { editable: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.reroll,
      labelkey: ANARCHY.common.roll.modifiers.reroll,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    factory: context => RollParameters.computeRollModifiers('reroll', context)
  },
  // reduction from opponent
  {
    code: 'reduced',
    options: {
      flags: {},
      order: 29, category: ROLL_PARAMETER_CATEGORY.pool,
      labelkey: ANARCHY.common.roll.modifiers.reduced,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    condition: context => (context.attackRoll?.param.opponentPool ?? 0) != 0,
    factory: context => {
      const reduced = context.attackRoll?.param.opponentPool ?? 0;
      return {
        flags: { used: true },
        value: - reduced,
      }
    }
  },
  // forced success rerolls
  {
    code: 'rerollForced',
    options: {
      order: 31, category: ROLL_PARAMETER_CATEGORY.rerollForced,
      labelkey: ANARCHY.common.roll.modifiers.rerollForced,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    factory: context => {
      const rerollForced = context.attackRoll?.param.opponentReroll ?? 0;
      return {
        flags: { used: true, editable: rerollForced == 0 },
        value: rerollForced,
      }
    }
  },
  // anarchy dispositions
  {
    code: 'anarchyDisposition',
    options: {
      flags: { optional: true, isAnarchy: true, forceDisplay: true, },
      order: 70, category: ROLL_PARAMETER_CATEGORY.pool,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.anarchyDisposition,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
    },
    condition: context => context.actor.getAnarchyValue() > 0,
    onChecked: (p, checked) => {
      p.used = checked;
      p.value = checked ? 3 : 0;
    },
  },
  // anarchy take risks
  {
    code: 'anarchyRisk',
    options: {
      flags: { optional: true, isAnarchy: true, forceDisplay: true, },
      order: 70, category: ROLL_PARAMETER_CATEGORY.risk,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.anarchyRisk,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
      hbsTemplateChat: `${TEMPLATES_PATH}/chat/parts/anarchy-risk.hbs`,
    },
    condition: context => context.actor.getAnarchyValue() > 0,
    onChecked: (p, checked) => {
      p.used = checked;
      p.value = checked ? 1 : 0;
    },
  },
  // edge
  {
    code: 'edge',
    options: {
      flags: { optional: true, forceDisplay: true, },
      value: 0,
      order: 70, category: ROLL_PARAMETER_CATEGORY.edge,
      labelkey: ANARCHY.common.roll.modifiers.edge,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
    },
    condition: context => context.options.canUseEdge && context.actor.getRemainingEdge(),
    onChecked: (p, checked) => {
      p.used = checked;
      p.value = checked ? 1 : 0;
    },
  },
  // reduce opponent pool
  {
    code: 'opponentPool',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 100, category: ROLL_PARAMETER_CATEGORY.opponentPool,
      labelkey: ANARCHY.common.roll.modifiers.opponentPool,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    factory: context => RollParameters.computeRollModifiers('opponentPool', context),
    condition: context => !context.attributeAction
  },
  // force opponent rerolls
  {
    code: 'opponentReroll',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 100, category: ROLL_PARAMETER_CATEGORY.opponentReroll,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.opponentReroll,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
    },
    factory: context => RollParameters.computeRollModifiers('opponentReroll', context),
    condition: context => !context.attributeAction
  },

]

export class RollParameters {
  constructor() {
    this.parameters = [];
    HooksManager.register(ANARCHY_HOOKS.REGISTER_ROLL_PARAMETERS);
    HooksManager.register(ANARCHY_HOOKS.MODIFY_ROLL_PARAMETER);
    Hooks.on(ANARCHY_HOOKS.MODIFY_ROLL_PARAMETER, p => this._validate(p));
    Hooks.once(ANARCHY_HOOKS.REGISTER_ROLL_PARAMETERS, register => DEFAULT_ROLL_PARAMETERS.forEach(
      parameter => register(parameter)
    ));
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    Hooks.callAll(ANARCHY_HOOKS.REGISTER_ROLL_PARAMETERS, async rollParameter => {
      Hooks.callAll(ANARCHY_HOOKS.MODIFY_ROLL_PARAMETER, rollParameter);
      if (!rollParameter.ignore) {
        await this._register(rollParameter);
      }
    });
    const templates = Misc.distinct([]
      .concat(this.parameters.map(p => p.options.hbsTemplateRoll))
      .concat(this.parameters.map(p => p.options.hbsTemplateChat))
      .filter(it => it != undefined));
    await loadTemplates(Misc.distinct(templates));
    await loadTemplates([`${TEMPLATES_PATH}/roll/parts/parameter-label.hbs`]);
  }

  _validate(parameter) {
    if (!parameter.code) {
      console.error(`${LOG_HEAD} RollParameter does not have a code`, parameter);
      parameter.ignore = true;
    }
  }

  async _register(parameter) {
    if (this.parameters.find(it => it.code == parameter.code)) {
      console.error(`${LOG_HEAD} RollParameter ${parameter.code} is already registered`, parameter, it);
      return;
    }

    if (!parameter.onChecked) {
      parameter.onChecked = (p, checked) => p.used = checked;
    }

    parameter.onValue = (p, value) => p.value = value;
    this.parameters.push(parameter);
  }

  async _optionalLoadTemplate(hbsTemplate) {
    if (hbsTemplate) {
      await loadTemplates([hbsTemplate]);
    }
  }

  build(context) {
    return this.parameters.filter(p => !p.condition || p.condition(context))
      .map(p => this._computeParameter(p, context));
  }

  compute(parameters) {
    const actual = parameters.filter(it => it.used);
    const byCategory = Misc.classify(actual, it => it.category);
    const sums = {}
    Object.values(byCategory).forEach(list => sums[list[0].category] = Misc.sumValues(list, it => it.value ?? (it.optional ? 1 : 0)));
    return sums;
  }

  _computeParameter(param, context) {
    const computed = {
      code: param.code,
      onChecked: param.onChecked,
      onValue: param.onValue,
    };
    mergeObject(computed, param.options);
    if (param.factory) {
      mergeObject(computed, param.factory(context, param.options));
    }
    computed.used = computed.used || computed.value;
    return computed;
  }

  static computeRollModifiers(effect, context) {
    return Modifiers.computeRollModifiers(context.actor.items, context, effect);
  }

}
