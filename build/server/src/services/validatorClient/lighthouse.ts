import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import { promisify } from "util";
import { keystoreManager } from "../keystoreManager";
import { ClientKeystoreManager } from "./generic";
import { Supervisor } from "../../utils/Supervisor";
import {
  LIGHTHOUSE_BINARY,
  LIGHTHOUSE_DATA_DIR,
  LIGHTHOUSE_KEYSTORES_DIR,
  LIGHTHOUSE_SECRETS_DIR,
  LIGHTHOUSE_VERBOSITY,
  LIGHTHOUSE_EXTRA_OPTS
} from "../../params";
import { getLogger } from "../../logs";
import { getBeaconProviderUrl } from "../../utils/beaconProviderUrl";

export const lighthouseBinary = new Supervisor(
  {
    command: LIGHTHOUSE_BINARY,
    args: ["validator_client"],
    options: {
      "auto-register": true,
      // "strict-lockfiles": true,
      "debug-level": LIGHTHOUSE_VERBOSITY,
      datadir: LIGHTHOUSE_DATA_DIR,
      "secrets-dir": LIGHTHOUSE_SECRETS_DIR,
      server: getBeaconProviderUrl(),
      // dargs extra options
      _: [LIGHTHOUSE_EXTRA_OPTS]
    },
    dynamicOptions: () => ({
      server: getBeaconProviderUrl()
    })
  },
  {
    timeoutKill: 10 * 1000,
    restartWait: 1000,
    resolveStartOnData: true,
    logger: getLogger({ location: "lighthouse" })
  }
);

/**
 * Lighthouse account paths
 *
 * ```bash
 * $accountsRootDir
 * ├── secrets
 * |   ├── 0x8e41b969493454318c27ec6fac90645769331c07ebc8db5037...
 * |   └── 0xa329f988c16993768299643d918a2694892c012765d896a16f...
 * ├── keystores
 * |   ├── 0x8e41b969493454318c27ec6fac90645769331c07ebc8db5037...
 * |   |   ├── eth1-deposit-data.rlp
 * |   |   ├── eth1-deposit-gwei.txt
 * |   |   └── voting-keystore.json
 * |   └── 0xa329f988c16993768299643d918a2694892c012765d896a16f...
 * |       ├── eth1-deposit-data.rlp
 * |       ├── eth1-deposit-gwei.txt
 * |       └── voting-keystore.json
 * ├── wallet1.pass (arbitrary path)
 * └── wallets
 *     └── 96ae14b4-46d7-42dc-afd8-c782e9af87ef (dir)
 *         └── 96ae14b4-46d7-42dc-afd8-c782e9af87ef (json)
 * ```
 */
export const lighthouseKeystoreManager: ClientKeystoreManager = {
  async hasKeystores(): Promise<boolean> {
    return fs.readdirSync(LIGHTHOUSE_KEYSTORES_DIR).length > 0;
  },

  async importKeystores() {
    await fs.promises.mkdir(LIGHTHOUSE_SECRETS_DIR, { recursive: true });
    const validatorsPaths = keystoreManager.getValidatorsPaths();
    for (const validatorPaths of validatorsPaths) {
      let pubkey = validatorPaths.pubkey;
      if (!pubkey.startsWith("0x")) pubkey = `0x${pubkey}`;
      const dirPath = path.join(LIGHTHOUSE_KEYSTORES_DIR, pubkey);
      const keystorePath = path.join(dirPath, "voting-keystore.json");
      const secretPath = path.join(LIGHTHOUSE_SECRETS_DIR, pubkey);
      await fs.promises.mkdir(dirPath, { recursive: true });
      await fs.promises.copyFile(validatorPaths.keystorePath, keystorePath);
      await fs.promises.copyFile(validatorPaths.secretPath, secretPath);
    }
  },

  async deleteKeystores() {
    await promisify(rimraf)(LIGHTHOUSE_KEYSTORES_DIR);
    await promisify(rimraf)(LIGHTHOUSE_SECRETS_DIR);
  }
};
