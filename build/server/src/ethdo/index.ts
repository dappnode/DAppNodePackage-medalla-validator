import { EthdoCmds } from "./cmds";
import { EthdoAccount, EthdoAccountResult } from "../../common";
import { logs } from "../logs";
import shell from "../utils/shell";
import { findFirstAvailableNum, findNAvailableNums } from "../utils/names";
import { getRandomToken } from "../utils/token";
import { ethdoKeymanager } from "../services/keymanager";

export const withdrawalWallet = "withdrawal";
const validatorWallet = "validator";
export type WalletType = typeof validatorWallet | typeof withdrawalWallet;
const PRIMARY = "primary";
export const withdrawalAccount = `${withdrawalWallet}/${PRIMARY}`;

interface EthdoAccountInfo {
  name: string;
  uuid: string;
  publicKey: string;
  account: string;
}

/**
 * This cache prevents checking for a wallet to exist once it already exists
 * ethdo wallets cannot be deleted, so the check becomes unnecessary
 */
const walletExistsCache: { [wallet: string]: boolean } = {};

export class Ethdo extends EthdoCmds {
  async assertWalletExists(wallet: WalletType): Promise<void> {
    try {
      if (walletExistsCache[wallet]) return;
      await this.walletInfo({ wallet });
    } catch (eInfo) {
      if (!isWalletNotFoundError(eInfo)) throw eInfo;
      try {
        await this.walletCreate({ wallet });
        walletExistsCache[wallet] = true;
      } catch (eCreate) {
        if (!eCreate.message.includes("already exists")) throw eCreate;
      }
    }
  }

  // Account imports

  async importValidator(privateKey: string): Promise<EthdoAccountResult> {
    const wallet: WalletType = validatorWallet;
    await this.assertWalletExists(wallet);
    const account = await ethdo.randomAccountName(wallet);
    const passphrase = await getValidatorPassphrase(account);
    await ethdo.accountImport({ account, passphrase, key: privateKey });
    const publicKey = await this.accountPublicKey(account);
    const validator = { account, publicKey, passphrase };
    return validator;
  }

  // Account listing

  async accountList(wallet: WalletType): Promise<EthdoAccountInfo[]> {
    try {
      const accounts = await this.walletAccountsVerbose({ wallet });
      return accounts.map(account => ({
        account: this.formatAccount(account.name, wallet),
        ...account
      }));
    } catch (e) {
      // In case parsing the wallet account --verbose output fails, fetch each account
      if (!isWalletNotFoundError(e))
        logs.warn(`Error on walletAccountsVerbose`, e);

      const accounts = await this.walletAccounts({ wallet }).catch(e => {
        if (isWalletNotFoundError(e)) return [] as string[];
        else throw e;
      });
      return await Promise.all(
        accounts.map(async name => {
          const account = this.formatAccount(name, wallet);
          const publicKey = await this.accountPublicKey(account);
          return { account, name, publicKey, uuid: "" };
        })
      );
    }
  }

  /**
   * List validators with their password from ethdoKeymanager.json
   * Takes 169ms / 1000 validators
   */
  async listValidatorsWithPassphrase(): Promise<EthdoAccountResult[]> {
    const passphrases = ethdoKeymanager.read();
    const validators = await ethdo.accountList(validatorWallet);
    return validators
      .map(({ account, publicKey }) => ({
        account,
        publicKey,
        passphrase: passphrases[account]
      }))
      .filter(({ passphrase }) => passphrase);
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

  async getWithdrawalAccount(): Promise<string> {
    try {
      await this.accountInfo({ account: withdrawalAccount });
    } catch (e) {
      if (isWalletNotFoundError(e))
        throw Error(`no withdrawal account, must be created first`);
      throw e;
    }
    return withdrawalAccount;
  }

  async createWithdrawalAccount(passphrase: string): Promise<void> {
    await this.assertWalletExists(withdrawalWallet);
    await this.accountCreate({ account: withdrawalAccount, passphrase });
  }

  /**
   * Creates N validators. Takes 37ms / validator, 37s per 1000 validators
   * @param count
   */
  async createValidatorAccounts(count: number): Promise<EthdoAccountResult[]> {
    const wallet: WalletType = validatorWallet;
    await this.assertWalletExists(wallet);

    // Generate sequential validator names
    const accountsBefore = await this.accountList(wallet);
    const names = accountsBefore.map(({ name }) => name);
    const validatorNames = findNAvailableNums(names, count);
    const newAccounts: { account: string; passphrase: string }[] = [];

    // Create accounts and get their public keys
    // Do it sequentially to prevent ethdo race conditions
    for (const name of validatorNames) {
      const account = this.formatAccount(name, wallet);
      const passphrase = await getValidatorPassphrase(account);
      await this.accountCreate({ account, passphrase });
      newAccounts.push({ account, passphrase });
    }

    // Get public key and passphrase for each account at once
    const newAccountsWithPubkey: EthdoAccountResult[] = [];
    const accountsAfter = await this.accountList(wallet);
    const accountsMap = new Map(accountsAfter.map(a => [a.account, a]));
    for (const { account, passphrase } of newAccounts) {
      const publicKey =
        accountsMap.get(account)?.publicKey ||
        (await this.accountPublicKey(account));
      const validator = { account, passphrase, publicKey };
      newAccountsWithPubkey.push(validator);
    }

    return newAccountsWithPubkey;
  }

  async randomAccountName(wallet: WalletType): Promise<string> {
    const accounts = await this.accountList(wallet);
    const names = accounts.map(({ name }) => name);
    const name =
      wallet === "withdrawal" && !names.includes(PRIMARY)
        ? PRIMARY
        : findFirstAvailableNum(names);
    return this.formatAccount(name || "1", wallet);
  }

  /**
   * Makes sure account includes the wallet prefix
   * @param name 1
   * @param wallet validator
   * @return validator/1
   */
  formatAccount(account: string, wallet: WalletType): string {
    if (!account || account === `${wallet}/`)
      throw Error(`account name must not be empty: ${account}`);
    if (account.startsWith(wallet)) return account;
    else return `${wallet}/${account}`;
  }
}

async function getValidatorPassphrase(account: string): Promise<string> {
  let passphrase = ethdoKeymanager.get(account);
  if (!passphrase) {
    passphrase = getRandomToken(16);
    ethdoKeymanager.set(account, passphrase);
  }
  return passphrase;
}

function isWalletNotFoundError(e: Error): boolean {
  const { message } = e;
  return /wallet not found/i.test(message) || /no account/i.test(message);
}

/**
 * Initialized ethdo instance with local shell
 */
export const ethdo = new Ethdo(shell);

/**
 * Parse name from validator account
 * @param account "validator/1"
 * @return "1"
 */
export function parseValidatorName(account: string): string {
  return account.split(validatorWallet)[1] || account;
}
