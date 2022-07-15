import { ICONS_PATH, TEMPLATE } from "../constants.js";
import { AnarchyBaseActor } from "./base-actor.js";


export class DeviceActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/actors/cctv-camera.svg`;
  }

  static get initiative() {
    return AnarchyBaseActor.initiative + " + @attributes.system.value";
  }

  prepareData() {
    super.prepareData();
  }

  hasMatrixMonitor() { return true; }

  prepareDerivedData() {
    this.system.monitors.matrix.max = this._getMonitorMax(TEMPLATE.attributes.system);
    super.prepareDerivedData();
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.firewall,
      TEMPLATE.attributes.system,
    ];
  }


}