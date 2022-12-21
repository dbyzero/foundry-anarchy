import { CharacterActor } from "./actor/character-actor.js";
import { LOG_HEAD, SYSTEM_NAME, TEMPLATE } from "./constants.js";
import { ANARCHY_SKILLS } from "./skills.js";
import { ANARCHY_HOOKS, HooksManager } from "./hooks-manager.js";
import { Misc } from "./misc.js";
import { AttributeActions } from "./attribute-actions.js";

export const DECLARE_MIGRATIONS = 'anarchy-declareMigration';

export class Migration {
  get code() { return "sample"; }

  get version() { return "0.0.0"; }

  async migrate() { return () => { } };

  async applyItemsUpdates(computeUpdates) {
    await game.actors.forEach(async (actor) => {
      const actorItemUpdates = computeUpdates(actor.items);
      if (actorItemUpdates.length > 0) {
        console.log(this.code, `Applying updates on actor ${actor.name} items`, actorItemUpdates);
        await actor.updateEmbeddedDocuments('Item', actorItemUpdates);
      }
    });

    const itemUpdates = computeUpdates(game.items);
    if (itemUpdates.length > 0) {
      console.log(this.code, 'Applying updates on items', itemUpdates);
      await Item.updateDocuments(itemUpdates);
    }
  }
}

class _0_3_1_MigrationMoveWordsInObjects extends Migration {
  get version() { return '0.3.1' }
  get code() { return 'move-words-in-objects'; }

  async migrate() {
    game.actors.forEach(async actor => {
      await actor.update({
        ['system.keywords']: this._createWordObject(actor.system.keywords),
        ['system.cues']: this._createWordObject(actor.system.cues),
        ['system.dispositions']: this._createWordObject(actor.system.dispositions),
      });
    });
  }

  _createWordObject(current) {
    return Misc.reindexIds((current ?? []).map(k => { return { word: k, audio: '' }; }));
  }
}

class _0_3_8_MigrateWeaponDamage extends Migration {
  get version() { return '0.3.8' }
  get code() { return 'migrate-weapons-strength-damage'; }

  async migrate() {

    const isStrengthDamageItem = it => it.type == 'weapon' && it.system.strength;
    const fixItemDamage = it => {
      return {
        _id: it.id,
        'system.damageAttribute': TEMPLATE.attributes.strength,
        'system.strength': undefined,
      }
    };

    this.applyItemsUpdates(items => items.filter(isStrengthDamageItem).map(fixItemDamage));
  }

}

class _0_3_14_MigrateSkillDrainConvergence extends Migration {
  get version() { return '0.3.14' }
  get code() { return 'migrate-skill-drain-convergence'; }

  async migrate() {
    const withDrain = ANARCHY_SKILLS.filter(it => it.hasDrain).map(it => it.code);
    const hasDrain = it => it.type == 'skill' && withDrain.includes(it.system.code);
    const setDrain = it => { return { _id: it.id, 'system.hasDrain': true } };

    const withConvergence = ANARCHY_SKILLS.filter(it => it.hasConvergence).map(it => it.code);
    const hasConvergence = it => it.type == 'skill' && withConvergence.includes(it.system.code);
    const setConvergence = it => { return { _id: it.id, 'system.hasConvergence': true } };

    const computeUpdates = items => items.filter(hasDrain).map(setDrain)
      .concat(items.filter(hasConvergence).map(setConvergence))

    await this.applyItemsUpdates(computeUpdates);
  }
}

class _0_4_0_SelectWeaponDefense extends Migration {
  get version() { return '0.4.0' }
  get code() { return 'migrate-select-weapon-defense'; }

  async migrate() {
    const findWeaponSkillWithDefense = weapon => ANARCHY_SKILLS.find(it => it.defense && it.code == weapon.system.skill);
    const setDefense = weapon => {
      return {
        _id: weapon.id,
        'system.defense': AttributeActions.fixedDefenseCode(findWeaponSkillWithDefense(weapon)?.defense)
      }
    };

    await this.applyItemsUpdates(items =>
      items.filter(it => it.isWeapon())
        .filter(findWeaponSkillWithDefense)
        .map(setDefense));
  }
}

class _0_5_0_MigrationBaseResistanceIsZero extends Migration {
  get version() { return '0.5.0' }
  get code() { return 'base-resistance-is-zero'; }

  async migrate() {
    game.actors.forEach(async actor => await actor.update(this._resistanceUpdates(actor)));
  }

  _resistanceUpdates(actor) {
    const updates = {};
    Object.entries(actor.system.monitors).forEach(
      kv => {
        if (kv[1].resistance) {
          updates[`system.monitors.${kv[0]}.resistance`] = 0;
        }
      });
    return updates;
  }
}

class _0_6_0_MigrateSkillSocial extends Migration {
  get version() { return '0.6.0' }
  get code() { return 'migrate-skill-social'; }

  async migrate() {
    const socialSkills = ANARCHY_SKILLS.filter(it => it.isSocial).map(it => it.code);
    const isSocial = it => it.type == 'skill' && socialSkills.includes(it.system.code);
    const setSocial = it => { return { _id: it.id, 'system.isSocial': true } };
    await this.applyItemsUpdates(items => items.filter(isSocial).map(setSocial));
  }
}

export class Migrations {
  constructor() {
    HooksManager.register(ANARCHY_HOOKS.DECLARE_MIGRATIONS);

    Hooks.once(ANARCHY_HOOKS.DECLARE_MIGRATIONS, addMigrations => addMigrations(
      new _0_3_1_MigrationMoveWordsInObjects(),
      new _0_3_8_MigrateWeaponDamage(),
      new _0_3_14_MigrateSkillDrainConvergence(),
      new _0_4_0_SelectWeaponDefense(),
      new _0_5_0_MigrationBaseResistanceIsZero(),
      new _0_6_0_MigrateSkillSocial(),
    ));

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
    if (isNewerVersion(game.system.version, currentVersion)) {
      let migrations = [];
      Hooks.callAll(ANARCHY_HOOKS.DECLARE_MIGRATIONS, (...addedMigrations) =>
        migrations = migrations.concat(addedMigrations.filter(m => isNewerVersion(m.version, currentVersion)))
      );
      Hooks.off(ANARCHY_HOOKS.DECLARE_MIGRATIONS, () => { });

      if (migrations.length > 0) {

        migrations.sort((a, b) => isNewerVersion(a.version, b.version) ? 1 : isNewerVersion(b.version, a.version) ? -1 : 0);
        migrations.forEach(async m => {
          ui.notifications.info(`Executing migration ${m.code}: version ${currentVersion} is lower than ${m.version}`);
          await m.migrate();
        });
        ui.notifications.info(`Migrations done, version will change to ${game.system.version}`);
      }
      else {
        console.log(LOG_HEAD + `No migration needeed, version will change to ${game.system.version}`)
      }

      game.settings.set(SYSTEM_NAME, "systemMigrationVersion", game.system.version);
    }
    else {
      console.log(LOG_HEAD + `No system version changed`);
    }
  }
}
