import { ethers } from "ethers";
import { depositAmountEth } from "../../params";
import { getAccount } from "./getAccount";
import { getGoerliProvider } from "./provider";
import memoize from "memoizee";

/**
 * Prevent spamming the node if the UI requests the balance too fast
 */
const getEthBalance = memoize(
  async function getBalance(address: string) {
    const provider = getGoerliProvider();
    const balanceWei = await provider.getBalance(address);
    return parseFloat(ethers.utils.formatEther(balanceWei));
  },
  { promise: true, maxAge: 5000 }
);

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
  if (!account.address)
    throw Error(`Error getting eth1 account, empty address`);

  const balanceEth = await getEthBalance(account.address);
  return {
    address: account.address,
    balance: balanceEth,
    insufficientFunds: balanceEth <= parseFloat(depositAmountEth)
  };
}
