import { ChildProcessStatus } from "../../common";
import * as db from "../db";
import { getValidatorBinary } from "../services/validatorBinary";

export async function getBinaryStatus(): Promise<ChildProcessStatus | null> {
  const validatorClient = db.server.validatorClient.get();
  if (!validatorClient) return null;
  else return getValidatorBinary(validatorClient).getStatus();
}
