import { LOG_HEAD } from "./constants.js";

const HOOK_LOAD_STYLES = 'anarchy-loadStyles';

const DEFAULT_STYLES = [
  { name: 'Default', cssClass: 'style-anarchy' },
]

/**
 * The Styles class manages the addition of different styles
 */
export class Styles {
  static init() {
    game.system.anarchy.styles = new Styles();
  }

  constructor() {
    this.styles = [];
    game.system.anarchy.hooks.register(HOOK_LOAD_STYLES);
    Hooks.once(HOOK_LOAD_STYLES, list => list.push(...DEFAULT_STYLES));
    Hooks.once('ready', () => this.onReady());
  }
  async onReady() {
    Hooks.callAll(HOOK_LOAD_STYLES, this.styles);
    console.log(LOG_HEAD + 'Loaded styles', this.styles);
    Hooks.off(HOOK_LOAD_STYLES, () => { });
  }

}