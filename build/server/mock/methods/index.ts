import {
  PendingValidator,
  ValidatorStats,
  Eth1AccountStats,
  NodeStats,
  WithdrawalAccountInfo
} from "../../common";

// New state

let validatorCount = 0;
const pendingValidators = new Map<number, PendingValidator>();
const validator = new Map<number, ValidatorStats>();
let eth1Balance = 320.462112364172;
let withdrawalAccountExists = false;

// New routes

export async function addValidators(
  count: number
): Promise<PendingValidator[]> {
  const indexes: number[] = [];
  for (let i = 0; i < count; i++) indexes.push(validatorCount++);

  eth1Balance -= 32 * count;

  pendingValidators.clear();

  const results = await Promise.all(
    indexes.map(
      async (index): Promise<PendingValidator> => {
        const account = `validator/${index}`;
        const publicKey = String(Math.random());
        const transactionHash = String(Math.random());
        const blockNumber = Math.ceil(100000 * Math.random());

        pendingValidators.set(index, {
          account,
          publicKey,
          status: "pending"
        });

        // Simulate mined
        await waitMs(2000 + 2000 * Math.random());

        pendingValidators.set(index, {
          account,
          publicKey,
          status: "mined",
          transactionHash
        });

        // Simulate waiting for confirmation
        await waitMs(2000 + 2000 * Math.random());

        validator.set(index, {
          index,
          publicKey,
          depositEvents: [
            {
              transactionHash,
              blockNumber,
              pubkey: publicKey,
              withdrawal_credentials:
                "0x00b6589882996478845d4dd2ca85a57387d6a392217808c908add83b160a0fa7",
              amount: "0x0040597307000000",
              signature:
                "0x9085a737a4490a403e9d0773abcb283b39270a97df7e6fc95c10ac6e6ade3698a88d00b0712fd95b3c2c519035b829160efa34962c92d1dd440db532c5b9bdabf91c7927c3ca1350eb2eb0b52700abd2e704bb547a2dd1ecfa0368a4d72da5e6",
              index: "0x6200000000000000"
            }
          ],
          status: "DEPOSITED",
          balance: {
            eth: 32,
            isExpected: true
          }
        });

        if (Math.random() > 0.66)
          return {
            account,
            publicKey,
            status: "confirmed",
            transactionHash,
            blockNumber
          };
        else
          return {
            account,
            publicKey,
            status: "error",
            transactionHash,
            blockNumber,
            error:
              "Error: VM Exception while processing transaction: revert Not registered."
          };
      }
    )
  );

  pendingValidators.clear();

  return results;
}

export async function getPendingValidators(): Promise<PendingValidator[]> {
  return Array.from(pendingValidators.values());
}

export async function getValidators(): Promise<ValidatorStats[]> {
  return Array.from(validator.values());
}

// Internal Eth1 account
export async function eth1AccountGet(): Promise<Eth1AccountStats> {
  eth1Balance = eth1Balance * 1.01;
  return {
    address: "0x11111111111111111111111111111111111111111",
    balance: +eth1Balance.toFixed(3),
    network: "Goerli",
    insufficientFunds: false
  };
}
// Node stats
export async function nodeStats(): Promise<NodeStats> {
  return {
    peers: [
      {
        address:
          "/ip4/104.36.201.234/tcp/13210/p2p/16Uiu2HAm5RX4gAQtwqArBmuuGugUXAViKaKBx6ugDJb1L1RFcpfK",
        direction: "OUTBOUND"
      }
    ],
    syncing: { syncing: false },
    chainhead: {
      headSlot: "177684",
      headEpoch: "5552",
      headBlockRoot: "y1GDABJ0iPgZhdcWBXTon4r2TgEnpS3XFISckLyqa+U=",
      finalizedSlot: "177600",
      finalizedEpoch: "5550",
      finalizedBlockRoot: "Bb/6F2NfmtilyxQb+2tItGlD1WNwR17gMVd5kIxjgCQ=",
      justifiedSlot: "177632",
      justifiedEpoch: "5551",
      justifiedBlockRoot: "e+1HeaYj+a/u9gPyUfyUhrGDyv/5BkpOXiF8KnXcItc=",
      previousJustifiedSlot: "177600",
      previousJustifiedEpoch: "5550",
      previousJustifiedBlockRoot: "Bb/6F2NfmtilyxQb+2tItGlD1WNwR17gMVd5kIxjgCQ="
    },
    eth2NetworkName: "Topaz"
  };
}

export async function withdrawalAccountGet(): Promise<WithdrawalAccountInfo> {
  return {
    account: "withdrawal/primary",
    exists: withdrawalAccountExists,
    isMigration: true
  };
}

export async function withdrawalAccountCreate(
  password: string
): Promise<string> {
  password;
  withdrawalAccountExists = true;
  return `{"crypto":{"checksum":{"function":"sha256","message":"8934f3db210e218e1c5b4513bed4a03d42e78c43447109402ac211fd5d8920ef","params":{}},"cipher":{"function":"aes-128-ctr","message":"a5cd4f9eabbe476b75aaa90a5a06df1f265c3489149fe95306a3940ebb5abb57","params":{"iv":"72d3615a55f6c963dbd1833980658624"}},"kdf":{"function":"pbkdf2","message":"","params":{"c":16,"dklen":32,"prf":"hmac-sha256","salt":"f8ff356724d9a297e62ccfb3640c39af6767b86abc1b79e17b96545d3ac32288"}}},"encryptor":"keystore","name":"2","pubkey":"93905cd39c8f0b0226bd7ade6686e103800d152f421f52fc7e0f03e8487ca28613a1548445d32286167888407f7a8642","uuid":"304e671d-f24f-4a20-aa02-9243c0b3fc01","version":4}`;
}

// Old routes

const waitMs = (ms: number): Promise<void> =>
  new Promise(r => setTimeout(r, ms));
