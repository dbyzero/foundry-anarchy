import { SRA } from "../config.js";

export class Weapon {

  static getDamageValue(damage, strength, actorStrength) {
    let dmg = Number(damage);
    if (strength) {
      if (actorStrength !== undefined) {
        dmg = dmg + Math.ceil(Number(actorStrength) / 2);
      }
      else {
        console.warn('Melee weapon not attached to an actor');
        return game.i18n.localize(SRA.item.weapon.meleeWithoutActor);
      }
    }
    return dmg;
  }

  static getDamageCode(damage, strength) {
    let code = '';
    if (strength) {
      code += game.i18n.localize(SRA.attributes.strength).substring(0, 3).toUpperCase() + '/2 + ';
    }
    code += String(damage);
    return code;
  }
}