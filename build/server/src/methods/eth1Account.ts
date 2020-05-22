import { getAddressAndBalance } from "../services/eth1";
import { Eth1AccountStats } from "../../common";

export async function eth1AccountGet(): Promise<Eth1AccountStats> {
  return await getAddressAndBalance();
}
