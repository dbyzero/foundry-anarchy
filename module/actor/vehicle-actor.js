import { BASE_MONITOR, ICONS_PATH, TEMPLATE } from "../constants.js";
import { Misc } from "../misc.js";
import { AnarchyBaseActor } from "./base-actor.js";

export class VehicleActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/shadowamps/drone.svg`;
  }

  static get initiative() {
    return "2d6 + max(@attributes.system.value, @attributes.autopilot.value)";
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.data.monitors.matrix.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.system.value, 2)
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.system,
      TEMPLATE.attributes.firewall,
      TEMPLATE.attributes.autopilot
    ];
  }

}