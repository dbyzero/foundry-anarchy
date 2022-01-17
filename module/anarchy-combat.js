import { Misc } from "./misc.js";

export class AnarchyCombat extends Combat {

  get initiative() {
    return { formula: "2d6" }
  }

  async rollInitiative(ids, options) {

    const selectedCombatants = ids.map(id => this.combatants.find(c => c.id == id));
    const combatantsByType = Misc.classify(selectedCombatants, it => it.actor.type);

    Object.entries(combatantsByType).forEach(async ([type, list]) => {
      const typeActorClass = game.system.anarchy.actorClasses[type];
      const typeIds = list.map(it => it.id);
      const typeOptions = mergeObject({ formula: typeActorClass.initiative }, options ?? {});
      await super.rollInitiative(typeIds, typeOptions);
    });
  }
}