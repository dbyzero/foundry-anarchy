import { ICONS_PATH } from "../constants.js";
import { ANARCHY } from "../config.js";
import { Enums } from "../enums.js";
import { AnarchyBaseItem } from "./anarchy-base-item.js";
import { Checkbars } from "../common/checkbars.js";

export class WeaponItem extends AnarchyBaseItem {

  static get defaultIcon() {
    return `${ICONS_PATH}/weapons/mac-10.svg`;
  }

  isWeaponSkill(item) {
    return item.type == 'skill' && item.data.data.code === this.data.data.skill;
  }

  getDamageValue() {
    return WeaponItem.damageValue(
      this.data.data.damage,
      this.data.data.strength,
      this.parent?.data.data.attribute.strength.value
    );
  }

  static damageValue(monitor, damage, strength, actorStrength) {
    if (monitor == 'marks') {
      return '';
    }
    let dmg = Number(damage);
    if (strength) {
      if (actorStrength !== undefined) {
        dmg = dmg + Math.ceil(Number(actorStrength) / 2);
      }
      else {
        console.warn('Melee weapon not attached to an actor');
        return game.i18n.localize(ANARCHY.item.weapon.meleeWithoutActor);
      }
    }
    return dmg;
  }


  getDamageCode() {
    return WeaponItem.damageCode(
      this.data.data.monitor,
      this.data.data.damage,
      this.data.data.strength,
    );
  }

  static armorMode(monitor, noArmor) {
    if (Checkbars.useArmor(monitor)) {
      return noArmor ? 'noArmor' : 'withArmor'
    }
    return '';
  }

  static damageCode(monitor, damage, strength) {
    if (monitor == 'marks') {
      return '';
    }
    let code = '';
    if (strength) {
      code += game.i18n.localize(ANARCHY.attributes.strength).substring(0, 3).toUpperCase() + '/2 + ';
    }
    code += String(damage);
    return code;
  }

  getRanges() {
    let ranges = [
      this._getRange('short'),
    ]
    if (this.data.data.range.max != 'short') {
      ranges.push(this._getRange('medium'));
    }
    if (this.data.data.range.max == 'long') {
      ranges.push(this._getRange('long'));
    }
    return ranges
  }

  _getRange(range) {
    return { value: this.data.data.range[range], label: Enums.getFromList(Enums.getEnums().ranges, range) };
  }

}