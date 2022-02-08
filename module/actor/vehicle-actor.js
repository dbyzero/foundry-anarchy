import { BASE_MONITOR, ICONS_PATH, TEMPLATE } from "../constants.js";
import { Misc } from "../misc.js";
import { AnarchyBaseActor } from "./base-actor.js";

export class VehicleActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/shadowamps/drone.svg`;
  }

  static get initiative() {
    return AnarchyBaseActor.initiative + " + max(@attributes.system.value, @attributes.autopilot.value)";
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    this.data.data.monitors.matrix.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.system.value, 2);
    super.prepareDerivedData();
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.autopilot,
      TEMPLATE.attributes.firewall,
      TEMPLATE.attributes.system
    ];
  }

}