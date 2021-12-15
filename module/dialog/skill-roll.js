import { SRA } from "../config.js";
import { Enums } from "../enums.js";
import { SheetHelper } from "../sheet-helper.js";

/**
 * Extend the base Dialog entity to select roll parameters
 * @extends {Dialog}
 */
export class SRASkillRoll extends Dialog {
  /**
   * rollData:{
   *     actor: Actor,
   *     skill: Item,
   *     specialization: string,
   *     use: {
   *       anarchy: boolean,
   *       edge: boolean
   *     }
   * }
   */
  static async create(rollData, onRoll = async r => { }) {
    rollData.SRA = SRA;
    rollData.ENUMS = Enums.getEnums();
    const html = await renderTemplate('systems/shadowrun-anarchy/templates/dialog/skill-roll.hbs', rollData)
    return new SRASkillRoll(rollData, html, onRoll);
  }

  constructor(rollData, html, onRoll = async r => { }) {
    const config = {
      title: rollData.title,
      content: html,
      default: 'skill-roll',
      buttons: {
        'skill-roll': { label: game.i18n.localize(SRA.common.roll.button), callback: () => onRoll(this.rollData) }
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

  activateListeners(html) {
    super.activateListeners(html);
    this.bringToTop();

    html.find('.select-skill-attribute').change((event) => {
      this.rollData.attribute = event.currentTarget.value;
      html.find('.select-attribute .selected-attribute-value').text(
        this.rollData.actor.getAttributeValue(this.rollData.attribute)
      );
      this.updateRollData();
    });

    html.find('.check-use-modifier').click(event => {
      const modifier = $(event.currentTarget).attr('data-modifier');
      if (this.rollData.modifiers[modifier].isAnarchy && event.currentTarget.checked) {
        // only allow selecting one anarchy for a given roll
        html.find(`.list-modifiers input.check-use-modifier.anarchy-modifier:not([data-modifier='${modifier}'])`)
          .prop('checked', false);
      }
      this.rollData.modifiers[modifier].used = event.currentTarget.checked;
      this.updateRollData();
    });

    html.find('.input-select-modifier').change(event => {
      const modifier = $(event.currentTarget).closest('.list-item').attr('data-modifier')
      this.rollData.modifiers[modifier].modifier = Number.parseInt(event.currentTarget.value);
      this.updateRollData();
    });
  }

}