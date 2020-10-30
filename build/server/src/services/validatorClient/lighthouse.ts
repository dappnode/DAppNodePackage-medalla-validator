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
      testnet: "medalla",
      // "strict-lockfiles": true,
      "debug-level": LIGHTHOUSE_VERBOSITY,
      datadir: LIGHTHOUSE_DATA_DIR,
      "beacon-node": getBeaconProviderUrl(),
      ...(GRAFFITI ? { graffiti: GRAFFITI } : {}), // Ignore if empty
      // dargs extra options
      _: [LIGHTHOUSE_EXTRA_OPTS]
    },
    // No typing necessary, Supervisor instance makes sure it's correct
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    dynamicOptions: () => ({
      "beacon-node": getBeaconProviderUrl()
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
 * /lighthouse/
 * `-- validators
 *     |-- 0x8a34daad3e91bd5d34573fbad003753e94db563229791e563e2893f3719251251136bb61431916312e2cc0d68c8f8756
 *     |   `-- voting-keystore.json
 *     |-- 0xb0318686ee67bfc0cedc286725214e91b6b92b5ee409d3af844cb5b6c265ef5037c8f1cb1bcca493568c2cfea46afa09
 *     |   `-- voting-keystore.json
 *     |-- slashing_protection.sqlite
 *     `-- validator_definitions.yml
 * ```
 * 
 * ```
 * root@b480544c61c4:/# cat /lighthouse/validators/validator_definitions.yml 
 * - enabled: true
 *   voting_public_key: "0x8a34daad3e91bd5d34573fbad003753e94db563229791e563e2893f3719251251136bb61431916312e2cc0d68c8f8756"
 *   description: ""
 *   type: local_keystore
 *   voting_keystore_path: /lighthouse/validators/0x8a34daad3e91bd5d34573fbad003753e94db563229791e563e2893f3719251251136bb61431916312e2cc0d68c8f8756/voting-keystore.json
 *   voting_keystore_password: password1
 * - enabled: true
 *   voting_public_key: "0xb0318686ee67bfc0cedc286725214e91b6b92b5ee409d3af844cb5b6c265ef5037c8f1cb1bcca493568c2cfea46afa09"
 *   description: ""
 *   type: local_keystore
 *   voting_keystore_path: /lighthouse/validators/0xb0318686ee67bfc0cedc286725214e91b6b92b5ee409d3af844cb5b6c265ef5037c8f1cb1bcca493568c2cfea46afa09/voting-keystore.json
 *   voting_keystore_password: password1
  ```
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
   *   --datadir $LIGHTHOUSE_DATA_DIR
   *   --testnet medalla
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
            datadir: LIGHTHOUSE_DATA_DIR,
            testnet: "medalla",
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
  },

  async deleteKeystores(): Promise<void> {
    await promisify(rimraf)(LIGHTHOUSE_KEYSTORES_DIR);
    keyMgrLogger.info(`Deleted all files in ${LIGHTHOUSE_KEYSTORES_DIR}`);
  }
};
