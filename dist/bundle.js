(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRAActor = void 0;
class SRAActor extends Actor {
    prepareData() {
        super.prepareData();
    }
}
exports.SRAActor = SRAActor;
},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRAActorSheet = void 0;
const constants_1 = require("../constants");
class SRAActorSheet extends ActorSheet {
    get template() {
        return `${constants_1.TEMPLATES_PATH}/actor/${this.actor.data.type}.html`;
    }
    getData(options) {
        let data = super.getData();
        // TODO: fill data on our own
        return data;
    }
}
exports.SRAActorSheet = SRAActorSheet;
},{"../constants":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRA = void 0;
exports.SRA = {
    itemTypes: {
        metatype: 'SRA.ItemTypes.Metatype',
        skill: 'SRA.ItemTypes.Skill',
        quality: 'SRA.ItemTypes.Quality',
        shadowamp: 'SRA.ItemTypes.ShadowAmp',
        weapon: 'SRA.ItemTypes.Weapon',
        gear: 'SRA.ItemTypes.Gear',
        contact: 'SRA.ItemTypes.Contact'
    },
    attributes: {
        strength: 'SRA.Attributes.Strength',
        agility: 'SRA.Attributes.Agility',
        willpower: 'SRA.Attributes.Willpower',
        logic: 'SRA.Attributes.Logic',
        charisma: 'SRA.Attributes.Charisma',
        edge: 'SRA.Attributes.Edge',
    },
    // specialTypes: {
    //     mundane: 'SRA.Mundane',
    //     awakened: 'SRA.Awakened',
    //     emerged: 'SRA.Emerged',
    // },
    // damageTypes: {
    //     physical: 'SRA.DmgTypePhysical',
    //     stun: 'SRA.DmgTypeStun',
    //     matrix: 'SRA.DmgTypeMatrix',
    // },
    // spellTypes: {
    //     combat: 'SRA.SpellCatCombat',
    //     effect: 'SRA.SpellCatEffect',
    // },
    // weaponRanges: {
    //     close: 'SRA.WeaponRangeClose',
    //     near: 'SRA.WeaponRangeNear',
    //     far: 'SRA.WeaponRangeFar',
    // },
    // qualityTypes: {
    //     positive: 'SRA.QualityTypePositive',
    //     negative: 'SRA.QualityTypeNegative',
    // },
};
},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LENGTH_UNIT = exports.DEFAULT_ROLL_NAME = exports.CORE_FLAGS = exports.CORE_NAME = exports.FLAGS = exports.TEMPLATES_PATH = exports.SYSTEM_DIST = exports.SYSTEM_PATH = exports.SYSTEM_SOCKET = exports.SYSTEM_NAME = void 0;
/**
 * The constants file contains things that do not change
 *
 * Constants are written in ALL_CAPS_CONSTANTS and should never be changed during runtime.
 */
exports.SYSTEM_NAME = 'shadowrun-anarchy';
exports.SYSTEM_SOCKET = `system.${exports.SYSTEM_NAME}`;
exports.SYSTEM_PATH = `systems/${exports.SYSTEM_NAME}`;
exports.SYSTEM_DIST = `${exports.SYSTEM_PATH}/dist`;
exports.TEMPLATES_PATH = `systems/${exports.SYSTEM_NAME}/dist/templates`;
exports.FLAGS = {
// for system flags (used for system settings)
};
exports.CORE_NAME = 'core';
exports.CORE_FLAGS = {
    RollMode: 'rollMode'
};
exports.DEFAULT_ROLL_NAME = 'Roll';
exports.LENGTH_UNIT = 'm';
},{}],5:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlebarsManager = exports.partials = void 0;
const constants_1 = require("./constants");
exports.partials = [
    `${constants_1.TEMPLATES_PATH}/actor/parts/ProfileImage.html`,
];
class HandlebarsManager {
    static preload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield loadTemplates(exports.partials);
        });
    }
    static register() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.HandlebarsManager = HandlebarsManager;
},{"./constants":4}],6:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HooksManager = void 0;
const SRAActor_1 = require("./actor/SRAActor");
const SRAActorSheet_1 = require("./actor/SRAActorSheet");
const config_1 = require("./config");
const constants_1 = require("./constants");
const handlebars_manager_1 = require("./handlebars-manager");
class HooksManager {
    static register() {
        console.log('Shadowrun Anarchy | Registering system hooks');
        Hooks.once('init', HooksManager.onInit);
    }
    static onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Shadowrun Anarchy | onInit | loading system');
            game['sra'] = {
                SRAActor: SRAActor_1.SRAActor
            };
            CONFIG.Actor.documentClass = SRAActor_1.SRAActor;
            // @ts-ignore
            CONFIG.SRA = config_1.SRA;
            Actors.unregisterSheet('core', ActorSheet);
            Actors.registerSheet(constants_1.SYSTEM_NAME, SRAActorSheet_1.SRAActorSheet, {
                label: "SRA.Sheet.Actor",
                makeDefault: true,
                types: ['character']
            });
            console.log('Shadowrun Sheet:', //game.i18n.localize(
            "SRA.Sheet.Actor"
            //)
            );
            yield handlebars_manager_1.HandlebarsManager.preload();
        });
    }
}
exports.HooksManager = HooksManager;
},{"./actor/SRAActor":1,"./actor/SRAActorSheet":2,"./config":3,"./constants":4,"./handlebars-manager":5}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_manager_1 = require("./handlebars-manager");
const hooks_manager_1 = require("./hooks-manager");
/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
hooks_manager_1.HooksManager.register();
handlebars_manager_1.HandlebarsManager.register();
},{"./handlebars-manager":5,"./hooks-manager":6}]},{},[7])

//# sourceMappingURL=bundle.js.map
