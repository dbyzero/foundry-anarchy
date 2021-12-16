import { SRA } from "./config.js";

const defaultSkillsAttribute = {
  athletics: SRA.attributes.strength,

  closeCombat: SRA.attributes.agility,
  projectileWeapons: SRA.attributes.agility,
  firearms: SRA.attributes.agility,
  heavyWeapons: SRA.attributes.agility,
  vehicleWeapons: SRA.attributes.agility,
  stealth: SRA.attributes.agility,
  pilotingGround: SRA.attributes.agility,
  pilotingOther: SRA.attributes.agility,
  escapeArtist: SRA.attributes.agility,

  conjuring: SRA.attributes.willpower,
  sorcery: SRA.attributes.willpower,
  astralCombat: SRA.attributes.willpower,
  survival: SRA.attributes.willpower,

  biotech: SRA.attributes.logic,
  hacking: SRA.attributes.logic,
  electronics: SRA.attributes.logic,
  engineering: SRA.attributes.logic,
  tracking: SRA.attributes.logic,
  tasking: SRA.attributes.logic,

  con: SRA.attributes.charisma,
  intimidation: SRA.attributes.charisma,
  negotiation: SRA.attributes.charisma,
  disguise: SRA.attributes.charisma,

  animals: SRA.attributes.charisma,
  etiquette: SRA.attributes.charisma,
};

const actorDescriptionTypeLists = {
  keyword: "keywords",
  disposition: "dispositions",
  cue: "cues"
}

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

  static registerEnums() {
    // Customisation of skills will have to be done based on system settings
    Enums.skillsAttribute = defaultSkillsAttribute;
    Enums.hbsSkills = Enums.mapObjetToValueLabel(SRA.skill);
    Enums.hbsAttributes = Enums.mapObjetToValueLabel(SRA.attributes)
      .filter(a => a.value != 'knowledge');
    Enums.hbsItemTypes = Enums.mapObjetToValueLabel(SRA.itemType);
    Enums.hbsCapacities = Enums.mapObjetToValueLabel(SRA.capacity);
    Enums.hbsMonitors = Enums.mapObjetToValueLabel(SRA.monitor);
    Enums.hbsMonitorLetters = Enums.mapObjetToValueLabel(SRA.monitorLetter);
    Enums.hbsShadowampCategories = Enums.mapObjetToValueLabel(SRA.shadowampCategory);
    Enums.hbsAreas = Enums.mapObjetToValueLabel(SRA.area);
    Enums.hbsRanges = Enums.mapObjetToValueLabel(SRA.range);
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
      ranges: Enums.hbsRanges
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

  static getSkillAttribute(code) {
    if (Enums.isSkillCode(code))  {
        return Enums.skillsAttribute[code];
    }
    return 'agility';
  }

  static isSkillCode(code) {
    return code && Enums.skillsAttribute[code];
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

