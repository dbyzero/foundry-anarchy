import { ANARCHY } from "../config.js";
import { GLITCH_COLORSET, RISK_COLORSET } from "./dice.js";

const ROLL_THEME = {}

export class AnarchyRoll {
  static ROLL_THEME_POOL;
  static init() {
    Hooks.once('ready', () => AnarchyRoll.onReady());
  }

  static onReady() {
    Object.entries(ANARCHY.common.roll.rollTheme).forEach(entry => {
      ROLL_THEME[entry[0]] = game.i18n.localize(entry[1]);
    });
  }

  /**
   * @param {*} param : { pool: 1, reroll: 0, risk: 0, rerollForced: 0, target: 5 }
   */
  constructor(param) {
    this.param = mergeObject(param, { pool: 1, reroll: 0, risk: 0, glitch: 0, rerollForced: 0, target: 5 }, { overwrite: false });
    this.subrolls = {
      roll: undefined,
      reroll: undefined,
      removed: undefined,
      rerollForced: undefined,
      risk: undefined,
      glitch: undefined,
    }
    this.outcome = 'nothing'
    this.glitch = 0;
    this.prowess = 0;
    this.total = 0;
  }


  async evaluate() {
    await this.rollPool();
    await this.rollRerolls();
    await this.rollRerollForced();
    await this.rollGlitchDice();
    await this.rollAnarchyRisk();
    this.determineOutcome();
  }

  async rollPool() {
    this.subrolls.pool = new Roll(`${this.param.pool}d6cs>=${this.param.target}[${ROLL_THEME['dicePool']}]`)
    await this.subrolls.pool.evaluate({ async: true })
    this.total = this.subrolls.pool.total;
  }

  async rollRerolls() {
    const rerolls = Math.min(this.param.pool - this.total, this.param.reroll);
    if (rerolls > 0) {
      this.subrolls.reroll = new Roll(`${rerolls}d6cs>=${this.param.target}[${ROLL_THEME['reroll']}]`);
      await this.subrolls.reroll.evaluate({ async: true });
      this.total += this.subrolls.reroll.total;
    }
  }

  async rollRerollForced() {
    const removed = Math.min(this.total, this.param.rerollForced);
    if (removed > 0) {
      this.subrolls.removed = new Roll(`-${removed}d1cf=1[${ROLL_THEME['removed']}]`)
      await this.subrolls.removed.evaluate({ async: true })
      this.subrolls.rerollForced = new Roll(`${removed}d6cs>=${this.param.target}[${ROLL_THEME['rerollRemoved']}]`)
      await this.subrolls.rerollForced.evaluate({ async: true })
      this.total -= removed;
      this.total += this.subrolls.rerollForced.total;
    }
  }

  async rollGlitchDice() {
    if (this.param.glitch > 0) {
      this.subrolls.glitch = new Roll(`${this.param.glitch}dgcs=0[${ROLL_THEME['glitch']}]`);
      await this.subrolls.glitch.evaluate({ async: true })
      this.subrolls.glitch.dice[0].options.appearance = { colorset: GLITCH_COLORSET };
      this.glitch += this.subrolls.glitch.terms[0].results.filter(it => it.result == 1).length;
    }
  }

  async rollAnarchyRisk() {
    if (this.param.risk > 0) {
      this.subrolls.risk = new Roll(`${this.param.risk}drcs>=5[${ROLL_THEME['anarchyRisk']}]`);
      await this.subrolls.risk.evaluate({ async: true })
      this.subrolls.risk.dice[0].options.appearance = { colorset: RISK_COLORSET };
      this.glitch += this.subrolls.risk.terms[0].results.filter(it => it.result == 1).length;
      this.prowess += this.subrolls.risk.terms[0].results.filter(it => it.result >= 5).length;
      if (this.subrolls.risk.total > 0) {
        this.total++;
      }
    }
  }

  determineOutcome() {
    this.outcome = (this.glitch > this.prowess
      ? 'glitch'
      : this.glitch < this.prowess
        ? 'prowess'
        : this.glitch > 0
          ? 'nothing' // TODO: replace with an even glitch/exploit?
          : 'nothing');
  }

  async toMessage(messageData, options) {
    options = mergeObject(options ?? {}, { create: true });
    return await this.toGroupedRoll().toMessage(messageData, options);
  }

  toGroupedRoll() {
    let index = 1;
    let rolls = [];

    this._addRoll(rolls, this.subrolls.pool);
    this._addRoll(rolls, this.subrolls.reroll);
    this._addRoll(rolls, this.subrolls.removed);
    this._addRoll(rolls, this.subrolls.rerollForced);
    this._addRoll(rolls, this.subrolls.risk);
    this._addRoll(rolls, this.subrolls.glitch);

    rolls.forEach(r => r.dice[0].options.rollOrder = (index++));

    return Roll.fromTerms([PoolTerm.fromRolls(rolls)]);
  }

  _addRoll(rolls, roll) {
    if (roll) {
      rolls.push(roll);
    }
  }

  async _displayDice(roll) {
    if (roll) {
      game.dice3d?.showForRoll(roll);
    }
  }

  get hits() {
    return this.total;
  }

  get pool() {
    return this.param?.pool ?? 0;
  }
}
