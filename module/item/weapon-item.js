import { ICONS_PATH, TEMPLATE } from "../constants.js";
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
      this.data.data.monitor,
      this.data.data.damage,
      this.data.data.damageAttribute,
      this.parent?.data.data.attribute[this.data.data.damageAttribute]?.value
    );
  }

  static damageValue(monitor, damage, damageAttribute, actorAttribute) {
    let dmg = Number(damage);
    if (damageAttribute) {
      if (actorAttribute !== undefined) {
        dmg = dmg + Math.ceil(Number(actorAttribute) / 2);
      }
      else {
        console.warn('Weapon not attached to an actor');
        return game.i18n.localize(ANARCHY.item.weapon.weaponWithoutActor);
      }
    }
    return dmg;
  }

  getDamageCode() {
    return WeaponItem.damageCode(
      this.data.data.monitor,
      this.data.data.damage,
      this.data.data.damageAttribute,
    );
  }

  static damageCode(monitor, damage, damageAttribute) {
    let code = '';
    if (damageAttribute && ANARCHY.attributes[damageAttribute]) {
      code += game.i18n.localize(ANARCHY.attributes[damageAttribute]).substring(0, 3).toUpperCase() + '/2 + ';
    }
    code += String(damage);
    return code;
  }

  static armorMode(monitor, noArmor) {
    if (Checkbars.useArmor(monitor)) {
      return noArmor ? 'noArmor' : 'withArmor'
    }
    return '';
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
    return { value: this.data.data.range[range], labelkey: Enums.getFromList(Enums.getEnums().ranges, range) };
  }

  prepareShortcut() {
    return {
      img: this.img,
      label: this.name,
      callback: actor => actor.rollWeapon(this)
    };
  }

}