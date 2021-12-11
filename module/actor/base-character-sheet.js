import { SRA } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Misc } from "../misc.js";
import { Essence } from "../essence.js";
import { ConfirmationDialog } from "../confirmation.js";

export class SRABaseCharacterSheet extends ActorSheet {

  static getItem(event, actor) {
    return actor.items.get(SRABaseCharacterSheet.getItemId(event));
  }

  static getItemId(event) {
    return SRABaseCharacterSheet.getEventItemData(event, "item-id");
  }
  static getItemType(event) {
    return SRABaseCharacterSheet.getEventItemData(event, "item-type", ".define-item-type");
  }

  static getEventItemData(event, property, parentclass=".item") {
    const node = SRABaseCharacterSheet.getEventElement(event, parentclass);
    return node?.data(property);
  }

  static getEventElement(event, parentclass=".item") {
    return $(event.currentTarget)?.parents(parentclass);
  }

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
      essence:{
        adjust: Essence.getAdjust(this.actor.data.data.counters.essence.value)
      }
    });
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-edit').click(async event => {
      const item = SRABaseCharacterSheet.getItem(event, this.actor);
      item.sheet.render(true);
    });
    
    html.find('.item-delete').click(async event => {
      const item = SRABaseCharacterSheet.getItem(event, this.actor);
      ConfirmationDialog.confirmDeleteActorItem(this, item, (id)=>{
        this.actor.deleteEmbeddedDocuments('Item', [id]);
        this.render(true);
      });
    });

    html.find('.item-add').click(async event => {
      const itemType = SRABaseCharacterSheet.getItemType(event);
      const itemName = game.i18n.format(SRA.common.newName, {type: game.i18n.localize('SRA.itemType.singular.'+itemType)}) ;
      this.createItem(itemName, itemType)
    });

  }
  
  /* -------------------------------------------- */
  async createItem(name, type) {
    await this.actor.createEmbeddedDocuments('Item', [{ name: name, type: type }], { renderSheet: true });
  }


}