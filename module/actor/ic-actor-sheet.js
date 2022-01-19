import { AnarchyBaseActorSheet } from "./base-actor-sheet.js";

export class ICActorSheet extends AnarchyBaseActorSheet {

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