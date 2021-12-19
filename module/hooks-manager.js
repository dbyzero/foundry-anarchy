import { SRACharacter } from './actor/character.js'
import { SRACharacterSheet } from './actor/character-sheet.js';
import { SRA } from './config.js';
import { SYSTEM_NAME } from './constants.js';
import { HandlebarsManager } from './handlebars-manager.js';
import { SRABaseItemSheet } from './item/base-item-sheet.js';
import { SRASkillSheet } from './item/skill-item-sheet.js';
import { SRABaseItem } from './item/base-item.js';
import { Enums } from './enums.js';
import { GMAnarchy } from './anarchy/gm-anarchy.js';

export class HooksManager {

  static register() {
    console.log('Shadowrun Anarchy | Registering system hooks');
    Hooks.once('init', HooksManager.onInit);
    Hooks.once('ready', async () => await HooksManager.onReady());
  }

  static async onInit() {
    console.log('Shadowrun Anarchy | onInit | loading system');
    game.system.sra = {
      SRACharacter
    };
    CONFIG.Actor.documentClass = SRACharacter;
    CONFIG.Item.documentClass = SRABaseItem;
    CONFIG.Combat.initiative = {
      formula: "1d6"
    }

    CONFIG.SRA = SRA;

    Enums.registerEnums();
    HooksManager.registerSheets();

    console.log('Shadowrun Anarchy | ', game.i18n.localize(SRA.actor.characterSheet));
    console.log('Shadowrun Anarchy | ', game.i18n.localize(SRA.item.sheet));

    await HandlebarsManager.init();
    GMAnarchy.init();
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

  static async onReady() {

    const gmAnarchy = GMAnarchy.create();
    if (game.user.isGM) {
      gmAnarchy.render(true);
    }
    game.system.sra.gmAnarchy = gmAnarchy;
    // const options = game.system.sra.gmAnarchy.defaultOptions;
    // renderTemplate(options.template, { anarchy: gmAnarchy.anarchy })
    //   .then(html => game.system.sra.gmAnarchy.render(true));


  }
}