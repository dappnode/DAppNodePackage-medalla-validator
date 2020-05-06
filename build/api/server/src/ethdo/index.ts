import { EthdoCmds } from "./cmds";
import { EthdoWallets } from "../../../common/types";

export class Ethdo extends EthdoCmds {
  async listAll(): Promise<EthdoWallets[]> {
    const walletNames = await this.walletList();
    const wallets: EthdoWallets[] = [];
    for (const name of walletNames.sort()) {
      const accounts = await this.walletAccounts({ wallet: name });
      wallets.push({ name, accounts: accounts.sort() });
    }
    return wallets;
  }
}
