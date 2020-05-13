import crypto from "crypto";
import { EthdoCmds } from "./cmds";
import {
  EthdoWallets,
  WalletAccount,
  EthdoAccount,
  EthdoAccountResult
} from "../../common";
import { logs } from "../logs";
import shell from "../utils/shell";
import { findFirstAvailableNum } from "../utils/names";
import { getRandomToken } from "../utils/token";

const withdrawalWallet = "withdrawl";
const validatorWallet = "validator";
export type WalletType = typeof validatorWallet | typeof withdrawalWallet;
const PRIMARY = "primary";

interface EthdoAccountNoPass {
  account: string;
  passphrase?: string;
}

export class Ethdo extends EthdoCmds {
  /**
   * List all wallets and their accounts
   */
  async listAll(): Promise<EthdoWallets[]> {
    const walletNames = await this.walletList();
    const wallets: EthdoWallets[] = [];
    for (const name of walletNames.sort()) {
      const accounts = await this.walletAccounts({ wallet: name });
      wallets.push({ name, accounts: accounts.sort() });
    }
    return wallets;
  }

  async assertWalletExists(wallet: WalletType): Promise<void> {
    try {
      await this.walletInfo({ wallet });
    } catch (eInfo) {
      if (!eInfo.message.includes("not found")) throw eInfo;
      try {
        await this.walletCreate({ wallet });
      } catch (eCreate) {
        if (!eCreate.message.includes("already exists")) throw eCreate;
      }
    }
  }

  //  Account creation

  async createAccount(
    { account, passphrase }: EthdoAccountNoPass,
    wallet: WalletType
  ): Promise<EthdoAccountResult> {
    await this.assertWalletExists(wallet);
    account = formatAccount(account, wallet);
    passphrase = passphrase || getRandomToken();
    await this.accountCreate({ account, passphrase });
    const publicKey = await this.accountPublicKey(account);
    return { account, publicKey, passphrase };
  }

  // Account imports

  async importAccount(
    privateKey: string,
    wallet: WalletType
  ): Promise<EthdoAccountResult> {
    await this.assertWalletExists(wallet);
    const account = await ethdo.randomAccountName(wallet);
    const passphrase = getRandomToken();
    await ethdo.accountImport({ account, passphrase, key: privateKey });
    const publicKey = await this.accountPublicKey(account);
    return { account, publicKey, passphrase };
  }

  // Account listing

  async accountList(wallet: WalletType): Promise<WalletAccount[]> {
    try {
      const accounts = await this.walletAccountsVerbose({ wallet });
      return accounts.map(account => ({
        id: formatAccount(account.name, wallet),
        ...account
      }));
    } catch (e) {
      // In case parsing the wallet account --verbose output fails, fetch each account
      if (!e.message.includes("wallet not found"))
        logs.warn(`Error on walletAccountsVerbose`, e);

      const accounts = await this.walletAccounts({ wallet }).catch(e => {
        if (e.message.includes("wallet not found")) return [] as string[];
        else throw e;
      });
      return await Promise.all(
        accounts.map(async name => {
          const account = formatAccount(name, wallet);
          const publicKey = await this.accountPublicKey(account);
          return {
            id: account,
            name,
            publicKey,
            uuid: ""
          };
        })
      );
    }
  }

  async accountPublicKey(account: string): Promise<string> {
    // publicKeyRes = "Public key: 0x9886f5efa28139ae94302a63dc139ab5b31833b14f8cdebb3314875c7cd890e76a9872aea18d408dba547b3d255e415e"
    const publicKeyRes = await this.accountInfo({ account });
    const publicKey = publicKeyRes.split(":")[1].trim();
    if (!publicKey)
      throw Error(`account info returns unexpected format: ${publicKeyRes}`);
    return publicKey;
  }

  /**
   * Create a new validator account and generate deposit data
   */
  async getDepositData(
    validator: EthdoAccount,
    withdrawalAccount: string
  ): Promise<string> {
    return await this.validatorDepositdata({
      validatoraccount: validator.account,
      passphrase: validator.passphrase,
      withdrawalaccount: withdrawalAccount,
      depositvalue: "32Ether",
      raw: true
    });
  }

  // Utils

  async randomAccountName(wallet: WalletType): Promise<string> {
    const accounts = await this.accountList(wallet);
    const names = accounts.map(({ name }) => name);
    const name =
      wallet === "withdrawl" && !names.includes(PRIMARY)
        ? PRIMARY
        : findFirstAvailableNum(names);
    return formatAccount(name || "1", wallet);
  }
}

/**
 * Initialized ethdo instance with local shell
 */
export const ethdo = new Ethdo(shell);

/**
 * Makes sure account includes the wallet prefix
 * @param name 1
 * @param wallet validator
 * @return validator/1
 */
function formatAccount(account: string, wallet: WalletType): string {
  if (!account || account === `${wallet}/`)
    throw Error(`account name must not be empty: ${account}`);
  if (account.startsWith(wallet)) return account;
  else return `${wallet}/${account}`;
}
