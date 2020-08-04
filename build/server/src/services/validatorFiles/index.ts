import * as db from "../../db";
import { ValidatorFileManager } from "./abstractManager";
import { ValidatorClientName } from "../../../common";
import { LighthouseValidatorFileManager } from "./lighthouse";
import { PrysmValidatorFileManager } from "./prysm";
import {
  LIGHTHOUSE_KEYSTORES_DIR,
  LIGHTHOUSE_SECRETS_DIR,
  PRYSM_WALLET_DIR,
  PRYSM_SECRETS_DIR
} from "../../params";

// Create unique instances to make sure files are not being written more than once
const lighthouseFileManager = new LighthouseValidatorFileManager({
  keystoresDir: LIGHTHOUSE_KEYSTORES_DIR,
  secretsDir: LIGHTHOUSE_SECRETS_DIR
});

const prysmFileManager = new PrysmValidatorFileManager({
  walletDir: PRYSM_WALLET_DIR,
  secretsDir: PRYSM_SECRETS_DIR
});

export async function initializeValidatorDirectories() {
  lighthouseFileManager.init();
  prysmFileManager.init();
}

/**
 * Check if current selected validator client has validator files
 * Use on startup to start its associated binary
 */
export function thereAreValidatorFiles(): boolean {
  const client = db.server.validatorClient.get();
  const validatorFileManager = getValidatorFileManager(client);
  return validatorFileManager.hasKeys();
}

/**
 * Return a client specific validator file manager
 */
export function getValidatorFileManager(
  client: ValidatorClientName
): ValidatorFileManager {
  switch (client) {
    case "lighthouse":
      return lighthouseFileManager;

    case "prysm":
      return prysmFileManager;

    default:
      throw Error(`Unsupported client ${client}`);
  }
}
