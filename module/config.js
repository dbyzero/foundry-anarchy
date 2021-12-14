export const SRA = {
    common: {
        newEntry: 'SRA.common.newEntry',
        newName: 'SRA.common.newName',
        cancel: 'SRA.common.cancel',
        add: 'SRA.common.add',
        edit: 'SRA.common.edit',
        del: 'SRA.common.del',
        roll: {
            button: 'SRA.common.roll.button',
            title: 'SRA.common.roll.title',
            modifiers: {
                edge: 'SRA.common.roll.modifiers.edge',
                specialization: 'SRA.common.roll.modifiers.specialization',
                anarchy_disposition: 'SRA.common.roll.modifiers.anarchy_disposition',
                anarchy_risk: 'SRA.common.roll.modifiers.anarchy_risk',
                wounds: 'SRA.common.roll.modifiers.wounds',
                other: 'SRA.common.roll.modifiers.other',
                reroll: 'SRA.common.roll.modifiers.reroll',
                reroll_forced: 'SRA.common.roll.modifiers.reroll_forced',
                opponent_reroll: 'SRA.common.roll.modifiers.opponent_reroll',
                opponent_reduce: 'SRA.common.roll.modifiers.opponent_reduce'
            }
        },
        confirmation: {
            del: 'SRA.common.confirmation.del',
            delitem: 'SRA.common.confirmation.delitem'
        },
        errors:{
            insufficient: 'SRA.common.errors.insufficient'
        },
        sourcereference: 'SRA.common.sourcereference',
        sourcereferencehelp: 'SRA.common.sourcereferencehelp',
        description: 'SRA.common.description',
        gmnotes: 'SRA.common.gmnotes'
    },
    actor: {
        characterSheet: 'SRA.actor.characterSheet',
        actorName: 'SRA.actor.actorName',
        genre: 'SRA.actor.genre',
        singular: {
            keyword: 'SRA.actor.singular.keyword',
            disposition: 'SRA.actor.singular.disposition',
            cue: 'SRA.actor.singular.cue',
        },
        plural: {
            keyword: 'SRA.actor.plural.keyword',
            disposition: 'SRA.actor.plural.disposition',
            cue: 'SRA.actor.plural.cue',
        },
        essence: {
            adjustments: 'SRA.essence.adjustments',
        },
        counters: {
            essence: 'SRA.actor.counters.essence',
            karma: 'SRA.actor.counters.karma',
            karmatotal: 'SRA.actor.counters.karmatotal',
            anarchy: 'SRA.actor.counters.anarchy',
            edge: 'SRA.actor.counters.edge',
        },
        monitors: {
            conditionmonitors: 'SRA.actor.monitors.conditionmonitors',
            physical: 'SRA.actor.monitors.physical',
            stun: 'SRA.actor.monitors.stun',
            armor: 'SRA.actor.monitors.armor'
        }
    },
    item: {
        sheet: 'SRA.item.sheet',
        skill: {
            code: 'SRA.item.skill.code',
            isKnowledge: 'SRA.item.skill.isKnowledge',
            attribute: 'SRA.item.skill.attribute',
            value: 'SRA.item.skill.value',
            specialization: 'SRA.item.skill.specialization',
            specializationhelp: 'SRA.item.skill.specializationhelp'
        },
        quality: {
            positive: 'SRA.item.quality.positive'
        },
        shadowamp: {
            category: 'SRA.item.shadowamp.category',
            capacity: 'SRA.item.shadowamp.capacity',
            level: 'SRA.item.shadowamp.level',
            essence: 'SRA.item.shadowamp.essence',
            level_short: 'SRA.item.shadowamp.level_short',
            essence_short: 'SRA.item.shadowamp.essence_short'
        },
        weapon: {
            skill: 'SRA.item.weapon.skill',
            damage: 'SRA.item.weapon.damage',
            strength: 'SRA.item.weapon.strength',
            area: 'SRA.item.weapon.area',
            noarmor: 'SRA.item.weapon.noarmor',
            witharmor: 'SRA.item.weapon.witharmor',
            damage_short: 'SRA.item.weapon.damage_short',
            area_short: 'SRA.item.weapon.area_short',
            noarmor_short: 'SRA.item.weapon.noarmor_short',
            range: {
                max: 'SRA.item.weapon.range.max'
            }
        }
    },
    itemType: {
        singular: {
            metatype: 'SRA.itemType.singular.metatype',
            skill: 'SRA.itemType.singular.skill',
            quality: 'SRA.itemType.singular.quality',
            shadowamp: 'SRA.itemType.singular.shadowamp',
            weapon: 'SRA.itemType.singular.weapon',
            gear: 'SRA.itemType.singular.gear',
            contact: 'SRA.itemType.singular.contact'
        },
        plural: {
            metatype: 'SRA.itemType.plural.metatype',
            skill: 'SRA.itemType.plural.skill',
            quality: 'SRA.itemType.plural.quality',
            shadowamp: 'SRA.itemType.plural.shadowamp',
            weapon: 'SRA.itemType.plural.weapon',
            gear: 'SRA.itemType.plural.gear',
            contact: 'SRA.itemType.plural.contact'
        }
    },
    capacity: {
        mundane: 'SRA.capacity.mundane',
        awakened: 'SRA.capacity.awakened',
        emerged: 'SRA.capacity.emerged'
    },
    monitor: {
        physical: 'SRA.monitor.physical',
        stun: 'SRA.monitor.stun',
        matrix: 'SRA.monitor.matrix'
    },
    monitor_letter: {
        physical: 'SRA.monitor_letter.physical',
        stun: 'SRA.monitor_letter.stun',
        matrix: 'SRA.monitor_letter.matrix'
    },
    shadowampcategory: {
        cyberware: 'SRA.shadowampcategory.cyberware',
        bioware: 'SRA.shadowampcategory.bioware',
        cyberdeck: 'SRA.shadowampcategory.cyberdeck',
        program: 'SRA.shadowampcategory.program',
        complexform: 'SRA.shadowampcategory.complexform',
        drone: 'SRA.shadowampcategory.drone',
        spell: 'SRA.shadowampcategory.spell',
        adeptpower: 'SRA.shadowampcategory.adeptpower',
        equipment: 'SRA.shadowampcategory.equipment',
        special: 'SRA.shadowampcategory.special'
    },
    attributes: {
        strength: 'SRA.attributes.strength',
        agility: 'SRA.attributes.agility',
        willpower: 'SRA.attributes.willpower',
        logic: 'SRA.attributes.logic',
        charisma: 'SRA.attributes.charisma',
        edge: 'SRA.attributes.edge',
        knowledge: 'SRA.attributes.knowledge',
    },
    skill: {
        athletics: 'SRA.skill.athletics',
        closecombat: 'SRA.skill.closecombat',
        projectileweapons: 'SRA.skill.projectileweapons',
        firearms: 'SRA.skill.firearms',
        heavyweapons: 'SRA.skill.heavyweapons',
        vehicleweapons: 'SRA.skill.vehicleweapons',
        stealth: 'SRA.skill.stealth',
        pilotingground: 'SRA.skill.pilotingground',
        pilotingother: 'SRA.skill.pilotingother',
        escapeartist: 'SRA.skill.escapeartist',
        astralcombat: 'SRA.skill.astralcombat',
        conjuring: 'SRA.skill.conjuring',
        sorcery: 'SRA.skill.sorcery',
        survival: 'SRA.skill.survival',
        biotech: 'SRA.skill.biotech',
        electronics: 'SRA.skill.electronics',
        hacking: 'SRA.skill.hacking',
        engineering: 'SRA.skill.engineering',
        tracking: 'SRA.skill.tracking',
        tasking: 'SRA.skill.tasking',
        con: 'SRA.skill.con',
        intimidation: 'SRA.skill.intimidation',
        negotiation: 'SRA.skill.negotiation',
        disguise: 'SRA.skill.disguise',
        animals: 'SRA.skill.animals',
        etiquette: 'SRA.skill.etiquette',
    },
    area: {
        none: 'SRA.area.none',
        shotgun: 'SRA.area.shotgun',
        circle: 'CONTROLS.MeasureCircle',
        cone: 'CONTROLS.MeasureCone',
        rect: 'CONTROLS.MeasureRect',
        ray: 'CONTROLS.MeasureRay'
    },
    range: {
        short: 'SRA.range.short',
        medium: 'SRA.range.medium',
        long: 'SRA.range.long',
    }
};

