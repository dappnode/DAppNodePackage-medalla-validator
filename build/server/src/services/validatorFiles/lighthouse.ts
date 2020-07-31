import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import { promisify } from "util";
import { ValidatorFileManager, BaseFileManager } from "./abstractManager";
import { ValidatorFiles, Eth2Keystore } from "../../../common";

const rimrafAsync = promisify(rimraf);

interface ValidatorPaths {
  keystore: string;
  secret: string;
}

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
export class LighthouseValidatorFileManager extends BaseFileManager
  implements ValidatorFileManager {
  keystoresDir: string;
  secretsDir: string;

  constructor(paths: { keystoresDir: string; secretsDir: string }) {
    super();
    this.keystoresDir = paths.keystoresDir;
    this.secretsDir = paths.secretsDir;
  }

  hasKeys(): boolean {
    return fs.readdirSync(this.keystoresDir).length > 0;
  }

  readPubkeys(): string[] {
    return fs.readdirSync(this.keystoresDir);
  }

  /**
   * Read all keystores and passphrases in disk
   */
  async read(): Promise<ValidatorFiles[]> {
    return this.ifNotLocked(async () => {
      const validatorsFiles: ValidatorFiles[] = [];
      for (const validatorDirName of fs.readdirSync(this.keystoresDir)) {
        const paths = this.getPaths({ pubkey: validatorDirName });
        const keystoreStr = await fs.promises.readFile(paths.keystore, "utf8");
        const keystore: Eth2Keystore = JSON.parse(keystoreStr);
        const passphrase = await fs.promises.readFile(paths.secret, "utf8");
        validatorsFiles.push({
          pubkey: keystore.pubkey,
          keystore: keystore,
          passphrase
        });
      }
      return validatorsFiles;
    });
  }

  /**
   * Write validatorsFiles to disk
   */
  async write(validatorsFiles: ValidatorFiles[]): Promise<void> {
    return this.ifNotLocked(async () => {
      for (const { pubkey, keystore, passphrase } of validatorsFiles) {
        const paths = this.getPaths({ pubkey });
        await fs.promises.writeFile(paths.keystore, JSON.stringify(keystore));
        await fs.promises.writeFile(paths.secret, passphrase);
      }
    });
  }

  /**
   * Delete all files in keystoresDir and secretsDir
   */
  async delete(): Promise<void> {
    return this.ifNotLocked(async () => {
      await rimrafAsync(this.keystoresDir);
      await rimrafAsync(this.secretsDir);
    });
  }

  private getPaths({ pubkey }: { pubkey: string }): ValidatorPaths {
    return {
      keystore: path.join(this.keystoresDir, pubkey, "voting-keystore.json"),
      secret: path.join(this.secretsDir, pubkey)
    };
  }
}
