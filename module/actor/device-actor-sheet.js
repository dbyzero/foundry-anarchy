import { BaseActorSheet } from "./base-actor-sheet.js";

export class DeviceActorSheet extends BaseActorSheet {

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
    });
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

}