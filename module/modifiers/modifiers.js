import { AttributeActions } from "../attribute-actions.js";
import { ANARCHY } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";
import { Enums } from "../enums.js";
import { HandlebarsManager } from "../handlebars-manager.js";
import { Misc } from "../misc.js";
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

  static buildRollModifiersFilter(context, effect) {
    return m => {
      if (m.group == 'roll' && m.effect == effect) {
        switch (m.category) {
          case 'attribute': return [context.attribute1, context.attribute2].includes(m.subCategory);
          case 'skill': return m.subCategory == context.skill?.data.data.code;
          case 'defense': return m.subCategory == context.attributeAction;
          case 'attributeAction': return m.subCategory == context.attributeAction;
        }
      }
      return false;
    }
  }

  static computeRollModifiers(items, context, effect) {
    const group = 'roll';
    const contextFilter = Modifiers.buildRollModifiersFilter(context, effect);
    const filter = m => m.group == group && m.effect == effect && contextFilter(m);
    const itemModifiers = items.map(item => Modifiers.itemModifiers(item, filter))
      .reduce((a, b) => a.concat(b), []);

    // sum values, max bonus is 3
    const sumValues = Math.min(3, Misc.sumValues(itemModifiers, im => im.modifier.value));
    // allow one item with modfier above 3 (for deltaware option in French rulebook)
    const maxValue = Math.max(...itemModifiers.map(im => im.modifier.value));
    return {
      value: Math.max(maxValue, sumValues),
      sources: itemModifiers
    };
  }

  static computeMonitorModifiers(items, monitor, category) {
    return Modifiers.computeSum(items, 'monitor', monitor, category);
  }

  static computeSum(items, group, monitor, category) {
    const filter = Modifiers._createFilter(group, monitor, category);
    const itemModifiers = items.map(item => Modifiers.itemModifiers(item, filter))
      .reduce((a, b) => a.concat(b), []);

    return Misc.sumValues(itemModifiers, m => m.modifier.value);
  }

  static _createFilter(group, effect, category) {
    return m => m.group == group
      && m.effect == (effect == undefined ? m.effect : effect)
      && m.category == (category == undefined ? m.category : category);
  }

  static countModifiers(items, group, effect = undefined, category = undefined) {
    const filter = Modifiers._createFilter(group, effect, category);
    const itemModifiers = items.map(item => Modifiers.itemModifiers(item, filter))
      .reduce((a, b) => a.concat(b), []);

    return itemModifiers.count;
  }

  static itemModifiers(item, filter) {
    return Modifiers._listItemModifiers(item, filter).map(m => Modifiers._itemModifier(item, m));
  }

  static _listItemModifiers(item, filter = m => true) {
    return (item.data.data.modifiers ?? []).filter(filter);
  }


  static _itemModifier(item, modifier) {
    return {
      item: item,
      modifier: modifier
    };
  }


}