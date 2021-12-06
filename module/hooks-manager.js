import { SRACharacter } from './actor/character.js'
import { SRACharacterSheet } from './actor/character-sheet.js';
import { SRA } from './config.js';
import { SYSTEM_NAME } from './constants.js';
import { HandlebarsManager } from './handlebars-manager.js';


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

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, SRACharacterSheet, {
      label: game.i18n.localize(SRA.sheet.character),
      makeDefault: true,
      types: ['character']
    });
    console.log('Shadowrun Anarchy | ', game.i18n.localize(SRA.sheet.character));

    await HandlebarsManager.preload();
  }
}