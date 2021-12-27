import { ANARCHY } from "./config.js"

const essenceRange = [
  { from: 5, to: 6, adjust: 0 },
  { from: 3, to: 5, adjust: -1 },
  { from: 1, to: 3, adjust: -2 },
  { from: 0, to: 1, adjust: -3 }
]
export class Essence {

  static getAdjust(essence) {
    return this.getRangeDetails(essence)?.adjust ?? 0;
  }

  static getRangeDetails(essence) {
    return essenceRange.find(r => r.from < essence && essence <= r.to) ?? essenceRange[0];
  }
}