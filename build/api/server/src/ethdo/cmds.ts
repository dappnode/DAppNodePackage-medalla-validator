import dargs from "dargs";

type CmdRunner = (cmd: string) => Promise<string>;

function hidePassphrase(s: string = ""): string {
  return s.replace(/--\S*passphrase\S*/g, "********");
}

export class EthdoCmds {
  private cmdRunner: CmdRunner;
  constructor(cmdRunner: CmdRunner) {
    this.cmdRunner = cmdRunner;
  }

  private async run(
    subCmd: string,
    options?: { [key: string]: any }
  ): Promise<string> {
    const cmd = ["ethdo", subCmd, ...dargs(options || {})].join(" ");
    try {
      return await this.cmdRunner(cmd);
    } catch (e) {
      // Make sure no sensitive information is logged in an error message
      e.message = hidePassphrase(e.message);
      e.stack = hidePassphrase(e.stack);
      throw e;
    }
  }

  /**
   * ethdo wallet accounts lists the accounts within a wallet.
   * ```
   * $ ethdo wallet accounts --wallet="Personal wallet"
   * Auctions
   * Operations
   * Spending
   * ```
   *
   * With the --verbose flag this will provide the public key of the accounts.
   * ```
   * $ ethdo wallet accounts --wallet="Personal wallet" --verbose
   * Auctions: 0x812f340269c315c1d882ae7c13cdaddf862dbdbd482b1836798b2070160dd1e194088cc6f39347782028d1e56bd18674
   * Operations: 0x8e2f9e8cc29658ff37ecc30e95a0807579b224586c185d128cb7a7490784c1ad9b0ab93dbe604ab075b40079931e6670
   * Spending: 0x85dfc6dcee4c9da36f6473ec02fda283d6c920c641fc8e3a76113c5c227d4aeeb100efcfec977b12d20d571907d05650
   * ```
   */
  async walletAccounts(options: {
    /**
     * the name of the wallet to create (defaults to "primary")
     */
    wallet: string;

    /**
     * With the --verbose flag this will provide the public key of the accounts.
     */
    verbose?: boolean;
  }): Promise<string[]> {
    const res = await this.run("wallet accounts", options);
    return res.split("\n");
  }

  /**
   * ethdo wallet info provides information about a given wallet. Options include:
   * ```
   * $ ethdo wallet info --wallet="Personal wallet"
   * Type: hierarchical deterministic
   * Accounts: 3
   * ```
   */
  async walletInfo(options: {
    /**
     * the name of the wallet to create (defaults to "primary")
     */
    wallet: string;
  }): Promise<string> {
    return await this.run("wallet info", options);
  }

  /**
   * ethdo wallet list lists all wallets in the store.
   * N.B. encrypted wallets will not show up in this list unless the correct passphrase for the store is supplied.
   * ```
   * 'Withdrawal\nvalidator'
   * ```
   */
  async walletList(): Promise<string[]> {
    const res = await this.run("wallet list");
    return res.split("\n");
  }

  /**
   * ```
   * ethdo wallet create --wallet="Personal wallet" --type="hd" --walletpassphrase="my wallet secret"
   * ```
   */
  async walletCreate(options: {
    /**
     * the name of the wallet to create (defaults to "primary")
     */
    wallet: string;
    /**
     * the type of wallet to create. This can be either "nd" for a
     * non-deterministic wallet, where private keys are generated
     * randomly, or "hd" for a hierarchical deterministic wallet,
     * where private keys are generated from a seed and path as per
     * [ERC-2333](https://github.com/CarlBeek/EIPs/blob/bls_path/EIPS/eip-2334.md) (defaults to "nd")
     */
    type?: "nd" | "hd";
    /**
     * the passphrase for of the wallet. This is required for hierarchical
     * deterministic wallets, to protect the seed
     */
    walletpassphrase?: string;
  }): Promise<string> {
    const res = await this.run("wallet create", options);
    return res;
  }

  /**
   * ethdo account create creates a new account with the given parameters.
   *
   * Note that for hierarchical deterministic wallets you will also need to supply --walletpassphrase to unlock the wallet seed.
   * ```
   * $ ethdo account create --account="Personal wallet/Operations" --walletpassphrase="my wallet secret" --passphrase="my account secret"
   * ```
   */
  async accountCreate(options: {
    /**
     *  the name of the account to create
     */
    account: string;
    /**
     * the passphrase for the account
     */
    passphrase: string;
    /**
     * the passphrase for of the wallet. This is required for hierarchical
     * deterministic wallets, to protect the seed
     */
    walletpassphrase?: string;
  }): Promise<string> {
    const res = await this.run("account create", options);
    return res;
  }

  /**
   * ethdo account import creates a new account by importing its private key. Options for creating the account include:
   * ```
   * ethdo account import --account=Validators/123 --key=6dd12d588d1c05ba40e80880ac7e894aa20babdbf16da52eae26b3f267d68032 --passphrase="my account secret"
   * ```
   */
  async accountImport(options: {
    /**
     *  the name of the account to create
     */
    account: string;
    /**
     * the passphrase for the account
     */
    passphrase: string;
    /**
     * the private key to import
     */
    key?: string;
  }): Promise<string> {
    return await this.run("account import", options);
  }

  /**
   * ethdo account info provides information about the given account. Options include:
   * $ ethdo account info --account="Personal wallet/Operations"
   * Public key: 0x8e2f9e8cc29658ff37ecc30e95a0807579b224586c185d128cb7a7490784c1ad9b0ab93dbe604ab075b40079931e6670
   */
  async accountInfo(options: {
    /**
     *  the name of the account to create
     */
    account: string;
  }): Promise<string> {
    return await this.run("account info", options);
  }

  async validatorDepositdata(options: {
    /**
     * Account of the account carrying out the validation
     */
    validatoraccount: string;
    /**
     * Account of the account to which the validator funds will be withdrawn
     */
    withdrawalaccount: string;
    /**
     * Value of the amount to be deposited
     * ```js
     * "32Ether"
     * ```
     */
    depositvalue: string;
    passphrase: string;
    /**
     * Print raw deposit data transaction data
     */
    raw: boolean;
  }): Promise<string> {
    return await this.run("validator depositdata", options);
  }
}
