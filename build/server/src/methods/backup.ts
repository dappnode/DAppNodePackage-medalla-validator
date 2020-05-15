import fs from "fs";
import path from "path";
import { WithdrawalAccountInfo } from "../../common";
import { ethdo, withdrawalAccount } from "../ethdo";
import {
  legacyWithdrawalExists,
  migrateLegacyWithdrawal
} from "../services/migratePrysmKeys";
import { ethdoWalletsPath } from "../params";

export async function withdrawalAccountGet(): Promise<WithdrawalAccountInfo> {
  let withdrawalAccount: string | null = null;
  try {
    withdrawalAccount = await ethdo.getWithdrawalAccount();
  } catch (e) {
    //
  }

  return {
    account: withdrawalAccount,
    exists: Boolean(withdrawalAccount)
  };
}

/**
 * Returns stringified encrypted keystore JSON
 */
export async function withdrawalAccountCreate(
  passphrase: string
): Promise<string> {
  if (legacyWithdrawalExists()) {
    // Migrate
    await migrateLegacyWithdrawal(passphrase);
  } else {
    // Create
    await ethdo.createWithdrawalAccount(passphrase);
  }

  // Fetch the keystore and return it
  return await fetchEthdoKeystore(withdrawalAccount);
}

/**
 * Fetches an encrypted keystore from the file system
 * @param account
 */
async function fetchEthdoKeystore(account: string): Promise<string> {
  const ethdoDir = ethdoWalletsPath;
  const { uuid } = await ethdo.accountInfoVerbose({ account });
  for (const walletUuid of fs.readdirSync(ethdoDir)) {
    try {
      return fs.readFileSync(path.join(ethdoDir, walletUuid, uuid), "utf8");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  throw Error(`Account ${account} UUID ${uuid} not found`);
}
