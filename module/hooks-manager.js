import { AnarchyActor } from './actor/anarchy-actor.js'
import { CharacterSheet } from './actor/character-sheet.js';
import { ANARCHY } from './config.js';
import { LOG_HEAD, SYSTEM_NAME } from './constants.js';
import { HandlebarsManager } from './handlebars-manager.js';
import { AnarchyItemSheet } from './item/base-item-sheet.js';
import { AnarchySkillSheet } from './item/skill-item-sheet.js';
import { AnarchyItem } from './item/anarchy-item.js';
import { Enums } from './enums.js';
import { GMManager } from './app/gm-manager.js';
import { RemoteCall } from './remotecall.js';
import { Users } from './users.js';
import { GMAnarchy } from './app/gm-anarchy.js';
import { GMDifficulty } from './app/gm-difficulty.js';
import { NPCSheet } from './actor/npc-sheet.js';
import { ChatManager } from './chat/chat-manager.js';
import { Styles } from './styles.js';
import { VehicleSheet } from './actor/vehicle-sheet.js';
import { DeviceSheet } from './actor/device-sheet.js';

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
    CONFIG.Actor.documentClass = AnarchyActor;
    CONFIG.Item.documentClass = AnarchyItem;
    CONFIG.Combat.initiative = { formula: "2d6 + max(@attributes.agility.value, @attributes.logic.value)" }

    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.actor.characterSheet));
    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.item.sheet));

    Enums.registerEnums();
    CONFIG.ENUMS = Enums.getEnums();
    CONFIG.ANARCHY = ANARCHY;;

    this.loadSheets();

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

  loadSheets() {
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, CharacterSheet, {
      label: game.i18n.localize(ANARCHY.actor.characterSheet),
      makeDefault: true,
      types: ['character']
    });
    Actors.registerSheet(SYSTEM_NAME, NPCSheet, {
      label: game.i18n.localize(ANARCHY.actor.npcSheet),
      makeDefault: false,
      types: ['character']
    });
    Actors.registerSheet(SYSTEM_NAME, VehicleSheet, {
      label: game.i18n.localize(ANARCHY.actor.characterSheet),
      makeDefault: true,
      types: ['vehicle']
    });
    Actors.registerSheet(SYSTEM_NAME, DeviceSheet, {
      label: game.i18n.localize(ANARCHY.actor.characterSheet),
      makeDefault: true,
      types: ['device']
    });

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet(SYSTEM_NAME, AnarchyItemSheet, {
      types: ["metatype", "quality", "shadowamp", "weapon", "gear", "contact"],
      makeDefault: true
    });
    Items.registerSheet(SYSTEM_NAME, AnarchySkillSheet, {
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