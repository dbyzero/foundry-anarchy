import { TEMPLATES_PATH } from "../constants";

export class SRAActorSheet extends ActorSheet {

    get template() {
    return `${TEMPLATES_PATH}/actor/${this.actor.data.type}.html`;
  }

  getData(options?: Application.RenderOptions): Promise<ActorSheet.Data<ActorSheet.Options>> | ActorSheet.Data<ActorSheet.Options> {
    let data = super.getData() as unknown as ActorSheet.Data<ActorSheet.Options>;
    // TODO: fill data on our own
    
    return data;
  }

}