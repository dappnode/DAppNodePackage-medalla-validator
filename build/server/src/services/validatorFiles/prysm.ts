import fs from "fs";
import path from "path";
import rimraf from "rimraf";
import { promisify } from "util";
import { ValidatorFileManager, BaseFileManager } from "./abstractManager";
import { ValidatorFiles, Eth2Keystore } from "../../../common";

const rimrafAsync = promisify(rimraf);
const keymanageroptsFile = "keymanageropts.json";

interface ValidatorPaths {
  dir: string;
  keystore: string;
  secret: string;
}

/**
 * Prysm account paths
 *
 * ```bash
 * $walletDir
 * └── direct
 *     ├── a9ca0e4fd5fbe6d097d2baced859b5fce1cbc4d2859606a5bcdbb4edf6a48a7c17e087b5ab0888e2fd0f4e4424fa77a3
 *     |   ├── deposit_data.ssz
 *     |   └── keystore-1596491667.json
 *     └── keymanageropts.json
 *
 * $secretsDir
 * └── a9ca0e4fd5fbe6d097d2baced859b5fce1cbc4d2859606a5bcdbb4edf6a48a7c17e087b5ab0888e2fd0f4e4424fa77a3.pass
 * ```
 *
 * Where `$walletDir/direct/keymanageropts.json`
 * ```json
 * {
 *   "direct_eip_version": "EIP-2335",
 *   "direct_accounts_passwords_directory": absolutePath($secretsDir)
 * }
 * ```
 */
export class PrysmValidatorFileManager extends BaseFileManager
  implements ValidatorFileManager {
  walletDir: string;
  secretsDir: string;
  keystoresDir: string;

  constructor(paths: { walletDir: string; secretsDir: string }) {
    super();
    this.walletDir = paths.walletDir;
    this.secretsDir = paths.secretsDir;
    this.keystoresDir = path.join(paths.walletDir, "direct");
  }

  init(): void {
    fs.mkdirSync(this.keystoresDir, { recursive: true });
    fs.mkdirSync(this.secretsDir, { recursive: true });
  }

  hasKeys(): boolean {
    return this.readPubkeys().length > 0;
  }

  readPubkeys(): string[] {
    try {
      return fs
        .readdirSync(this.keystoresDir)
        .filter(filename => filename !== keymanageroptsFile);
    } catch (e) {
      if (e.code === "ENOENT") return [];
      else throw e;
    }
  }

  /**
   * Read all keystores and passphrases in disk
   */
  async read(): Promise<ValidatorFiles[]> {
    return this.ifNotLocked(async () => {
      const validatorsFiles: ValidatorFiles[] = [];
      for (const validatorDirName of this.readPubkeys()) {
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
      fs.mkdirSync(this.keystoresDir, { recursive: true });
      const keymgroptsPath = path.join(this.keystoresDir, keymanageroptsFile);
      if (!fs.existsSync(keymgroptsPath)) {
        const keymgropts = {
          direct_eip_version: "EIP-2335",
          direct_accounts_passwords_directory: path.resolve(this.secretsDir)
        };
        fs.writeFileSync(keymgroptsPath, JSON.stringify(keymgropts, null, 2));
      }

      await fs.promises.mkdir(this.secretsDir, { recursive: true });
      for (const { pubkey, keystore, passphrase } of validatorsFiles) {
        const paths = this.getPaths({ pubkey });
        await fs.promises.mkdir(paths.dir, { recursive: true });
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
    if (!pubkey.startsWith("0x")) pubkey = `0x${pubkey}`;
    return {
      dir: path.join(this.keystoresDir, pubkey),
      keystore: path.join(this.keystoresDir, pubkey, "keystore-voting.json"),
      secret: path.join(this.secretsDir, pubkey)
    };
  }
}
