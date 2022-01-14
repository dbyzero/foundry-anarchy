import { ANARCHY } from "./config.js";
import { ANARCHY_HOOKS } from "./hooks-manager.js";
import { Misc } from "./misc.js";

const actorWordTypes = {
  keyword: "keywords",
  disposition: "dispositions",
  cue: "cues"
}

export class Enums {
  static ENUMS;
  static hbsAttributes;
  static hbsItemTypes;
  static hbsCapacities;
  static hbsMonitors;
  static hbsMonitorLetters;
  static hbsShadowampCategories;
  static hbsAreas;
  static hbsRanges;

  static sortedAttributeKeys;

  // this method is the place to add settings-based entries in the enums
  static init() {
    Enums.hbsAttributes = Enums.mapObjetToValueLabel(ANARCHY.attributes)
      .filter(a => a.value != 'knowledge' && a.value != 'noAttribute');
    Enums.hbsItemTypes = Enums.mapObjetToValueLabel(ANARCHY.itemType);
    Enums.hbsCapacities = Enums.mapObjetToValueLabel(ANARCHY.capacity);
    Enums.hbsMonitors = Enums.mapObjetToValueLabel(ANARCHY.monitor);
    Enums.hbsMonitorLetters = Enums.mapObjetToValueLabel(ANARCHY.monitorLetter);
    Enums.hbsShadowampCategories = Enums.mapObjetToValueLabel(ANARCHY.shadowampCategory);
    Enums.hbsAreas = Enums.mapObjetToValueLabel(ANARCHY.area);
    Enums.hbsRanges = Enums.mapObjetToValueLabel(ANARCHY.range);
    Enums.hbsVehicleCategories = Enums.mapObjetToValueLabel(ANARCHY.vehicleCategory);
    Enums.sortedAttributeKeys = Object.keys(ANARCHY.attributes);

    Hooks.once(ANARCHY_HOOKS.GET_HANDLEPAR_HELPERS, () => Enums.registerHandleBarHelpers());
  }

  static registerHandleBarHelpers() {
    Handlebars.registerHelper('sortedAttributes', map => Misc.sortedMap(map, Misc.ascendingBySortedArray(Enums.sortedAttributeKeys)));
  }

  static getEnums(filterAttributes = it => true) {
    return {
      attributes: Enums.hbsAttributes.filter(it => filterAttributes(it.value)),
      itemTypes: Enums.hbsItemTypes,
      capacities: Enums.hbsCapacities,
      monitors: Enums.hbsMonitors,
      shadowampCategories: Enums.hbsShadowampCategories,
      skills: game.system.anarchy.skills.getSkillLabels(),
      areas: Enums.hbsAreas,
      ranges: Enums.hbsRanges,
      vehicleCategories: Enums.hbsVehicleCategories
    };
  }

  static getActorWordTypes() {
    return actorWordTypes;
  }

  static getMonitors() {
    return Enums.hbsMonitors;
  }

  static getMonitorLetters() {
    return Enums.hbsMonitorLetters;
  }

  static getActorWordTypePlural(wordType) {
    return actorWordTypes[wordType];
  }

  static localizeAttribute(attribute) {
    if (!ANARCHY.attributes[attribute]) {
      return game.i18n.localize(ANARCHY.attributes['noAttribute']);
    }
    return game.i18n.localize(ANARCHY.attributes[attribute]);
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

