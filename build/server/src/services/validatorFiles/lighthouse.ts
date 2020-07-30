import fs from "fs";
import path from "path";
import { ValidatorFileManager } from "./abstractManager";
import { ValidatorFiles, Eth2Keystore } from "../../../common";

const keystoreFileName = "voting-keystore.json";

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
export class LighthouseValidatorFileManager implements ValidatorFileManager {
  keystoresDir: string;
  secretsDir: string;

  constructor(paths: { keystoresDir: string; secretsDir: string }) {
    this.keystoresDir = paths.keystoresDir;
    this.secretsDir = paths.secretsDir;
  }

  hasKeys(): boolean {
    return fs.readdirSync(this.keystoresDir).length > 0;
  }

  readPubkeys(): string[] {
    return fs.readdirSync(this.keystoresDir);
  }

  read(): ValidatorFiles[] {
    return fs.readdirSync(this.keystoresDir).map(
      (validatorDirName): ValidatorFiles => {
        const paths = this.getPaths({ pubkey: validatorDirName });
        const keystoreStr = fs.readFileSync(paths.keystore, "utf8");
        const keystore: Eth2Keystore = JSON.parse(keystoreStr);
        const passphrase = fs.readFileSync(paths.secret, "utf8");
        return {
          pubkey: keystore.pubkey,
          keystore: keystore,
          passphrase
        };
      }
    );
  }

  write(validatorsFiles: ValidatorFiles[]): void {
    for (const validatorFiles of validatorsFiles) {
      const paths = this.getPaths(validatorFiles);
      fs.writeFileSync(paths.keystore, JSON.stringify(validatorFiles.keystore));
      fs.writeFileSync(paths.secret, validatorFiles.passphrase);
    }
  }

  private getPaths({ pubkey }: { pubkey: string }): ValidatorPaths {
    return {
      keystore: path.join(this.keystoresDir, pubkey, "voting-keystore.json"),
      secret: path.join(this.secretsDir, pubkey)
    };
  }
}
