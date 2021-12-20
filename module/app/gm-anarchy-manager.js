import { HandleDragApplication } from "./handle-drag.js";
import { SRA } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";

const ANARCHY_MANAGER = "anarchy-manager";
const ANARCHY_MANAGER_POSITION = "anarchy-manager-position";
const ANARCHY_GM = "anarchy-gm";
const ANARCHY_MANAGER_INITIAL_POSITION = { top: 200, left: 200 };
const GM_ANARCHY_TEMPLATE = 'systems/shadowrun-anarchy/templates/app/gm-anarchy-manager.hbs';

export class GMAnarchyManager extends Application {

  static init() {
    game.settings.register(SYSTEM_NAME, ANARCHY_GM, {
      scope: "world",
      config: false,
      default: 1,
      type: Number
    });
  }

  static create() {
    return new GMAnarchyManager();
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
    return options;
  }

  getData() {
    this.handleDrag.setPosition();
    return {
      anarchy: Number(this.anarchy),
      maxAnarchy: Number(this.anarchy) + 1,
      SRA: SRA
    }
  }

  async updateDisplay() {
    
  }

  
  async activateListeners(html) {
    super.activateListeners(html);
    console.log('activateListeners', html);
    
    await this.updateDisplay(html);
    
    html.find('.anarchy-manager-move-handle').mousedown(event => this.handleDrag.onMouseDown(event));
    
    html.find('a.click-checkbar-element').click(async event => await this._onCheckbarClick(event));
    
  }
  
  async _onCheckbarClick(event) {
    const current = $(event.currentTarget);
    const gmAnarchyBar = current.closest('.gm-anarchy-bar');

    const index = Number.parseInt(current.attr('data-index'));
    const isChecked = current.attr('data-checked') == 'true';
    this._setAnarchy(index + (isChecked ? 0 : 1));

    gmAnarchyBar.find('.checkbar-root')
      .replaceWith(await this._buildAnarchyCheckbar());
    gmAnarchyBar.find('a.click-checkbar-element')
      .click(async event => await this._onCheckbarClick(event));
  }

  async _buildAnarchyCheckbar() {
    const htmlCheckBar = await renderTemplate("systems/shadowrun-anarchy/templates/common/checkbar.hbs", {
      code: 'anarchy',
      value: Number(this.anarchy),
      max: Number(this.anarchy) + 1,
      labelkey: SRA.anarchy.gmAnarchy,
      rowlength: 10,
      adjust: false,
      checkicon: 'fas fa-star',
      uncheckicon: 'far fa-star',
    });
    return htmlCheckBar;
  }
  
  _setAnarchy(newAnarchy) {
    this.anarchy = newAnarchy;
    game.settings.set(SYSTEM_NAME, ANARCHY_GM, this.anarchy);
  }

}

