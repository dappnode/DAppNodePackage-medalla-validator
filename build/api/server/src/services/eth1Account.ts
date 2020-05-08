import { ethers } from "ethers";
import { db } from "../db";

/**
 * Returns eth1 local account address and balance in ETH
 * If the account does not exist, it is created
 */
export async function getAddressAndBalance(): Promise<{
  address: string;
  balance: number;
}> {
  let account = db.eth1Account.get();
  if (!account) {
    // Create account
    const wallet = ethers.Wallet.createRandom();
    account = {
      address: wallet.address,
      privateKey: wallet.privateKey
    };
    db.eth1Account.set(account);
  }

  const provider = new ethers.providers.InfuraProvider("goerli");
  const balanceWei = await provider.getBalance(account.address);
  return {
    address: account.address,
    balance: parseFloat(ethers.utils.formatEther(balanceWei))
  };
}
