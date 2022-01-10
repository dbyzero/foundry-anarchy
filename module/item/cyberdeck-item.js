import { TEMPLATE } from "../constants.js";
import { AnarchyBaseItem } from "./anarchy-base-item.js";

export class CyberdeckItem extends AnarchyBaseItem {

  getAttributes() {
    return [
      TEMPLATE.attributes.firewall
    ];
  }
}