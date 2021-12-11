import { Damage } from "./damage.js";
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
  //-- counters & monitors
  'systems/shadowrun-anarchy/templates/actor/parts/armor.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/monitors.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/counteranarchy.hbs',
  'systems/shadowrun-anarchy/templates/actor/parts/counteredge.hbs',
  //-- technical partials
  'systems/shadowrun-anarchy/templates/common/checkbar.hbs',
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
    Handlebars.registerHelper('divint', (value, divisor) => parseInt(value/divisor));
    Handlebars.registerHelper('sum', (v1, v2) => v1 + v2);
    Handlebars.registerHelper('diff', (v1, v2) => v1 - v2);
    Handlebars.registerHelper('either', (a, b) => a ? a : b);
  }

  static hbsFor(start, end, options) {
    let accum = '';
    for (let i = start; i < end; ++i) {
      accum += options.fn(i);
    }
    return accum;
  }
}