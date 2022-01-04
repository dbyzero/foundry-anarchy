export class AnarchyRoll {

  /**
   * @param {*} param : { pool: 1, reroll: 0, risk: 0, rerollForced: 0, target: 5 }
   */
  constructor(param) {
    mergeObject(param, { pool: 1, reroll: 0, risk: 0, rerollForced: 0, target: 5 }, { overwrite: false });
    this.param = param;
    this.roll = new Roll(`${param.pool}d6cs>=${param.target}`)
    this.subrolls = {
    }
  }

  async evaluate() {
    await this.roll.evaluate({ async: true });

    this.subrolls.total = this.roll.total;

    // reroll failures
    let rerolls = Math.min(this.param.pool - this.subrolls.total, this.param.reroll);
    if (rerolls > 0) {
      this.subrolls.reroll = new Roll(`${rerolls}d6cs>=${this.param.target}`);
      await this.subrolls.reroll.evaluate({ async: true });
      this.subrolls.total += this.subrolls.reroll.total;
    }

    // reroll success
    rerolls = Math.min(this.subrolls.total, this.param.rerollForced);
    if (rerolls > 0) {
      this.subrolls.total -= rerolls;
      this.subrolls.rerollForced = new Roll(`${rerolls}d6cs>=${this.param.target}`)
      await this.subrolls.rerollForced.evaluate({ async: true });
      this.subrolls.total += this.subrolls.rerollForced.total;
    }
    // taking risks
    if (this.param.risk > 0) {
      this.subrolls.risk = new Roll(`${this.param.risk}d6cs>=5`);
      await this.subrolls.risk.evaluate({ async: true });
      this.subrolls.glitch = this.subrolls.risk.terms[0].results.filter(it => it.result == 1).length;
      this.subrolls.prowess = this.subrolls.risk.total;
      this.subrolls.riskDice = this.subrolls.risk.terms[0].results[0].result;
      if (this.subrolls.prowess) {
        this.subrolls.total++;
      }
      this.subrolls.risk.outcome = this.subrolls.prowess ? 'prowess' : this.subrolls.glitch ? 'glitch' : 'nothing';
    }
    return this;
  }

  async toMessage(messageData, options) {
    return await this.roll.toMessage(messageData, options);
  }

  get hits() {
    return this.subrolls?.total ?? 0;
  }

  get glitch() {
    return this.subrolls.glitch;
  }

  get prowess() {
    return this.subrolls.prowess;
  }

  get pool() {
    return this.param?.pool ?? 0;
  }
}
