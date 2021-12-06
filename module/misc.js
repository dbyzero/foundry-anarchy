export class Misc {
  
  static ascending(orderFunction = x => x) {
    return (a, b) => Misc.sortingBy(orderFunction(a), orderFunction(b));
  }

  static descending(orderFunction = x => x) {
    return (a, b) => Misc.sortingBy(orderFunction(b), orderFunction(a));
  }

  static sortingBy(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }

  static distinct(array) {
    return [...new Set(array)];
  }

  static join(params, separator = '') {
    return params.reduce(Misc.joiner(separator));
  }

  static joiner(separator = '') {
    return (a, b) => a + separator + b;
  }

  static classify(items, classifier = it => it.type) {
    let itemsBy = {};
    Misc.classifyInto(itemsBy, items, classifier);
    return itemsBy;
  }

  static classifyFirst(items, classifier) {
    let itemsBy = {};
    for (const item of items) {
      const classification = classifier(item);
      if (!itemsBy[classification]) {
        itemsBy[classification] = item;
      }
    }
    return itemsBy;
  }

  static classifyInto(itemsBy, items, classifier = it => it.type) {
    for (const item of items) {
      const classification = classifier(item);
      let list = itemsBy[classification];
      if (!list) {
        list = [];
        itemsBy[classification] = list;
      }
      list.push(item);
    }
  }

}