import { ANARCHY } from "../config.js";
import { ICONS_PATH, TEMPLATE } from "../constants.js";
import { ErrorManager } from "../error-manager.js";
import { AnarchyUsers } from "../users.js";
import { AnarchyBaseActor } from "./base-actor.js";

export class VehicleActor extends AnarchyBaseActor {

  static get defaultIcon() {
    return `${ICONS_PATH}/shadowamps/drone.svg`;
  }

  static get initiative() {
    return AnarchyBaseActor.initiative + " + max(@attributes.system.value, @attributes.autopilot.value)";
  }

  prepareDerivedData() {
    this.system.monitors.matrix.max = this._getMonitorMax(TEMPLATE.attributes.system)
    super.prepareDerivedData()
  }

  getMatrixDetails() {
    return {
      hasMatrix: true,
      logic: TEMPLATE.attributes.system,
      firewall: TEMPLATE.attributes.firewall,
      monitor: this.system.monitors.matrix,
      overflow: undefined,
    }
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.autopilot,
      TEMPLATE.attributes.handling,
      TEMPLATE.attributes.firewall,
      TEMPLATE.attributes.system
    ];
  }

  getPhysicalAgility() { return TEMPLATE.attributes.autopilot }

  getDamageMonitor(damageType) {
    switch (damageType) {
      case TEMPLATE.monitors.physical: return TEMPLATE.monitors.structure;
      case TEMPLATE.monitors.stun: return undefined;
    }
    return super.getDamageMonitor(damageType);
  }

  getRightToDefend() {
    return CONST.DOCUMENT_PERMISSION_LEVELS.OBSERVER;
  }

  async rollPilotDefense(attack) {
    const selectedActors = AnarchyUsers.getSelectedActors()
    ErrorManager.checkOutOfRange(ANARCHY.user.selectedTokenActors, selectedActors.length, 0, 1)

    const character = AnarchyUsers.getPlayerActor(game.user);
    const vehicleOwner = this.getOwnerActor();
    const pilot = [...selectedActors, character, vehicleOwner]
      .filter(actor => actor?.testUserPermission(game.user, this.getRightToDefend()))
      .find(actor => actor?.canPilotVehicle())
    if (pilot) {
      return await pilot.rollDefense(attack)
    }
    else {
      ui.notifications.warn(
        game.i18n.localize(ANARCHY.common.errors.noValidPilotForVehicle, {
          vehicle: this.name
        }))
    }
  }
  async _migrateHandlingToAttribute(actor) {
    const fromAttribute = this.system.attributes.handling?.value ?? 0
    const fromOldField = this.system.handling
    if (fromOldField && fromAttribute < fromOldField) {
      await this.update({
        'system.-=handling': null,
        'system.attributes.handling.value': fromOldField
      })
    }
  }

}