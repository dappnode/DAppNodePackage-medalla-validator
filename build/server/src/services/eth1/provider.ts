import { ethers } from "ethers";

export function getGoerliProvider(): ethers.providers.Provider {
  return new ethers.providers.InfuraProvider("goerli");
}
