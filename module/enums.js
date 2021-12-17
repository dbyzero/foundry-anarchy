import { SRA } from "./config.js";

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
  { actionCode: "catch", labelkey: SRA.attributeActions.catch, attribute: "agility", attribute2: "agility" },
  { actionCode: "defense", labelkey: SRA.attributeActions.defense, attribute: "agility", attribute2: "logic" },
  { actionCode: "judgeIntentions", labelkey: SRA.attributeActions.judgeIntentions, attribute: "charisma", attribute2: "charisma" },
  { actionCode: "perception", labelkey: SRA.attributeActions.perception, attribute: "logic", attribute2: "willpower" },
  { actionCode: "resistTorture", labelkey: SRA.attributeActions.resistTorture, attribute: "strength", attribute2: "willpower" },
  { actionCode: "composure", labelkey: SRA.attributeActions.composure, attribute: "charisma", attribute2: "willpower" },
  { actionCode: "memory", labelkey: SRA.attributeActions.memory, attribute: "logic", attribute2: "logic" },
  { actionCode: "lifting", labelkey: SRA.attributeActions.lifting, attribute: "strength", attribute2: "strength" },
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
    Enums.hbsSkills = Enums.mapObjetToValueLabel(SRA.skill);
    Enums.hbsAttributes = Enums.mapObjetToValueLabel(SRA.attributes)
        .filter(a => a.value != 'knowledge' && a.value != 'noAttribute');
    Enums.hbsItemTypes = Enums.mapObjetToValueLabel(SRA.itemType);
    Enums.hbsCapacities = Enums.mapObjetToValueLabel(SRA.capacity);
    Enums.hbsMonitors = Enums.mapObjetToValueLabel(SRA.monitor);
    Enums.hbsMonitorLetters = Enums.mapObjetToValueLabel(SRA.monitorLetter);
    Enums.hbsShadowampCategories = Enums.mapObjetToValueLabel(SRA.shadowampCategory);
    Enums.hbsAreas = Enums.mapObjetToValueLabel(SRA.area);
    Enums.hbsRanges = Enums.mapObjetToValueLabel(SRA.range);
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
    if (!SRA.attributes[attribute]) {
      return game.i18n.localize(SRA.attributes['noAttribute']);
    }
    return game.i18n.localize(SRA.attributes[attribute]);
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

