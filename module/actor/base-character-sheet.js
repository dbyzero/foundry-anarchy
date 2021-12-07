import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Misc } from "../misc.js";

export class SRABaseCharacterSheet extends ActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.hbs`;
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      items: {},
      config: SRA

    });
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }


}