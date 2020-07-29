import { ValidatorFiles } from "../../../common";

export interface ValidatorFileManager {
  write: (validatorFiles: ValidatorFiles) => void;
}
