import { LOG_HEAD, SYSTEM_NAME } from "./constants.js";

export class HooksManager {
  constructor() {
    this.hooks = [];
  }

  register(name) {
    console.log(LOG_HEAD + 'HooksManager.register', name);
    if (!name.startsWith(SYSTEM_NAME + '-')) {
      throw "For safety Anarchy Hooks names must be prefixed by anarchy'-'"
    }
    this.hooks.push(name);
  }

}