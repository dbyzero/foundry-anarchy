import { BASE_MONITOR } from "../constants.js";
import { Misc } from "../misc.js";
import { AnarchyBaseActor, CHECKBARS } from "./base-actor.js";

export class DeviceActor extends AnarchyBaseActor {

  constructor(data, context = {}) {
    super(data, context);
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    this.data.data.monitors.matrix.max = BASE_MONITOR + Misc.divup(this.data.data.attributes.system.value, 2)

  }

}