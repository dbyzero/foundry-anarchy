import { HandleDragApplication } from "./handle-drag.js";
import { SRA } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";
import { GMAnarchy } from "./gm-anarchy.js";

const GM_MANAGER = "gm-manager";
const GM_MANAGER_POSITION = "gm-manager-position";
const GM_MANAGER_INITIAL_POSITION = { top: 200, left: 200 };
const GM_MANAGER_TEMPLATE = 'systems/shadowrun-anarchy/templates/app/gm-manager.hbs';


export class GMManager extends Application {

  static init() {

  }

  static create() {
    game.system.sra.gmManager = new GMManager();

    if (game.user.isGM) {
      game.system.sra.gmManager.render(true);
    }

  }

  constructor() {
    super();
    this.gmAnarchy = new GMAnarchy();
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
  }

  /* -------------------------------------------- */
  static get defaultOptions() {
    let options = super.defaultOptions;
    options.id = GM_MANAGER;
    options.title = game.i18n.localize(SRA.gmManager.title);
    options.template = GM_MANAGER_TEMPLATE;
    options.popOut = false;
    options.resizable = false;
    options.height = "auto";
    options.width = 200;
    return options;
  }

  getData() {
    this.handleDrag.setPosition();
    return {
      anarchy: this.gmAnarchy.getAnarchyData(),
      SRA: SRA
    }
  }

  async activateListeners(html) {
    super.activateListeners(html);

    html.find('.gm-manager-move-handle').mousedown(event => this.handleDrag.onMouseDown(event));

    this.gmAnarchy.activateListeners(html)

  }
}

