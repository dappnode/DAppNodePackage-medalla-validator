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
    server.validatorClient.set(nextClient);
    await nextClientFileManager.write(validatorFiles);
    await prevClientFileManager.delete();
  } catch (e) {
    // If there is an error writing files to the next client, write to previous
    try {
      server.validatorClient.set(prevClient);
      await nextClientFileManager.delete();
      await prevClientFileManager.write(validatorFiles);
      await prevClientBinary.start();
    } catch (e) {
      logs.error(`Error rolling back validator switch`, e);
    }
    throw e;
  }

  await nextClientBinary.start();
}
