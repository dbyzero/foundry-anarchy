import { BASE_MONITOR, ICONS_PATH, TEMPLATE } from "../constants.js";
import { Misc } from "../misc.js";
import { AnarchyBaseActor } from "./base-actor.js";


export class ICActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/misc/rub-el-hizb.svg`;
  }

  static get initiative() {
    return "2d6 + @attributes.logic.value";
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.data.monitors.matrix.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.logic.value, 2);
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.firewall,
      TEMPLATE.attributes.logic,
    ];
  }


}