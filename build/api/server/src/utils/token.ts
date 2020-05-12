import crypto from "crypto";

/**
 * Random token of 32 bytes in hex using crypto.randomBytes
 */
export function getRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}
