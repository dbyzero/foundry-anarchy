import { SRA } from "../config.js";
import { SYSTEM_NAME } from "../constants.js";
import { ErrorManager } from "../error-manager.js";
import { Icons } from "../icons.js";
import { RemoteCall } from "../remotecall.js";

const ANARCHY_GM = "anarchy-gm";
const GM_ADD_ANARCHY = 'GMManager.addAnarchy';

export class GMAnarchy {

  static init() {
    game.settings.register(SYSTEM_NAME, ANARCHY_GM, {
      scope: "world",
      config: false,
      default: 1,
      type: Number
    });

    RemoteCall.register(GM_ADD_ANARCHY, {
      callback: data => game.system.sra.gmManager.gmAnarchy.addAnarchy(data),
      condition: user => user.isGM
    });
  }

  constructor() {
    this.anarchy = game.settings.get(SYSTEM_NAME, ANARCHY_GM);
  }

  getAnarchyData() {
    return {
      value: this.getAnarchy(),
      max: this.getAnarchyMax(),
    }
  }

  getAnarchy() {
    return this.anarchy;
  }

  getAnarchyMax() {
    return this.anarchy + 1;
  }

  async addAnarchy(count) {
    if (!RemoteCall.call(GM_ADD_ANARCHY, count)) {
      ErrorManager.checkSufficient(SRA.gmManager.gmAnarchy, -count, this.anarchy);
      await this.setAnarchy(this.anarchy + count);
    }
  }

  async setAnarchy(newAnarchy) {
    this.anarchy = newAnarchy;
    game.settings.set(SYSTEM_NAME, ANARCHY_GM, newAnarchy);
    await this._rebuild();
    this._syncAllNPCSheetAnarchy();
  }

  async activateListeners(html) {
    this.toolbar = html.find(".gm-anarchy-bar");
    await this._rebuild();
  }

  async _rebuild() {
    this.toolbar.find('.checkbar-root').replaceWith(await this._renderBar());
    this.toolbar.find('a.click-checkbar-element').click(async (event) => await this._onClickAnarchyCheckbar(event));
  }

  async _onClickAnarchyCheckbar(event) {
    const current = $(event.currentTarget);
    const index = Number.parseInt(current.attr('data-index'));
    const isChecked = current.attr('data-checked') == 'true';
    const newAnarchy = index + (isChecked ? 0 : 1);

    await this.setAnarchy(newAnarchy);
  }

  async _renderBar() {
    return await renderTemplate("systems/shadowrun-anarchy/templates/common/checkbar.hbs", {
      code: 'anarchy',
      value: this.getAnarchy(),
      max: this.getAnarchyMax(),
      labelkey: SRA.gmManager.gmAnarchy,
      rowlength: 10,
      adjust: false,
      iconChecked: Icons.fontAwesome('fas fa-sun'),
      iconUnchecked: Icons.fontAwesome('far fa-sun'),
    });
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
      actor.sheet?.render(actor.sheet.rendered);
    }
  }
}