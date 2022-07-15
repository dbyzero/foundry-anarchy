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
    this.system.monitors.matrix.max = this._getMonitorMax(TEMPLATE.attributes.logic);
    this.system.monitors.matrix.canMark = false;
    super.prepareDerivedData();
  }

  hasMatrixMonitor() { return true; }

  getAttributes() {
    return [
      TEMPLATE.attributes.logic,
      TEMPLATE.attributes.edge,
    ];
  }

  isEmerged() {
    return true;
  }

}