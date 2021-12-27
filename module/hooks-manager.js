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

export class HooksManager {

  static register() {
    console.log(LOG_HEAD + 'HooksManager.Registering system hooks');
    Hooks.once('init', HooksManager.onInit);
    Hooks.once('ready', async () => await HooksManager.onReady());
  }

  static async onInit() {
    console.log(LOG_HEAD + 'HooksManager.onInit | loading system');
    game.system.anarchy = {
      AnarchyActor
    };
    CONFIG.Actor.documentClass = AnarchyActor;
    CONFIG.Item.documentClass = AnarchyItem;
    CONFIG.Combat.initiative = { formula: "2d6 + max(@attributes.agility.value, @attributes.logic.value)" }

    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.actor.characterSheet));
    console.log(LOG_HEAD + game.i18n.localize(ANARCHY.item.sheet));

    CONFIG.ANARCHY = ANARCHY;

    Enums.registerEnums();
    HooksManager.registerSheets();


    // initialize remote calls registry first
    RemoteCall.init();
    Users.init();
    GMAnarchy.init();
    GMDifficulty.init();
    GMManager.init();
    AnarchyItem.init();
    ChatManager.init();
    await HandlebarsManager.init();
    console.log(LOG_HEAD + 'init done');
  }

  static async onReady() {
    GMManager.create();
  }

  static registerSheets() {
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
}