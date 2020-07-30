import { ValidatorFiles } from "../../../common";

export interface ValidatorFileManager {
  hasKeys: () => boolean;
  readPubkeys: () => string[];
  read: () => ValidatorFiles[];
  write: (validatorFiles: ValidatorFiles[]) => void;
}
