
export class SheetHelper {

  static getItem(event, actor) {
    return actor.items.get(SheetHelper.getItemId(event));
  }

  static getItemId(event) {
    return SheetHelper.getEventItemData(event, "item-id");
  }
  static getItemType(event) {
    return SheetHelper.getEventItemData(event, "item-type", ".define-item-type");
  }

  static getEventItemData(event, property, parentclass = ".item") {
    const node = SheetHelper.getEventElement(event, parentclass);
    return node?.data(property);
  }

  static getEventElement(event, parentclass = ".item") {
    return $(event.currentTarget)?.parents(parentclass);
  }
}
