import "mocha";
import assert from "assert";

import { findNAvailableNums } from "../../src/utils/names";

describe("Utils > names", () => {
  describe("findNAvailableNums", () => {
    const cases: {
      id: string;
      arr: string[];
      count: number;
      nums: string[];
    }[] = [
      {
        id: "Normal case",
        arr: ["1", "3", "legacy"],
        count: 3,
        nums: ["2", "4", "5"]
      },
      {
        id: "One item",
        arr: ["1", "3", "legacy"],
        count: 1,
        nums: ["2"]
      },
      {
        id: "Empty case",
        arr: [],
        count: 0,
        nums: []
      },
      {
        id: "Sequential case",
        arr: [],
        count: 3,
        nums: ["1", "2", "3"]
      }
    ];

    for (const { id, arr, count, nums } of cases) {
      it(`Should return available nums for ${id}`, () => {
        const res = findNAvailableNums(arr, count);
        assert.deepEqual(res, nums);
      });
    }
  });
});
