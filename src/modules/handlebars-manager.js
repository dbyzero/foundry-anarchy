import { LOG_HEAD } from "./constants.js";
import { Damage } from "./damage.js";
import { Enums } from "./enums.js";
import { Grammar } from "./grammar.js";
import { Icons } from "./icons.js";
import { WeaponItem } from "./item/weapon-item.js";
import { Misc } from "./misc.js";

const HBS_PARTIAL_TEMPLATES = [
  // -- monitors
  'systems/anarchy/templates/monitors/anarchy-actor.hbs',
  'systems/anarchy/templates/monitors/armor.hbs',
  'systems/anarchy/templates/monitors/edge.hbs',
  'systems/anarchy/templates/actor/parts/matrix-cyberdeck.hbs',
  'systems/anarchy/templates/monitors/matrix.hbs',
  'systems/anarchy/templates/monitors/physical.hbs',
  'systems/anarchy/templates/monitors/social-credibility.hbs',
  'systems/anarchy/templates/monitors/social-rumor.hbs',
  'systems/anarchy/templates/monitors/structure.hbs',
  'systems/anarchy/templates/monitors/stun.hbs',
  // character
  'systems/anarchy/templates/actor/character/capacity.hbs',
  'systems/anarchy/templates/actor/character/description.hbs',
  'systems/anarchy/templates/actor/character/essence.hbs',
  'systems/anarchy/templates/actor/character/genre.hbs',
  'systems/anarchy/templates/actor/character/karma.hbs',
  'systems/anarchy/templates/actor/character/metatype.hbs',
  'systems/anarchy/templates/actor/character/social-celebrity.hbs',
  // character parts
  'systems/anarchy/templates/actor/parts/words.hbs',
  'systems/anarchy/templates/actor/parts/contact.hbs',
  'systems/anarchy/templates/actor/parts/contacts.hbs',
  'systems/anarchy/templates/actor/parts/gear.hbs',
  'systems/anarchy/templates/actor/parts/gears.hbs',
  // character enhanced
  'systems/anarchy/templates/actor/character-enhanced/metatype.hbs',
  'systems/anarchy/templates/actor/character-enhanced/attributes.hbs',
  'systems/anarchy/templates/actor/character-enhanced/capacity.hbs',
  'systems/anarchy/templates/actor/character-enhanced/attribute.hbs',
  // actor common
  'systems/anarchy/templates/actor/parts/attributebutton.hbs',
  'systems/anarchy/templates/actor/parts/attributebuttons.hbs',
  'systems/anarchy/templates/actor/parts/attribute.hbs',
  'systems/anarchy/templates/actor/parts/attributes.hbs',
  'systems/anarchy/templates/actor/parts/description.hbs',
  'systems/anarchy/templates/actor/parts/gmnotes.hbs',
  'systems/anarchy/templates/actor/parts/owned-actor.hbs',
  'systems/anarchy/templates/actor/parts/owned-actors.hbs',
  'systems/anarchy/templates/monitors/marks-actor.hbs',
  'systems/anarchy/templates/monitors/marks.hbs',
  'systems/anarchy/templates/actor/parts/ownership.hbs',
  'systems/anarchy/templates/actor/parts/qualities.hbs',
  'systems/anarchy/templates/actor/parts/quality.hbs',
  'systems/anarchy/templates/actor/parts/shadowamp.hbs',
  'systems/anarchy/templates/actor/parts/shadowamps.hbs',
  'systems/anarchy/templates/actor/parts/item-attribute.hbs',
  'systems/anarchy/templates/actor/parts/cyberdeck.hbs',
  'systems/anarchy/templates/actor/parts/cyberdecks.hbs',
  'systems/anarchy/templates/actor/parts/skill.hbs',
  'systems/anarchy/templates/actor/parts/skills.hbs',
  'systems/anarchy/templates/actor/parts/weapon-range.hbs',
  'systems/anarchy/templates/actor/parts/weapon.hbs',
  'systems/anarchy/templates/actor/parts/weapons.hbs',
  //-- NPC
  'systems/anarchy/templates/actor/npc-parts/quality.hbs',
  'systems/anarchy/templates/actor/npc-parts/qualities.hbs',
  'systems/anarchy/templates/actor/npc-parts/shadowamp.hbs',
  'systems/anarchy/templates/actor/npc-parts/shadowamps.hbs',
  'systems/anarchy/templates/actor/npc-parts/skill.hbs',
  'systems/anarchy/templates/actor/npc-parts/skills.hbs',
  'systems/anarchy/templates/actor/npc-parts/weapon.hbs',
  'systems/anarchy/templates/actor/npc-parts/weapons.hbs',
  // Vehicles
  'systems/anarchy/templates/actor/vehicle/vehicle-attributes.hbs',
  'systems/anarchy/templates/actor/vehicle/vehicle-category.hbs',
  'systems/anarchy/templates/actor/vehicle/vehicle-skill.hbs',
  // item
  'systems/anarchy/templates/item/parts/inactive.hbs',
  'systems/anarchy/templates/item/parts/itemname.hbs',
  'systems/anarchy/templates/item/parts/modifier.hbs',
  'systems/anarchy/templates/item/parts/modifiers.hbs',
  'systems/anarchy/templates/item/parts/references.hbs',
  // common&technical partials
  'systems/anarchy/templates/monitors/anarchy.hbs',
  'systems/anarchy/templates/monitors/anarchy-scene.hbs',
  'systems/anarchy/templates/common/check-element.hbs',
  'systems/anarchy/templates/common/checkbar.hbs',
  'systems/anarchy/templates/common/label.hbs',
  'systems/anarchy/templates/common/damage-code.hbs',
  'systems/anarchy/templates/common/damage-armor.hbs',
  'systems/anarchy/templates/common/enum-value-label.hbs',
  'systems/anarchy/templates/common/favorite.hbs',
  'systems/anarchy/templates/common/item-control-add.hbs',
  'systems/anarchy/templates/common/item-control-activate.hbs',
  'systems/anarchy/templates/common/item-controls.hbs',
  'systems/anarchy/templates/common/control-connectionMode.hbs',
  'systems/anarchy/templates/common/actor-reference.hbs',
  // dialogs
  'systems/anarchy/templates/dialog/roll-modifier.hbs',
  // apps
  'systems/anarchy/templates/app/gm-anarchy.hbs',
  'systems/anarchy/templates/app/gm-difficulty.hbs',
  'systems/anarchy/templates/app/gm-difficulty-buttons.hbs',
];

export class HandlebarsManager {

  constructor() {
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    this.registerBasicHelpers();
    await loadTemplates(Misc.distinct(HBS_PARTIAL_TEMPLATES))
  }

  async reloadAnarchyTemplate(file) {
    console.log(LOG_HEAD + 'Reloading template ' + file);

    // refresh template
    Handlebars.unregisterPartial(file);
    await loadTemplates([file]);

    // render all Dialogs
    const windowKeys = Object.keys(ui.windows);
    windowKeys.forEach(window => ui.windows[window].render());
  }

  registerBasicHelpers() {
    Handlebars.registerHelper('concat', (...args) => Misc.join(args.slice(0, -1)));
    Handlebars.registerHelper('substring', (str, from, to) => str?.substring(from, to));
    Handlebars.registerHelper('toUpperCase', Grammar.toUpperCaseNoAccent);
    Handlebars.registerHelper('weaponDamageLetter', Damage.letter);
    Handlebars.registerHelper('weaponDamageCode', WeaponItem.damageCode);
    Handlebars.registerHelper('weaponDamageValue', WeaponItem.damageValue);
    Handlebars.registerHelper('weaponArmorMode', WeaponItem.armorMode);

    Handlebars.registerHelper('skillValue', (actor, skillId) => actor.getSkillValue(skillId, false));
    Handlebars.registerHelper('specializationValue', (actor, skillId) => actor.getSkillValue(skillId, true));
    Handlebars.registerHelper('for', HandlebarsManager.hbsForLoop);
    Handlebars.registerHelper('modulo', (value, divisor) => value % divisor);
    Handlebars.registerHelper('divint', Misc.divint);
    Handlebars.registerHelper('divup', Misc.divup);
    Handlebars.registerHelper('sum', (v1, v2) => v1 + v2);
    Handlebars.registerHelper('diff', (v1, v2) => v1 - v2);
    Handlebars.registerHelper('min', (v1, v2) => Math.min(v1, v2));
    Handlebars.registerHelper('max', (v1, v2) => Math.max(v1, v2));
    Handlebars.registerHelper('either', (a, b) => a ? a : b);
    Handlebars.registerHelper('isInteger', a => a !== undefined && Number.isInteger(a));
    Handlebars.registerHelper('actorAttribute', (attribute, actor, item = undefined) => actor.getAttributeValue(attribute, item));
    Handlebars.registerHelper('localizeAttribute', Enums.localizeAttribute);
    Handlebars.registerHelper('iconFA', Icons.fontAwesome);
    Handlebars.registerHelper('iconSrc', Icons.iconSystemPath);
    Handlebars.registerHelper('iconPath', Icons.iconPath);
    Handlebars.registerHelper('iconD6', Icons.iconD6);
    Handlebars.registerHelper('getActor', id => game.actors.get(id));
    Handlebars.registerHelper('actorHasFavorite', (actorId, options) => HandlebarsManager.checkHasFavorite(actorId, options));
  }

  static hbsForLoop(start, end, options) {
    let accum = '';
    for (let i = start; i < end; ++i) {
      accum += options.fn(i);
    }
    return accum;
  }

  static checkHasFavorite(actorId, options) {
    const actor = game.actors.get(actorId);
    return actor?.hasFavorite(options.hash.type, options.hash.id);
  }

}