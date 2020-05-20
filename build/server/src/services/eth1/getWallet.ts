import { ethers } from "ethers";
import { getAccount } from "./getAccount";
import { getGoerliProvider } from "./provider";

/**
 * Get internal Eth1 account ethers wallet to send transactions
 */
export function getWallet(): ethers.Wallet {
  const account = getAccount();
  const provider = getGoerliProvider();
  return new ethers.Wallet(account.privateKey, provider);
}
