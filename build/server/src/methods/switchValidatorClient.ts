import { ValidatorClientName } from "../../common";
import { getValidatorBinary } from "../services/validatorBinary";
import { getValidatorFileManager } from "../services/validatorFiles";
import { server } from "../db";
import { logs } from "../logs";

/**
 * Kills `prevClient` running binary ensuring it has exited.
 * Then, it start the `nextClient` binary resolving when data is emitted
 */
export async function switchValidatorClient(
  nextClient: ValidatorClientName
): Promise<void> {
  const prevClient = server.validatorClient.get();
  if (prevClient === nextClient) return;

  const prevClientBinary = getValidatorBinary(prevClient);
  const nextClientBinary = getValidatorBinary(nextClient);
  const prevClientFileManager = getValidatorFileManager(prevClient);
  const nextClientFileManager = getValidatorFileManager(nextClient);

  await prevClientBinary.kill();

  // Move keys to next client

  const validatorFiles = await prevClientFileManager.read();
  try {
    await nextClientFileManager.write(validatorFiles);
    await prevClientFileManager.delete();
  } catch (e) {
    // If there is an error writing files to the next client, write to previous
    try {
      await nextClientFileManager.delete();
      await prevClientFileManager.write(validatorFiles);
    } catch (e) {
      logs.error(`Error rolling back validator files mv`, e);
    }
    throw e;
  }

  await nextClientBinary.start();
}
