
export class SheetHelper {

  static getItemId(event) {
    return $(event.currentTarget).closest('.item').attr('data-item-id');
  }

  static getItemType(event) {
    return $(event.currentTarget).closest('.define-item-type').attr('data-item-type');
  }

  static getWord(event) {
    return $(event.currentTarget).closest('.define-wordlist').attr('data-word')
  }

  static getWordList(event) {
    return $(event.currentTarget).closest('.define-wordlist').attr('data-wordlist')
  }
}
