import { EthdoWallets, ValidatorAccount } from "../../common/types";

const walletValidator = "Validator";

const accounts: ValidatorAccount[] = [
  { name: "1", wallet: walletValidator, status: "pending", balance: 32.34521 },
  { name: "2", wallet: walletValidator, status: "pending", balance: 32.044 },
  { name: "3", wallet: walletValidator, status: "pending", balance: 32.172 }
];

const wallets: EthdoWallets[] = [
  { name: "Validator", accounts: ["1", "2"] },
  { name: "Withdrawl", accounts: ["1", "2"] }
];

export async function accountsGet(): Promise<ValidatorAccount[]> {
  return accounts;
}

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

export async function accountCreate(name: string): Promise<void> {
  if (accounts.some(a => a.name === name))
    throw Error(`Account with name ${name} already exists`);
  const newAccount: ValidatorAccount = {
    name,
    wallet: walletValidator,
    status: "pending",
    balance: 32
  };
  accounts.push(newAccount);
}
