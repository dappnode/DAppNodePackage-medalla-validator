import { server } from "../../db";
import { ValidatorFileManager } from "./abstractManager";
import { LighthouseValidatorFileManager } from "./lighthouse";
import { ValidatorFiles, Eth2ClientName } from "../../../common";
import { LIGHTHOUSE_KEYSTORES_DIR, LIGHTHOUSE_SECRETS_DIR } from "../../params";

// Create unique instances to make sure files are not being written more than once
const lighthouseFileManager = new LighthouseValidatorFileManager({
  keystoresDir: LIGHTHOUSE_KEYSTORES_DIR,
  secretsDir: LIGHTHOUSE_SECRETS_DIR
});

export async function writeValidatorFiles(
  validatorsFiles: ValidatorFiles[]
): Promise<void> {
  const validatorFileManager = getCurrentValidatorFileManager();
  await validatorFileManager.write(validatorsFiles);
}

/**
 * Check if current selected validator client has validator files
 * Use on startup to start its associated binary
 */
export function thereAreValidatorFiles(): boolean {
  const validatorFileManager = getCurrentValidatorFileManager();
  return validatorFileManager.hasKeys();
}

export function getCurrentValidatorFileManager(): ValidatorFileManager {
  const client = server.validatorClient.get();
  return getValidatorFileManager(client);
}

/**
 * Return a client specific validator file manager
 */
export function getValidatorFileManager(
  client: Eth2ClientName
): ValidatorFileManager {
  switch (client) {
    case "lighthouse":
      return lighthouseFileManager;

    case "prysm":
    default:
      throw Error(`Unsupported client ${client}`);
  }
}
