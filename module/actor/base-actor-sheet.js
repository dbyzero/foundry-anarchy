import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { ConfirmationDialog } from "../confirmation.js";
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
      ownerActor: this.actor.getOwnerActor(),
      ownedActors: this.actor.getOwnedActors(),
      options: {
        owner: this.document.isOwner,
        cssClass: this.isEditable ? "editable" : "locked",
      },
      ENUMS: mergeObject({ attributeActions: this.actor.getAttributeActions() }, Enums.getEnums()),
      ANARCHY: ANARCHY
    });
    Misc.classifyInto(hbsData.items, hbsData.data.items);
    return hbsData;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // items standard actions (add/edit/delete)
    html.find('.click-item-add').click(async event => {
      await this.createNewItem(this.getEventItemType(event));
    });

    html.find('.click-item-edit').click(async event => {
      this.getEventItem(event)?.sheet.render(true);
    });

    html.find('.click-item-delete').click(async event => {
      const item = this.getEventItem(event);
      ConfirmationDialog.confirmDeleteItem(item, async () => {
        await this.actor.deleteEmbeddedDocuments('Item', [item.id]);
        this.render(true);
      });
    });

    // ownership management
    html.find('.click-owner-actor-unlink').click(async event => {
      this.detachFromOwner(this.actor.getOwnerActor(), this.actor);
    });
    html.find('.click-owned-actor-view').click(async event => {
      this.getEventOwnedActor(event)?.sheet.render(true);
    });
    html.find('.click-owned-actor-unlink').click(async event => {
      this.detachFromOwner(this.actor, this.getEventOwnedActor(event));
    });

    // counters & monitors
    html.find('a.click-checkbar-element').click(async event => {
      const handler = this.getEventItem(event) ?? this.actor;
      await handler.switchMonitorCheck(
        this.getEventMonitorCode(event),
        this.getEventIndex(event),
        this.isEventChecked(event)
      );

    });

    // rolls
    html.find('.click-skill-roll').click(async event => {
      this.actor.skillRoll(
        this.getEventItem(event),
        this.getEventSkillSpecialization(event));
    });

    html.find('.click-roll-attribute').click(async event => {
      const handler = this.getEventItem(event) ?? this.actor;
      handler.attributeRoll(
        $(event.currentTarget).closest('.anarchy-attribute').attr('data-attribute')
      );
    });

    html.find('.click-roll-attribute-action').click(async event => {
      //TODO: add action buttons to cberdeck? //const handler = this.getEventItem(event) ?? this.actor;
      this.actor.attributeRoll(
        $(event.currentTarget).attr('data-attribute'),
        $(event.currentTarget).attr('data-attribute2'),
        $(event.currentTarget).attr('data-action-code'));
    });

    html.find('.click-weapon-roll').click(async event => {
      this.actor.weaponRoll(this.getEventItem(event));
    });
  }

  getEventItemType(event) {
    return $(event.currentTarget).closest('.define-item-type').attr('data-item-type');
  }

  getEventItem(event) {
    const itemId = $(event.currentTarget).closest('.item').attr('data-item-id')
      ?? $(event.currentTarget).closest('.anarchy-metatype').attr('data-item-id');
    return this.actor.items.get(itemId);
  }

  isEventChecked(event) {
    return $(event.currentTarget).attr('data-checked') == 'true';
  }

  getEventSkillSpecialization(event) {
    return $(event.currentTarget).closest('.click-skill-roll').attr('data-item-specialization');
  }

  getEventActionCode(event) {
    return $(event.currentTarget).attr('data-action-code');
  }

  getEventMonitorCode(event) {
    return $(event.currentTarget).closest('.checkbar-root').attr('data-monitor-code');
  }

  getEventIndex(event) {
    return Number.parseInt($(event.currentTarget).attr('data-index'));
  }

  getEventOwnedActor(event) {
    const ownedActorId = $(event.currentTarget).closest('.define-owned-actor').attr('data-actor-id');
    return game.actors.get(ownedActorId);
  }

  async createNewItem(itemType) {
    const name = game.i18n.format(ANARCHY.common.newName, { type: game.i18n.localize(ANARCHY.itemType.singular[itemType]) });
    await this.actor.createEmbeddedDocuments('Item', [{ name: name, type: itemType }], { renderSheet: true });
  }

  detachFromOwner(owner, owned) {
    ConfirmationDialog.confirmDetachOwnerActor(owner, owned, async () => {
      await owned.attachToOwnerActor();
      this.render(true);
    });
  }

  async _onDropActor(event, dragData) {
    if (dragData.id != this.actor.id) {
      const owned = game.actors.get(dragData.id);
      if (owned) {
        // check circular references: find a owner, without finding the owned id
        ConfirmationDialog.confirmAttachOrCopy(this.actor, owned,
          async () => await owned.attachToOwnerActor(this.actor),
          async () => await owned.attachToOwnerActor(this.actor, 'copy'));
      }
    }
    super._onDropActor(event, dragData);
  }

}