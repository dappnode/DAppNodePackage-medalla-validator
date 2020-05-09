import { ethers } from "ethers";
import { db } from "../db";
import { logs } from "../logs";

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
    data:
      "0x22895118000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120bc422fea5cc267aa219f69358cc5e8d655a6fc74da7875651e5be96a65e12f440000000000000000000000000000000000000000000000000000000000000030b71c2293c560956277fffe6ca28ce64065794388b3735b20bf9c33c7d68aff04cbcf5e4e748764e924908c1911049794000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020004e9ba6eeb0bf30da181ebccd441c68f8ebf6d7230a4c04dacba86c3a0ddcbd00000000000000000000000000000000000000000000000000000000000000608f5d934d5b65b6308016ea7b4490f5d9938f87c97fef4f426a67e227e2e3d767397ba1458213b9c5da92edba65141a32062681c13aa72c899fb807dc0b05529d75c7f1e2f41211dd80dd662ccf9e45275d4cbdac3e3a150a91ed89c916b8caa7",
    value: ethers.utils.parseEther(depositAmount)
  };

  logs.info(`Sending deposit request`, tx);
  const txResponse = await wallet.sendTransaction(tx);

  const receipt = await txResponse.wait(1);
  logs.info(`Successful deposit`, receipt);
  return receipt.transactionHash;
}
