import { SRA } from "./config.js";

export class ConfirmationDialog {

  static async confirmDeleteItem(item, onConfirm = () =>{} ) {
    let dialog = new Dialog({
      title: game.i18n.localize(SRA.common.confirmation.del),
      content: game.i18n.format(SRA.common.confirmation.delitem, {
          name: item.name,
          type: game.i18n.localize(SRA.itemType.singular[item.type])
        }),
      buttons: {
        delete: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(SRA.common.del),
          callback: onConfirm
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(SRA.common.cancel)
        }
      },
      default: "cancel"
    });
    dialog.render(true);
  }
}