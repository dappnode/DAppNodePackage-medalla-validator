import { ethers } from "ethers";
import { goerliWeb3Url } from "../../params";

let provider: ethers.providers.JsonRpcProvider;

export function getGoerliProvider(): ethers.providers.JsonRpcProvider {
  if (!provider) provider = new ethers.providers.JsonRpcProvider(goerliWeb3Url);
  return provider;
}
