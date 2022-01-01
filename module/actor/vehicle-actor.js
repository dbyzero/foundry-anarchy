import { BaseActor } from "./base-actor.js";
import { ErrorManager } from "../error-manager.js";

export class VehicleActor extends BaseActor {

  constructor(data, context = {}) {
    super(data, context);
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    super.prepareDerivedData();
  }
}