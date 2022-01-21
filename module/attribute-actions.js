import { ANARCHY } from "./config.js";
import { ANARCHY_SYSTEM, TEMPLATE } from "./constants.js";
import { Icons } from "./icons.js";

function action(code, attr1, attr2, icon, actorTypes, condition = actor => true) {
  return {
    code: code,
    labelkey: ANARCHY.attributeAction[code],
    attribute1: attr1,
    attribute2: attr2,
    icon: icon,
    actorTypes: actorTypes,
    condition: condition
  }
}

function defense(code, actionCode) {
  return {
    code: code,
    labelkey: ANARCHY.defense[code],
    actionCode: actionCode
  }
}

const ATTR = TEMPLATE.attributes;
const ACTOR = TEMPLATE.actorTypes;
const ACTION = ANARCHY_SYSTEM.actions;
const DEFENSE = ANARCHY_SYSTEM.defenses;

const ATTRIBUTE_ACTIONS = [
  action(ACTION.defense, ATTR.agility, ATTR.logic, Icons.fontAwesome('fas fa-shield-alt'), [ACTOR.character]),
  action(ACTION.defense, ATTR.autopilot, undefined, Icons.fontAwesome('fas fa-tachometer-alt'), [ACTOR.vehicle]),
  // TODO: add a way to pilot a vehicle to fallback defense of controled vehicle
  action(ACTION.resistTorture, ATTR.strength, ATTR.willpower, Icons.fontAwesome('fas fa-angry'), [ACTOR.character]),
  action(ACTION.perception, ATTR.logic, ATTR.willpower, Icons.fontAwesome('fas fa-eye'), [ACTOR.character]),
  action(ACTION.perception, ATTR.logic, ATTR.willpower, Icons.fontAwesome('fas fa-eye'), [ACTOR.device]),
  action(ACTION.perception, ATTR.system, ATTR.system, Icons.fontAwesome('fas fa-eye'), [ACTOR.device, ACTOR.vehicle]),
  action(ACTION.composure, ATTR.charisma, ATTR.willpower, Icons.fontAwesome('fas fa-meh'), [ACTOR.character]),
  action(ACTION.judgeIntentions, ATTR.charisma, ATTR.charisma, Icons.fontAwesome('fas fa-theater-masks'), [ACTOR.character]),
  action(ACTION.memory, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-brain'), [ACTOR.character]),
  action(ACTION.catch, ATTR.agility, ATTR.agility, Icons.fontAwesome('fas fa-baseball-ball'), [ACTOR.character]),
  action(ACTION.lift, ATTR.strength, ATTR.strength, Icons.fontAwesome('fas fa-dumbbell'), [ACTOR.character]),

  action(ACTION.matrixDefense, ATTR.logic, undefined, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.character], actor => !actor.hasCyberdeck()),
  action(ACTION.matrixDefense, ATTR.firewall, ATTR.logic, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.character], actor => actor.hasCyberdeck()),
  action(ACTION.matrixDefense, ATTR.firewall, ATTR.logic, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.ic]),
  action(ACTION.matrixDefense, ATTR.firewall, ATTR.system, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.device, ACTOR.vehicle]),
  action(ACTION.matrixDefense, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.sprite]),

  action(ACTION.matrixPerception, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-video'), [ACTOR.character, ACTOR.sprite, ACTOR.ic]),
  action(ACTION.matrixPerception, ATTR.system, ATTR.system, Icons.fontAwesome('fas fa-video'), [ACTOR.device]),
]

const DEFENSES = [
  defense(DEFENSE.physicalDefense, ACTION.defense),
  defense(DEFENSE.mentalDefense, ACTION.resistTorture),
  defense(DEFENSE.socialDefense, ACTION.composure),
  defense(DEFENSE.matrixDefense, ACTION.matrixDefense),
  defense(DEFENSE.astralDefense, ACTION.perception),
]

export class AttributeActions {

  static all(filter = undefined) {
    return filter
      ? ATTRIBUTE_ACTIONS.filter(filter)
      : ATTRIBUTE_ACTIONS;
  }

  static getActorActions(actor) {
    return ATTRIBUTE_ACTIONS.filter(it => it.actorTypes.includes(actor.type) && it.condition(actor));
  }

  static getActorDefenses(actor) {
    return DEFENSES
      .map(defense => {
        const actorAction = AttributeActions.getActorAction(actor, defense.actionCode);
        return AttributeActions._convertToDefense(actorAction, defense);
      })
      .filter(it => it?.code);
  }

  static getActorAction(actor, actionCode) {
    return AttributeActions.getActorActions(actor).find(it => it.code == actionCode);
  }

  static getActorDefense(actor, code) {
    const defense = DEFENSES.find(it => it.code == code);
    const actorAction = AttributeActions.getActorAction(actor, defense.actionCode);
    return AttributeActions._convertToDefense(actorAction, defense);
  }

  static _convertToDefense(actorAction, defense) {
    return actorAction ? mergeObject(defense,
      actorAction ?? {},
      { overwrite: false, inplace: false }
    ) : undefined;
  }

  static getDefenses() {
    return DEFENSES;
  }

  static prepareShortcut(actor, actionCode) {
    const action = AttributeActions.getActorActions(actor).find(a => a.code == actionCode);
    if (action) {
      return {
        icon: action.icon,
        label: game.i18n.localize(action.labelkey),
        callback: (token) => token.actor.rollAttributeAction(actionCode),
      };
    }
    return undefined;
  }
}