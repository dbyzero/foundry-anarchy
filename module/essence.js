import { SRA } from "./config.js"

const essenceRange = [
  {from:5, to: 6, code_i18n: SRA.essence.adjustments.from5_5to6, adjust: 0},
  {from:3, to: 5, code_i18n: SRA.essence.adjustments.from3_5to5, adjust: -1},
  {from:1, to: 3, code_i18n: SRA.essence.adjustments.from1_5to3, adjust: -2},
  {from:0, to: 1, code_i18n: SRA.essence.adjustments.from0_5to1, adjust: -3}
]
export class Essence{
  static getAdjustDescriptive(essence) {
    return this.getRangeDetails(essence)?.code_i18n;
  }
  
  static getAdjust(essence) {
    return this.getRangeDetails(essence)?.adjust ??0;
  }

  static getRangeDetails(essence) {
    return essenceRange.find(r => r.from < essence && essence <= r.to) ?? essenceRange[0];
  }
}