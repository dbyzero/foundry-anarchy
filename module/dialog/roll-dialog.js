import { SRA } from "../config.js";
import { Enums } from "../enums.js";
import { SRARoll } from "../roll.js";
import { Modifiers } from "../modifiers.js";

/**
 * Extend the base Dialog entity to select roll parameters
 * @extends {Dialog}
 */
export class SRARollDialog extends Dialog {

  static prepareSkillRollData(actor, skill, specialization) {
    return {
      mode: 'skill',
      actor: actor,
      skill: skill,
      attribute: skill?.data.data.attribute,
      specialization: specialization,
      modifiers: Modifiers.build(actor, skill, specialization),
      ENUMS: Enums.getEnums(),
      SRA: SRA,
      title: game.i18n.format(SRA.common.roll.title, {
        name: skill?.name,
        specialization: specialization ? '- ' + specialization : ''
      })
    };
  }

  static prepareAttributeRollData(actor, attribute, attribute2 = undefined, attributeAction = undefined) {
    const rollData = {
      mode: 'attribute',
      actor: actor,
      attributeAction: attributeAction,
      attribute: attribute,
      attribute2: attribute2,
      modifiers: Modifiers.build(actor),
      ENUMS: Enums.getEnums(),
      SRA: SRA
    };
    return rollData;
  }

  static async create(rollData) {
    const html = await renderTemplate(`systems/shadowrun-anarchy/templates/dialog/sra-roll.hbs`, rollData);
    return new SRARollDialog(rollData, html);
  }

  constructor(rollData, html) {
    const config = {
      title: rollData.title,
      content: html,
      default: 'roll',
      buttons: {
        'roll': { label: game.i18n.localize(SRA.common.roll.button), callback: () => SRARollDialog.onRoll(this.rollData) }
      },
    };
    const options = {
      classes: ["sra-dialog"],
      width: 450,
      height: 530,
      'z-index': 99999,
    };

    super(config, options);

    this.rollData = rollData;
  }

  static async onRoll(rollData) {
    rollData.param = Modifiers.computeRollParameters(rollData);
    await rollData.actor.spendEdge(rollData.param.edge);
    await rollData.actor.spendAnarchy(rollData.param.anarchy);

    rollData.roll = new SRARoll(rollData.param);
    await rollData.roll.evaluate();

    const flavor = await renderTemplate(`systems/shadowrun-anarchy/templates/chat/${rollData.mode}-roll.hbs`, rollData);
    const message = await rollData.roll.toMessage({ flavor: flavor }, { create: false });
    ChatMessage.create(message);
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.bringToTop();

    html.find('.select-skill-attribute').change((event) => {
      this.rollData.attribute = event.currentTarget.value;
      html.find('.select-attribute .selected-attribute-value').text(
        this.rollData.actor.getAttributeValue(this.rollData.attribute)
      );
    });

    html.find('.select-attribute2').change((event) => {
      this.rollData.attribute2 = event.currentTarget.value;
      html.find('.select-attribute .selected-attribute2-value').text(
        this.rollData.actor.getAttributeValue(this.rollData.attribute2)
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
  }

}