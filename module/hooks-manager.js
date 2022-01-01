import { ANARCHY } from './config.js';
import { AnarchyItem } from './item/anarchy-item.js';
import { BaseActor } from './actor/base-actor.js';
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
import { Users } from './users.js';
import { VehicleActorSheet } from './actor/vehicle-actor-sheet.js';
import { VehicleActor } from './actor/vehicle-actor.js';
import { DeviceActor } from './actor/device-actor.js';

export class HooksManager {

  static initialize() {
    new HooksManager();
  }

  constructor() {
    this.hooks = [];
    console.log(LOG_HEAD + 'HooksManager.Registering system hooks');
    Hooks.once('init', () => this.onInit());
  }

  async onInit() {
    game.system.anarchy = {
      hooks: this
    };
    console.log(LOG_HEAD + 'HooksManager.onInit | loading system');
    CONFIG.Actor.documentClass = BaseActor;
    CONFIG.Item.documentClass = AnarchyItem;
    CONFIG.Combat.initiative = { formula: "2d6 + max(@attributes.agility.value, @attributes.logic.value)" }

    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.actor.characterSheet));
    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.item.sheet));

    Enums.registerEnums();
    CONFIG.ENUMS = Enums.getEnums();
    CONFIG.ANARCHY = ANARCHY;;

    this.loadActorAndSheets();
    this.loadItemsAndSheets();

    // initialize remote calls registry first
    RemoteCall.init();
    Users.init();
    GMAnarchy.init();
    GMDifficulty.init();
    GMManager.init();
    AnarchyItem.init();
    ChatManager.init();
    Styles.init();
    HandlebarsManager.init();
    console.log(LOG_HEAD + 'HooksManager.onInit | done');
    Hooks.once('ready', () => this.onReady());
  }

  async onReady() {
    console.log(LOG_HEAD + 'HooksManager.onReady');
    GMManager.create();
  }

  loadActorAndSheets() {
    game.system.anarchy.actorClasses = {
      character: CharacterActor,
      vehicle: VehicleActor,
      device: DeviceActor
    }

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

  loadItemsAndSheets() {
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

  register(name) {
    if (!name.startsWith(SYSTEM_NAME + '-')) {
      throw "For safety Anarchy Hooks names must be prefixed by anarchy'-'"
    }
    this.hooks.push(name);
    console.log(LOG_HEAD + 'registered hook ' + name);
  }

}