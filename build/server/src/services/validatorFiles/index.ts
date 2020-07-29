import { ValidatorFileManager } from "./abstractManager";
import { LighthouseValidatorFileManager } from "./lighthouse";
import { ValidatorFiles, Eth2ClientName } from "../../../common";
import { LIGHTHOUSE_KEYSTORES_DIR, LIGHTHOUSE_SECRETS_DIR } from "../../params";

export function writeValidatorFiles(
  client: Eth2ClientName,
  validatorFiles: ValidatorFiles
): void {
  const validatorFileManager = getValidatorFileManager(client);
  validatorFileManager.write(validatorFiles);
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
