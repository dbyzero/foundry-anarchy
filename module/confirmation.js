import { ANARCHY } from "./config.js";
import { Icons } from "./icons.js";

export class ConfirmationDialog {

  static async confirmDeleteItem(item, onConfirm = () => { }) {
    let dialog = new Dialog({
      title: game.i18n.localize(ANARCHY.common.confirmation.del),
      content: game.i18n.format(ANARCHY.common.confirmation.delitem, {
        name: item.name,
        type: game.i18n.localize(ANARCHY.itemType.singular[item.type])
      }),
      buttons: {
        delete: {
          icon: Icons.fontAwesome('fas fa-check'),
          label: game.i18n.localize(ANARCHY.common.del),
          callback: onConfirm
        },
        cancel: {
          icon: Icons.fontAwesome('fas fa-times'),
          label: game.i18n.localize(ANARCHY.common.cancel)
        }
      },
      default: "cancel"
    });
    dialog.render(true);
  }
}