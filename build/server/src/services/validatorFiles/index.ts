import { server } from "../../db";
import { ValidatorFileManager } from "./abstractManager";
import { LighthouseValidatorFileManager } from "./lighthouse";
import { ValidatorFiles, Eth2ClientName } from "../../../common";
import { LIGHTHOUSE_KEYSTORES_DIR, LIGHTHOUSE_SECRETS_DIR } from "../../params";

export function writeValidatorFiles(validatorsFiles: ValidatorFiles[]): void {
  const validatorFileManager = getCurrentValidatorFileManager();
  validatorFileManager.write(validatorsFiles);
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
function getValidatorFileManager(client: Eth2ClientName): ValidatorFileManager {
  switch (client) {
    case "lighthouse":
      return new LighthouseValidatorFileManager({
        keystoresDir: LIGHTHOUSE_KEYSTORES_DIR,
        secretsDir: LIGHTHOUSE_SECRETS_DIR
      });

    case "prysm":
    default:
      throw Error(`Unsupported client ${client}`);
  }
}
