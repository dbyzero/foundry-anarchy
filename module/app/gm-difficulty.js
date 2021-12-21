import { SRA } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";

const GM_DIFFICULTY_POOLS = "gm-difficulty-pools";

export class GMDifficulty {

  static init() {
    const defaultDifficulty = game.i18n.localize(SRA.gmManager.gmDifficulty.default);
    game.settings.register(SYSTEM_NAME, GM_DIFFICULTY_POOLS, {
      scope: "world",
      name: game.i18n.localize(SRA.gmManager.gmDifficulty.name),
      hint: game.i18n.localize(SRA.gmManager.gmDifficulty.hint),
      scope: "world",
      config: true,
      default: defaultDifficulty,
      type: String
    });
  }

  constructor() {
    this.loadDifficultySettings();
    Hooks.on("createSetting", async (setting, options, id) => this.onUpdateSetting(setting, options, id));
    Hooks.on("updateSetting", async (setting, options, id) => this.onUpdateSetting(setting, options, id));
  }
  
  async onUpdateSetting(setting, options, id){
    if (setting.key == `${SYSTEM_NAME}.${GM_DIFFICULTY_POOLS}`) {
      this.loadDifficultySettings();
      this._rebuild();
      game.system.sra.gmManager.render(false);
    }
  }

  loadDifficultySettings() {
    const setting = game.settings.get(SYSTEM_NAME, GM_DIFFICULTY_POOLS);
    this.difficultyPools = setting.split(',').map(it => {
      const kv = it.split(':');
      return { difficulty: kv[0], pool: kv[1] };
    });
  }

  getDifficultyData() {
    return this.difficultyPools;
  }

  async activateListeners(html) {
    this.toolbar = html.find(".gm-difficulty-bar");
    await this._rebuild();
  }

  async _rebuild() {
    this.toolbar.find('.gm-difficulty-bar').replaceWith(await this._renderBar());
    this.toolbar.find('a.click-roll-difficuty-pool').click(async (event) => await this._onClickDifficulty(event));
  }

  async _renderBar() {
    return await renderTemplate("systems/shadowrun-anarchy/templates/app/gm-difficulty-buttons.hbs", {
      difficultyPools: this.difficultyPools
    });
  }

  async _onClickDifficulty(event) {
    const pool = $(event.currentTarget).attr('data-pool');
    const difficulty = $(event.currentTarget).attr('data-difficulty');
    const roll = new Roll(`${pool}d6cs>=5`);
    await roll.evaluate();
    const flavor = game.i18n.format(SRA.gmManager.gmDifficulty.chatMessage, {
      pool: pool,
      difficulty:difficulty,
      success: roll.total
    });
    const message = await roll.toMessage({ flavor: flavor }, { create: false });
    ChatMessage.create(message);
  }
}