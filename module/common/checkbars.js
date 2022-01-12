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
  marks: { dataPath: undefined, max: it => 9, resource: ANARCHY.actor.monitors.marks }

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
      case 'marks':
        return await Checkbars.setActorMarks(target, value, sourceActorId);
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

  static getActorMarks(target, sourceActorId) {
    return Checkbars._findActorMarks(target.data.data.monitors.matrix.marks, sourceActorId);
  }

  static async addActorMark(target, sourceActorId) {
    const previous = Checkbars._findActorMarks(target.data.data.monitors.matrix.marks, sourceActorId);
    Checkbars.setActorMarks(target, (previous.marks ?? 0) + 1, sourceActorId);
  }

  static async setActorMarks(target, value, sourceActorId) {
    if (target.canReceiveMarks()) {
      let targetMarks = deepClone(target.data.data.monitors.matrix.marks);
      ErrorManager.checkOutOfRange(CHECKBARS.marks.resource, value, 0, CHECKBARS.marks.max(target));
      const sourceActorMarks = Checkbars._findActorMarks(targetMarks, sourceActorId);
      if (sourceActorMarks.marks == undefined) {
        targetMarks.push(sourceActorMarks);
      }
      sourceActorMarks.marks = Math.max(0, value);
      await target.update({ ['data.monitors.matrix.marks']: targetMarks.filter(target => target.marks > 0) });
    }
  }

  static _findActorMarks(marks, sourceActorId) {
    return marks.find(source => source.actorId == sourceActorId) ?? { actorId: sourceActorId };
  }
}