import { AnarchyBaseActor } from "./base-actor.js";

export class VehicleActor extends AnarchyBaseActor {

  constructor(data, context = {}) {
    super(data, context);
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }

  isActorWithOwnerId() { return true; }

  async attachToOwner(owner) {
  }

}