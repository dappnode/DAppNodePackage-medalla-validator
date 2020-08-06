import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import rimraf from "rimraf";
import dargs from "dargs";
import { getLogger } from "../../logs";
import { ValidatorPaths } from "../keystoreManager";
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
  GRAFFITI
} from "../../params";

const binaryLogger = getLogger({ location: "prysm" });
const keyMgrLogger = getLogger({ location: "prysm keystore manager" });

export const prysmBinary = new Supervisor(
  {
    command: PRYSM_BINARY,
    options: {
      "monitoring-host": "0.0.0.0",
      "beacon-rpc-provider": getBeaconProviderUrlPrysm(),
      datadir: PRYSM_DATA_DIR,
      "wallet-dir": PRYSM_WALLET_DIR,
      "wallet-password-file": PRYSM_WALLET_PASSWORD_PATH,
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
    logger: binaryLogger
  }
);

/**
 * Prysm uses the validator binary to handle the import of keystores
 * The resulting structure is not relevant and can be completely
 * deleted by just removing the wallet directory
 */
export const prysmKeystoreManager: ClientKeystoreManager = {
  async hasKeystores(): Promise<boolean> {
    return fs.existsSync(PRYSM_WALLET_DIR);

    // TODO: Use a better way
    // Note: `accounts-v2 list` outputs a too verbose output, can't use
    // [2020-08-06 21:57:14]  INFO accounts-v2: (wallet directory) /prysm/.eth2validators/primary
    // (keymanager kind) non-HD wallet

    // Showing 1 validator account
    // View the eth1 deposit transaction data for your accounts by running `validator accounts-v2 list --show-deposit-data

    // Account 0 | shortly-vast-gibbon
    // [validating public key] 0xb709108cf222c87d64526c393d872961f647f438b483365c14e5c0a26d08862cf06d10e630a71816c1920cb8ac699260

    // const { stdout, stderr } = await promisify(exec)(
    //   [
    //     PRYSM_BINARY,
    //     "accounts-v2",
    //     "list",
    //     ...dargs({
    //       "wallet-dir": PRYSM_WALLET_DIR,
    //       "wallet-password-file": PRYSM_WALLET_PASSWORD_PATH
    //     })
    //   ].join(" ")
    // );
  },

  async importKeystores(validatorsPaths: ValidatorPaths[]) {
    if (!fs.existsSync(PRYSM_WALLET_PASSWORD_PATH)) {
      ensureDirFromFilePath(PRYSM_WALLET_PASSWORD_PATH);
      fs.writeFileSync(PRYSM_WALLET_PASSWORD_PATH, getPrysmPassword());
      keyMgrLogger.info(`Wrote wallet password: ${PRYSM_WALLET_PASSWORD_PATH}`);
    }

    // Necessary to create a wallet?

    for (const validatorPaths of validatorsPaths) {
      const { stdout, stderr } = await promisify(exec)(
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
      keyMgrLogger.info(
        `Imported ${validatorsPaths.length} keystores to wallet ${PRYSM_WALLET_DIR}`,
        { stdout, stderr }
      );
    }
  },

  async deleteKeystores() {
    await promisify(rimraf)(PRYSM_WALLET_DIR);
    keyMgrLogger.info(`Deleted all files in ${PRYSM_WALLET_DIR}`);
  }
};

/**
 * Prysm does not want the protocol in the beacon URL
 */
function getBeaconProviderUrlPrysm() {
  const url = getBeaconProviderUrl();
  return url.replace(/^https?:\/\//, "");
}

/**
 * Return a password compatible with Prysm requirements
 * - more than 8 characters
 * - must contain 1 number
 * - must contain 1 special character
 */
function getPrysmPassword(): string {
  return getRandomToken(32) + ".";
}
