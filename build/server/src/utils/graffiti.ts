import { ethers } from "ethers";

/**
 * Encode UTF8 text to hex at a fixed 32 bytes length (pad and crop)
 * @param input
 */
export function textToGraffiti(input: string) {
  if (!input) input = "";
  if (ethers.utils.isHexString(input)) return input;

  const bytes = ethers.utils.toUtf8Bytes(input);
  return (
    "0x" +
    Buffer.from(bytes.slice(0, 32))
      .toString("hex")
      .padEnd(64, "0")
  );
}

export function graffitiToText(hex: string) {
  return ethers.utils.toUtf8String(hex, true).replace(/\u0000/g, "");
}
