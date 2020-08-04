import { ValidatorFiles } from "../../common";
import { getValidatorFileManager } from "../services/validatorFiles";
import { getValidatorBinary } from "../services/validatorBinary";
import * as db from "../db";

/**
 * Import validator keystores and passphrases, store them locally
 * and restart validator client to apply
 */
export async function importValidators(
  validatorsFiles: ValidatorFiles[]
): Promise<void> {
  const fileManager = getValidatorFileManager(db.server.validatorClient.get());
  await fileManager.write(validatorsFiles);

  // Re-fetch current validatorClient in case it has changed
  const binary = getValidatorBinary(db.server.validatorClient.get());
  await binary.restart();
}
