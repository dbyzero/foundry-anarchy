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

}