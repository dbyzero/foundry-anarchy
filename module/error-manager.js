import { SRA } from "./config.js";

export class ErrorManager {
  static insufficient(resource, required, available) {
    const error = game.i18n.format(SRA.common.errors.insufficient, {
      resource: game.i18n.localize(resource),
      required: required,
      available: available
    });
    ui.notifications.error(error);
    throw error;
  }
  
  static checkOutOfRange(resource, value, min, max) {
    if (value < min || value > max) {
      const error = game.i18n.format(SRA.common.errors.out_of_range, {
        resource: game.i18n.localize(resource),
        value: value, min: min, max: max
      });
      ui.notifications.error(error);
      throw error;
    }
  }
}