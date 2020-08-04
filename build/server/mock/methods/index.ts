import crypto from "crypto";
import {
  ValidatorStats,
  NodeStats,
  ValidatorFiles,
  ValidatorSettings,
  ValidatorClientName,
  BeaconProviderName
} from "../../common";

// New state
const validators = new Map<number, ValidatorStats>();
const settings: ValidatorSettings = {
  validatorClient: "lighthouse",
  beaconProvider: "lighthouse"
};

// Add some mock validators to start with
addValidatorToMockSet();
addValidatorToMockSet();

function addValidatorToMockSet(): void {
  const index = validators.size;
  const publicKey = "0x" + crypto.randomBytes(48).toString("hex");
  const transactionHash = "0x" + crypto.randomBytes(32).toString("hex");
  const blockNumber = Math.ceil(100000 * Math.random());

  validators.set(index, {
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
}

// New routes

export async function addValidators(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    addValidatorToMockSet();
  }
}

export async function getValidators(): Promise<ValidatorStats[]> {
  return Array.from(validators.values());
}

// Node stats
export async function nodeStats(): Promise<NodeStats> {
  return {
    peers: [
      "/ip4/104.36.201.234/tcp/13210/p2p/16Uiu2HAm5RX4gAQtwqArBmuuGugUXAViKaKBx6ugDJb1L1RFcpfK"
    ],
    syncing: { startingSlot: 0, currentSlot: 100, highestSlot: 200 },
    chainhead: {
      headSlot: 177684,
      headBlockRoot: "y1GDABJ0iPgZhdcWBXTon4r2TgEnpS3XFISckLyqa+U=",
      finalizedSlot: 177600,
      slotsPerEpoch: 32
    },
    eth2NetworkName: "Topaz"
  };
}

export async function importValidators(
  validators: ValidatorFiles[]
): Promise<void> {
  await waitMs(5000);
  // eslint-disable-next-line no-console
  console.log(`Importing validator files`, validators);
}

export async function getValidatorSettings(): Promise<ValidatorSettings> {
  await waitMs(500);
  return settings;
}

export async function switchValidatorClient(
  nextClient: ValidatorClientName
): Promise<void> {
  await waitMs(10000);
  settings.validatorClient = nextClient;
}

export async function setBeaconProvider(
  beaconProvider: BeaconProviderName
): Promise<void> {
  await waitMs(10000);
  settings.beaconProvider = beaconProvider;
}

// Helpers

function waitMs(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
