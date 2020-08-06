import fs from "fs";
import path from "path";
import { ValidatorFiles } from "../../common";
import { VALIDATOR_KEYSTORES_DIR, VALIDATOR_SECRETS_DIR } from "../params";

interface ValidatorPaths {
  dirPath: string;
  keystorePath: string;
  secretPath: string;
  pubkey: string;
}

type ValidatorSafeFiles = Pick<ValidatorFiles, "pubkey" | "keystore">;

interface GeneralKeystoreManager {
  importKeystores(keystore: ValidatorFiles[]): Promise<void>;
  readKeystores(): Promise<ValidatorSafeFiles[]>;
  getValidatorsPaths(): ValidatorPaths[];
}

export const keystoreManager: GeneralKeystoreManager = {
  async importKeystores(validatorsFiles: ValidatorFiles[]): Promise<void> {
    await fs.promises.mkdir(VALIDATOR_SECRETS_DIR, { recursive: true });
    for (const { pubkey, keystore, passphrase } of validatorsFiles) {
      const paths = getPaths({ pubkey });
      await fs.promises.mkdir(paths.dirPath, { recursive: true });
      await fs.promises.writeFile(paths.keystorePath, JSON.stringify(keystore));
      await fs.promises.writeFile(paths.secretPath, passphrase);
    }
  },

  async readKeystores(): Promise<ValidatorSafeFiles[]> {
    const validatorsFiles: ValidatorSafeFiles[] = [];
    for (const { keystorePath, pubkey } of this.getValidatorsPaths()) {
      validatorsFiles.push({
        pubkey,
        keystore: JSON.parse(await fs.promises.readFile(keystorePath, "utf8"))
      });
    }
    return validatorsFiles;
  },

  getValidatorsPaths(): ValidatorPaths[] {
    return fs.readdirSync(VALIDATOR_KEYSTORES_DIR).map(pubkey => {
      return getPaths({ pubkey });
    });
  }
};

function getPaths({ pubkey }: { pubkey: string }): ValidatorPaths {
  if (!pubkey.startsWith("0x")) pubkey = `0x${pubkey}`;
  const dirPath = path.join(VALIDATOR_KEYSTORES_DIR, pubkey);
  return {
    pubkey,
    dirPath,
    keystorePath: path.join(dirPath, "voting-keystore.json"),
    secretPath: path.join(VALIDATOR_SECRETS_DIR, pubkey)
  };
}
