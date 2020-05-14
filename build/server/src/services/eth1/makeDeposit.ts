import { ethers } from "ethers";
import { depositAmountEth, depositContractAddress } from "../../params";
import { getAccount } from "./getAccount";
import { getGoerliProvider } from "./provider";

/**
 * Sends deposit data to the Goerli deposit contract
 * Account must be funded beforehand
 * @param depositData
 */
export async function makeDeposit(
  depositData: string
): Promise<ethers.providers.TransactionResponse> {
  const account = getAccount();
  const provider = getGoerliProvider();
  const wallet = new ethers.Wallet(account.privateKey, provider);
  const tx = {
    to: depositContractAddress,
    data: depositData,
    value: ethers.utils.parseEther(depositAmountEth)
  };
  return await wallet.sendTransaction(tx);
}
