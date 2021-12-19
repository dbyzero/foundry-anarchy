import { HandleDragApplication } from "./handle-drag.js";
import { SRA } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";

const ANARCHY_MANAGER = "anarchy-manager";
const ANARCHY_MANAGER_POSITION = "anarchy-manager-position";
const ANARCHY_GM = "anarchy-gm";
const ANARCHY_MANAGER_INITIAL_POSITION = { top: 200, left: 200 };
const GM_ANARCHY_TEMPLATE = 'systems/shadowrun-anarchy/templates/app/gm-anarchy.hbs';

export class GMAnarchy extends Application {

  static init() {
    game.settings.register(SYSTEM_NAME, ANARCHY_GM, {
      scope: "world",
      config: false,
      default: 1,
      type: Number
    });
  }

  static create() {
    return new GMAnarchy();
  }

  constructor() {
    super();
    this.anarchy = game.settings.get(SYSTEM_NAME, ANARCHY_GM);
    this.handleDrag = new HandleDragApplication(
      doc => doc.getElementById("anarchy-manager"),
      {
        initial: ANARCHY_MANAGER_INITIAL_POSITION,
        maxPos: { left: 200, top: 100 },
        settings: {
          system: SYSTEM_NAME,
          keyPosition: ANARCHY_MANAGER_POSITION
        }
      }
    )
    console.log('constructor', this);
  }

  /* -------------------------------------------- */
  static get defaultOptions() {
    let options = super.defaultOptions;
    options.id = ANARCHY_MANAGER;
    options.title = game.i18n.localize(SRA.anarchy.title);
    options.template = GM_ANARCHY_TEMPLATE;
    options.popOut = false;
    options.resizable = false;
    options.height = "auto";
    options.width = 200;
    console.log('defaultOptions', options);
    return options;
  }

  getData() {
    this.handleDrag.setPosition();
    return {
      anarchy: this.anarchy,
      SRA: SRA
    }
  }

  async updateDisplay() {

  }

  async activateListeners(html) {
    super.activateListeners(html);
    console.log('activateListeners', html);

    await this.updateDisplay();

    html.find('.anarchy-manager-move-handle').mousedown(event => this.handleDrag.onMouseDown(event));
  }

  _handleMoveRightClick() {
    this.position = ANARCHY_MANAGER_INITIAL_POSITION;
    game.settings.set(SYSTEM_NAME, ANARCHY_MANAGER_POSITION, this.position);
    this._setPosition(this.position);
  }
}

