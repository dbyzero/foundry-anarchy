import { Enums, hbsMonitorLetters, hbsMonitors } from "./enums.js";

export class Damage {
  static monitor(code) {
    return game.i18n.localize(Enums.getFromList(hbsMonitors, code) ?? "");
  }

  static letter(code) {
    return game.i18n.localize(Enums.getFromList(hbsMonitorLetters, code) ?? "");
  }
}