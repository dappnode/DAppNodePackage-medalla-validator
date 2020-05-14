import "mocha";
import assert from "assert";
import { DepositEvent } from "../../common";

import { computeEstimatedBalance } from "../../src/utils/depositEvent";

describe("Utils > depositEvent", () => {
  describe("computeEstimatedBalance", () => {
    const depositEvent = {
      blockNumber: 2679205,
      txHash:
        "0x17260fbc186e1c157447a162b44b3c0d55254f6a9fbeb2ee6dbcc9354c31c811",
      pubkey:
        "0xaf2b4016569f8e2579c66bc22e5cf9fe18e17f296fbbd1d486c5a0b51be59015f9619c6046df1c95d91d441c54beafd5",
      withdrawal_credentials:
        "0x00d7f75a7704bab7c2b0da63f4ada1589e3064b25de5fdb683616aa24c1f55c1",
      amount: "0x0040597307000000",
      signature:
        "0xab85236682dd32cc24126961f54f6d3afc22f38a140fad12aa2e8d46adc0f21c7e862831f1296813ecfc2f98beb7542f08622309e81ef5c2ca3d0cd17300764de1cdbd2bc1b99202181d256c4b8e5a05b3bc17369fbcf4512105879592cefff4",
      index: "0xbb78000000000000"
    };

    it("Parse balance from deposit event", () => {
      const depositEvents = [depositEvent];
      const balance = computeEstimatedBalance(depositEvents);
      assert.equal(balance, "32.0");
    });

    it("Parse balance from multiple deposit events", () => {
      const depositEvents = [depositEvent, depositEvent, depositEvent];
      const balance = computeEstimatedBalance(depositEvents);
      assert.equal(balance, "32.0");
    });

    it("Parse balance from no deposit events", () => {
      const depositEvents: DepositEvent[] = [];
      const balance = computeEstimatedBalance(depositEvents);
      assert.equal(balance, null);
    });
  });
});
