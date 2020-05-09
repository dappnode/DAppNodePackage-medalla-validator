import { ethers } from "ethers";
import { db } from "../db";

// Old
const depositContractAddress = "0x4689a3C63CE249355C8a573B5974db21D2d1b8Ef";
const depositAmount = "3.2";

// New
// const depositContractAddress = "0x5cA1e00004366Ac85f492887AAab12d0e6418876";
// const depositAmount = "32.0";

function getAccount(): {
  address: string;
  privateKey: string;
} {
  let account = db.eth1Account.get();
  if (!account) {
    const wallet = ethers.Wallet.createRandom();
    account = { address: wallet.address, privateKey: wallet.privateKey };
    db.eth1Account.set(account);
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
  const balanceWei = await provider.getBalance(account.address);
  const balanceEth = parseFloat(ethers.utils.formatEther(balanceWei));
  return {
    address: account.address,
    balance: balanceEth,
    insufficientFunds: balanceEth <= parseFloat(depositAmount)
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
    value: ethers.utils.parseEther(depositAmount)
  };

  const sendPromise = await wallet.sendTransaction(tx);
  const receipt = await sendPromise.wait(0);
  const txHash = receipt.transactionHash;

  console.log(`Successful deposit
  txHash: ${txHash}
  deposit data:${depositData}
`);
  return txHash;
}
