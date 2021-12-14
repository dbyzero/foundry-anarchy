import { SRACharacter } from './actor/character.js'
import { SRACharacterSheet } from './actor/character-sheet.js';
import { SRA } from './config.js';
import { SYSTEM_NAME } from './constants.js';
import { HandlebarsManager } from './handlebars-manager.js';
import { SRABaseItemSheet } from './item/base-item-sheet.js';
import { SRASkillSheet } from './item/skill-item-sheet.js';
import { SRABaseItem } from './item/base-item.js';
import { Enums } from './enums.js';


export class HooksManager {
  static register() {
    console.log('Shadowrun Anarchy | Registering system hooks');
    Hooks.once('init', HooksManager.onInit)
  }

  static async onInit() {
    console.log('Shadowrun Anarchy | onInit | loading system');
    game.system.sra = {
      SRACharacter
    };
    CONFIG.Actor.documentClass = SRACharacter;
    CONFIG.Combat.initiative = {
      formula: "1d6"
    }

    CONFIG.SRA = SRA;

    HooksManager.registerSheets();
    Enums.registerEnums();

    console.log('Shadowrun Anarchy | ', game.i18n.localize(SRA.actor.characterSheet));
    console.log('Shadowrun Anarchy | ', game.i18n.localize(SRA.item.sheet));

    await HandlebarsManager.preload();
    SRABaseItem.init();
  }

  static registerSheets() {
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, SRACharacterSheet, {
      label: game.i18n.localize(SRA.actor.characterSheet),
      makeDefault: true,
      types: ['character']
    });

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet(SYSTEM_NAME, SRABaseItemSheet, {
      types: ["metatype", "quality", "shadowamp", "weapon", "gear", "contact"],
      makeDefault: true
    });
    Items.registerSheet(SYSTEM_NAME, SRASkillSheet, {
      types: ["skill"],
      makeDefault: true
    });
  }
}