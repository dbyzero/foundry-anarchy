import { AttributeActions } from "../attribute-actions.js";
import { ANARCHY } from "../config.js";
import { Enums } from "../enums.js";
import { HandlebarsManager } from "../handlebars-manager.js";
import { Skills } from "../skills.js";

export class Modifiers {
  constructor() {
    this.modifiers = {
      groups: Enums.mapObjetToKeyValue(ANARCHY.modifier.group, 'key', 'label'),
      roll: Modifiers._buildGroupOptions('roll'),
      monitor: Modifiers._buildGroupOptions('monitor'),
      other: Modifiers._buildGroupOptions('other'),
    }
    Hooks.once('ready', () => this.onReady());
  }

  static _buildGroupOptions(group) {
    return {
      label: ANARCHY.modifier.group[group],
      effects: Enums.mapObjetToKeyValue(ANARCHY.modifier[group].effect, 'key', 'label'),
      categories: Enums.mapObjetToKeyValue(ANARCHY.modifier[group].category, 'key', 'label'),
    };
  }

  async onReady() {
    Handlebars.registerHelper('modifierHasSubCategory', (group, effect, category) => this.hasSubCategory(group, effect, category));
    Handlebars.registerHelper('modifierSelectOption', (value, options) => this.getSelectOptions(value, options));
  }

  hasSubCategory(group, effect, category) {
    if (group == 'roll') {
      return true;
    }
    return false;
  }

  getSelectOptions(select, options) {
    switch (select) {
      case 'group': return this.modifiers.groups;
      case 'effect': return this.modifiers[options.hash.group].effects;
      case 'category': return this.modifiers[options.hash.group].categories;
      case 'subCategory':
        switch (options.hash.group) {
          case 'roll': {
            const subCategories = this.getSelectRollSubCategories(options.hash.category);
            return subCategories;
          }
        }
        return [];
    }
    return [];
  }

  getSelectRollSubCategories(category) {
    switch (category) {
      case 'attribute':
        return Enums.getAttributes().map(attr => { return { key: attr.value, label: attr.labelkey } });
      case 'skill':
        return game.system.anarchy.skills.getSkillLabels().map(skill => { return { key: skill.value, label: skill.labelkey } });
      case 'attributeAction':
        return AttributeActions.all().map(action => { return { key: action.code, label: action.labelkey } });
      case 'defense':
        return AttributeActions.getDefenses().map(defense => { return { key: defense.code, label: defense.labelkey } });
    }
    return [];
  }

  getEnums() {
    return { modifiers: this.modifiers };
  }
}