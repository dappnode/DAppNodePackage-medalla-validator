import { ValidatorFiles } from "../../../common";

export interface ValidatorFileManager {
  hasKeys: () => boolean;
  readPubkeys: () => string[];
  read: () => Promise<ValidatorFiles[]>;
  write: (validatorFiles: ValidatorFiles[]) => Promise<void>;
  delete: () => Promise<void>;
}

export class BaseFileManager {
  private locked = false;

  /**
   * Callbacks passed to this function can only be run once at a time
   */
  async ifNotLocked<R>(fn: () => Promise<R>): Promise<R> {
    if (this.locked) throw Error(`file manager is locked`);
    try {
      this.locked = true;
      const res = await fn();
      this.locked = false;
      return res;
    } catch (e) {
      this.locked = false;
      throw e;
    }
  }
}
