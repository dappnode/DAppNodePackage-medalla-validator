import {
  EthdoWallets,
  ValidatorAccount,
  WithdrawlAccount
} from "../../common/types";

const walletValidator = "Validator";

const withdrawlAccounts: WithdrawlAccount[] = [];

const accounts: ValidatorAccount[] = [
  { name: "1", wallet: walletValidator, status: "pending", balance: 32.34521 },
  { name: "2", wallet: walletValidator, status: "pending", balance: 32.044 },
  { name: "3", wallet: walletValidator, status: "pending", balance: 32.172 }
];

const wallets: EthdoWallets[] = [
  { name: "Validator", accounts: ["1", "2"] },
  { name: "Withdrawl", accounts: ["1", "2"] }
];

let eth1Balance = 32.462112364172;

const waitMs = (ms: number) => new Promise(r => setTimeout(r, ms));

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

//  Useful now

export async function accountWithdrawlCreate({
  name,
  passphrase
}: {
  name: string;
  passphrase: string;
}) {
  passphrase;
  withdrawlAccounts.push({ id: `withdrawl/${name}`, name });
  await waitMs(1000);
  if (passphrase === "error") throw Error(`Triggered error`);
}

export async function accountWithdrawlList(): Promise<WithdrawlAccount[]> {
  await waitMs(1000);
  return withdrawlAccounts;
}

export async function newValidator(
  withdrawalAccount: string
): Promise<{ depositData: string; account: string }> {
  withdrawalAccount;
  await waitMs(1000);
  return {
    account: "validator/1",
    depositData:
      "0x8defbaaba5c193a7975ca61649d5802632761ec1d986f5103100cd294ec69b8a0x8defbaaba5c193a7975ca61649d5802632761ec1d986f5103100cd294ec69b8a"
  };
}

export async function eth1AccountGet(): Promise<{
  address: string;
  balance: number;
}> {
  eth1Balance = eth1Balance * 1.01;
  return {
    address: "0x11111111111111111111111111111111111111111",
    balance: eth1Balance
  };
}
