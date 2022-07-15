import { ANARCHY } from "../config.js";
import { TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { AnarchyBaseActor } from "./base-actor.js";
import { ErrorManager } from "../error-manager.js";
import { Misc } from "../misc.js";
import { Modifiers } from "../modifiers/modifiers.js";
import { Checkbars } from "../common/checkbars.js";
import { RollCelebrity } from "../dialog/roll-celebrity.js";

const HBS_TEMPLATE_ACTOR_DRAIN = `${TEMPLATES_PATH}/chat/actor-drain.hbs`;

const essenceRange = [
  { from: 5, to: 6, adjust: 0 },
  { from: 3, to: 5, adjust: -1 },
  { from: 1, to: 3, adjust: -2 },
  { from: 0, to: 1, adjust: -3 }
]

export class CharacterEssence {
  static getAdjust(essence) {
    return this.getEssenceRange(essence)?.adjust ?? 0;
  }

  static getEssenceRange(essence) {
    return essenceRange.find(r => r.from < essence && essence <= r.to) ?? essenceRange[0];
  }
}

export class CharacterActor extends AnarchyBaseActor {

  static get initiative() {
    return AnarchyBaseActor.initiative + " + max(@attributes.agility.value, @attributes.logic.value)";
  }

  hasOwnAnarchy() { return this.hasPlayerOwner; }

  prepareData() {
    super.prepareData();
  }

  prepareDerivedData() {
    this.system.monitors.physical.max = this._getMonitorMax(TEMPLATE.attributes.strength)
    this.system.monitors.stun.max = this._getMonitorMax(TEMPLATE.attributes.willpower)
    super.prepareDerivedData();
    this.system.ignoreWounds = Modifiers.sumModifiers(this.items, 'other', 'ignoreWounds');
    this.system.counters.essence.value = this._computeEssence();
  }

  _computeEssence() {
    // spent essence: from cyberware/bioware
    const spentEssence = Misc.sumValues(this.items.filter(it => it.type == 'shadowamp')
      .map(it => it.system.essence));
    // adjustments: from quality (that gives a "free" essence point), or essence losses due to vampire
    const essenceAdjustment = Modifiers.sumModifiers(this.items, 'other', 'essenceAdjustment');
    return Math.min(6, 6 + essenceAdjustment - spentEssence);
  }

  getAttributes() {
    return [
      TEMPLATE.attributes.strength,
      TEMPLATE.attributes.agility,
      TEMPLATE.attributes.willpower,
      TEMPLATE.attributes.logic,
      TEMPLATE.attributes.charisma,
      TEMPLATE.attributes.edge
    ];
  }

  getMatrixMonitor() {
    const cyberdeck = this.getCyberdeck();
    if (cyberdeck) {
      return cyberdeck.system.monitors.matrix;
    }
    if (this.isEmerged()) {
      return this.system.monitors.stun;
    }
    return super.getMatrixMonitor();
  }

  hasMatrixMonitor() { return true; }

  async setMatrixMonitorValue(value) {
    const cyberdeck = this.getCyberdeck();
    if (cyberdeck) {
      return await cyberdeck.setMatrixMonitorValue(value);
    }
    if (this.isEmerged()) {
      return Checkbars.setCheckbar(this, TEMPLATE.monitors.stun, value);
    }
  }

  getDamageMonitor(damageType) {
    switch (damageType) {
      case TEMPLATE.monitors.stun:
      case TEMPLATE.monitors.physical:
        return damageType;
    }
    return super.getDamageMonitor(damageType);
  }


  async createWord(wordType, added) {
    this._mutateWords(wordType, values => values.concat([{ word: added, audio: '' }]));
  }

  async sayWord(wordType, wordId) {
    const wordsToSay = this.getWord(wordType, wordId);
    if (wordsToSay) {
      if (wordsToSay?.audio) {
        // TODO: play audio file
      }
      ChatMessage.create({
        speaker: { alias: this.token?.name ?? this.name },
        content: wordsToSay.word // TODO: improve the tchat content (add the character image)
      });
    }
  }

  getWord(wordType, wordId) {
    return wordType ? this.system[wordType].find(it => it.id == wordId) : undefined;
  }

  async editWord(wordType, wordId) {
    // TODO: dialog to edit the word audio
  }

  async updateWord(wordType, id, updated) {
    this._applyWordUpdate(wordType, id, it => mergeObject(it, { word: updated }, { overwrite: true }));
  }

  async _applyWordUpdate(wordType, id, updateFunction) {
    this._mutateWords(wordType, values => values.map(it => {
      if (it.id == id) {
        updateFunction(it)
      }
      return it;
    }));
  }

  async deleteWord(wordType, deletedId) {
    this._mutateWords(wordType, values => values.filter(it => it.id != deletedId));
  }

  async _mutateWords(wordType, mutate = values => values) {
    if (!wordType) {
      return;
    }
    let newValues = mutate(this.system[wordType]);
    Misc.reindexIds(newValues);
    await this.update({ [`system.${wordType}`]: newValues });
  }

  getCelebrityValue() {
    return this.system.counters.social.celebrity.value;
  }
  getCredibilityValue() {
    return this.system.counters.social.credibility.value;
  }
  getRumorValue() {
    return this.system.counters.social.rumor.value;
  }

  getAnarchy() {
    if (this.hasOwnAnarchy()) {
      return {
        value: this.system.counters.anarchy.value,
        max: this.system.counters.anarchy.max,
        scene: this.getAnarchyScene()
      };
    }
    return super.getAnarchy();
  }

  getAnarchyScene() {
    return this.system.counters.sceneAnarchy.value ?? 0;
  }

  async spendAnarchy(count) {
    if (count > 0) {
      const sceneAnarchy = this.getAnarchyScene();
      const currentAnarchy = this.getAnarchyValue();
      ErrorManager.checkSufficient(ANARCHY.actor.counters.anarchy, count, currentAnarchy + sceneAnarchy);

      const useSceneAnarchy = Math.min(sceneAnarchy, count);
      const useAnarchy = count - useSceneAnarchy;

      if (useSceneAnarchy > 0) {
        Checkbars.addCounter(this, TEMPLATE.monitors.sceneAnarchy, -useSceneAnarchy);
      }
      if (this.hasPlayerOwner) {
        await game.system.anarchy.gmAnarchy.actorGivesAnarchyToGM(this, count);
        Checkbars.addCounter(this, TEMPLATE.monitors.anarchy, -useAnarchy);
      }
      else if (useAnarchy > 0) {
        super.spendAnarchy(useAnarchy);
      }
    }
  }

  canUseEdge() {
    return true;
  }

  getWounds() {
    const wounds = Misc.divint(this.system.monitors.stun.value, 3)
      + Misc.divint(this.system.monitors.physical.value, 3);

    return Math.max(0, wounds - this.system.ignoreWounds);
  }

  canSetMarks() {
    return this.isEmerged() || this.getCyberdeck();
  }

  canReceiveMarks() {
    return false;
  }

  isEmerged() {
    return this.system.capacity == TEMPLATE.capacities.emerged;
  }

  getCyberdeck() {
    return this.items.find(it => it.isActive() && it.isCyberdeck())
  }

  async rollDrain(drain) {
    if (drain) {
      const rollDrain = new Roll(`${drain}dgcf=1[${game.i18n.localize(ANARCHY.common.roll.rollTheme.drain)}]`);
      await rollDrain.evaluate({ async: true });
      await this.sufferDrain(rollDrain.total);

      const flavor = await renderTemplate(HBS_TEMPLATE_ACTOR_DRAIN, {
        ANARCHY: ANARCHY,
        actor: this,
        drain: rollDrain.total,
        options: {
          classes: game.system.anarchy.styles.selectCssClass()
        }
      });
      await rollDrain.toMessage({ flavor: flavor });
    }
  }

  async sufferDrain(drain) {
    if (drain != 0) {
      await this.addCounter(TEMPLATE.monitors.stun, drain);
    }
  }

  async rollConvergence(convergence) {
    if (!convergence) {
      return;
    }
    game.system.anarchy.gmConvergence.rollConvergence(this.id, convergence)
  }

  async rollCelebrity() {
    await RollCelebrity.create(this);
  }
}