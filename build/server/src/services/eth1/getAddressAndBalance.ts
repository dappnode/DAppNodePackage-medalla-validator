import { ethers } from "ethers";
import { depositAmountEth } from "../../params";
import { getAccount } from "./getAccount";
import { getEth1Provider } from "./provider";
import memoize from "memoizee";
import { Eth1AccountStats } from "../../../common";

/**
 * Prevent spamming the node if the UI requests the balance too fast
 */
const getEthBalance = memoize(
  async function getBalance(address: string) {
    const provider = getEth1Provider();
    const balanceWei = await provider.getBalance(address);
    return parseFloat(ethers.utils.formatEther(balanceWei));
  },
  { promise: true, maxAge: 5000 }
);

const getNetwork = memoize(
  async () => {
    const provider = getEth1Provider();
    const network = await provider.getNetwork();
    return network.name || `Testnet ID ${network.chainId}`;
  },
  { promise: true, maxAge: 60000 }
);

/**
 * Returns eth1 local account address and balance in ETH
 * If the account does not exist, it is created
 */
export async function getAddressAndBalance(): Promise<Eth1AccountStats> {
  const account = getAccount();
  if (!account.address)
    throw Error(`Error getting eth1 account, empty address`);

  const balanceEth = await getEthBalance(account.address);
  const network = await getNetwork();
  return {
    address: account.address,
    balance: balanceEth,
    network,
    insufficientFunds: balanceEth <= parseFloat(depositAmountEth)
  };
}
