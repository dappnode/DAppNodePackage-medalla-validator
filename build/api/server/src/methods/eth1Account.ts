import { getAddressAndBalance } from "../services/eth1Account";

export async function eth1AccountGet(): Promise<{
  address: string;
  balance: number;
}> {
  return await getAddressAndBalance();
}
