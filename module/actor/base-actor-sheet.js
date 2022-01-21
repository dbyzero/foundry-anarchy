import { ANARCHY } from "../config.js";
import { TEMPLATE, TEMPLATES_PATH } from "../constants.js";
import { ConfirmationDialog } from "../confirmation.js";
import { Misc } from "../misc.js";
import { Enums } from "../enums.js";
import { SelectActor } from "../dialog/select-actor.js";

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
      ENUMS: mergeObject({ attributeAction: this.actor.getAttributeActions() }, Enums.getEnums()),
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

    html.find('.click-favorite').click(async event => {
      this.onClickFavorite({
        skillId: $(event.currentTarget).attr('data-skill-id'),
        specialization: $(event.currentTarget).attr('data-specialization'),
        weaponId: $(event.currentTarget).attr('data-weapon-id'),
        attributeAction: $(event.currentTarget).attr('data-attributeAction'),
        isFavorite: $(event.currentTarget).attr('data-isFavorite')
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
      const monitor = this.getEventMonitorCode(event);
      const sourceActorId = monitor == 'marks' ?
        $(event.currentTarget).closest('.anarchy-marks').attr('data-actor-id')
        : undefined;
      await handler.switchMonitorCheck(
        monitor,
        this.getEventIndex(event),
        this.isEventChecked(event),
        sourceActorId
      );
    });
    html.find('a.click-add-mark-actor').click(async event => {
      this.onClickAddMark();
    });

    // rolls
    html.find('.click-skill-roll').click(async event => {
      this.actor.rollSkill(
        this.getEventItem(event),
        this.getEventSkillSpecialization(event));
    });

    html.find('.click-roll-attribute').click(async event => {
      const handler = this.getEventItem(event) ?? this.actor;
      handler.rollAttribute(
        $(event.currentTarget).closest('.anarchy-attribute').attr('data-attribute')
      );
    });

    html.find('.click-roll-attribute-action').click(async event => {
      this.actor.rollAttributeAction(this.getEventActionCode(event));
    });

    html.find('.click-weapon-roll').click(async event => {
      this.actor.rollWeapon(this.getEventItem(event));
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

  async onClickFavorite(options) {
    const newState = options.isFavorite != "true";
    if (options.skillId) {
      await this.actor.switchFavorite(newState, TEMPLATE.itemType.skill, options.skillId, options.specialization);
    }
    else if (options.weaponId) {
      await this.actor.switchFavorite(newState, TEMPLATE.itemType.weapon, options.weaponId);
    }
    else if (options.attributeAction) {
      await this.actor.switchFavorite(newState, 'attributeAction', options.attributeAction);
    }
    else {
      console.warn('Favorite not supported', options);
    }
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

  async onClickAddMark() {
    if (this.actor.canReceiveMarks()) {
      const title = game.i18n.format(ANARCHY.common.selection.actorSettingMarks, { name: this.actor.name });
      await SelectActor.selectActor(title,
        game.actors.filter(actor => !this.actor.getActorMarks(actor.id) && actor.canSetMarks()),
        actor => this.actor.addActorMark(actor.id)
      );
    }
  }
}