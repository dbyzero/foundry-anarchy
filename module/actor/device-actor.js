import { AnarchyBaseActor, CHECKBARS } from "./base-actor.js";
import { ErrorManager } from "../error-manager.js";

export class DeviceActor extends AnarchyBaseActor {

  constructor(data, context = {}) {
    super(data, context);
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }

  async setCounter(monitor, value) {
    const checkbar = CHECKBARS[monitor];
    if (checkbar) {
      if (monitor == 'anarchy') {
        await this.setAnarchy(checkbar, value);
      }
      else {
        ErrorManager.checkOutOfRange(checkbar.resource, value, 0, checkbar.maxForActor(this));
        await this.update({ [`${checkbar.dataPath}`]: value });
      }
    }
  }

  isActorWithOwnerId() { return true; }
}