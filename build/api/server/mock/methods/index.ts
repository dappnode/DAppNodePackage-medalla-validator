import { EthdoWallets } from "../../common/types";

const wallets: EthdoWallets[] = [
  { name: "Validator", accounts: ["1", "2"] },
  { name: "Withdrawl", accounts: ["1", "2"] }
];

/**
 * Greets user
 * @param name
 */
export async function walletsGet(): Promise<EthdoWallets[]> {
  return wallets;
}

export async function walletCreate(walletName: string): Promise<void> {
  wallets.push({ name: walletName, accounts: [] });
}

export async function accountCreate(
  accountName: string,
  walletName: string
): Promise<void> {
  const wallet = wallets.find(w => w.name === walletName);
  if (!wallet) throw Error(`No wallet`);
  wallet.accounts.push(accountName);
}
