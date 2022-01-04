
export class AnarchyGlitchDie extends Die {
  /** @override */
  static DENOMINATION = "g";

  static diceSoNiceData(system) {
    return {
      type: "dg",
      labels: ['1', '2', '3', '4', '5', '6'],
      system: system
    }
  }

  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }
}

export class AnarchyRiskDie extends Die {
  static DENOMINATION = "r";

  static diceSoNiceData(system) {
    return {
      type: "dr",
      labels: ['1', '2', '3', '4', '5', '6'],
      system: system
    }
  }

  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }
}


export class AnarchyDice {

  static init() {
    CONFIG.Dice.terms[AnarchyGlitchDie.DENOMINATION] = AnarchyGlitchDie;
    CONFIG.Dice.terms[AnarchyRiskDie.DENOMINATION] = AnarchyRiskDie;
    Hooks.once('diceSoNiceReady', (dice3d) => AnarchyDice.diceSoNiceReady(dice3d));
    Hooks.once('ready', () => AnarchyDice.onReady());
  }

  static onReady() {
    if (game.modules.get("dice-so-nice")?.active) {
      if (game.settings.get("core", "noCanvas")) {
        ui.notifications.warn("Dice So Nice! will not display dice sue to Foundry option 'Disable Game Canvas' ");
      }
    }
  }

  static diceSoNiceReady(dice3d) {
    for (const system of Object.keys(dice3d.DiceFactory.systems)) {
      dice3d.addDicePreset(AnarchyGlitchDie.diceSoNiceData(system));
      dice3d.addDicePreset(AnarchyRiskDie.diceSoNiceData(system));
    }
  }

}