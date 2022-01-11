import { ANARCHY } from "./config.js";
import { LOG_HEAD, SYSTEM_NAME } from "./constants.js";

export const HOOK_LOAD_STYLES = 'anarchy-loadStyles';

const DEFAULT_CSS_CLASS = 'default-css-class';
const CSS_DEFAULT = 'style-anarchy-shadowrun';

const DEFAULT_STYLES = [
  { name: 'Shadowrun Anarchy', cssClass: CSS_DEFAULT },
  { name: 'Dark', cssClass: 'style-dark' },
  { name: 'Dark glass', cssClass: 'style-darkglass' },
]

/**
 * The Styles class manages the addition of different styles
 */
export class Styles {
  constructor() {
    game.system.anarchy.hooks.register(HOOK_LOAD_STYLES);
    Hooks.once(HOOK_LOAD_STYLES, styles => DEFAULT_STYLES.forEach(it => styles[it.cssClass] = it.name));
    Hooks.once('ready', () => this.onReady());
    this.availableStyles = {};
  }

  async onReady() {
    Hooks.callAll(HOOK_LOAD_STYLES, this.availableStyles);
    console.log(LOG_HEAD + 'Loaded styles', this.availableStyles);
    Hooks.off(HOOK_LOAD_STYLES, () => { });

    game.settings.register(SYSTEM_NAME, DEFAULT_CSS_CLASS, {
      scope: "world",
      name: game.i18n.localize(ANARCHY.settings.defaultCssClass.name),
      hint: game.i18n.localize(ANARCHY.settings.defaultCssClass.hint),
      config: true,
      default: CSS_DEFAULT,
      choices: this.availableStyles,
      type: String
    });
  }

  selectCssClass(style = undefined) {
    if (style && this.availableStyles[style]) {
      return style;
    }
    style = game.settings.get(SYSTEM_NAME, DEFAULT_CSS_CLASS);
    return this.availableStyles[style] ? style : CSS_DEFAULT;
  }

}