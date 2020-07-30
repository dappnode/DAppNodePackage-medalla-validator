import { ValidatorFiles } from "../../common";
import { writeValidatorFiles } from "../services/validatorFiles";
import { getCurrentValidatorBinary } from "../services/validatorBinary";

/**
 * Import validator keystores and passphrases, store them locally
 * and restart validator client to apply
 */
export async function importValidators(
  validatorsFiles: ValidatorFiles[]
): Promise<void> {
  writeValidatorFiles(validatorsFiles);
  const validatorBinary = getCurrentValidatorBinary();
  await validatorBinary.restart();
}
