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
}