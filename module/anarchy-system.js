import { ANARCHY } from './config.js';
import { AnarchyBaseItem } from './item/anarchy-base-item.js';
import { AnarchyBaseActor } from './actor/base-actor.js';
import { CharacterActor } from './actor/character-actor.js';
import { BaseItemSheet } from './item/base-item-sheet.js';
import { CharacterActorSheet } from './actor/character-actor-sheet.js';
import { ChatManager } from './chat/chat-manager.js';
import { DeviceActorSheet } from './actor/device-actor-sheet.js';
import { Enums } from './enums.js';
import { GMAnarchy } from './app/gm-anarchy.js';
import { GMDifficulty } from './app/gm-difficulty.js';
import { GMManager } from './app/gm-manager.js';
import { HandlebarsManager } from './handlebars-manager.js';
import { LOG_HEAD, SYSTEM_NAME } from './constants.js';
import { NPCCharacterActorSheet } from './actor/npc-character-actor-sheet.js';
import { RemoteCall } from './remotecall.js';
import { SkillItemSheet } from './item/skill-item-sheet.js';
import { Styles } from './styles.js';
import { AnarchyUsers } from './users.js';
import { VehicleActorSheet } from './actor/vehicle-actor-sheet.js';
import { VehicleActor } from './actor/vehicle-actor.js';
import { DeviceActor } from './actor/device-actor.js';
import { HooksManager } from './hooks-manager.js';

/* -------------------------------------------- */
/*  Foundry VTT AnarchySystem Initialization    */
/* -------------------------------------------- */

export class AnarchySystem {

  static start() {
    const anarchySystem = new AnarchySystem();
    Hooks.once('init', async () => await anarchySystem.onInit());
  }

  async onInit() {
    game.system.anarchy = this;

    console.log(LOG_HEAD + 'AnarchySystem.onInit');

    this.remoteCall = new RemoteCall();
    this.hooks = new HooksManager();
    this.styles = new Styles();
    this.handlebarsManager = new HandlebarsManager();
    this.gmAnarchy = new GMAnarchy();
    this.gmManager = new GMManager();
    this.actorClasses = {
      character: CharacterActor,
      vehicle: VehicleActor,
      device: DeviceActor
    }

    console.log(LOG_HEAD + 'AnarchySystem.onInit | loading system');
    CONFIG.Actor.documentClass = AnarchyBaseActor;
    CONFIG.Item.documentClass = AnarchyBaseItem;
    CONFIG.Combat.initiative = { formula: "2d6 + max(@attributes.agility.value, @attributes.logic.value)" }

    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.actor.characterSheet));
    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.item.sheet));

    Enums.registerEnums();
    CONFIG.ENUMS = Enums.getEnums();
    CONFIG.ANARCHY = ANARCHY;

    this.loadActorSheets();
    this.loadItemSheets();

    // initialize remote calls registry first
    AnarchyUsers.init();
    AnarchyBaseItem.init();
    ChatManager.init();
    console.log(LOG_HEAD + 'AnarchySystem.onInit | done');
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    console.log(LOG_HEAD + 'AnarchySystem.onReady');
  }

  loadActorSheets() {
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, CharacterActorSheet, {
      label: game.i18n.localize(ANARCHY.actor.characterSheet),
      makeDefault: true,
      types: ['character']
    });
    Actors.registerSheet(SYSTEM_NAME, NPCCharacterActorSheet, {
      label: game.i18n.localize(ANARCHY.actor.npcSheet),
      makeDefault: false,
      types: ['character']
    });
    Actors.registerSheet(SYSTEM_NAME, VehicleActorSheet, {
      label: game.i18n.localize(ANARCHY.actor.characterSheet),
      makeDefault: true,
      types: ['vehicle']
    });
    Actors.registerSheet(SYSTEM_NAME, DeviceActorSheet, {
      label: game.i18n.localize(ANARCHY.actor.characterSheet),
      makeDefault: true,
      types: ['device']
    });
  }

  loadItemSheets() {
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet(SYSTEM_NAME, BaseItemSheet, {
      types: ["metatype", "quality", "shadowamp", "weapon", "gear", "contact"],
      makeDefault: true
    });
    Items.registerSheet(SYSTEM_NAME, SkillItemSheet, {
      types: ["skill"],
      makeDefault: true
    });
  }

}