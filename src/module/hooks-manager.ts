import { SRAActor } from './actor/SRAActor'
import { SRAActorSheet } from './actor/SRAActorSheet';
import { SRA } from './config';
import { SYSTEM_NAME } from './constants';
import { HandlebarsManager } from './handlebars-manager';


export class HooksManager {
  static register() {
    console.log('Shadowrun Anarchy | Registering system hooks');
    Hooks.once('init', HooksManager.onInit)
  }

  static async onInit() {
    console.log('Shadowrun Anarchy | onInit | loading system');
    game['sra'] = {
      SRAActor
    }
    CONFIG.Actor.documentClass = SRAActor;

    // @ts-ignore
    CONFIG.SRA = SRA;
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, SRAActorSheet, {
      label: "SRA.Sheet.Actor",
      makeDefault: true,
      types: ['character']
    });
    console.log('Shadowrun Sheet:', //game.i18n.localize(
      "SRA.Sheet.Actor"
      //)
    );

    await HandlebarsManager.preload();
  }
}