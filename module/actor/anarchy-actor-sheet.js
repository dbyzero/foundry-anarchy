import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Misc } from "../misc.js";
import { Essence } from "../essence.js";
import { ConfirmationDialog } from "../confirmation.js";
import { SheetHelper } from "../sheet-helper.js";
import { Enums } from "../enums.js";

export class AnarchyActorSheet extends ActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.hbs`;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      dragDrop: [{ dragSelector: ".item ", dropSelector: null }],
    });
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      items: {},
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner,
        cssClass: this.isEditable ? "editable" : "locked",
        ownAnarchy: this.document.hasPlayerOwner,
        anarchy: {
          value: this.actor.getAnarchy(),
          max: this.actor.getAnarchyMax()
        }
      },
      essence: {
        adjust: Essence.getAdjust(this.actor.data.data.counters?.essence?.value)
      },
      ENUMS: Enums.getEnums(),
      ANARCHY: ANARCHY
    });
    hbsData.options.classes.push(game.system.anarchy.styles.selectCssClass(this.actor.data.data.style));
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // cues, dispositions, keywords
    html.find('.click-wordlist-add').click(async event => {
      const wordlist = SheetHelper.getWordList(event);
      const word = game.i18n.localize(ANARCHY.common.newEntry);
      this.actor.createWordlistWord(wordlist, word);
    });

    html.find('.change-wordlist-value').change(async event => {
      const updated = event.currentTarget.value;
      const previous = SheetHelper.getWord(event);
      const wordlist = SheetHelper.getWordList(event);
      await this.actor.updateWordlistWord(wordlist, previous, updated);
    });

    html.find('.click-wordlist-delete').click(async event => {
      const previous = SheetHelper.getWord(event);
      const wordlist = SheetHelper.getWordList(event);
      this.actor.deleteWordlistWord(wordlist, previous);
    });

    // items standard actions (add/edit/delete)
    html.find('.click-item-add').click(async event => {
      this.createItem(SheetHelper.getItemType(event))
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
      const specialization = SheetHelper.getClosestElementData(event, "item-specialization", ".click-skill-roll");
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

    // rolls
    html.find('.click-weapon-roll').click(async event => {
      const itemId = SheetHelper.getItemId(event);
      const weapon = this.actor.items.get(itemId);
      this.actor.weaponRoll(weapon);
    });

  }

  /* -------------------------------------------- */
  async createItem(type) {
    const name = game.i18n.format(ANARCHY.common.newName, { type: game.i18n.localize(ANARCHY.itemType.singular[type]) });
    await this.actor.createEmbeddedDocuments('Item', [{ name: name, type: type }], { renderSheet: true });
  }

  async _onDropItem(event, dragData) {
    const destItemId = $(event.target).closest('.item').attr('data-item-id');
    /*
      TODO:
      if destItemId
        if Same type
          move before the item
        else
          for now do nothing.
      else
        if in container
          is it before or after items? move at begining or at end

    //const callSuper = await this.actor.processDropItem(dropParams);
    */
    await super._onDropItem(event, dragData)
  }

}