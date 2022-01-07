export class AnarchyRoll {

  /**
   * @param {*} param : { pool: 1, reroll: 0, risk: 0, rerollForced: 0, target: 5 }
   */
  constructor(param) {
    this.param = mergeObject(param, { pool: 1, reroll: 0, risk: 0, glitch: 0, rerollForced: 0, target: 5 }, { overwrite: false });
    this.subrolls = {
      roll: new Roll(`${this.param.pool}d6cs>=${this.param.target}`),
      reroll: undefined,
      rerollForced: undefined,
      outcome: 'nothing',
      risk: undefined,
      glitch: undefined
    }
    this.glitch = 0;
    this.prowess = 0;
    this.total = 0;
  }


  async evaluate() {
    await this.rollPool();
    await this.rollRerolls();
    await this.rollRerollsForced();
    await this.rollGlitchDice();
    await this.rollAnarchyRisk();
    await this.determineOutcome();
  }

  async rollPool() {
    await this.subrolls.roll.evaluate({ async: true })
    this.total = this.subrolls.roll.total;
  }

  async rollRerolls() {
    // reroll failures
    const rerollsFailures = Math.min(this.param.pool - this.total, this.param.reroll);
    if (rerollsFailures > 0) {
      this.subrolls.reroll = new Roll(`${rerollsFailures}d6cs>=${this.param.target}[reroll]`);
      await this.subrolls.reroll.evaluate({ async: true });
      this.total += this.subrolls.reroll.total;
    }
  }

  async rollRerollsForced() {
    // reroll success
    const rerollsSuccess = Math.min(this.total, this.param.rerollForced);
    if (rerollsSuccess > 0) {
      this.subrolls.rerollForced = new Roll(`${rerollsSuccess}d6cs>=${this.param.target}[forced]`)
      await this.subrolls.rerollForced.evaluate({ async: true })
      this.total += this.subrolls.rerollForced.total - rerollsSuccess;
    }
  }

  async rollGlitchDice() {
    if (this.param.glitch > 0) {
      this.subrolls.glitch = new Roll(`${this.param.glitch}d6cf=1[glitch]`);
      await this.subrolls.glitch.evaluate({ async: true })
      this.glitch += this.subrolls.glitch.terms[0].results.filter(it => it.result == 1).length;
    }
  }

  async rollAnarchyRisk() {
    if (this.param.risk > 0) {
      this.subrolls.risk = new Roll(`${this.param.risk}d6cs>=5[risk]`);
      await this.subrolls.risk.evaluate({ async: true })
      this.glitch += this.subrolls.risk.terms[0].results.filter(it => it.result == 1).length;
      this.prowess += this.subrolls.risk.total;
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

    const message = await this.subrolls.roll.toMessage(messageData, options);
    await this.subrolls.reroll?.toMessage(messageData, options);
    await this.subrolls.rerollForced?.toMessage(messageData, options);
    await this.subrolls.risk?.toMessage(messageData, options);
    await this.subrolls.glitch?.toMessage(messageData, options);
    // TODO:
    return message;
  }

  get hits() {
    return this.total;
  }

  get pool() {
    return this.param?.pool ?? 0;
  }
}
