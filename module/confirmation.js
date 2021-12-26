import { SRA } from "./config.js";
import { Icons } from "./icons.js";

export class ConfirmationDialog {

  static async confirmDeleteItem(item, onConfirm = () => { }) {
    let dialog = new Dialog({
      title: game.i18n.localize(SRA.common.confirmation.del),
      content: game.i18n.format(SRA.common.confirmation.delitem, {
        name: item.name,
        type: game.i18n.localize(SRA.itemType.singular[item.type])
      }),
      buttons: {
        delete: {
          icon: Icons.fontAwesome('fas fa-check'),
          label: game.i18n.localize(SRA.common.del),
          callback: onConfirm
        },
        cancel: {
          icon: Icons.fontAwesome('fas fa-times'),
          label: game.i18n.localize(SRA.common.cancel)
        }
      },
      default: "cancel"
    });
    dialog.render(true);
  }
}