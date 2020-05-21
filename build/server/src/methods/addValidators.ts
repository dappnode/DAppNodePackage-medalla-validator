import { EthdoAccountResult, PendingValidator } from "../../common";
import {
  readkeymanagerMap,
  addValidatorsToKeymanager
} from "../services/keymanager";
import { ethdo } from "../ethdo";
import * as eth1 from "../services/eth1";
import { logs } from "../logs";
import { ethers } from "ethers";
import { getAddressAndBalance } from "../services/eth1";
import { depositAmountEth, depositCallGasLimit } from "../params";
import { getDepositContractAddress } from "../services/eth1/getDepositContractAddress";

/**
 * Pending validator state for progress reporting in the UI, stored in memory
 */
const pendingValidators = new Map<string, PendingValidator>();

/**
 * Return pending validators to the UI
 */
export async function getPendingValidators(): Promise<PendingValidator[]> {
  return Array.from(pendingValidators.values());
}

/**
 * Resolves when all validators have resolved, either with success or errors
 * @param count
 */
export async function addValidators(
  count: number
): Promise<PendingValidator[]> {
  // Safety check to make sure ETH1 balance is ok
  const { balance } = await getAddressAndBalance();
  if (balance < count * parseInt(depositAmountEth))
    throw Error(`Insufficient balance to add ${count} validators: ${balance}`);

  // Compute validator accounts sequentially to prevent race conditions
  const validators = await getAvailableAndCreateValidatorAccounts(count);
  const withdrawalAccount = await ethdo.getWithdrawalAccount();

  // Retrieve eth1 wallet
  const wallet = eth1.getWallet();
  let baseNonce = await wallet.provider.getTransactionCount(
    wallet.getAddress()
  );
  let nonceOffset = 0;

  // Get deposit contract address from beacon node
  const depositContractAddress = await getDepositContractAddress();

  const hasConfirmed = new Map<string, boolean>();
  const results: PendingValidator[] = await Promise.all(
    validators.map(
      async (validator): Promise<PendingValidator> => {
        const updateStatus = getUpdateStatus(validator);
        let txData: { transactionHash?: string; blockNumber?: number } = {};
        try {
          const depositData = await ethdo.getDepositData(
            validator,
            withdrawalAccount
          );

          updateStatus({
            status: "pending"
          });

          // Make sure the nonce is increment when sending all transactions at once
          const nonce = baseNonce + nonceOffset++;
          const txResponse = await wallet.sendTransaction({
            to: depositContractAddress,
            data: depositData,
            value: ethers.utils.parseEther(depositAmountEth),
            gasLimit: depositCallGasLimit,
            nonce
          });

          updateStatus({
            status: "mined",
            transactionHash: txResponse.hash,
            blockNumber: txResponse.blockNumber,
            amountEth: parseFloat(ethers.utils.formatEther(txResponse.value))
          });
          txData = {
            transactionHash: txResponse.hash,
            blockNumber: txResponse.blockNumber
          };

          // ### Todo: Make sure transaction is successful
          const receipt = await txResponse.wait(1);
          updateStatus({
            status: "confirmed",
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber
          });
          txData = {
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber
          };
          hasConfirmed.set(validator.account, true);

          return {
            account: validator.account,
            publicKey: validator.publicKey,
            status: "confirmed",
            ...txData
          };
        } catch (e) {
          logs.error(`Error adding validator ${validator.account}`, e);
          updateStatus({
            status: "error",
            error: e.message
          });
          return {
            account: validator.account,
            publicKey: validator.publicKey,
            status: "error",
            error: e.message,
            ...txData // Add txData to errors so user can go see the txHash in etherscan
          };
        }
      }
    )
  );

  // Add to keymanager and restart validator
  addValidatorsToKeymanager(
    validators.filter(validator => hasConfirmed.get(validator.account))
  );

  // Clean progress data
  pendingValidators.clear();

  return results;
}

/**
 * Alias to reduce boilerplate when dynamically updating the UI
 * @param validator
 */
function getUpdateStatus(validator: EthdoAccountResult) {
  return (
    data: Pick<PendingValidator, "status"> & Partial<PendingValidator>
  ) => {
    const account = validator.account;
    pendingValidators.set(account, {
      ...validator,
      ...(pendingValidators.get(account) || {}),
      ...data
    });
  };
}

/**
 * Finds existing validators that are not assigned
 * Their password is fetched from the intermediate ethdo keymanager
 * They are not added to the keymanager until the deposit tx is confirmed
 * Then creates remaining necessary validators
 * @param count
 */
async function getAvailableAndCreateValidatorAccounts(
  count: number
): Promise<EthdoAccountResult[]> {
  try {
    const keymanagerMap = readkeymanagerMap();
    const unusedValidators = (
      await ethdo.listValidatorsWithPassphrase()
    ).filter(validator => !keymanagerMap.has(validator.account));

    const newValidatorsCount = count - unusedValidators.length;
    const newValidators =
      newValidatorsCount > 0
        ? await ethdo.createValidatorAccounts(newValidatorsCount)
        : [];

    return [...unusedValidators, ...newValidators];
  } catch (e) {
    // If reusing validators fails, just create new validator accounts
    logs.error(`Error creating available validators`, e);
    return await ethdo.createValidatorAccounts(count);
  }
}
