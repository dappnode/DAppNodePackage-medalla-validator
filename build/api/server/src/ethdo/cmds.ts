import dargs from "dargs";

type CmdRunner = (cmd: string) => Promise<string>;

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
    return this.cmdRunner(cmd);
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
