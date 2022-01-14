import { CharacterActor } from "./actor/character-actor.js";
import { LOG_HEAD, SYSTEM_NAME, TEMPLATE } from "./constants.js";
import { ANARCHY_HOOKS, HooksManager } from "./hooks-manager.js";

export const DECLARE_MIGRATIONS = 'anarchy-declareMigration';

export class Migration {
  get code() { return "sample"; }

  get version() { return "0.0.0"; }

  async migrate() { return () => { } };
}

class _0_3_1_MigrationMoveWordsInObjects extends Migration {
  get version() { return '0.3.1' }
  get code() { return 'move-words-in-objects'; }

  async migrate() {
    game.actors.forEach(async actor => {
      await actor.update({
        ['data.keywords']: this._createWordObject(actor.data.data.keywords),
        ['data.cues']: this._createWordObject(actor.data.data.cues),
        ['data.dispositions']: this._createWordObject(actor.data.data.dispositions),
      });
    });
  }

  _createWordObject(current) {
    return CharacterActor.reindexWordIds((current ?? []).map(k => { return { word: k, audio: '' }; }));
  }
}

class _0_3_8_MigrateWeaponDamage extends Migration {
  get version() { return '0.3.8' }
  get code() { return 'migrate-weapons-strength-damage'; }

  async migrate() {
    await game.actors.forEach(async actor => {
      await this.actor.updateEmbeddedDocuments(actor.items.filter(item => this._isStrengthDamageItem(item))
        .map(item => this._fixItemDamage(item)));
    });
    await Item.updateDocuments(game.items.filter(item => this._isStrengthDamageItem(item))
      .map(item => this._fixItemDamage(item)));
  }

  _isStrengthDamageItem(it) {
    return it.type == 'weapon' && it.data.data.strength;
  }
  _fixItemDamage(item) {
    return { _id: item.id, 'data.damageAttribute': TEMPLATE.attributes.strength };
  }
}

const SYSTEM_MIGRATIONS = [
  new _0_3_1_MigrationMoveWordsInObjects(),
  new _0_3_8_MigrateWeaponDamage()
];


export class Migrations {
  constructor() {
    HooksManager.register(ANARCHY_HOOKS.DECLARE_MIGRATIONS);
    this.migrations = []
    Hooks.once(ANARCHY_HOOKS.DECLARE_MIGRATIONS, list => SYSTEM_MIGRATIONS.forEach(m => list.push(m)));

    game.settings.register(SYSTEM_NAME, "systemMigrationVersion", {
      name: "System Migration Version",
      scope: "world",
      config: false,
      type: String,
      default: "0.0.0"
    });
  }

  migrate() {
    const currentVersion = game.settings.get(SYSTEM_NAME, "systemMigrationVersion");
    if (isNewerVersion(game.system.data.version, currentVersion)) {
      Hooks.callAll(ANARCHY_HOOKS.DECLARE_MIGRATIONS, this.migrations);
      Hooks.off(ANARCHY_HOOKS.DECLARE_MIGRATIONS, () => { });
      this.migrations = this.migrations.filter(m => isNewerVersion(m.version, currentVersion));
      if (this.migrations.length > 0) {

        this.migrations.sort((a, b) => isNewerVersion(a.version, b.version) ? -1 : isNewerVersion(ab.version, a.version) ? 1 : 0);
        this.migrations.forEach(async m => {
          ui.notifications.info(`Executing migration ${m.code}: version ${currentVersion} is lower than ${m.version}`);
          await m.migrate();
        });
        ui.notifications.info(`Migrations done, version will change to ${game.system.data.version}`);
      }
      else {
        console.log(LOG_HEAD + `No migration needeed, version will change to ${game.system.data.version}`)
      }

      game.settings.set(SYSTEM_NAME, "systemMigrationVersion", game.system.data.version);
    }
    else {
      console.log(LOG_HEAD + `No system version changed`);
    }
  }
}
