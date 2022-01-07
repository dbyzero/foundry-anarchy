import { SYSTEM_DESCRIPTION, SYSTEM_NAME, SYSTEM_PATH } from "../constants.js";

const GLITCH_COLORSET = 'anarchy-glitch';
const RISK_COLORSET = 'anarchy-risk';
const DICE_GLITCH = `${SYSTEM_PATH}/style/danger-point.webp`;
const DICE_NOTHING = `${SYSTEM_PATH}/style/anarchy-point-off.webp`;
const DICE_PROWESS = `${SYSTEM_PATH}/style/anarchy-point.webp`;

export class AnarchyDice {
  static dice3d = undefined;

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
    AnarchyDice.dice3d = dice3d;
    game.settings.set("dice-so-nice", "enabledSimultaneousRollForMessage", false);
    dice3d.addSystem({ id: SYSTEM_NAME, name: SYSTEM_DESCRIPTION }, "preferred");
    /*
     * See guides:
     * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Hooks
     * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Customization
     */
    dice3d.addColorset(AnarchyGlitchDie.diceSoNiceColorSet());
    dice3d.addColorset(AnarchyRiskDie.diceSoNiceColorSet());
    dice3d.addDicePreset(AnarchyGlitchDie.diceSoNiceData());
    dice3d.addDicePreset(AnarchyRiskDie.diceSoNiceData());
  }

  static img(path) {
    return `<img src="${path}" />`
  }
}


export class AnarchyGlitchDie extends Die {
  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }

  /** @override */
  getResultLabel(result) {
    switch (result.result) {
      case "1": return AnarchyDice.img(DICE_GLITCH);
    }
    return result.result.toString();
  }

  /** @override */
  static DENOMINATION = "g";

  static diceSoNiceColorSet() {
    return {
      name: GLITCH_COLORSET,
      description: "Anarchy Dice - Glitch",
      category: "Anarchy",
      foreground: "white",
      background: "#5c0a5c",
      outline: "#000000",
      edge: "#e5e7c3",
      texture: "poison",
      material: 'metal',
    }
  }

  static diceSoNiceData() {
    return {
      type: "dg",
      labels:
        [DICE_GLITCH, "2", "3", "4", "5", "6"],
      colorset: GLITCH_COLORSET,
      system: SYSTEM_NAME
    }
  }

}

export class AnarchyRiskDie extends Die {
  constructor(termData) {
    termData.faces = 6;
    super(termData);
  }

  static DENOMINATION = "r";

  /** @override */
  getResultLabel(result) {
    switch (result.result) {
      case "1": return AnarchyDice.img(DICE_GLITCH);
      case "5": return AnarchyDice.img(DICE_PROWESS);
      case "6": return AnarchyDice.img(DICE_PROWESS);
    }
    return result.result.toString();
  }



  static diceSoNiceColorSet() {
    return {
      name: RISK_COLORSET,
      description: "Anarchy Dice - Risk",
      category: "Anarchy",
      foreground: "#faecd1",
      background: "#040101",
      outline: "none",
      edge: "none",
      texture: "fire",
      material: 'metal',
    }
  }

  static diceSoNiceData() {
    return {
      type: "dr",
      labels:
        [DICE_GLITCH, "2", "3", "4", DICE_PROWESS, DICE_PROWESS],
      colorset: RISK_COLORSET,
      system: SYSTEM_NAME
    }
  }
}

