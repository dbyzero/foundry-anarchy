import { ICONS_PATH, TEMPLATE } from "../constants.js";
import { AnarchyBaseActor } from "./base-actor.js";


export class SpriteActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/misc/rss.svg`;
  }

  static get initiative() {
    return AnarchyBaseActor.initiative + " + @attributes.logic.value";
  }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    this.data.data.monitors.matrix.max = this._getMonitorMax(TEMPLATE.attributes.logic);
    super.prepareDerivedData();
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.logic,
      TEMPLATE.attributes.edge,
    ];
  }

}