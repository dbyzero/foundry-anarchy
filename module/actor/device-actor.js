import { BASE_MONITOR, ICONS_PATH, TEMPLATE } from "../constants.js";
import { Misc } from "../misc.js";
import { AnarchyBaseActor } from "./base-actor.js";


export class DeviceActor extends AnarchyBaseActor {

  get defaultIcon() {
    return `${ICONS_PATH}/actors/cctv-camera.svg`;
  }


  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.data.monitors.matrix.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.system.value, 2);
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.system,
      TEMPLATE.attributes.firewall,
    ];
  }


}