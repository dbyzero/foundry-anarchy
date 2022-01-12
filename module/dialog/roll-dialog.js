import { ANARCHY } from "../config.js";
import { TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { Modifiers } from "../modifiers.js";
import { RollManager } from "../roll/roll-manager.js";

/**
 * Extend the base Dialog entity to select roll parameters
 * @extends {Dialog}
 */
export class RollDialog extends Dialog {

  static prepareActorRoll(actor) {
    return {
      actor: actor,
      attributes: actor.getAttributes(),
      modifiers: Modifiers.actorModifiers(actor)
    }
  }

  static async actorAttributeRoll(actor, attribute, attribute2 = undefined, attributeAction = undefined) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: 'attribute',
      attributeAction: attributeAction,
      attribute: attribute,
      attribute2: attribute2
    });
    await RollDialog.create(rollData);
  }

  static async actorSkillRoll(actor, skill, specialization) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: 'skill',
      skill: skill,
      attribute: skill?.data.data.attribute ?? TEMPLATE.attributes.agility,
      specialization: specialization,
    });
    mergeObject(rollData.modifiers, Modifiers.skillModifiers(actor, skill, specialization));
    await RollDialog.create(rollData);
  }

  static async actorWeaponRoll(actor, skill, weapon) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: 'weapon',
      weapon: weapon,
      skill: skill,
      attribute: skill?.data.data.attribute ?? TEMPLATE.attributes.agility,
      specialization: skill?.data.data.specialization,
    });
    mergeObject(rollData.modifiers, Modifiers.skillModifiers(actor, skill, rollData.specialization));
    mergeObject(rollData.modifiers, Modifiers.weaponModifiers(weapon));
    await RollDialog.create(rollData);
  }

  static async itemAttributeRoll(item, attribute) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(item.actor), {
      mode: 'attribute',
      item: item,
      attribute: attribute
    });
    rollData.attributes = mergeObject(rollData.attributes, item.getAttributes());
    await RollDialog.create(rollData);
  }

  static async create(rollData) {
    mergeObject(rollData, {
      anarchy: rollData.actor.getAnarchyValue(),
      ENUMS: Enums.getEnums(attributeName => rollData.attributes.includes(attributeName)),
      ANARCHY: ANARCHY
    });
    const html = await renderTemplate(`${TEMPLATES_PATH}/dialog/roll-dialog.hbs`, rollData);
    new RollDialog(rollData, html).render(true);
  }

  constructor(rollData, html) {
    const config = {
      title: rollData.title,
      content: html,
      default: 'roll',
      buttons: {
        'roll': { label: game.i18n.localize(ANARCHY.common.roll.button), callback: async () => await RollManager.roll(rollData) }
      },
    };
    const options = {
      classes: ["anarchy-dialog"],
      width: 450,
      height: 570,
      'z-index': 99999,
    };

    super(config, options);

    this.rollData = rollData;
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.bringToTop();

    html.find('.select-attribute').change((event) => {
      const actor = this.rollData.actor;
      const selectedAttribute = event.currentTarget.value;
      const attrSelector = $(event.currentTarget).closest('.attribute-selector');
      const itemId = attrSelector.attr('data-item-id');
      const item = itemId ? actor.items.get(itemId) : undefined;
      const selector = attrSelector.attr('data-selector');
      this.rollData[selector] = selectedAttribute;
      html.find(`.attribute-selector[data-selector="${selector}"] .selected-attribute-value`).text(
        actor.getAttributeValue(selectedAttribute, item)
      );
    });

    html.find('.check-use-modifier').click(event => {
      const modifier = $(event.currentTarget).attr('data-modifier');
      if (this.rollData.modifiers[modifier].isAnarchy && event.currentTarget.checked) {
        // only allow selecting one anarchy for a given roll
        html.find(`.list-modifiers input.check-use-modifier.anarchy-modifier:not([data-modifier='${modifier}'])`)
          .prop('checked', false);
      }
      this.rollData.modifiers[modifier].used = event.currentTarget.checked;
    });

    html.find('.input-select-modifier').change(event => {
      const modifier = $(event.currentTarget).attr('data-modifier')
      this.rollData.modifiers[modifier].value = Number.parseInt(event.currentTarget.value);
    });

    html.find('.select-option-modifier').change(event => {
      const selected = Number.parseInt(event.currentTarget.value);
      const modifier = $(event.currentTarget).attr('data-modifier')
      this.rollData.modifiers[modifier].value = selected;
      this.rollData.modifiers[modifier].selectedLabel = html.find(`.list-modifiers .item[data-modifier='${modifier}'] select option:selected`)
        .text()

      html.find(`.list-modifiers .item[data-modifier='${modifier}'] .selected-option-modifier-value`)
        .text(selected);
    });


  }

}