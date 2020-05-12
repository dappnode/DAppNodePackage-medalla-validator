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
    } catch (e) {
      await this.walletCreate({ wallet });
    }
  }

  //  Account creation

  async createValidatorAccount(
    account: EthdoAccountNoPass
  ): Promise<EthdoAccountResult> {
    return this.createAccount(account, validatorWallet);
  }

  async createWithdrawlAccount(
    account: EthdoAccount
  ): Promise<EthdoAccountResult> {
    return this.createAccount(account, withdrawalWallet);
  }

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

  async importValidator(privateKey: string): Promise<EthdoAccountResult> {
    const account = await ethdo.randomValidatorName();
    await this.assertWalletExists(validatorWallet);
    return this.importAccount(account, privateKey);
  }

  async importWithdrawl(privateKey: string): Promise<EthdoAccountResult> {
    const account = await ethdo.randomWithdrawlName();
    await this.assertWalletExists(validatorWallet);
    return this.importAccount(account, privateKey);
  }

  async importAccount(
    account: string,
    privateKey: string
  ): Promise<EthdoAccountResult> {
    const passphrase = getRandomToken();
    await ethdo.accountImport({ account, passphrase, key: privateKey });
    const publicKey = await this.accountPublicKey(account);
    return { account, publicKey, passphrase };
  }

  // Account listing

  async accountWithdrawlList(): Promise<WalletAccount[]> {
    return this.accountList(withdrawalWallet);
  }

  async accountValidatorList(): Promise<WalletAccount[]> {
    return this.accountList(validatorWallet);
  }

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

  async randomValidatorName(): Promise<string> {
    const accounts = await this.accountValidatorList();
    const names = accounts.map(({ name }) => name);
    const name = findFirstAvailableNum(names);
    return formatAccount(name, validatorWallet);
  }

  async randomWithdrawlName(): Promise<string> {
    const accounts = await this.accountWithdrawlList();
    const names = accounts.map(({ name }) => name);
    const name = !names.includes(PRIMARY)
      ? PRIMARY
      : findFirstAvailableNum(names);
    return formatAccount(name, withdrawalWallet);
  }
}

/**
 * Initialized ethdo instance with local shell
 */
export const ethdo = new Ethdo(shell);

/**
 * Makes sure account includes the wallet prefix
 * @param account 1
 * @param wallet validator
 * @return validator/1
 */
function formatAccount(account: string, wallet: WalletType): string {
  if (account.startsWith(wallet)) return account;
  else return `${wallet}/${account}`;
}
