import { SRA } from "./config.js";

export class ErrorManager {

  static checkSufficient(resource, required, available) {
    if (required > available) {
      const error = game.i18n.format(SRA.common.errors.insufficient, {
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
      const error = game.i18n.format(SRA.common.errors.outOfRange, {
        resource: game.i18n.localize(resource),
        value: value, min: min, max: max
      });
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkUserGM() {
    if (!game.user.isGM) {
      const error = game.i18n.localize(SRA.common.errors.onlyGM);
      ui.notifications.error(error);
      throw error;
    }
  }

  static checkItemType(item, expectedType) {
    if (item.type != expectedType) {
      const error = game.i18n.format(SRA.common.errors.expectedType, {
        type: game.i18n.localize(item.type ? (SRA.itemType.singular[item.type]) : item.type),
        expectedType: game.i18n.localize(expectedType)
      });
      ui.notifications.error(error);
      throw error;
    }
  }
}