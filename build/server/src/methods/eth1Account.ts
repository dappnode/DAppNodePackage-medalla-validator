import { getAddressAndBalance, makeDeposit } from "../services/eth1Account";

export async function eth1AccountGet(): Promise<{
  address: string;
  balance: number;
  insufficientFunds: boolean;
}> {
  return await getAddressAndBalance();
}

export async function eth1MakeDeposit(
  depositData: string
): Promise<string | undefined> {
  return await makeDeposit(depositData);
}
