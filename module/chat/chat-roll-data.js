export class ChatRollData {

  static rollDataToJSON(rollData) {
    const chatRollData = {
      mode: rollData.mode,
      actor: ChatRollData._reduceToId(rollData.actor),
      skill: ChatRollData._reduceToId(rollData.skill),
      weapon: ChatRollData._reduceToId(rollData.weapon),
      attribute: rollData.attribute,
      attribute2: rollData.attribute2,
      attributeAction: rollData.attributeAction,
      specialization: rollData.specialization,
      modifiers: ChatRollData._reduceModifiers(rollData.modifiers),
      param: rollData.param
    }
    return JSON.stringify(chatRollData);
  }

  static rollDataFromJSON(jsonRollData) {
    const rollData = JSON.parse(jsonRollData);
    rollData.actor = ChatRollData._reloadActorFromId(rollData.actor);
    rollData.skill = ChatRollData._reloadItemFromId(rollData.actor, rollData.skill);
    rollData.weapon = ChatRollData._reloadItemFromId(rollData.actor, rollData.weapon);
    return rollData;
  }

  static _reduceToId(document) {
    return document ? { id: document.id } : undefined;
  }

  static _reloadActorFromId(actor) {
    return actor?.id ? game.actors.get(actor.id) : undefined;
  }

  static _reloadItemFromId(actor, item) {
    return actor && item?.id ? actor.items.get(item.id) : undefined;
  }

  static _reduceModifiers(modifiers) {
    const reduced = {}
    Object.entries(modifiers)
      .forEach(kv => {
        if (kv[1]?.used) {
          reduced[kv[0]] = ChatRollData._reducedModifier(kv[1]);
        }
      });
    return reduced;
  }

  static _reducedModifier(modifier) {
    return {
      type: modifier.type,
      label: modifier.label,
      category: modifier.category,
      isAnarchy: modifier.isAnarchy,
      value: modifier.value,
      used: modifier.used,
      selectedLabel: modifier.selectedLabel
    };
  }
}