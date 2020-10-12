import fs from "fs";
import path from "path";
import { exec } from "child_process";
import rimraf from "rimraf";
import dargs from "dargs";
import { promisify } from "util";
import { ValidatorPaths } from "../keystoreManager";
import { ClientKeystoreManager } from "./generic";
import { Supervisor, getBeaconProviderUrl, ensureDir } from "../../utils";
import {
  LIGHTHOUSE_BINARY,
  LIGHTHOUSE_DATA_DIR,
  LIGHTHOUSE_KEYSTORES_DIR,
  LIGHTHOUSE_SECRETS_DIR,
  LIGHTHOUSE_VERBOSITY,
  LIGHTHOUSE_EXTRA_OPTS,
  GRAFFITI
} from "../../params";
import { getLogger } from "../../logs";

const binaryLogger = getLogger({ location: "lighthouse" });
const keyMgrLogger = getLogger({ location: "lighthouse keystore manager" });

export const lighthouseBinary = new Supervisor(
  {
    command: LIGHTHOUSE_BINARY,
    args: ["validator_client"],
    options: {
      testnet: "zinken",
      // "strict-lockfiles": true,
      "debug-level": LIGHTHOUSE_VERBOSITY,
      datadir: LIGHTHOUSE_DATA_DIR,
      "secrets-dir": LIGHTHOUSE_SECRETS_DIR,
      server: getBeaconProviderUrl(),
      ...(GRAFFITI ? { graffiti: GRAFFITI } : {}), // Ignore if empty
      // dargs extra options
      _: [LIGHTHOUSE_EXTRA_OPTS]
    },
    // No typing necessary, Supervisor instance makes sure it's correct
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    dynamicOptions: () => ({
      server: getBeaconProviderUrl()
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
    try {
      return fs.readdirSync(LIGHTHOUSE_KEYSTORES_DIR).length > 0;
    } catch (e) {
      if (e.code === "ENOENT") return false;
      else throw e;
    }
  },

  /**
   * lighthouse account_manager validator import
   *   --reuse-password
   *   --stdin-inputs
   *   --directory /validators/keystores/0x8a34daad3e91bd5d34573fbad003753e94db563229791e563e2893f3719251251136bb61431916312e2cc0d68c8f8756
   *   < /validators/secrets/0x8a34daad3e91bd5d34573fbad003753e94db563229791e563e2893f3719251251136bb61431916312e2cc0d68c8f8756
   *
   * [Lighthouse v0.3.0-b185d7b]
   */
  async importKeystores(validatorsPaths: ValidatorPaths[]): Promise<void> {
    for (const { pubkey, keystorePath, secretPath } of validatorsPaths) {
      // This command will only import 1 account MAX, so it's okay to use exec
      // The output will never be too long and it will last for < 20 sec
      const { stdout, stderr } = await promisify(exec)(
        [
          LIGHTHOUSE_BINARY,
          "account_manager",
          "validator",
          "import",
          ...dargs({
            "reuse-password": true,
            "stdin-inputs": true,
            directory: path.dirname(keystorePath)
          }),
          // Provide the password to stdin
          `< ${secretPath}`
        ].join(" ")
      );

      if (stdout.includes("imported 0 validator"))
        throw Error(
          `cmd 'lighthouse account_manager validator import' failed to import keystore from ${keystorePath}: ${stdout}`
        );

      keyMgrLogger.info(`Imported ${pubkey} keystore to lighthouse`, {
        stdout,
        stderr
      });
    }

    //
    // OLD
    //

    ensureDir(LIGHTHOUSE_SECRETS_DIR);
    for (const validatorPaths of validatorsPaths) {
      let pubkey = validatorPaths.pubkey;
      if (!pubkey.startsWith("0x")) pubkey = `0x${pubkey}`;
      const dirPath = path.join(LIGHTHOUSE_KEYSTORES_DIR, pubkey);
      const keystorePath = path.join(dirPath, "voting-keystore.json");
      const secretPath = path.join(LIGHTHOUSE_SECRETS_DIR, pubkey);
      ensureDir(dirPath);
      await fs.promises.copyFile(validatorPaths.keystorePath, keystorePath);
      await fs.promises.copyFile(validatorPaths.secretPath, secretPath);
    }
    keyMgrLogger.info(
      `Imported ${validatorsPaths.length} keystores to ${LIGHTHOUSE_KEYSTORES_DIR}`
    );
  },

  async deleteKeystores(): Promise<void> {
    await promisify(rimraf)(LIGHTHOUSE_KEYSTORES_DIR);
    await promisify(rimraf)(LIGHTHOUSE_SECRETS_DIR);
    keyMgrLogger.info(`Deleted all files in ${LIGHTHOUSE_KEYSTORES_DIR}`);
  }
};
