import { TEMPLATES_PATH } from "./constants.js";
import { Misc } from "./misc.js";

export const partials = [
  `${TEMPLATES_PATH}/actor/parts/attributes.hbs`,
  `${TEMPLATES_PATH}/actor/parts/attribute.hbs`,
  `${TEMPLATES_PATH}/actor/parts/wordlist.hbs`,
];

export class HandlebarsManager {

  static async preload() {
    await loadTemplates(partials);
  }

  static async register() {
    Handlebars.registerHelper('concat', (...args) => Misc.join(args.slice(0, -1)));
  }
}