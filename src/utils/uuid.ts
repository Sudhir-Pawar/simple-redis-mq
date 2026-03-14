import { v7 as uuidv7 } from "uuid";

export class UUID {
  static getUniqueId() {
    return uuidv7();
  }
}
