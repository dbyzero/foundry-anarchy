import { TEMPLATES_PATH } from "../constants.js";
import { Misc } from "../misc.js";

const TEMPLATE_HUD_SHORTCUTS = `${TEMPLATES_PATH}/token/hud-shortcuts.hbs`;

export class HUDShortcuts {

  constructor() {
    Hooks.on('renderTokenHUD', async (app, html, data) => await this.addExtensionHud(app, html, data._id));
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    await loadTemplates([
      TEMPLATE_HUD_SHORTCUTS,
    ]);
  }

  /* -------------------------------------------- */
  async removeExtensionHud(app, html, tokenId) {
    html.find('.control-icon.anarchy-shortcuts').remove();
  }

  async addExtensionHud(app, html, tokenId) {
    app.hasExtension = true;
    const token = canvas.tokens.get(tokenId);
    const actor = token.actor;

    const hud = await this._renderShortcuts(actor);
    html.find('.control-icon[data-action=combat]').after(hud);
  }

  async _renderShortcuts(actor) {
    const hbsHudData = {
      actor: actor,
      shortcuts: actor.getShortcuts(),
      options: {
        classes: [game.system.anarchy.styles.selectCssClass()]
      },
    };
    const html = await renderTemplate(TEMPLATE_HUD_SHORTCUTS, hbsHudData);
    const hud = $(html);
    const list = hud.find('.anarchy-shortcuts-list');

    this._toggleHudActive(hud, list);

    hud.find('.anarchy-shortcuts-toggle').click(event => {
      this._toggleHudActive(hud, list);
    });

    list.find('.anarchy-shortcut-button').click(event => {
      const actorId = $(event.currentTarget).closest('.anarchy-shortcuts-list').attr('data-actor-id');
      const shortcutType = $(event.currentTarget).attr('data-shortcut-type');
      const shortcutId = $(event.currentTarget).attr('data-shortcut-id');
      this.onClickShortcutButton(actorId, shortcutType, shortcutId);
    });
    return hud;
  }

  onClickShortcutButton(actorId, shortcutType, shortcutId) {
    const actor = game.actors.get(actorId);
    const shortcut = actor?.getShortcut(shortcutType, shortcutId);
    shortcut?.callback(actor);
  }

  _toggleHudActive(hud, list) {
    hud.toggleClass('active');
    Misc.showControlWhen(list, hud.hasClass('active'));
  }

}