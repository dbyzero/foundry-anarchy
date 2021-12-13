import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Misc } from "../misc.js";
import { Essence } from "../essence.js";
import { ConfirmationDialog } from "../confirmation.js";
import { SheetHelper } from "../sheet-helper.js";

export class SRABaseCharacterSheet extends ActorSheet {

  get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.hbs`;
  }

  getData(options) {
    let hbsData = mergeObject(
      super.getData(options), {
      items: {},
      config: SRA,
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner
      },
      essence: {
        adjust: Essence.getAdjust(this.actor.data.data.counters.essence.value)
      }
    });
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // cues, dispositions, keywords
    html.find('.wordlist-add').click(async event => {
      const wordlist = SheetHelper.getEventItemData(event, 'wordlist', '.define-wordlist');
      const word = game.i18n.localize(SRA.common.newEntry);
      this.actor.createWordlistWord(wordlist, word);
    });

    html.find('.wordlist-value').change(async event => {
      const updated = event.currentTarget.value;
      const previous = SheetHelper.getEventItemData(event, 'word', '.define-wordlist');
      const wordlist = SheetHelper.getEventItemData(event, 'wordlist', '.define-wordlist');
      await this.actor.updateWordlistWord(wordlist, previous, updated);
    });
    
    html.find('.wordlist-delete').click(async event => {
      const wordlist = SheetHelper.getEventItemData(event, 'wordlist', '.define-wordlist');
      const word = SheetHelper.getEventItemData(event, 'word', '.define-wordlist');
      this.actor.deleteWordlistWord(wordlist, word);
    });

    // items standard actions (add/edit/delete)
    html.find('.item-add').click(async event => {
      this.createItem(SheetHelper.getItemType(event))
    });

    html.find('.item-edit').click(async event => {
      const item = SheetHelper.getItem(event, this.actor);
      item.sheet.render(true);
    });

    html.find('.item-delete').click(async event => {
      const item = SheetHelper.getItem(event, this.actor);
      ConfirmationDialog.confirmDeleteActorItem(this, item, (id) => {
        this.actor.deleteEmbeddedDocuments('Item', [id]);
        this.render(true);
      });
    });


  }

  /* -------------------------------------------- */
  async createItem(type) {
    const name = game.i18n.format(SRA.common.newName, { type: game.i18n.localize(SRA.itemType.singular[type]) });
    await this.actor.createEmbeddedDocuments('Item', [{ name: name, type: type }], { renderSheet: true });
  }


}