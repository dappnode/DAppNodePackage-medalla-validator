import { getAddressAndBalance } from "../services/eth1";

export async function eth1AccountGet(): Promise<{
  address: string;
  balance: number;
  insufficientFunds: boolean;
}> {
  return await getAddressAndBalance();
}
