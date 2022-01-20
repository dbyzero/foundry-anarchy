import { ANARCHY } from "./config.js";
import { TEMPLATE } from "./constants.js";
import { Icons } from "./icons.js";

const ATTR = TEMPLATE.attributes;
const ACTOR = TEMPLATE.actorTypes;

function action(code, attr1, attr2, icon, actorTypes, condition = actor => true) {
  return {
    code: code,
    labelkey: ANARCHY.attributeActions[code],
    attribute1: attr1,
    attribute2: attr2,
    icon: icon,
    actorTypes: actorTypes,
    condition: condition
  }
}

export const ACTION = {
  defense: "defense",
  resistTorture: "resistTorture",
  judgeIntentions: "judgeIntentions",
  perception: "perception",
  composure: "composure",
  memory: "memory",
  catch: "catch",
  lift: "lift",
  matrixDefense: "matrixDefense",
  matrixPerception: "matrixPerception",
  vehicleDefense: "vehicleDefense"
}

const ATTRIBUTE_ACTIONS = [
  action(ACTION.defense, ATTR.agility, ATTR.logic, Icons.fontAwesome('fas fa-shield-alt'), [ACTOR.character]),
  action(ACTION.resistTorture, ATTR.strength, ATTR.willpower, Icons.fontAwesome('fas fa-angry'), [ACTOR.character]),
  action(ACTION.perception, ATTR.logic, ATTR.willpower, Icons.fontAwesome('fas fa-eye'), [ACTOR.character]),
  action(ACTION.composure, ATTR.charisma, ATTR.willpower, Icons.fontAwesome('fas fa-meh'), [ACTOR.character]),
  action(ACTION.judgeIntentions, ATTR.charisma, ATTR.charisma, Icons.fontAwesome('fas fa-theater-masks'), [ACTOR.character]),
  action(ACTION.memory, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-brain'), [ACTOR.character]),
  action(ACTION.catch, ATTR.agility, ATTR.agility, Icons.fontAwesome('fas fa-baseball-ball'), [ACTOR.character]),
  action(ACTION.lift, ATTR.strength, ATTR.strength, Icons.fontAwesome('fas fa-dumbbell'), [ACTOR.character]),
  action(ACTION.vehicleDefense, ATTR.agility, ATTR.logic, Icons.fontAwesome('fas fa-tachometer-alt'), [ACTOR.character]),
  action(ACTION.vehicleDefense, ATTR.autopilot, undefined, Icons.fontAwesome('fas fa-tachometer-alt'), [ACTOR.vehicle]),
  action(ACTION.matrixDefense, ATTR.firewall, ATTR.logic, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.character], actor => actor.hasCyberdeck()),
  action(ACTION.matrixDefense, ATTR.firewall, ATTR.logic, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.IC]),
  action(ACTION.matrixDefense, ATTR.firewall, ATTR.system, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.device, ACTOR.vehicle]),
  action(ACTION.matrixDefense, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-shield-virus'), [ACTOR.sprite]),
  action(ACTION.matrixPerception, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-video'), [ACTOR.character, ACTOR.sprite, ACTOR.IC]),
  action(ACTION.matrixPerception, ATTR.system, ATTR.system, Icons.fontAwesome('fas fa-video'), [ACTOR.device]),
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

  static prepareShortcut(actionCode) {
    const action = AttributeActions.getActorActions(actor).find(a => a.code == actionCode);
    if (action) {
      return {
        icon: action.icon,
        label: game.i18n.localize(action.labelkey),
        callback: actor => actor.rollAttribute(action.attribute1, action.attribute2, actionCode),
      };
    }
    return undefined;

  }
}