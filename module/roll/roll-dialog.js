import { ANARCHY } from "../config.js";
import { ANARCHY_SYSTEM, TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";
import { Misc } from "../misc.js";
import { ROLL_PARAMETER_CATEGORY } from "./roll-parameters.js";

/**
 * Extend the base Dialog to select roll parameters
 * @extends {Dialog}
 */
export class RollDialog extends Dialog {

  static init() {
    Hooks.once('ready', async () => await this.onReady());
  }

  static async onReady() {
    await loadTemplates([
      'systems/anarchy/templates/roll/roll-parameters-category.hbs',
      'systems/anarchy/templates/roll/parts/generic.hbs',
      'systems/anarchy/templates/roll/parts/image-attribute.hbs',
      'systems/anarchy/templates/roll/parts/image-attributeAction.hbs',
      'systems/anarchy/templates/roll/parts/image-defense.hbs',
      'systems/anarchy/templates/roll/parts/image-skill.hbs',
      'systems/anarchy/templates/roll/parts/image-weapon.hbs',
    ]);
  }

  static prepareActorRoll(actor, item = undefined) {
    return {
      actor: actor,
      tokenId: actor.token?.id,
      attributes: actor.getUsableAttributes(item),
      options: {
        canUseEdge: actor.canUseEdge()
      }
    }
  }

  static async rollAttribute(actor, attribute) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: ANARCHY_SYSTEM.rollType.attribute,
      attribute1: attribute
    });
    await RollDialog.create(rollData);
  }

  static async rollAttributeAction(actor, action) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: ANARCHY_SYSTEM.rollType.attributeAction,
      attributeAction: action.code,
      attribute1: action.attribute1,
      attribute2: action.attribute2
    });
    await RollDialog.create(rollData);
  }

  static async rollAttribute(actor, attribute) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: ANARCHY_SYSTEM.rollType.attribute,
      attribute1: attribute
    });
    await RollDialog.create(rollData);
  }

  static async rollSkill(actor, skill, specialization) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: ANARCHY_SYSTEM.rollType.skill,
      skill: skill,
      attribute1: skill?.system.attribute ?? TEMPLATE.attributes.agility,
      specialization: specialization,
    });
    await RollDialog.create(rollData);
  }

  static async rollWeapon(actor, skill, weapon, targeting) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: ANARCHY_SYSTEM.rollType.weapon,
      weapon: weapon,
      skill: skill,
      attribute1: skill?.system.attribute ?? TEMPLATE.attributes.agility,
      specialization: skill?.system.specialization,
      targeting: targeting
    });
    await RollDialog.create(rollData);
  }

  static async rollDefense(actor, action, attack) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(actor), {
      mode: ANARCHY_SYSTEM.rollType.defense,
      attribute1: action.attribute1,
      attribute2: action.attribute2,
      defenseAction: action.code,
      attackRoll: attack.attackRoll,
      tokenId: attack.defenderTokenId,
      choiceChatMessageId: attack.choiceChatMessageId,
    });
    await RollDialog.create(rollData);
  }

  static async itemAttributeRoll(item, attribute) {
    const rollData = mergeObject(RollDialog.prepareActorRoll(item.actor), {
      mode: ANARCHY_SYSTEM.rollType.attribute,
      item: item,
      attribute1: attribute,
      attributes: item.actor.getUsableAttributes(item)
    });
    await RollDialog.create(rollData);
  }

  static async create(roll) {
    const rollParameters = game.system.anarchy.rollParameters.build(roll).sort(Misc.ascending(p => p.order ?? 200));
    mergeObject(roll, {
      ENUMS: Enums.getEnums(attributeName => roll.attributes.includes(attributeName)),
      ANARCHY: ANARCHY,
      parameters: rollParameters
    });

    const title = await renderTemplate(`${TEMPLATES_PATH}/roll/roll-dialog-title.hbs`, roll);
    const html = await renderTemplate(`${TEMPLATES_PATH}/roll/roll-dialog.hbs`, roll);
    new RollDialog(title, html, roll).render(true);
  }


  constructor(title, html, roll) {
    const config = {
      title: title,
      content: html,
      default: 'roll',
      buttons: {
        'roll': {
          label: game.i18n.localize(ANARCHY.common.roll.button),
          callback: async () => await game.system.anarchy.rollManager.roll(roll)
        }
      },
    };
    const options = {
      classes: [game.system.anarchy.styles.selectCssClass(), "anarchy-dialog"],
      width: 400,
      height: 134 + 24 * roll.parameters.length,
      'z-index': 99999,
    };

    super(config, options);

    this.roll = roll;
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.bringToTop();

    html.find('.select-attribute-parameter').change((event) => {
      const parameter = this._getRollParameter(event);
      const item = this._getEventItem(event, this.roll.actor);
      const selected = event.currentTarget.value;
      const value = this.roll.actor.getAttributeValue(selected, item);
      this.roll[parameter.code] = selected;
      this._setParameterSelectedOption(html, parameter, selected, value);
    });

    html.find('.check-optional').click(event => {
      const parameter = this._getRollParameter(event);
      parameter.onChecked(parameter, event.currentTarget.checked);
      if (parameter.category == ROLL_PARAMETER_CATEGORY.pool) {
        this._updateParameterValue(html, parameter, parameter.value)
      }
    });

    html.find('.input-select-parameter').on('input', event => {
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
    parameter.onChecked(parameter, selected);
    parameter.onValue(parameter, value);
    parameter.selected = selected;
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
    return this.roll.parameters.find(it => it.code == code);
  }
}