import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";

export class SRABaseCharacterSheet extends ActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.hbs`;
  }

  getData(options) {
    let data = mergeObject(super.getData(options),
      {
        config: SRA
      });
    return data;
  }


}