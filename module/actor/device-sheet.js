import { AnarchyActorSheet } from "./anarchy-actor-sheet.js";

export class DeviceSheet extends AnarchyActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 450,
      height: 550
    });
  }

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