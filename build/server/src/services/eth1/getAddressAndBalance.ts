import { ethers } from "ethers";
import { depositAmountEth } from "../../params";
import { getAccount } from "./getAccount";
import { getGoerliProvider } from "./provider";

/**
 * Returns eth1 local account address and balance in ETH
 * If the account does not exist, it is created
 */
export async function getAddressAndBalance(): Promise<{
  address: string;
  balance: number;
  insufficientFunds: boolean;
}> {
  const account = getAccount();
  const provider = getGoerliProvider();
  if (!account.address)
    throw Error(`Error getting eth1 account, empty address`);
  const balanceWei = await provider.getBalance(account.address);
  const balanceEth = parseFloat(ethers.utils.formatEther(balanceWei));
  return {
    address: account.address,
    balance: balanceEth,
    insufficientFunds: balanceEth <= parseFloat(depositAmountEth)
  };
}
