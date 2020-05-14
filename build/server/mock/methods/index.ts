import {
  PendingValidator,
  ValidatorStats,
  Eth1AccountStats,
  NodeStats
} from "../../common";

// New state

let validatorCount = 0;
let pendingValidators: { [index: number]: PendingValidator } = {};
const validator: { [index: number]: ValidatorStats } = {};
let eth1Balance = 3200.462112364172;

// New routes

export async function addValidators(
  count: number
): Promise<PendingValidator[]> {
  const indexes: number[] = [];
  for (let i = 0; i < count; i++) indexes.push(validatorCount++);

  eth1Balance -= 32 * count;

  pendingValidators = {};

  const results = await Promise.all(
    indexes.map(
      async (index): Promise<PendingValidator> => {
        const account = `validator/${index}`;
        const publicKey = String(Math.random());
        const transactionHash = String(Math.random());
        const blockNumber = Math.ceil(100000 * Math.random());

        pendingValidators[index] = {
          account,
          publicKey,
          status: "pending"
        };

        // Simulate mined
        await waitMs(2000 + 2000 * Math.random());

        pendingValidators[index] = {
          account,
          publicKey,
          status: "mined",
          transactionHash
        };

        // Simulate waiting for confirmation
        await waitMs(2000 + 2000 * Math.random());

        validator[index] = {
          index,
          publicKey,
          depositEvents: {
            [transactionHash]: { transactionHash, blockNumber }
          },
          status: "DEPOSITED",
          balance: {
            eth: 32,
            isEstimated: true
          }
        };

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

  pendingValidators = {};

  return results;
}

export async function getPendingValidators(): Promise<PendingValidator[]> {
  return Object.values(pendingValidators);
}

export async function getValidators(): Promise<ValidatorStats[]> {
  return Object.values(validator);
}

// Internal Eth1 account
export async function eth1AccountGet(): Promise<Eth1AccountStats> {
  eth1Balance = eth1Balance * 1.01;
  return {
    address: "0x11111111111111111111111111111111111111111",
    balance: +eth1Balance.toFixed(3),
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
    }
  };
}

// Old routes

const waitMs = (ms: number): Promise<void> =>
  new Promise(r => setTimeout(r, ms));
