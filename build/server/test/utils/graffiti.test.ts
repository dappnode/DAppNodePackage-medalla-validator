import "mocha";
import assert from "assert";

import { textToGraffiti, graffitiToText } from "../../src/utils/graffiti";

describe("Utils > graffiti", () => {
  describe("convert to graffiti back and forth", () => {
    const cases: {
      id: string;
      hex: string;
      input: string;
      result?: string;
    }[] = [
      {
        id: "Sample full text",
        hex:
          "0x7072796c6162732d76616c696461746f722d6663646634666439622d66353873",
        input: "prylabs-validator-fcdf4fd9b-f58s"
      },
      {
        id: "Short string real",
        hex:
          "0x4564776172642077617320686572650000000000000000000000000000000000",
        input: "Edward was here"
      },
      {
        id: "Empty string",
        hex:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        input: ""
      },
      {
        id: "Long string, to be cropped",
        hex:
          "0x7072796c6162732d76616c696461746f722d7072796c6162732d76616c696461",
        input: "prylabs-validator-prylabs-validator-prylabs-validator",
        result: "prylabs-validator-prylabs-valida"
      },
      {
        id: "DAppNode tag",
        hex:
          "0x7072796c6162732d76616c696461746f722d2d66726f6d2d646170706e6f6465",
        input: "prylabs-validator--from-dappnode"
      }
    ];

    for (const { id, hex, input, result } of cases) {
      it(`Should convert ${id} input`, () => {
        const hexResult = textToGraffiti(input);
        const textResult = graffitiToText(hex);
        const textAfter = graffitiToText(hexResult);
        assert.equal(hexResult, hex, "Wrong text > graffiti");
        assert.equal(textResult, result || input, "Wrong graffiti > text");
        assert.equal(textAfter, result || input, "Wront result");
      });
    }
  });
});
