import { ICONS_PATH } from "../constants.js";
import { TEMPLATE } from "../constants.js";
import { AnarchyBaseItem } from "./anarchy-base-item.js";

export class CyberdeckItem extends AnarchyBaseItem {

  static get defaultIcon() {
    return `${ICONS_PATH}/shadowamps/cyberdeck.svg`;
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.firewall
    ];
  }

  async setMatrixMonitor(checkbarPath, value) {
    await this.update({ [checkbarPath]: value });
  }

  hasMatrixMonitor() { return true }

  getMatrixMonitor() { return this.system.monitors.matrix }

  getMatrixOverflow() {
    switch (this.system.connectionMode) {
      case 'virtual': return TEMPLATE.monitors.physical
      case 'augmented': return TEMPLATE.monitors.stun
    }
    return undefined
  }

  isConnected() {
    return this.getMatrixOverflow() != undefined
  }

  async nextConnectionMode() {
    const newConnectionMode = CyberdeckItem.getNextConnectionMode(this.system.connectionMode)
    await this.update({ 'system.connectionMode': newConnectionMode })
  }

  static getNextConnectionMode(connectionMode) {
    switch (connectionMode) {
      case 'disconnected': return 'augmented'
      case 'augmented': return 'virtual'
      default:
      case 'virtual': return 'disconnected'
    }
  }

}