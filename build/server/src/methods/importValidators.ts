import { server } from "../db";
import { ValidatorFiles } from "../../common";
import { writeValidatorFiles } from "../services/validatorFiles";

/**
 * Import validator keystores and passphrases, store them locally
 * and restart validator client to apply
 */
export async function importValidators(
  validatorsFiles: ValidatorFiles[]
): Promise<void> {
  // Make sure all validators are written to the same client
  const client = server.validatorClient.get();
  for (const validatorFiles of validatorsFiles) {
    writeValidatorFiles(client, validatorFiles);
  }
}
