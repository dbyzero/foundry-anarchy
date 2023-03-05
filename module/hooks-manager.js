import { CHECKBARS, Checkbars } from "./common/checkbars.js";
import { ANARCHY } from "./config.js";
import { LOG_HEAD, SYSTEM_NAME } from "./constants.js";

export const ANARCHY_HOOKS = {
  /**
   * Hook to declare template data migrations
   */
  DECLARE_MIGRATIONS: 'anarchy-declareMigration',
  /**
   * Hook used to declare additional styles available
   */
  REGISTER_STYLES: 'anarchy-registerStyles',
  /**
   * Hook allowing to register additional roll parameters
   */
  REGISTER_ROLL_PARAMETERS: 'anarchy-registerRollParameters',
  /**
   * Hook allowing to modify some parameters (from Anarchy hacks modules).
   * Setting property ignore=true allows to remove the parameter.
   */
  MODIFY_ROLL_PARAMETER: 'anarchy-forbidRollParameter',
  /**
   * Hook allowing to provide alternate skill sets for Anarchy hack modules
   */
  PROVIDE_SKILL_SET: 'anarchy-provideSkillSet',
  /**
   * Hook allowing to provide alternate way to apply damages for Anarchy hack modules
   */
  PROVIDE_DAMAGE_MODE: 'anarchy-provideDamageMode',
  /**
   * Hook allowing to provide alternate way to apply damages for Anarchy hack modules
   */
  ANARCHY_HACK: 'anarchy-hack',
}

const SETTING_KEY_ANARCHY_HACK = `${SYSTEM_NAME}.${ANARCHY_HOOKS.ANARCHY_HACK}`;

const SHADOWRUN_ANARCHY_NO_HACK = {
  id: SYSTEM_NAME,
  name: 'Standard Shadowrun Anarchy',
  hack: {
    checkbars: () => CHECKBARS
  }
};

export class HooksManager {

  constructor() {
    this.hooks = [];
    this.hacks = {};
    this.hackNames = {};
    this._register(ANARCHY_HOOKS.ANARCHY_HACK);
    Hooks.on(ANARCHY_HOOKS.ANARCHY_HACK, register => register(SHADOWRUN_ANARCHY_NO_HACK));
    Hooks.on('updateSetting', async (setting, update, options, id) => this.onUpdateSetting(setting, update, options, id));
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    Hooks.callAll(ANARCHY_HOOKS.ANARCHY_HACK, (hack) => {
      this.hacks[hack.id] = hack;
      this.hackNames[hack.id] = hack.name;
    });
    game.settings.register(SYSTEM_NAME, ANARCHY_HOOKS.ANARCHY_HACK, {
      scope: "world",
      name: game.i18n.localize(ANARCHY.settings.anarchyHack.name),
      hint: game.i18n.localize(ANARCHY.settings.anarchyHack.hint),
      config: true,
      default: SHADOWRUN_ANARCHY_NO_HACK.id,
      choices: this.hackNames,
      type: String
    });
    this.applySelectedAnarchyHack();
  }

  async onUpdateSetting(setting, update, options, id) {
    if (setting.key == SETTING_KEY_ANARCHY_HACK) {
      this.applySelectedAnarchyHack();
    }
  }

  applySelectedAnarchyHack() {
    const selectedHack = this.hacks[game.settings.get(SYSTEM_NAME, ANARCHY_HOOKS.ANARCHY_HACK)];
    if (selectedHack) {
      Checkbars.hackCheckbars(selectedHack.hack.checkbars());
    }
  }

  static instance() {
    return game.system.anarchy.hooks;
  }

  static register(name) {
    HooksManager.instance()._register(name);
  }

  _register(name) {
    console.log(LOG_HEAD + 'HooksManager.register', name);
    if (!name.startsWith(SYSTEM_NAME + '-')) {
      throw "For safety Anarchy Hooks names must be prefixed by anarchy'-'"
    }
    this.hooks.push(name);
  }

}