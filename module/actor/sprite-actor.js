import { ICONS_PATH, TEMPLATE } from "../constants.js";
import { AnarchyBaseActor } from "./base-actor.js";


export class SpriteActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/misc/rss.svg`;
  }

  static get initiative() {
    return AnarchyBaseActor.initiative + " + @attributes.logic.value";
  }

  getMatrixDetails() {
    return {
      logic: TEMPLATE.attributes.logic,
      firewall: TEMPLATE.attributes.logic,
      monitor: this.system.monitors.matrix,
      overflow: undefined,
      hasMatrix: true,
    }
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.logic,
      TEMPLATE.attributes.edge,
    ];
  }

  isEmerged() { return true }
}