import { Eth2ClientName } from "../../common";
import { switchValidatorBinary } from "../services/validatorBinary";

export async function switchValidatorClient(
  nextClient: Eth2ClientName
): Promise<void> {
  await switchValidatorBinary(nextClient);
}
