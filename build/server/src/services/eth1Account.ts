import { ethers } from "ethers";
import * as db from "../db";
import { logs } from "../logs";
import { depositAmountEth, depositContractAddress } from "../params";

function getAccount(): {
  address: string;
  privateKey: string;
} {
  let account = db.accounts.eth1Account.get();
  if (!account) {
    const wallet = ethers.Wallet.createRandom();
    account = { address: wallet.address, privateKey: wallet.privateKey };
    db.accounts.eth1Account.set(account);
  }
  return account;
}

function getGoerliProvider(): ethers.providers.Provider {
  return new ethers.providers.InfuraProvider("goerli");
}

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

/**
 * Sends deposit data to the Goerli deposit contract
 * Account must be funded beforehand
 * @param depositData
 */
export async function makeDeposit(
  depositData: string
): Promise<string | undefined> {
  const account = getAccount();
  const provider = getGoerliProvider();
  const wallet = new ethers.Wallet(account.privateKey, provider);
  const tx = {
    to: depositContractAddress,
    data: depositData,
    value: ethers.utils.parseEther(depositAmountEth)
  };

  logs.info(`Sending deposit request`, tx);
  const txResponse = await wallet.sendTransaction(tx);

  const receipt = await txResponse.wait(1);
  logs.info(`Successful deposit`, receipt);
  return receipt.transactionHash;
}
