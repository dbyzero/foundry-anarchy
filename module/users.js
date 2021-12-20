import { SRA } from "./config.js";
import { Misc } from "./misc.js";
import { RemoteCall } from "./remotecall.js";

const BLIND_MESSAGE_TO_GM = 'Users.blindMessageToGM';

export class Users {

  static init() {
    RemoteCall.register(BLIND_MESSAGE_TO_GM, {
      callback: data => Users.blindMessageToGM(data),
      condition: user => user.isGM
    })
  }

  static blindMessageToGM(chatMessageData) {
    if (!RemoteCall.call(BLIND_MESSAGE_TO_GM, chatMessageData)) {
      ChatMessage.create({
        user: chatMessageData.user,
        whisper: ChatMessage.getWhisperRecipients('GM'),
        blind: true,
        content: game.i18n.format(SRA.chat.blindMessageToGM, {
          user: game.user.name,
          message: chatMessageData.content
        })
      });
    }
  }

  static oneGM() {
    return game.users.entities.find(u => u.isGM);
  }

  static firstConnectedGM() {
    return game.users.entities.sort(Misc.ascending(u => u.id)).find(u => u.isGM && u.active);
  }

  /**
   * @returns true pour un seul utilisateur: le premier GM connecté par ordre d'id
   */
  static isUniqueConnectedGM(user) {
    return user.id == Users.firstConnectedGM()?.id;
  }
}