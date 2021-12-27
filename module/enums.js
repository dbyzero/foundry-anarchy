import { ANARCHY } from "./config.js";
import { Icons } from "./icons.js";

const defaultSkillsAttribute = {
  athletics: 'strength',

  closeCombat: 'agility',
  projectileWeapons: 'agility',
  firearms: 'agility',
  heavyWeapons: 'agility',
  vehicleWeapons: 'agility',
  stealth: 'agility',
  pilotingGround: 'agility',
  pilotingOther: 'agility',
  escapeArtist: 'agility',

  conjuring: 'willpower',
  sorcery: 'willpower',
  astralCombat: 'willpower',
  survival: 'willpower',

  biotech: 'logic',
  hacking: 'logic',
  electronics: 'logic',
  engineering: 'logic',
  tracking: 'logic',
  tasking: 'logic',

  con: 'charisma',
  intimidation: 'charisma',
  negotiation: 'charisma',
  disguise: 'charisma',

  animals: 'charisma',
  etiquette: 'charisma',
};

const actorDescriptionTypeLists = {
  keyword: "keywords",
  disposition: "dispositions",
  cue: "cues"
}

const defaultAttributeActions = [
  { actionCode: "catch", labelkey: ANARCHY.attributeActions.catch, attribute: "agility", attribute2: "agility", icon: Icons.fontAwesome('fas fa-baseball-ball') },
  { actionCode: "defense", labelkey: ANARCHY.attributeActions.defense, attribute: "agility", attribute2: "logic", icon: Icons.fontAwesome('fas fa-shield-alt') },
  { actionCode: "judgeIntentions", labelkey: ANARCHY.attributeActions.judgeIntentions, attribute: "charisma", attribute2: "charisma", icon: Icons.fontAwesome('fas fa-theater-masks') },
  { actionCode: "perception", labelkey: ANARCHY.attributeActions.perception, attribute: "logic", attribute2: "willpower", icon: Icons.fontAwesome('fas fa-eye') },
  { actionCode: "resistTorture", labelkey: ANARCHY.attributeActions.resistTorture, attribute: "strength", attribute2: "willpower", icon: Icons.fontAwesome('fas fa-angry') },
  { actionCode: "composure", labelkey: ANARCHY.attributeActions.composure, attribute: "charisma", attribute2: "willpower", icon: Icons.fontAwesome('fas fa-meh') },
  { actionCode: "memory", labelkey: ANARCHY.attributeActions.memory, attribute: "logic", attribute2: "logic", icon: Icons.fontAwesome('fas fa-brain') },
  { actionCode: "lifting", labelkey: ANARCHY.attributeActions.lifting, attribute: "strength", attribute2: "strength", icon: Icons.fontAwesome('fas fa-dumbbell') },
]
export class Enums {
  static ENUMS;
  static hbsSkills;
  static skillsAttribute;
  static hbsAttributes;
  static hbsItemTypes;
  static hbsCapacities;
  static hbsMonitors;
  static hbsMonitorLetters;
  static hbsShadowampCategories;
  static hbsAreas;
  static hbsRanges;
  static hbsAllAttributes

  // this method is the place to add settings-based entries in the enums
  static registerEnums() {
    // Customisation of skills will have to be done based on system settings
    Enums.skillsAttribute = defaultSkillsAttribute;
    Enums.hbsSkills = Enums.mapObjetToValueLabel(ANARCHY.skill);
    Enums.hbsAttributes = Enums.mapObjetToValueLabel(ANARCHY.attributes)
      .filter(a => a.value != 'knowledge' && a.value != 'noAttribute');
    Enums.hbsItemTypes = Enums.mapObjetToValueLabel(ANARCHY.itemType);
    Enums.hbsCapacities = Enums.mapObjetToValueLabel(ANARCHY.capacity);
    Enums.hbsMonitors = Enums.mapObjetToValueLabel(ANARCHY.monitor);
    Enums.hbsMonitorLetters = Enums.mapObjetToValueLabel(ANARCHY.monitorLetter);
    Enums.hbsShadowampCategories = Enums.mapObjetToValueLabel(ANARCHY.shadowampCategory);
    Enums.hbsAreas = Enums.mapObjetToValueLabel(ANARCHY.area);
    Enums.hbsRanges = Enums.mapObjetToValueLabel(ANARCHY.range);
    Enums.attributeActions = defaultAttributeActions;
  }

  static getEnums() {
    return {
      attributes: Enums.hbsAttributes,
      itemTypes: Enums.hbsItemTypes,
      capacities: Enums.hbsCapacities,
      monitors: Enums.hbsMonitors,
      shadowampCategories: Enums.hbsShadowampCategories,
      skills: Enums.hbsSkills,
      areas: Enums.hbsAreas,
      ranges: Enums.hbsRanges,
      attributeActions: Enums.attributeActions
    };
  }

  static getActorDescriptionTypeLists() {
    return actorDescriptionTypeLists;
  }

  static getMonitors() {
    return Enums.hbsMonitors;
  }

  static getMonitorLetters() {
    return Enums.hbsMonitorLetters;
  }

  static getActorDescriptionType(wordlist) {
    return actorDescriptionTypeLists[wordlist];
  }

  static localizeAttribute(attribute) {
    if (!ANARCHY.attributes[attribute]) {
      return game.i18n.localize(ANARCHY.attributes['noAttribute']);
    }
    return game.i18n.localize(ANARCHY.attributes[attribute]);
  }

  static getSkillAttribute(code) {
    if (Enums.isDefaultSkill(code)) {
      return defaultSkillsAttribute[code];
    }
    return '';
  }

  static isDefaultSkill(code) {
    return code && defaultSkillsAttribute[code];
  }

  static getFromList(list, value, key = 'value', label = 'label') {
    const found = list.find(m => m[key] == value);
    return found ? found[label] : undefined
  }

  static mapObjetToValueLabel(object, value = 'value', label = 'label') {
    return Object.entries(object).map(
      entry => {
        const ret = {};
        ret[value] = entry[0];
        ret[label] = entry[1];
        return ret;
      });
  }

}

