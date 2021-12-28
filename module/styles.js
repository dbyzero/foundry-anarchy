import { ANARCHY } from "./config.js";
import { LOG_HEAD, SYSTEM_NAME } from "./constants.js";

const DEFAULT_CSS_CLASS = 'default-css-class';
const HOOK_LOAD_STYLES = 'anarchy-loadStyles';
const CSS_DEFAULT = 'style-anarchy';

const DEFAULT_STYLES = [
  { name: 'Default', cssClass: CSS_DEFAULT },
  { name: 'Shadowrun Anarchy', cssClass: 'style-anarchy-shadowrun' },
  { name: 'Dark glass', cssClass: 'style-darkglass' },
]

/**
 * The Styles class manages the addition of different styles
 */
export class Styles {
  static init() {


    game.system.anarchy.styles = new Styles();
  }

  constructor() {
    game.system.anarchy.hooks.register(HOOK_LOAD_STYLES);
    Hooks.once(HOOK_LOAD_STYLES, styles => DEFAULT_STYLES.forEach(it => styles[it.cssClass] = it.name));
    Hooks.once('ready', () => this.onReady());
    this.styles = {};
  }
  async onReady() {
    Hooks.callAll(HOOK_LOAD_STYLES, this.styles);
    console.log(LOG_HEAD + 'Loaded styles', this.styles);
    Hooks.off(HOOK_LOAD_STYLES, () => { });

    game.settings.register(SYSTEM_NAME, DEFAULT_CSS_CLASS, {
      scope: "world",
      name: game.i18n.localize(ANARCHY.settings.defaultCssClass.name),
      hint: game.i18n.localize(ANARCHY.settings.defaultCssClass.hint),
      config: true,
      default: CSS_DEFAULT,
      choices: this.styles,
      type: String
    });
  }
  selectCssClass(style = undefined) {
    if (style && this.styles[style]) {
      return style;
    }
    return game.settings.get(SYSTEM_NAME, DEFAULT_CSS_CLASS);
  }

}