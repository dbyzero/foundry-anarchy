import { AnarchyBaseItem } from "./anarchy-base-item.js";

export class MetatypeItem extends AnarchyBaseItem {

  async onCreateItem(options, id) {
    this.parent?.removeOtherMetatype(this);
  }

  isMetatype() { return true; }


}