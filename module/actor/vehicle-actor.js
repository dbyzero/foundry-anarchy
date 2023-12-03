import { ICONS_PATH, TEMPLATE } from "../constants.js";
import { AnarchyBaseActor } from "./base-actor.js";

export class VehicleActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/shadowamps/drone.svg`;
  }

  static get initiative() {
    return AnarchyBaseActor.initiative + " + max(@attributes.system.value, @attributes.autopilot.value)";
  }

  prepareDerivedData() {
    this.system.monitors.matrix.max = this._getMonitorMax(TEMPLATE.attributes.system)
    super.prepareDerivedData()
  }

  getMatrixDetails() {
    return {
      hasMatrix: true,
      logic: TEMPLATE.attributes.system,
      firewall: TEMPLATE.attributes.firewall,
      monitor: this.system.monitors.matrix,
      overflow: undefined,
    }
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.autopilot,
      TEMPLATE.attributes.firewall,
      TEMPLATE.attributes.system
    ];
  }

  getDamageMonitor(damageType) {
    switch (damageType) {
      case TEMPLATE.monitors.physical: return TEMPLATE.monitors.structure;
      case TEMPLATE.monitors.stun: return undefined;
    }
    return super.getDamageMonitor(damageType);
  }


}