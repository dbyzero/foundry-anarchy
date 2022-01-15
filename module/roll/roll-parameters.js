import { ANARCHY } from "../config.js";
import { LOG_HEAD, TEMPLATE } from "../constants.js";
import { ANARCHY_HOOKS, HooksManager } from "../hooks-manager.js";
import { Misc } from "../misc.js";

export const ROLL_PARAMETER_CATEGORY = {
  title: 'title',
  pool: 'pool',
  reroll: 'reroll',
  rerollSuccess: 'rerollSuccess',
  glitch: 'glitch',
  drain: 'drain',
  edge: 'edge',
  risk: 'risk',
  opponent: 'opponent'
}

const DEFAULT_PARAMETERS = [
  // attribute1
  {
    code: 'attribute1',
    options: {
      flags: {},
      order: 1, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO',
    },
    condition: context => context.attribute1 || context.skill,
    factory: context => {
      const attribute = context.attribute1 ?? context.skill?.data.data.attribute;
      return {
        labelkey: TEMPLATE.attributes[attribute],
        value: context.actor.getAttributeValue(attribute, context.activeItem),
      }
    }
  },

  // attribute2
  {
    code: 'attribute2',
    options: {
      flags: {},
      order: 1, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO',
    },
    condition: context => context.attribute2 || context.attributeAction,
    factory: context => {
      return {
        labelkey: TEMPLATE.attributes[context.attribute2],
        value: context.actor.getAttributeValue(context.attribute2, context.activeItem),
      };
    }
  },

  // skill
  {
    code: 'skill',
    options: {
      order: 3, category: ROLL_PARAMETER_CATEGORY.pool,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.skill,
    factory: context => {
      return {
        label: context.skill.name,
        value: context.skill.data.data.value,
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
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context.skill?.data.data.specialization,
    factory: context => {
      return {
        label: context.skill.data.data.specialization,
        used: context.specialization,
      }
    }
  },
  // wounds
  {
    code: 'wounds',
    options: {
      flags: { optional: true, },
      order: 10, category: ROLL_PARAMETER_CATEGORY.pool,
      labelkey: ANARCHY.common.roll.modifiers.wounds,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.actor.getWounds(),
    factory: context => {
      return { value: -  context.actor.getWounds() }
    }
  },
  // weapon range
  {
    code: 'range',
    options: {
      flags: { editable: true, },
      order: 20, category: ROLL_PARAMETER_CATEGORY.pool,
      labelkey: ANARCHY.common.roll.modifiers.range,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.weapon,
    factory: context => {
      const ranges = context.weapon.getRanges();
      return {
        value: ranges[0].value,
        options: ranges,
        selectedOption: game.i18n.localize(ranges[0].labelkey)
      }
    }
  },
  // other modifiers
  {
    code: 'other',
    options: {
      flags: { editable: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.pool,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.other,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    }
  },
  // rerolls
  {
    code: 'reroll',
    options: {
      flags: { editable: true, },
      order: 40, category: ROLL_PARAMETER_CATEGORY.reroll,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.reroll,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    }
  },
  // forced success rerolls
  {
    code: 'rerollForced',
    options: {
      flags: { editable: true, },
      order: 40, category: ROLL_PARAMETER_CATEGORY.rerollForced,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.rerollForced,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    }
  },
  // anarchy dispositions
  {
    code: 'anarchyDisposition',
    options: {
      flags: { optional: true, isAnarchy: true, forceDisplay: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.pool,
      value: 3,
      labelkey: ANARCHY.common.roll.modifiers.anarchyDisposition,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.actor.getAnarchyValue() > 0
  },
  // anarchy take risks
  {
    code: 'anarchyRisk',
    options: {
      flags: { optional: true, isAnarchy: true, forceDisplay: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.risk,
      value: 1,
      labelkey: ANARCHY.common.roll.modifiers.anarchyRisk,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.actor.getAnarchyValue() > 0
  },
  // edge
  {
    code: 'edge',
    options: {
      flags: { optional: true, forceDisplay: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.edge,
      value: 1,
      labelkey: ANARCHY.common.roll.modifiers.edge,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.actor.getRemainingEdge()
  },
  // glitch
  {
    code: 'glitch',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.glitch,
      labelkey: ANARCHY.common.roll.modifiers.glitch,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    factory: context => {
      const wounds = context.actor.getWounds();
      return {
        value: (wounds == 0 ? 0 : 1) + (context.glitch ?? 0),
      }
    }
  },
  {
    code: 'drain',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.drain,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.drain,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
    condition: context => context.skill?.data.data.hasDrain
  },
  // reduce opponent pool
  {
    code: 'opponentReduce',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 100, category: ROLL_PARAMETER_CATEGORY.opponent,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.opponentReduce,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },
  },
  // force opponent rerolls
  {
    code: 'opponentRerollForced',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 100, category: ROLL_PARAMETER_CATEGORY.opponent,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.opponentRerollForced,
      hbsTemplateRoll: 'TODO',
      hbsTemplateChat: 'TODO'
    },

  },

]

export class RollParameters {
  constructor() {
    this.parameters = [];
    HooksManager.register(ANARCHY_HOOKS.REGISTER_ROLL_PARAMETERS);
    HooksManager.register(ANARCHY_HOOKS.MODIFY_ROLL_PARAMETER);
    Hooks.on(ANARCHY_HOOKS.MODIFY_ROLL_PARAMETER, p => this._validate(p));
    Hooks.once(ANARCHY_HOOKS.REGISTER_ROLL_PARAMETERS, register => DEFAULT_PARAMETERS.forEach(
      parameter => register(parameter)
    ));
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    Hooks.callAll(ANARCHY_HOOKS.REGISTER_ROLL_PARAMETERS, rollParameter => {
      Hooks.callAll(ANARCHY_HOOKS.MODIFY_ROLL_PARAMETER, rollParameter);
      if (!rollParameter.ignore) {
        this._register(rollParameter);
      }
    });
  }

  _validate(parameter) {
    if (!parameter.code) {
      console.error(`${LOG_HEAD} RollParameter does not have a code`, parameter);
      parameter.ignore = true;
    }
  }

  _register(parameter) {
    // TODO: check there is a code
    if (this.parameters.find(it => it.code == parameter.code)) {
      console.error(`${LOG_HEAD} RollParameter ${parameter.code} is already registered`, parameter, it);
      return;
    }
    // TODO: add fallback handlebars templates for dialog/chat
    this.parameters.push(parameter);
  }

  build(context = {
    mode: undefined,
    attributeAction: undefined,
    attribute1: undefined,
    attribute2: undefined,
    actor: undefined,
    skill: undefined,
    specialization: undefined,
    weapon: undefined,
    shadowamp: undefined,
    activeItem: undefined,
  }) {
    const applicable = this.parameters.filter(p => !p.condition || p.condition(context));
    const parameters = applicable.map(p => this._computeParameter(p, context));

    return {
      parameters: parameters,
      context: context
    }
  }

  compute(parameters) {
    return Object.values(Misc.classify(parameters, it => it.category)).map(list => {
      return {
        category: list[0].category,
        value: Misc.sumValues(list, it => it.value)
      };
    });
  }

  _computeParameter(param, context) {
    const computed = { code: param.code };
    if (param.factory) {
      mergeObject(computed, param.factory(context, param.options));
    }
    mergeObject(computed, param.options);
    if (!computed.label && computed.labelkey) {
      computed.label = game.i18n.localize(computed.labelkey);
    }
    return computed;
  }
}
