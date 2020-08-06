import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import rimraf from "rimraf";
import dargs from "dargs";
import { getLogger } from "../../logs";
import { keystoreManager } from "../keystoreManager";
import { ClientKeystoreManager } from "./generic";
import {
  Supervisor,
  getBeaconProviderUrl,
  getRandomToken,
  ensureDirFromFilePath
} from "../../utils";
import {
  PRYSM_BINARY,
  PRYSM_VERBOSITY,
  PRYSM_EXTRA_OPTS,
  PRYSM_LOG_FILE,
  PRYSM_DATA_DIR,
  PRYSM_WALLET_DIR,
  PRYSM_WALLET_PASSWORD_PATH,
  PRYSM_SECRETS_DIR,
  GRAFFITI
} from "../../params";

/**
 * Prysm does not want the protocol in the beacon URL
 */
function getBeaconProviderUrlPrysm() {
  const url = getBeaconProviderUrl();
  return url.replace(/^https?:\/\//, "");
}

export const prysmBinary = new Supervisor(
  {
    command: PRYSM_BINARY,
    options: {
      "monitoring-host": "0.0.0.0",
      "beacon-rpc-provider": getBeaconProviderUrlPrysm(),
      datadir: PRYSM_DATA_DIR,
      "wallet-dir": PRYSM_WALLET_DIR,
      "passwords-dir": PRYSM_SECRETS_DIR,
      // "disable-accounts-v2": true,
      verbosity: PRYSM_VERBOSITY,
      "log-file": PRYSM_LOG_FILE,
      ...(GRAFFITI ? { graffiti: GRAFFITI } : {}), // Ignore if empty
      // dargs extra options
      _: [PRYSM_EXTRA_OPTS]
    },
    dynamicOptions: () => ({
      "beacon-rpc-provider": getBeaconProviderUrlPrysm()
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    logger: getLogger({ location: "prysm" })
  }
);

/**
 * Prysm uses the validator binary to handle the import of keystores
 * The resulting structure is not relevant and can be completely
 * deleted by just removing the wallet directory
 */
export const prysmKeystoreManager: ClientKeystoreManager = {
  hasKeystores(): boolean {
    return keystoreManager.getValidatorsPaths().length > 0;

    // TODO: Use Prysm itself to check if it has keystores
    // await shell(
    //   "validator accounts-v2 list",
    //   dargs({
    //     "wallet-dir": PRYSM_WALLET_DIR,
    //     "wallet-password-file": PRYSM_WALLET_PASSWORD_PATH
    //   })
    // );
  },

  async importKeystores() {
    if (!fs.existsSync(PRYSM_WALLET_PASSWORD_PATH)) {
      ensureDirFromFilePath(PRYSM_WALLET_PASSWORD_PATH);
      fs.writeFileSync(PRYSM_WALLET_PASSWORD_PATH, getRandomToken(32));
    }

    // Necessary to create a wallet?

    for (const validatorPaths of keystoreManager.getValidatorsPaths()) {
      await promisify(exec)(
        [
          PRYSM_BINARY,
          "accounts-v2",
          "import",
          ...dargs({
            "wallet-dir": PRYSM_WALLET_DIR,
            "wallet-password-file": PRYSM_WALLET_PASSWORD_PATH,
            // Directory containing multiple keystores WITH THE SAME PASSWORD
            "keys-dir": validatorPaths.dirPath,
            "account-password-file": validatorPaths.secretPath
          })
        ].join(" ")
      );
    }
  },

  async deleteKeystores() {
    await promisify(rimraf)(PRYSM_WALLET_DIR);
  }
};
