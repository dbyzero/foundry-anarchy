import { Damage } from "./damage.js";
import { Enums } from "./enums.js";
import { Grammar } from "./grammar.js";
import { Misc } from "./misc.js";

export const partials = [
  'systems/shadowrun-anarchy/templates/actor/parts/genre.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/metatype.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/capacity.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/essence.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/karma.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/attributes.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/attribute.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/wordlist.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/skills.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/skill.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/shadowamps.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/shadowamp.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/qualities.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/quality.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/weapons.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/weapon.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/gears.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/gear.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/contacts.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/contact.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/description.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/gmnotes.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/attributebuttons.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/attributebutton.hbs',
  //-- counters & monitors
  'systems/shadowrun-anarchy/templates/actor/parts/armor.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/monitors.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/counteranarchy.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/counteredge.hbs',
  //-- item
  'systems/shadowrun-anarchy/templates/item/parts/itemname.hbs',
  'systems/shadowrun-anarchy/templates/item/parts/references.hbs',
  //-- common&technical partials
  'systems/shadowrun-anarchy/templates/common/checkbar.hbs',
  'systems/shadowrun-anarchy/templates/common/damagecode.hbs',
  'systems/shadowrun-anarchy/templates/common/item-controls.hbs',
  'systems/shadowrun-anarchy/templates/common/enum-value-label.hbs',
  //-- dialogs
  'systems/shadowrun-anarchy/templates/dialog/roll-modifier.hbs',
  //-- chat
  'systems/shadowrun-anarchy/templates/chat/roll-modifier.hbs',
];

export class HandlebarsManager {

  static async preload() {
    await loadTemplates(partials);
  }

  static async register() {
    Handlebars.registerHelper('concat', (...args) => Misc.join(args.slice(0, -1)));
    Handlebars.registerHelper('substring', (str, from, to) => str?.substring(from, to));
    Handlebars.registerHelper('toUpperCase', Grammar.toUpperCaseNoAccent);
    Handlebars.registerHelper('damageLetter',  Damage.letter);
    Handlebars.registerHelper('for', HandlebarsManager.hbsFor);
    Handlebars.registerHelper('modulo', (value, divisor) => value % divisor);
    Handlebars.registerHelper('divint', Misc.divint);
    Handlebars.registerHelper('divup', Misc.divup);
    Handlebars.registerHelper('sum', (v1, v2) => v1 + v2);
    Handlebars.registerHelper('diff', (v1, v2) => v1 - v2);
    Handlebars.registerHelper('either', (a, b) => a ? a : b);
    Handlebars.registerHelper('isInteger', a => a !== undefined && Number.isInteger(a));
    Handlebars.registerHelper('actorAttribute', (actor, attribute) => actor.getAttributeValue(attribute));
    Handlebars.registerHelper('localizeAttribute', (attribute) => Enums.localizeAttribute(attribute));
  }

  static hbsFor(start, end, options) {
    let accum = '';
    for (let i = start; i < end; ++i) {
      accum += options.fn(i);
    }
    return accum;
  }
}