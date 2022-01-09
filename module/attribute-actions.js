import { ANARCHY } from "./config.js";
import { TEMPLATE } from "./constants.js";
import { Icons } from "./icons.js";

const ATTR = TEMPLATE.attributes;

function action(code, attr1, attr2, icon) {
  return {
    code: code,
    labelkey: ANARCHY.attributeActions[code],
    attribute: attr1,
    attribute2: attr2,
    icon: icon
  }
}

export const ACTION_CODE = {
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
  action(ACTION_CODE.defense, ATTR.agility, ATTR.logic, Icons.fontAwesome('fas fa-shield-alt')),
  action(ACTION_CODE.resistTorture, ATTR.strength, ATTR.willpower, Icons.fontAwesome('fas fa-angry')),
  action(ACTION_CODE.perception, ATTR.logic, ATTR.willpower, Icons.fontAwesome('fas fa-eye')),
  action(ACTION_CODE.composure, ATTR.charisma, ATTR.willpower, Icons.fontAwesome('fas fa-meh')),
  action(ACTION_CODE.judgeIntentions, ATTR.charisma, ATTR.charisma, Icons.fontAwesome('fas fa-theater-masks')),
  action(ACTION_CODE.memory, ATTR.logic, ATTR.logic, Icons.fontAwesome('fas fa-brain')),
  action(ACTION_CODE.catch, ATTR.agility, ATTR.agility, Icons.fontAwesome('fas fa-baseball-ball')),
  action(ACTION_CODE.lift, ATTR.strength, ATTR.strength, Icons.fontAwesome('fas fa-dumbbell')),
  action(ACTION_CODE.vehicleDefense, ATTR.agility, ATTR.logic, Icons.fontAwesome('fas fa-tachometer-alt')),
  action(ACTION_CODE.vehicleDefense, ATTR.autopilot, undefined, Icons.fontAwesome('fas fa-tachometer-alt')),
  action(ACTION_CODE.matrixDefense, ATTR.logic, ATTR.firewall, Icons.fontAwesome('fas fa-shield-virus')),
  action(ACTION_CODE.matrixDefense, ATTR.system, ATTR.firewall, Icons.fontAwesome('fas fa-shield-virus')),
  action(ACTION_CODE.matrixPerception, ATTR.system, ATTR.system, Icons.fontAwesome('fas fa-video')),
]

export class AttributeActions {

  static all(filter = undefined) {
    return filter
      ? ATTRIBUTE_ACTIONS.filter(filter)
      : ATTRIBUTE_ACTIONS;
  }


  static getActions(codes) {
    return AttributeActions.all(it => codes.includes(it.code));
  }

  static get(code) {
    return AttributeActions.all().find(it => it.code == code);

  }
}