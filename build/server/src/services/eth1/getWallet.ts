import { ethers } from "ethers";
import { getAccount } from "./getAccount";
import { getEth1Provider } from "./provider";

/**
 * Get internal Eth1 account ethers wallet to send transactions
 */
export function getWallet(): ethers.Wallet {
  const account = getAccount();
  const provider = getEth1Provider();
  return new ethers.Wallet(account.privateKey, provider);
}
