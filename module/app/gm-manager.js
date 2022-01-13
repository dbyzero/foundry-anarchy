import { HandleDragApplication } from "./handle-drag.js";
import { ANARCHY } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";
import { GMDifficulty } from "./gm-difficulty.js";


const GM_MANAGER = "gm-manager";
const GM_MANAGER_POSITION = "gm-manager-position";
const GM_MANAGER_INITIAL_POSITION = { top: 200, left: 200 };
const GM_MANAGER_TEMPLATE = 'systems/anarchy/templates/app/gm-manager.hbs';

export class GMManager extends Application {

  constructor() {
    super();
    this.gmAnarchy = game.system.anarchy.gmAnarchy;
    this.gmDifficulty = new GMDifficulty();
    this.handleDrag = new HandleDragApplication(
      doc => doc.getElementById("gm-manager"),
      {
        initial: GM_MANAGER_INITIAL_POSITION,
        maxPos: { left: 200, top: 100 },
        settings: {
          system: SYSTEM_NAME,
          keyPosition: GM_MANAGER_POSITION
        }
      })
    Hooks.once('ready', () => this.onReady());
  }

  onReady() {
    if (game.user.isGM) {
      game.system.anarchy.gmManager.render(true);
    }
  }

  /* -------------------------------------------- */
  static get defaultOptions() {
    let options = super.defaultOptions;
    options.id = GM_MANAGER;
    options.title = game.i18n.localize(ANARCHY.gmManager.title);
    options.template = GM_MANAGER_TEMPLATE;
    options.popOut = false;
    options.resizable = false;
    options.height = "auto";
    options.width = "auto";
    return options;
  }
  async render(force, options) {
    if (game.user.isGM) {
      await super.render(force, options);
    }
  }
  getData() {
    this.handleDrag.setPosition();
    return {
      anarchy: this.gmAnarchy.getAnarchy(),
      difficultyPools: this.gmDifficulty.getDifficultyData(),
      ANARCHY: ANARCHY,
      options: {
        classes: [game.system.anarchy.styles.selectCssClass()]
      }
    }
  }

  async activateListeners(html) {
    super.activateListeners(html);

    html.find('.app-title-bar').mousedown(event => this.handleDrag.onMouseDown(event));

    this.gmAnarchy.activateListeners(html)
    this.gmDifficulty.activateListeners(html)

  }
}

