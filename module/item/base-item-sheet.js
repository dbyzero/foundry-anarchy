import { ANARCHY } from "../config.js";
import { TEMPLATES_PATH } from "../constants.js";
import { Enums } from "../enums.js";

export class BaseItemSheet extends ItemSheet {

  get title() {
    return game.i18n.localize(ANARCHY.itemType.singular[this.item.type]) + ': ' + this.item.name;
  }

  get template() {
    return `${TEMPLATES_PATH}/item/${this.object.type}.hbs`;
  }

  getData(options) {
    const actorAttributes = this.item.actor?.getAttributes(this.item);

    const usableAttribute = this.item.actor
      ? attribute => actorAttributes.includes(attribute)
      : attribute => true;

    let hbsData = mergeObject(
      super.getData(options), {
      options: {
        isGM: game.user.isGM,
        owner: this.document.isOwner,
        isOwned: (this.actor != undefined),
        editable: this.isEditable,
        cssClass: this.isEditable ? "editable" : "locked",
      },
      ENUMS: Enums.getEnums(usableAttribute),
      ANARCHY: ANARCHY
    });
    hbsData.options.classes.push(game.system.anarchy.styles.selectCssClass());

    return hbsData;
  }


  activateListeners(html) {
    super.activateListeners(html);

    // counters & monitors
    html.find('a.click-checkbar-element').click(async event => {
      if (this.item.parent) {
        const monitor = this.getEventMonitorCode(event);
        const sourceActorId = monitor == 'marks' ?
          $(event.currentTarget).closest('.anarchy-marks').attr('data-actor-id')
          : undefined;
        await this.item.switchMonitorCheck(
          monitor,
          this.getEventIndex(event),
          this.isEventChecked(event),
          sourceActorId
        );
      }
    });
  }

  getEventMonitorCode(event) {
    return $(event.currentTarget).closest('.checkbar-root').attr('data-monitor-code');
  }

  getEventIndex(event) {
    return Number.parseInt($(event.currentTarget).attr('data-index'));
  }

  isEventChecked(event) {
    return $(event.currentTarget).attr('data-checked') == 'true';
  }
}
