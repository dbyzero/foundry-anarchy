import { SYSTEM_NAME, TEMPLATES_PATH } from "../constants.js";
import { RemoteCall } from "../remotecall.js";

const CONVERGENCES = "convergences";
const ROLL_CONVERGENCE = 'GMConvergence.rollConvergence';

const HBS_TEMPLATE_CONVERGENCE = `${TEMPLATES_PATH}/app/gm-convergence.hbs`
const HBS_TEMPLATE_CONVERGENCE_ACTORS = `${TEMPLATES_PATH}/app/gm-convergence-actors.hbs`;
export class GMConvergence {

  constructor() {
    game.settings.register(SYSTEM_NAME, CONVERGENCES, {
      scope: "world",
      config: false,
      default: [],
      type: Array
    });
    this.convergences = game.settings.get(SYSTEM_NAME, CONVERGENCES);
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    await loadTemplates([
      HBS_TEMPLATE_CONVERGENCE,
      HBS_TEMPLATE_CONVERGENCE_ACTORS
    ]);
    await RemoteCall.register(ROLL_CONVERGENCE, {
      callback: data => this.rollConvergence(data.actorId, data.convergence),
      condition: user => user.isGM
    });
  }

  getConvergences() {
    return this.convergences;
  }

  async rollConvergence(actorId, convergence) {
    if (!RemoteCall.call(ROLL_CONVERGENCE, { actorId: actorId, convergence: convergence })) {
      const actor = game.actors.get(actorId);
      const rollConvergence = new Roll(`${convergence}dgcf=1[${ROLL_THEME['drain']}]`);
      await rollConvergence.evaluate({ async: true });
      if (rollConvergence.result != 0) {
        this.addConvergence(actorId, rollConvergence);
      }
    }
  }

  async addConvergence(actorId, rollConvergence) {
    let c = this.convergences.find(it => it.actorId == actorId);
    if (!c) {
      c = { actorId: actorId, convergence: 0 };
      this.convergences.push(c);
    }
    c.convergence += rollConvergence.result;
    this.convergences = this.convergences.filter(it => it.convergence <= 0);
    game.settings.set(SYSTEM_NAME, CONVERGENCES, this.convergences);
    await this._rebuild();
  }

  async activateListeners(html) {
    this.toolbar = html.find(".gm-convergence-bar");
    await this._rebuild();
  }

  async _rebuild() {
    this.toolbar.find('.gm-convergence-bar').replaceWith(await this._renderBar());
    this.toolbar.find('a.click-convergence-element').click(async (event) => await this._onClickConvergence(event));
  }


  async _onClickConvergence(event) {
    // const monitor = $(event.currentTarget).closest('.checkbar-root').attr('data-monitor-code');
    // const index = Number.parseInt($(event.currentTarget).attr('data-index'));
    // const isChecked = $(event.currentTarget).attr('data-checked') == 'true';
    // const newAnarchy = index + (isChecked ? 0 : 1);
  }

  async _renderBar() {
    return await renderTemplate(HBS_TEMPLATE_CONVERGENCE_ACTORS, {
      convergence: this.convergences.map(it => mergeObject({ actor: game.actors.get(it.actorId) }, it))
    });
  }

}
