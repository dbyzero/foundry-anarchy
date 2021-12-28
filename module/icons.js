import { SYSTEM_PATH } from "./constants.js";

export class Icons {

  static fontAwesome(faClass) {
    return `<i class="${faClass}"></i>`;
  }
  static iconSrc(src, cssClasses) {
    return `<img class="${cssClasses}" src="${SYSTEM_PATH}/${src}" />`;
  }

}