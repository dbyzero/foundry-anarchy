import { AnarchyBaseActorSheet } from "./base-actor-sheet.js";

export class DeviceActorSheet extends AnarchyBaseActorSheet {

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