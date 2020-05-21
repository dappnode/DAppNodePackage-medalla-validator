import memoizee from "memoizee";
import { fetchGrpc, base64ToHex } from "../../utils/grpc";

export const getDepositContractAddress = memoizee(
  async (): Promise<string> => {
    /**
     * http://prysm-beacon-chain.public.dappnode:4001/eth/v1alpha1/node/genesis
     * {
     *   genesisTime: "2020-04-18T00:00:00Z",
     *   depositContractAddress: "XKHgAAQ2ashfSSiHqqsS0OZBiHY=",
     *   genesisValidatorsRoot: "VROORqJELS/9iVUKDzBWISe8VuYkTQ+itRij9M4ZM34="
     * }
     */
    const genesis: { depositContractAddress: string } = await fetchGrpc(
      `/eth/v1alpha1/node/genesis`
    );
    return base64ToHex(genesis.depositContractAddress);
  },
  { maxAge: 5 * 60 * 1000, promise: true }
);
