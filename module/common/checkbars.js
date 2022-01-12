import { ErrorManager } from "../error-manager.js";
import { ANARCHY } from "../config.js";
import { AnarchyUsers } from "../users.js";

export const CHECKBARS = {
  physical: { dataPath: 'data.monitors.physical.value', max: it => it.data.data.monitors.physical.max, resource: ANARCHY.actor.monitors.physical },
  stun: { dataPath: 'data.monitors.stun.value', max: it => it.data.data.monitors.stun.max, resource: ANARCHY.actor.monitors.stun },
  matrix: { dataPath: 'data.monitors.matrix.value', max: it => it.data.data.monitors.matrix.max, resource: ANARCHY.actor.monitors.matrix },
  armor: { dataPath: 'data.monitors.armor.value', max: it => it.data.data.monitors.armor.max, resource: ANARCHY.actor.monitors.armor },
  anarchy: { dataPath: 'data.counters.anarchy.value', max: it => it.data.data.counters.anarchy.max, resource: ANARCHY.common.anarchy.anarchy },
  edge: { dataPath: 'data.counters.edge.value', max: it => it.data.data.attributes.edge.value, resource: ANARCHY.actor.counters.edge },
  structure: { dataPath: 'data.monitors.structure.value', max: it => it.data.data.monitors.structure.max, resource: ANARCHY.actor.monitors.structure },

}

export class Checkbars {


  static newValue(index, checked) {
    return index + (checked ? 0 : 1);
  }
  static async switchMonitorCheck(target, monitor, index, checked, sourceActorId = undefined) {
    await Checkbars.setCounter(target, monitor, Checkbars.newValue(index, checked), sourceActorId)
  }

  static async setCounter(target, monitor, value, sourceActorId = undefined) {
    switch (monitor) {
      case 'anarchy':
        return await Checkbars.setAnarchy(target, value);
    }
    return await Checkbars.setCheckbar(target, monitor, value);
  }

  static async setCheckbar(target, monitor, value) {
    const checkbar = CHECKBARS[monitor];
    if (checkbar) {
      ErrorManager.checkOutOfRange(checkbar.resource, value, 0, checkbar.max(target));
      await target.update({ [`${checkbar.dataPath}`]: value });
    }
  }

  static async setAnarchy(target, newValue) {
    if (!target.hasOwnAnarchy()) {
      return;
    }

    if (target.hasGMAnarchy()) {
      await game.system.anarchy.gmManager.gmAnarchy.setAnarchy(newValue);
      target.render();
      return;
    }

    const current = target.data.data.counters.anarchy.value;
    await Checkbars.setCheckbar(target, monitor, newValue);
    if (newValue < current) {
      await game.system.anarchy.gmManager.gmAnarchy.actorGivesAnarchyToGM(target, current - newValue);
    }
    if (!game.user.isGM) {
      Checkbars.notifyAnarchyChange(target, current, newValue);
    }
  }

  static notifyAnarchyChange(target, current, newValue) {
    AnarchyUsers.blindMessageToGM({
      from: game.user.id,
      content: game.i18n.format(ANARCHY.gmManager.playerChangedAnarchy,
        {
          user: game.user.name,
          actor: target.name,
          from: current,
          to: newValue
        })
    });
  }

}