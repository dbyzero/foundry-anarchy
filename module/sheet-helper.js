
export class SheetHelper {

  static getItemId(event) {
    return $(event.currentTarget).closest('.item').attr('data-item-id')
      ?? $(event.currentTarget).closest('.anarchy-metatype').attr('data-item-id');
  }

  static getItemType(event) {
    return $(event.currentTarget).closest('.define-item-type').attr('data-item-type');
  }

  static getWordId(event) {
    return $(event.currentTarget).closest('.define-wordType').attr('data-word-id')
  }

  static getWordType(event) {
    return $(event.currentTarget).closest('.define-wordType').attr('data-word-type')
  }
}
