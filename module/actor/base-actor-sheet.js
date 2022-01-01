import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { ConfirmationDialog } from "../confirmation.js";
import { SheetHelper } from "../sheet-helper.js";
import { Misc } from "../misc.js";
import { Enums } from "../enums.js";

export class AnarchyBaseActorSheet extends ActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.hbs`;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      isGM: game.user.isGM,
      dragDrop: [{ dragSelector: ".item ", dropSelector: null }],
      classes: [game.system.anarchy.styles.selectCssClass(), "sheet", "actor"],
    });
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      items: {},
      anarchy: this.actor.getAnarchy(),
      options: {
        owner: this.document.isOwner,
        cssClass: this.isEditable ? "editable" : "locked",
      },
      ENUMS: Enums.getEnums(),
      ANARCHY: ANARCHY
    });
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // items standard actions (add/edit/delete)
    html.find('.click-item-add').click(async event => {
      const itemType = SheetHelper.getItemType(event);
      const name = game.i18n.format(ANARCHY.common.newName, { type: game.i18n.localize(ANARCHY.itemType.singular[itemType]) });
      await this.actor.createEmbeddedDocuments('Item', [{ name: name, type: itemType }], { renderSheet: true });
    });

    html.find('.click-item-edit').click(async event => {
      const itemId = SheetHelper.getItemId(event);
      const item = this.actor.items.get(itemId);
      item.sheet.render(true);
    });

    html.find('.click-item-delete').click(async event => {
      const itemId = SheetHelper.getItemId(event);
      const item = this.actor.items.get(itemId);
      ConfirmationDialog.confirmDeleteItem(item, () => {
        this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        this.render(true);
      });
    });

    // counters & monitors
    html.find('a.click-checkbar-element').click(async event => {
      const monitor = $(event.currentTarget).closest('.checkbar-root').attr('data-monitor-code');
      const index = Number.parseInt($(event.currentTarget).attr('data-index'));
      const checked = $(event.currentTarget).attr('data-checked') == 'true';
      const newValue = index + (checked ? 0 : 1);

      await this.actor.setCounter(monitor, newValue);
    });

    // rolls
    html.find('.click-skill-roll').click(async event => {
      const specialization = $(event.currentTarget).closest('.click-skill-roll').attr('data-item-specialization')
      const itemId = SheetHelper.getItemId(event);
      const item = this.actor.items.get(itemId);
      this.actor.skillRoll(item, specialization);
    });

    html.find('.click-roll-attribute').click(async event => {
      const attribute = $(event.currentTarget).closest('.item').attr('data-attribute');
      this.actor.attributeRoll(attribute);
    });

    html.find('.click-roll-attribute-action').click(async event => {
      const attribute = $(event.currentTarget).attr('data-attribute');
      const attribute2 = $(event.currentTarget).attr('data-attribute2');
      const actionCode = $(event.currentTarget).attr('data-action-code');
      this.actor.attributeRoll(attribute, attribute2, actionCode);
    });

    html.find('.click-weapon-roll').click(async event => {
      const itemId = SheetHelper.getItemId(event);
      const weapon = this.actor.items.get(itemId);
      this.actor.weaponRoll(weapon);
    });

  }

}