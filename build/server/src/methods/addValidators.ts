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
import { depositAmountEth } from "../params";

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

  const results = await Promise.all(
    validators.map(async validator =>
      addValidator(validator, withdrawalAccount)
        .then(value => ({
          status: "fulfilled" as "fulfilled",
          value
        }))
        .catch(reason => ({
          status: "rejected" as "rejected",
          reason
        }))
    )
  );

  // Clean progress data
  db.accounts.pendingValidators.set({});

  return results.map(
    (res, i): PendingValidator => {
      const validator = validators[i];
      if (res.status === "rejected") {
        return {
          account: validator.account,
          publicKey: validator.publicKey,
          status: "error",
          error: res.reason instanceof Error ? res.reason.message : res.reason
        };
      } else {
        const { transactionHash, blockNumber } = res.value || {};
        return {
          account: validator.account,
          publicKey: validator.publicKey,
          status: "confirmed",
          transactionHash,
          blockNumber
        };
      }
    }
  );
}

async function addValidator(
  validator: EthdoAccountResult,
  withdrawalAccount: string
): Promise<ethers.providers.TransactionReceipt> {
  function updateStatus(
    data: Pick<PendingValidator, "status"> & Partial<PendingValidator>
  ) {
    db.updatePendingValidator({
      account: validator.account,
      publicKey: validator.publicKey,
      ...data
    });
  }

  try {
    const depositData = await ethdo.getDepositData(
      validator,
      withdrawalAccount
    );

    updateStatus({
      status: "pending"
    });

    const txResponse = await eth1.makeDeposit(depositData);
    updateStatus({
      status: "mined",
      transactionHash: txResponse.hash,
      blockNumber: txResponse.blockNumber,
      amountEth: parseFloat(ethers.utils.formatEther(txResponse.value))
    });

    // ### Todo: Make sure transaction is successful
    const receipt = await txResponse.wait(1);
    updateStatus({
      status: "confirmed",
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    });

    // Confirmed successful deposit
    addValidatorToKeymanager(validator);

    return receipt;
  } catch (e) {
    logs.error(`Error adding validator ${validator.account}`, e);
    updateStatus({
      status: "error",
      error: e.message
    });
    throw e;
  }
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
        const localAccounts = db.accounts.validatorAccounts.get();
        const localAccount = localAccounts[validator.account];
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
    db.updateValidator({ ...validator, createdTimestamp: Date.now() });
  return validators;
}
