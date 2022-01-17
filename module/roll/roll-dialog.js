import { ANARCHY } from "../config.js";
import { TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { Misc } from "../misc.js";
import { ROLL_PARAMETER_CATEGORY } from "./roll-parameters.js";
import { RollManager } from "./roll-manager.js";

/**
 * Extend the base Dialog entity to select roll parameters
 * @extends {Dialog}
 */
export class RollDialog extends Dialog {

  static init() {
    Hooks.once('ready', async () => await this.onReady());
  }

  static async onReady() {
    await loadTemplates([
      'systems/anarchy/templates/roll/parts/generic.hbs',
      'systems/anarchy/templates/roll/parts/image-attribute.hbs',
      'systems/anarchy/templates/roll/parts/image-skill.hbs',
      'systems/anarchy/templates/roll/parts/image-weapon.hbs',
    ]);
  }

  static prepareActorRoll(actor, item = undefined) {
    return {
      actor: actor,
      attributes: actor.getAttributes(item)
    }
  }

  static async attributeRoll(actor, attribute, attribute2 = undefined, attributeAction = undefined) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: 'attribute',
      attributeAction: attributeAction,
      attribute1: attribute,
      attribute2: attribute2,
    });
    await RollDialog.create(rollData);
  }

  static async skillRoll(actor, skill, specialization) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: 'skill',
      skill: skill,
      attribute1: skill?.data.data.attribute ?? TEMPLATE.attributes.agility,
      specialization: specialization,
    });
    await RollDialog.create(rollData);
  }

  static async weaponRoll(actor, skill, weapon) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: 'weapon',
      weapon: weapon,
      skill: skill,
      attribute1: skill?.data.data.attribute ?? TEMPLATE.attributes.agility,
      specialization: skill?.data.data.specialization,
    });
    await RollDialog.create(rollData);
  }

  static async itemAttributeRoll(item, attribute) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(item.actor), {
      mode: 'attribute',
      item: item,
      attribute1: attribute,
      attributes: item.actor.getActorItemAttributes(item)
    });
    await RollDialog.create(rollData);
  }

  static async create(rollData) {
    mergeObject(rollData, {
      ENUMS: Enums.getEnums(attributeName => rollData.attributes.includes(attributeName)),
      ANARCHY: ANARCHY,
      parameters: game.system.anarchy.rollParameters.build(rollData)
    })
    rollData.parameters.sort(Misc.ascending(p => p.order ?? 200));
    const title = await renderTemplate(`${TEMPLATES_PATH}/roll/roll-dialog-title.hbs`, rollData);
    const html = await renderTemplate(`${TEMPLATES_PATH}/roll/roll-dialog.hbs`, rollData);
    new RollDialog(title, html, rollData).render(true);
  }


  constructor(title, html, rollData) {
    const config = {
      title: title,
      content: html,
      default: 'roll',
      buttons: {
        'roll': {
          label: game.i18n.localize(ANARCHY.common.roll.button), callback: async () => await RollManager.roll(rollData)
        }
      },
    };
    const options = {
      classes: [game.system.anarchy.styles.selectCssClass(), "anarchy-dialog"],
      width: 400,
      height: 90 + 24 * rollData.parameters.length,
      'z-index': 99999,
    };

    super(config, options);

    this.rollData = rollData;
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.bringToTop();

    html.find('.select-attribute-parameter').change((event) => {
      const parameter = this._getRollParameter(event);
      const item = this._getEventItem(event, this.rollData.actor);
      const selected = event.currentTarget.value;
      const value = this.rollData.actor.getAttributeValue(selected, item);
      this.rollData[parameter.code] = selected;
      this._setParameterSelectedOption(html, parameter, selected, value);
    });

    html.find('.check-optional').click(event => {
      const parameter = this._getRollParameter(event);
      parameter.onChecked(parameter, event.currentTarget.checked);
      if (parameter.category == ROLL_PARAMETER_CATEGORY.pool) {
        this._updateParameterValue(html, parameter, parameter.value)
      }
    });

    html.find('.input-select-parameter').change(event => {
      const parameter = this._getRollParameter(event);
      const value = Number.parseInt(event.currentTarget.value) ?? 0;
      parameter.onValue(parameter, value);
      parameter.onChecked(parameter, value);
    });

    html.find('.select-option-parameter').change(event => {
      const parameter = this._getRollParameter(event);
      const selected = event.currentTarget.value;
      const value = Number.parseInt(selected);
      this._setParameterSelectedOption(html, parameter, selected, value);
    });
  }

  _setParameterSelectedOption(html, parameter, selected, value) {
    parameter.onValue(parameter, value);
    parameter.onChecked(parameter, selected);
    parameter.selected = this._getSelectedOption(html, parameter);
    this._updateParameterValue(html, parameter, value);
  }

  _updateParameterValue(html, parameter, value) {
    html.find(`.parameter[data-parameter-code='${parameter.code}'] .parameter-value`)
      .text(value);
  }

  _getSelectedOption(html, parameter) {
    return html.find(`.parameter[data-parameter-code='${parameter.code}'] select.select-option-parameter option:selected`)
      .text();
  }

  _getEventItem(event, actor) {
    const itemId = $(event.currentTarget).closest('.parameter').attr('data-item-id');
    return itemId ? actor.items.get(itemId) : undefined;
  }

  _getRollParameter(event) {
    const code = $(event.currentTarget).closest('.parameter').attr('data-parameter-code');
    return this.rollData.parameters.find(it => it.code == code);
  }
}