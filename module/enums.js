import { SRA } from "./config.js";

export const skillsAttribute = {
  athletics: SRA.attributes.strength,
  acrobatics: SRA.attributes.agility,
  firearms: SRA.attributes.agility,
  projectiles: SRA.attributes.agility,
  gunnery: SRA.attributes.agility,
  heavyweapons: SRA.attributes.agility,
  closecombat: SRA.attributes.agility,
  stealth: SRA.attributes.agility,
  groundvehicles: SRA.attributes.agility,
  miscvehicles: SRA.attributes.agility,
  astralfight: SRA.attributes.willpower,
  conjuring: SRA.attributes.willpower,
  sorcery: SRA.attributes.willpower,
  survival: SRA.attributes.willpower,
  biotech: SRA.attributes.logic,
  electronics: SRA.attributes.logic,
  hacking: SRA.attributes.logic,
  engineering: SRA.attributes.logic,
  tracking: SRA.attributes.logic,
  technomancy: SRA.attributes.logic,
  animals: SRA.attributes.charisma,
  con: SRA.attributes.charisma,
  etiquette: SRA.attributes.charisma,
  intimidation: SRA.attributes.charisma,
  negotiation: SRA.attributes.charisma,
};
export const actorDescriptionTypeLists ={
  keyword: "keywords",
  disposition: "dispositions",
  cue: "cues"
}

export class Enums {
  static mapObjetToValueLabel(object, value = 'value', label = 'label') {
    return Object.entries(object).map(
      entry => {
        const ret = {};
        ret[value] = entry[0];
        ret[label] = entry[1];
        return ret;
      });
  }
  static getFromList(list, value, key='value', label='label') {
    const found = list.find(m => m[key] == value);
    return found? found[label] : undefined
  }
}

export const hbsAttributes = Enums.mapObjetToValueLabel(SRA.attributes);
export const hbsItemTypes = Enums.mapObjetToValueLabel(SRA.itemType)
export const hbsCapacities = Enums.mapObjetToValueLabel(SRA.capacity)
export const hbsMonitors = Enums.mapObjetToValueLabel(SRA.monitor)
export const hbsMonitorLetters = Enums.mapObjetToValueLabel(SRA.monitor_letter)
export const hbsShadowampCategories = Enums.mapObjetToValueLabel(SRA.shadowampcategory)
export const hbsSkills = Enums.mapObjetToValueLabel(SRA.skill);
export const hbsAreas = Enums.mapObjetToValueLabel(SRA.area);
export const hbsRanges = Enums.mapObjetToValueLabel(SRA.range);

