
export class SheetHelper {

  static getItem(event, actor) {
    return actor.items.get(SheetHelper.getItemId(event));
  }

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

  static getClosestElementData(event, property, parentclass = ".item") {
    return $(event.currentTarget).closest(parentclass).attr('data-' + property);
  }

  static getEventData(event, property) {
    return $(event.currentTarget).attr('data-' + property);
  }

  static getClosestElement(event, parentclass = ".item") {
    return $(event.currentTarget).closest(parentclass);
  }

}
