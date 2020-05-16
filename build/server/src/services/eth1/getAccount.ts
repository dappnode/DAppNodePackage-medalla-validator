import { ethers } from "ethers";
import * as db from "../../db";

export function getAccount(): {
  address: string;
  privateKey: string;
} {
  let account = db.accounts.eth1.get();
  if (!account) {
    const wallet = ethers.Wallet.createRandom();
    account = { address: wallet.address, privateKey: wallet.privateKey };
    db.accounts.eth1.set(account);
  }
  return account;
}
