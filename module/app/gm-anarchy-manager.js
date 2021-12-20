import { HandleDragApplication } from "./handle-drag.js";
import { SRA } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";
import { ErrorManager } from "../error-manager.js";
import { Users } from "../users.js";
import { RemoteCall } from "../remotecall.js";

const ANARCHY_MANAGER = "anarchy-manager";
const ANARCHY_MANAGER_POSITION = "anarchy-manager-position";
const ANARCHY_GM = "anarchy-gm";
const ANARCHY_MANAGER_INITIAL_POSITION = { top: 200, left: 200 };
const GM_ANARCHY_TEMPLATE = 'systems/shadowrun-anarchy/templates/app/gm-anarchy-manager.hbs';

const GM_ADD_ANARCHY = 'GMAnarchyManager.addAnarchy';

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
    game.system.sra.gmAnarchyManager = new GMAnarchyManager();

    if (game.user.isGM) {
      game.system.sra.gmAnarchyManager.render(true);
    }

    RemoteCall.register(GM_ADD_ANARCHY, {
      callback: data => game.system.sra.gmAnarchyManager.addAnarchy(data),
      condition: user => user.isGM
    });
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
      })
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
      value: this.getAnarchy(),
      max: this.getAnarchyMax(),
      SRA: SRA
    }
  }

  getAnarchy() {
    return this.anarchy;
  }

  getAnarchyMax() {
    return this.anarchy + 1;
  }

  async setAnarchy(newAnarchy) {
    this._saveAnarchy(newAnarchy);

    this.gmAnarchyBar.find('.checkbar-root')
      .replaceWith(await this._buildAnarchyCheckbar());
    this.gmAnarchyBar.find('a.click-checkbar-element')
      .click(async (event) => await this._onCheckbarClick(event));

    this._syncAllNPCSheetAnarchy();
  }

  async addAnarchy(count) {
    if (!RemoteCall.call(GM_ADD_ANARCHY, count)) {
      ErrorManager.checkSufficient(SRA.anarchy.gmAnarchy, -count, this.anarchy);
      await this.setAnarchy(this.anarchy + count);
    }
  }

  _syncAllNPCSheetAnarchy() {
    for (let actor of game.actors) {
      this._syncNPCSheetAnarchy(actor);
    }
    for (let token of game.canvas.tokens.documentCollection.values()) {
      if (token.actor && !token.data.actorLink) {
        this._syncNPCSheetAnarchy(token.actor);
      }
    }
  }

  _syncNPCSheetAnarchy(actor) {
    if (!actor.hasPlayerOwner) {
      console.log(`rendering NPC sheet for ${actor.name} , rendered=${actor.sheet?.rendered} `);
      actor.sheet.render(actor.sheet?.rendered);
    }
  }

  async updateDisplay() {

  }


  async activateListeners(html) {
    super.activateListeners(html);
    this.gmAnarchyBar = html.find(".gm-anarchy-bar");

    console.log('activateListeners', html);

    await this.updateDisplay(html);

    html.find('.anarchy-manager-move-handle').mousedown(event => this.handleDrag.onMouseDown(event));

    html.find('a.click-checkbar-element').click(async event => await this._onCheckbarClick(event));

  }

  async _onCheckbarClick(event) {
    const current = $(event.currentTarget);
    const index = Number.parseInt(current.attr('data-index'));
    const isChecked = current.attr('data-checked') == 'true';
    const newAnarchy = index + (isChecked ? 0 : 1);

    await this.setAnarchy(newAnarchy);
  }

  async _buildAnarchyCheckbar() {
    const htmlCheckBar = await renderTemplate("systems/shadowrun-anarchy/templates/common/checkbar.hbs", {
      code: 'anarchy',
      value: this.getAnarchy(),
      max: this.getAnarchyMax(),
      labelkey: SRA.anarchy.gmAnarchy,
      rowlength: 10,
      adjust: false,
      checkicon: 'fas fa-sun',
      uncheckicon: 'far fa-sun',
    });
    return htmlCheckBar;
  }

  _saveAnarchy(newAnarchy) {
    this.anarchy = newAnarchy;
    game.settings.set(SYSTEM_NAME, ANARCHY_GM, this.anarchy);
  }

}

