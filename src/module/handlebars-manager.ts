import { TEMPLATES_PATH } from "./constants";

export const partials = [
  `${TEMPLATES_PATH}/actor/parts/ProfileImage.html`,
];

export class HandlebarsManager {

  static async preload() {
    await loadTemplates(partials);
  }

  static async register() {
  }
}