import { TEMPLATES_PATH } from "./constants.js";
import { Grammar } from "./grammar.js";
import { Misc } from "./misc.js";

export const partials = [
  `${TEMPLATES_PATH}/actor/parts/metatype.hbs`,
  `${TEMPLATES_PATH}/actor/parts/capacity.hbs`,
  `${TEMPLATES_PATH}/actor/parts/karma.hbs`,
  `${TEMPLATES_PATH}/actor/parts/attributes.hbs`,
  `${TEMPLATES_PATH}/actor/parts/attribute.hbs`,
  `${TEMPLATES_PATH}/actor/parts/wordlist.hbs`,
  `${TEMPLATES_PATH}/actor/parts/skills.hbs`,
  `${TEMPLATES_PATH}/actor/parts/skill.hbs`,
];

export class HandlebarsManager {

  static async preload() {
    await loadTemplates(partials);
  }

  static async register() {
    Handlebars.registerHelper('concat', (...args) => Misc.join(args.slice(0, -1)));
    Handlebars.registerHelper('substring', (str, from, to) => str?.substring(from, to));
    Handlebars.registerHelper('toUpperCase', (str) => Grammar.toUpperCaseNoAccent(str));
  }
}