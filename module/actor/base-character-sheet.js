import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Misc } from "../misc.js";
import { Essence } from "../essence.js";
import { ConfirmationDialog } from "../confirmation.js";
import { SheetHelper } from "../sheet-helper.js";
import { Enums } from "../enums.js";

export class SRABaseCharacterSheet extends ActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.hbs`;
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      items: {},
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner
      },
      essence: {
        adjust: Essence.getAdjust(this.actor.data.data.counters.essence.value)
      },
      ENUMS: Enums.getEnums(),
      SRA: SRA
    });
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // cues, dispositions, keywords
    html.find('.wordlist-add').click(async event => {
      const wordlist = SheetHelper.getWordList(event);
      const word = game.i18n.localize(SRA.common.newEntry);
      this.actor.createWordlistWord(wordlist, word);
    });

    html.find('.wordlist-value').change(async event => {
      const updated = event.currentTarget.value;
      const previous = SheetHelper.getWord(event);
      const wordlist = SheetHelper.getWordList(event);
      await this.actor.updateWordlistWord(wordlist, previous, updated);
    });
    
    html.find('.wordlist-delete').click(async event => {
      const previous = SheetHelper.getWord(event);
      const wordlist = SheetHelper.getWordList(event);
      this.actor.deleteWordlistWord(wordlist, previous);
    });

    // items standard actions (add/edit/delete)
    html.find('.item-add').click(async event => {
      this.createItem(SheetHelper.getItemType(event))
    });

    html.find('.item-edit').click(async event => {
      const itemId = SheetHelper.getItemId(event);
      const item = this.actor.items.get(itemId);
      item.sheet.render(true);
    });

    html.find('.item-delete').click(async event => {
      const itemId = SheetHelper.getItemId(event);
      const item = this.actor.items.get(itemId);
      ConfirmationDialog.confirmDeleteItem(item, () => {
        this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        this.render(true);
      });
    });

    // counters & monitors
    html.find('a.click-checkbar-element').click(async event =>{
      const monitor = $(event.currentTarget).closest('.checkbar-root').attr('data-monitor-code');
      const index = Number.parseInt($(event.currentTarget).attr('data-index'));
      const checked = $(event.currentTarget).attr('data-checked') == 'true';
      console.log('click monitor ', monitor, ' at ', index, ' checked', checked);
      await this.actor.setCounter(monitor, index + (checked ? 0 : 1));
    });

    // rolls
    html.find('.skill-roll').click(async event => {
      const specialization = SheetHelper.getClosestElementData(event, "item-specialization", ".skill-roll");
      const itemId = SheetHelper.getItemId(event);
      const item = this.actor.items.get(itemId);
      this.actor.skillRoll(item, specialization);
    });


  }

  /* -------------------------------------------- */
  async createItem(type) {
    const name = game.i18n.format(SRA.common.newName, { type: game.i18n.localize(SRA.itemType.singular[type]) });
    await this.actor.createEmbeddedDocuments('Item', [{ name: name, type: type }], { renderSheet: true });
  }


}