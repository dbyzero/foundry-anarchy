import { ANARCHY } from "../config.js";
import { LOG_HEAD, TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { ANARCHY_HOOKS, HooksManager } from "../hooks-manager.js";
import { Misc } from "../misc.js";

export const ROLL_PARAMETER_CATEGORY = {
  title: 'title',
  pool: 'pool',
  reroll: 'reroll',
  rerollForced: 'rerollForced',
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
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/select-attribute.hbs`,
      hbsTemplateChat: undefined, //``,
    },
    condition: context => ['skill', 'attribute', 'weapon'].includes(context.mode),
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
      hbsTemplateChat: undefined, //``,
    },
    condition: context => context.mode == 'attribute',
    factory: context => {
      return {
        flags: { editable: !context.attributeAction },
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
      hbsTemplateChat: undefined, //``
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
      hbsTemplateChat: undefined, //``
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
  // wounds
  {
    code: 'wounds',
    options: {
      flags: { optional: true, },
      order: 10, category: ROLL_PARAMETER_CATEGORY.pool,
      labelkey: ANARCHY.common.roll.modifiers.wounds,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
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
  // weapon range
  {
    code: 'range',
    options: {
      flags: { editable: true, },
      order: 20, category: ROLL_PARAMETER_CATEGORY.pool,
      labelkey: ANARCHY.common.roll.modifiers.range,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/select-option.hbs`,
      hbsTemplateChat: undefined, //``
    },
    condition: context => context.weapon,
    factory: context => {
      const ranges = context.weapon.getRanges();
      return {
        value: ranges[0].value,
        choices: ranges,
        selected: game.i18n.localize(ranges[0].labelkey)
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
      hbsTemplateChat: undefined, //``
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
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
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
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
    }
  },
  // anarchy dispositions
  {
    code: 'anarchyDisposition',
    options: {
      flags: { optional: true, isAnarchy: true, forceDisplay: true, },
      order: 50, category: ROLL_PARAMETER_CATEGORY.pool,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.anarchyDisposition,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
      hbsTemplateChat: undefined, //``
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
      order: 50, category: ROLL_PARAMETER_CATEGORY.risk,
      labelkey: ANARCHY.common.roll.modifiers.anarchyRisk,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
      hbsTemplateChat: undefined, //``
    },
    condition: context => context.actor.getAnarchyValue() > 0
  },
  // edge
  {
    code: 'edge',
    options: {
      flags: { optional: true, forceDisplay: true, },
      order: 50, category: ROLL_PARAMETER_CATEGORY.edge,
      labelkey: ANARCHY.common.roll.modifiers.edge,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/check-option.hbs`,
      hbsTemplateChat: undefined, //``
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
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
    },
    factory: context => {
      const wounds = context.actor.getWounds();
      return {
        value: (wounds == 0 ? 0 : 1) + (context.glitch ?? 0),
      }
    }
  },
  // Drain
  {
    code: 'drain',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 30, category: ROLL_PARAMETER_CATEGORY.drain,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.drain,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
    },
    condition: context => (context.mode == 'skill' || context.mode == 'weapon') && context.skill?.data.data.hasDrain
  },
  // reduce opponent pool
  {
    code: 'opponentReduce',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 100, category: ROLL_PARAMETER_CATEGORY.opponent,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.opponentReduce,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
    },
    condition: context => !context.attributeAction
  },
  // force opponent rerolls
  {
    code: 'opponentRerollForced',
    options: {
      flags: { editable: true, forceDisplay: true, },
      order: 100, category: ROLL_PARAMETER_CATEGORY.opponent,
      value: 0,
      labelkey: ANARCHY.common.roll.modifiers.opponentRerollForced,
      hbsTemplateRoll: `${TEMPLATES_PATH}/roll/parts/input-numeric.hbs`,
      hbsTemplateChat: undefined, //``
    },
    condition: context => !context.attributeAction
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
    // TODO: 
    return Object.values(Misc.classify(actual, it => it.category)).map(list => {
      return {
        category: list[0].category,
        value: Misc.sumValues(list, it => it.value ?? (it.optional ? 1 : 0))
      };
    });
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

}
