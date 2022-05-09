import { ANARCHY } from "./config.js";

export class ErrorManager {

  static checkSufficient(resource, required, available) {
    if (required > available) {
      const error = game.i18n.format(ANARCHY.common.errors.insufficient, {
        resource: game.i18n.localize(resource),
        required: required,
        available: available
      });
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkOutOfRange(resource, value, min, max) {
    if (value < min || value > max) {
      const error = game.i18n.format(ANARCHY.common.errors.outOfRange, {
        resource: game.i18n.localize(resource),
        value: value, min: min, max: max
      });
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkUserGM() {
    if (!game.user.isGM) {
      const error = game.i18n.localize(ANARCHY.common.errors.onlyGM);
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkItemType(item, expectedType) {
    if (item.type != expectedType) {
      const error = game.i18n.format(ANARCHY.common.errors.expectedType, {
        type: game.i18n.localize(item.type ? (ANARCHY.itemType.singular[item.type]) : item.type),
        expectedType: game.i18n.localize(expectedType)
      });
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkWeaponDefense(weapon, actor) {
    const defense = weapon.getDefense();
    if (!defense) {
      const error = game.i18n.format(ANARCHY.common.errors.noDefenseOnWeapon, { actor: actor.name, weapon: weapon.name });
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkMonitorForDamage(damageType, monitor, actor) {
    if (!monitor) {
      const error = game.i18n.format(ANARCHY.common.errors.actorCannotReceiveDamage, {
        actor: actor.name,
        damageType: game.i18n.format('ANARCHY.actor.monitors.' + damageType)
      });
      ui.notifications.error(error);
      throw error;
    }
  }
}