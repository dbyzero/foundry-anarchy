
export class SheetHelper {

  static getItem(event, actor) {
    return actor.items.get(SheetHelper.getItemId(event));
  }

  static getItemId(event) {
    return SheetHelper.getClosestElementData(event, "item-id");
  }
  static getItemType(event) {
    return SheetHelper.getClosestElementData(event, "item-type", ".define-item-type");
  }

  static getClosestElementData(event, property, parentclass = ".item") {
    const node = SheetHelper.getClosestElement(event, parentclass);
    return node?.data(property);
  }

  static getEventData(event, property) {
    return event.currentTarget.attributes['data-'+property]?.value;
  }

  static getClosestElement(event, parentclass = ".item") {
    return $(event.currentTarget).closest(parentclass);
  }
}
