/**
 * The constants file contains things that do not change
 *
 * Constants are written in ALL_CAPS_CONSTANTS and should never be changed during runtime.
 */
export const SYSTEM_NAME = 'anarchy';
export const SYSTEM_DESCRIPTION = "Anarchy";
export const SYSTEM_SOCKET = `system.${SYSTEM_NAME}`;
export const SYSTEM_PATH = `systems/${SYSTEM_NAME}`;
export const TEMPLATES_PATH = `systems/${SYSTEM_NAME}/templates`;
export const LOG_HEAD = 'Anarchy | ';

export const ANARCHY_DICE_BONUS = 3;
export const SPECIALIZATION_BONUS = 2;
export const PLAYER_MAX_ANARCHY = 6;

export const TARGET_SUCCESS = 5;
export const TARGET_SUCCESS_EDGE = 4;

export const BASE_MONITOR = 8;

export const TEMPLATE = {
  attributes: {
    agility: "agility",
    strength: "strength",
    willpower: "willpower",
    logic: "logic",
    charisma: "charisma",
    edge: "edge",
    autopilot: "autopilot",
    firewall: "firewall",
    system: "system",
  }
}
