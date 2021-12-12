import { SRA } from "./config.js";

export class Enums {
  static mapObjetTo(object, key = 'key', value = 'value') {
    return Object.entries(object).map(
      entry => {
        const ret = {};
        ret[key] = entry[0];
        ret[value] = entry[1];
        return ret;
      });
  }
}

export const hbsAttributes = Enums.mapObjetTo(SRA.attributes, 'key', 'label');
export const hbsItemTypes = Enums.mapObjetTo(SRA.itemType, 'type', 'label')
export const hbsCapacity = Enums.mapObjetTo(SRA.capacity, 'key', 'label')
export const hbsShadowampCategory = Enums.mapObjetTo(SRA.shadowampcategory, 'key', 'label')
export const hbsSkill = Enums.mapObjetTo(SRA.skill, 'code', 'label');
export const hbsSkillAttribute = Enums.mapObjetTo(SRA.skillattribute, 'code', 'label');

