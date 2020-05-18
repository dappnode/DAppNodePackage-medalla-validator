import { EthdoAccountResult, PendingValidator } from "../../common";
import {
  addValidatorToKeymanager,
  readKeymanagerAccounts
} from "../services/keymanager";
import { ethdo } from "../ethdo";
import * as db from "../db";
import * as eth1 from "../services/eth1";
import { logs } from "../logs";
import { ethers } from "ethers";
import { getAddressAndBalance } from "../services/eth1";
import {
  depositAmountEth,
  depositContractAddress,
  depositCallGasLimit
} from "../params";

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

          // Confirmed successful deposit
          addValidatorToKeymanager(validator);

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

  // Clean progress data
  db.accounts.pendingValidators.clearAll();

  return results;
}

/**
 * Alias to reduce boilerplate when dynamically updating the UI
 * @param validator
 */
function getUpdateStatus(validator: EthdoAccountResult) {
  return function updateStatus(
    data: Pick<PendingValidator, "status"> & Partial<PendingValidator>
  ) {
    db.accounts.pendingValidators.merge({
      account: validator.account,
      publicKey: validator.publicKey,
      ...data
    });
  };
}

async function getAvailableAndCreateValidatorAccounts(
  count: number
): Promise<EthdoAccountResult[]> {
  try {
    // First, find existing validators that are not assigned
    const existingValidators = await ethdo.accountList("validator");
    const keymanagerAccounts = readKeymanagerAccounts();
    const unusedExistingValidators: EthdoAccountResult[] = [];
    for (const validator of existingValidators) {
      if (!keymanagerAccounts.some(a => a.account === validator.account)) {
        // The password must be fetched from the API's storage since the accounts are
        // not added to the keymanager until the deposit tx is confirmed
        const localAccount = db.accounts.validator.get(validator.account);
        if (localAccount)
          unusedExistingValidators.push({
            account: validator.account,
            publicKey: validator.publicKey,
            passphrase: localAccount.passphrase
          });
      }
    }

    // Then create remaining necessary validators
    const newValidatorsCount = count - unusedExistingValidators.length;
    const newValidators =
      newValidatorsCount > 0
        ? await createValidatorAccounts(newValidatorsCount)
        : [];

    return [...unusedExistingValidators, ...newValidators];
  } catch (e) {
    // If this fails, just create new validator accounts
    logs.error(`Error creating available validators`, e);
    return await createValidatorAccounts(count);
  }
}

/**
 * Stores the created accounts in the API's DB for when account creation fails.
 * Since the account (and its password) is not added to the keymanager until the
 * deposit tx is confirmed, the account's password has to be stored somewhere
 * @param count
 */
async function createValidatorAccounts(
  count: number
): Promise<EthdoAccountResult[]> {
  const validators = await ethdo.createValidatorAccounts(count);
  for (const validator of validators)
    db.accounts.validator.set({ ...validator, createdTimestamp: Date.now() });
  return validators;
}
