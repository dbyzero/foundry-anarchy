import { SYSTEM_PATH } from "./constants.js";

const faClassD6 = [
  'fas fa-dice',
  'fas fa-dice-one',
  'fas fa-dice-two',
  'fas fa-dice-three',
  'fas fa-dice-four',
  'fas fa-dice-five',
  'fas fa-dice-six',
]
export class Icons {

  static fontAwesome(faClass) {
    return `<i class="${faClass}"></i>`;
  }
  static iconSrc(src, cssClasses) {
    return `<img class="${cssClasses}" src="${SYSTEM_PATH}/${src}" />`;
  }

  static iconD6(dice) {
    if (dice < 0 || dice > 6) {
      throw `Dice ${dice} is out of dice range [1..6] or 0 for multidice`;
    }
    return Icons.fontAwesome(faClassD6[dice]);
  }
}