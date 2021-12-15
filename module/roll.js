export class SRARoll extends Roll {
  /**
   * @param {*} data : { pool: 1, reroll: 0, wild: 0, rerollsuccess: 0, target: 5 }
   */
  static create(data) {
    mergeObject(data, { pool: 1, reroll: 0, wild: 0, rerollsuccess: 0, target: 5}, {overwrite: false});
    const roll = new SRARoll(`${data.pool}d6cs>=${data.target}`);
    roll.data = data;
    roll.follow = {};
    return roll;
  }

  async evaluate() {
    await super.evaluate();

    let hits = this.hits;
    let failures = this.data.pool - hits;
    // reroll failures
    let rerollFailure = Math.min(failures, this.data.reroll);
    if (rerollFailure > 0) {
      this.follow.reroll = new Roll(`${rerollFailure}d6cs>=${data.target}`);
      await this.follow.reroll.evaluate();
      hits += this.follow.reroll.hits;
    }
    
    // reroll success
    let rerollSuccess = Math.min(this.hits, this.data.rerollsuccess);
    if (rerollSuccess > 0) {
      hits -= rerollSuccess;
      this.follow.rerollsuccess = new Roll(`${rerollSuccess}d6cs>=${data.target}`)
      await this.follow.rerollsuccess.evaluate();
      hits += this.follow.rerollsuccess.hits;
    }
    if (this.data.wild > 0) {
      this.follow.wild = new Roll(`${this.data.wild}d6cf=1cs>=5`);
      await this.follow.wild.evaluate();
    }

    failures = this.data.pool - hits;

    return this;
  }

  toJSON() {
    const data = super.toJSON();
    data.class = 'Roll';
    return data;
  }

  get sides() {
    if (this.terms) {
      return this.terms[0].results.map(result => result.result);
    }
    return this.parts[0].rolls.map(roll => roll.roll);
  }

  count(side) {
    return this.sides.filter(it => it === side).length;
  }

  get hits() {
    return this.total || 0;
  }

  get pool() {
    if (this.terms) {
      return this.dice[0].number;
    }

    return this.parts[0].rolls.length;
  }
}
