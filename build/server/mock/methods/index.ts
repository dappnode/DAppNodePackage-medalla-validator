import {
  PendingValidator,
  ValidatorStats,
  Eth1AccountStats,
  NodeStats
} from "../../common";
import { ethers } from "ethers";

// New state

let validatorCount = 0;
const pendingValidator: PendingValidator[] = [];
const validator: { [name: string]: ValidatorStats } = {};
let eth1Balance = 32.462112364172;

// New routes

export async function addValidators(
  count: number
): Promise<PendingValidator[]> {
  const names: string[] = [];
  for (let i = 0; i < count; i++) names.push(String(validatorCount++));

  return await Promise.all(
    names.map(
      async (name): Promise<PendingValidator> => {
        await waitMs(1000 + 1000 * Math.random());
        const publicKey = String(Math.random());
        const transactionHash = String(Math.random());
        const blockNumber = Math.ceil(100000 * Math.random());
        validator[name] = {
          name,
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
        return {
          account: name,
          publicKey: String(Math.random()),
          status: "confirmed",
          transactionHash: String(Math.random()),
          blockNumber: Math.ceil(100000 * Math.random())
        };
      }
    )
  );
}

export async function getPendingValidators(): Promise<PendingValidator[]> {
  return [];
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
